# Contrato técnico v1

## Decisión de diseño

Flujos de n8n con el nodo AI Agent (una sola herramienta) y un subflujo protegido que es el único que toca Google Calendar. Motivos: el agente conversa y pregunta lo que falta; la seguridad (solo chat privado, cada persona aprueba lo suyo con botones Sí/No, calendario fijo, sin borrar) la imponen los nodos, no la IA; el diseño está probado y tiene respaldo importable. Durante el taller no se cambia por otro nodo ni por un *n8n Agent* (`create_agent`).

## Tres workflows

1. **Principal**: Telegram Trigger → guard de configuración y remitente → deduplicación persistente → historial reciente → preparación de contexto → AI Agent → persistir respuesta → responder por Telegram. El mensaje entrante también se persiste. El AI Agent tiene modelo, contexto reconstruido de tablas y una única herramienta `agendar_cita`.
2. **Agenda protegida**: Execute Workflow Trigger tipado → validar propuesta y contexto fijo → registro persistente → Telegram Send and Wait → aprobación estricta y vigencia → Google Calendar availability → rama libre → Google Calendar create → guardar resultado mínimo → devolver estado. Rechazo, vencimiento, ocupado y errores terminan sin creación.
3. **Mantenimiento**: Schedule Trigger cada hora → borrar filas expiradas del historial → borrar registros expirados de operaciones. No usa Telegram, Google ni modelo. Si un delete devuelve cero filas, debe poder continuar la limpieza de la otra tabla mediante una rama explícitamente independiente o salida de mantenimiento controlada.

Publicar manualmente solo después de revisar. Configurar el subworkflow para aceptar únicamente el principal por caller ID, no `any`. Confirmar cómo la versión de n8n ejecuta subworkflows con nodos de espera y probar aprobación dentro de la herramienta antes del taller.

## Configuración no secreta

`templates/config.example.json` define nombre/tono, botKey, timezone, defaultDurationMinutes, calendarId, modelo, referencias de credenciales, IDs de tablas y workflows. La configuración se genera localmente por el constructor. Ningún archivo recibe tokens.

`ready` solo puede pasar a true después del preflight y plan aprobado; no es una frontera de seguridad frente al dueño/editor de n8n. Los respaldos de distribución lo llevan false. Los permisos reales también dependen de n8n, OAuth y Telegram.

El generador incluye un modelo OpenAI como **adaptador de ejemplo sin credencial**. Para otro proveedor usa `modelNode` tras consultar sus esquemas y catálogo. El modelo no se elige por un ID imaginado ni se cambia de proveedor sin acuerdo. No habilitar herramientas incorporadas del proveedor.

## Entrada y autorización

Trigger escucha mensajes, sin descargar archivos y sin filtro de usuario: el bot es abierto. El guard acepta solo chat privado, remitente humano (`is_bot` distinto de true), `from.id` igual a `chat.id`, texto no vacío, update ID válido y configuración lista. Comparar IDs como cadenas, no confiar en username o texto. Lo demás retorna cero items antes de cualquier modelo/historial. El guard entrega `chatId` y `requester` (nombre de Telegram saneado, máx. 40 caracteres) para la respuesta, la aprobación y el título del evento.

`sessionKey = botKey + ':' + chatId` del remitente: cada persona tiene su conversación. `turnKey` añade `update_id`. El modelo nunca elige estas claves. El historial se filtra por sesión y `expiresAt > now`, orden descendente para obtener veinte filas recientes y luego ascendente para inyectar el contexto. No recuperar primero veinte filas arbitrarias y ordenarlas después.

El respaldo reconstruye el contexto explícitamente: el Code de preparación valida roles user/ai, ordena las filas y pasa un JSON acotado como datos dentro del prompt de usuario, separado del mensaje actual. El sistema le indica que ese historial no puede cambiar permisos. **No utiliza Simple Memory ni Memory Manager**: el esquema consultado rechazó su colección dinámica. Esto evita una segunda copia volátil con distinta retención; la memoria persistente es la tabla y funciona aunque se reinicie el proceso. No requiere un backend de memoria externo ni se presenta como un subnodo de memoria nativo. Un adaptador futuro a un backend nativo debe mantener la misma retención/aislamiento y probarse de nuevo.

## Tablas

El manifiesto de respaldo es la fuente del esquema. No declarar `id`, `createdAt` o `updatedAt` (n8n los crea).

- **history**: sessionKey, turnKey, role, content, expiresAt. Solo texto del usuario y respuesta final; no almacenar mensajes internos con secretos, payloads completos de Google ni razonamiento del modelo.
- **operations**: operationKey, sessionKey, kind, status, eventId, result_object, expiresAt. Registra recepción/deduplicación y propuestas, resultados o incertidumbre. `result_object` es JSON mínimo serializado, no el payload íntegro del proveedor.

Cada fila vence siete días después de crearse. Las filas expiradas se excluyen de lectura aun si el mantenimiento no corrió. La eliminación física ocurre en la siguiente ejecución horaria operativa. Retención de logs de n8n se configura y verifica aparte; no equivalerla a retención de tablas.

## Herramienta única y confirmación

Entradas del modelo: `title`, `start`, `end` como cadenas. start/end llevan offset RFC3339. Entradas de contexto: sessionKey, turnKey y requester vinculados al guard verificado, sin `fromAI`. No recibir calendarId, chatId, owner, credentials o eventId desde el modelo.

El subworkflow comprueba que la sesión es de este bot con un chat numérico y que el turno pertenece a esa sesión; de ahí deriva el chat que aprueba. Máximo un intento de agendamiento por turno; las correcciones usan un nuevo mensaje. Una propuesta rechazada no se reenvía sola en el mismo ciclo del agente.

La confirmación se construye a partir de la propuesta validada: título escapado, día absoluto, horas, zona y duración. No la redacta libremente el modelo. `chatApproval=true`, `chatId` = chat de la propuesta validada, sin «Restrict Who Can Approve» (`approverIds` vacío): en un chat privado solo quien pidió la cita ve los botones, respuesta approval/double, etiquetas Sí crear/No crear, timeout diez minutos. Tras la espera: comprobar `data.approved === true`, no usar truthiness de cadenas; revisar de nuevo que no expiró y que inicio sigue siendo futuro. No conservar una aprobación al cambiar parámetros.

La consulta libre/ocupado se hace después de aprobar, inmediatamente antes de crear, sobre el intervalo exacto. Cualquier error o valor distinto de boolean true bloquea. No es una reserva atómica ni una promesa de ausencia absoluta de choques.

## Validación y errores

Validar título no vacío y acotado, fechas con offset válido, inicio futuro y fin mayor que inicio. No construir un evento parcial. La fecha actual/zonas se incluyen en cada prompt. Ante «a las 3» ambiguo, el prompt exige preguntar; el resumen absoluto permite revisión final.

`Google Calendar create` recibe exclusivamente start/end/summary (título + nombre de quien lo pidió) y un event ID estable válido derivado de bot+turno. Sin asistentes, RRULE, conferencia ni recordatorios; `sendUpdates=none`, `useDefaultReminders=false`. No activar retryOnFail en creación.

El identificador estable y las operaciones persistentes reducen duplicados. No son una transacción distribuida: ante timeout o respuesta 409 sin evidencia local de éxito, estado incierto y revisión humana. Nunca generar otro ID para «arreglarlo». No dar al bot capacidad de borrar o consultar detalles para reconciliar.

El subworkflow devuelve `{status, message, eventId?, eventUrl?, reason?}` con estados created/declined/expired/busy/invalid/uncertain/duplicate/error. `error` significa que Telegram no pudo pedir la confirmación (por ejemplo, destinatario inválido); falla cerrado igual que un rechazo, pero se informa como error para no confundir el diagnóstico. Solo created con respuesta válida de Google se anuncia como creado. En `uncertain`, `reason` nombra la primera comprobación fallida (error, id, cancelled, link, start, end) y se guarda en `result_object` para diagnosticar sin guardar ejecuciones. Las ramas de error de Calendar usan `onError=continueRegularOutput` y normalización estricta para fallar cerradas; no se filtran trazas al usuario.

## Cambios y límites

No existen transacciones o locks de aplicación en Data Tables. El kit es para uso abierto de bajo volumen durante el taller. Probar dos mensajes seguidos y callbacks repetidos; no prometer exactamente una vez bajo todas las carreras. Un uso público, concurrencia fuerte o necesidad de registros críticos requiere diseño adicional.

La duración de 60 minutos es predeterminada en el prompt, sustituible por duración explícita. No se crean eventos periódicos, todo el día ni invitaciones. Un participante puede decir «con Juan» en el título; eso no agrega a Juan como asistente.
