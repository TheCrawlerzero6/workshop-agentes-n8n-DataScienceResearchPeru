# Guía del facilitador

## Antes del taller

Ensayar el kit con una persona que no programe y la misma versión de n8n que utilizará el grupo. No declarar cumplidos 90/30 minutos antes del ensayo. Distribuir kit completo, no seis SKILL.md sueltos: las referencias hermanas son dependencias del paquete.

Preparar las cuentas con antelación según la guía de configuración (`guia-configuracion-taller.txt`), que se comparte solo por Drive y no está en el repo. El bot de Telegram y las conexiones de n8n se crean en vivo. Recomendar un calendario propio dedicado, sin citas sensibles. No compartir un token de Telegram entre participantes o workflows activos.

### Claves de OpenAI del taller

- Crear un proyecto exclusivo para el taller en la plataforma de OpenAI con **límite de gasto** y solo los modelos necesarios. Mejor una clave por participante (o por grupo pequeño) para poder revocar por separado.
- Compartirlas en un archivo del Drive **separado** de la guía de configuración, con acceso restringido a los inscritos. Ese archivo nunca se sube a GitHub ni se pega en chats.
- Indicar que la clave se pega solo en *Credentials → OpenAI* de n8n.
- Al terminar (regla 5) revocar todas las claves del proyecto y, si se quiere, archivar el proyecto.
- Verificar antes del taller que el modelo elegido admite tool calling.

El bot es **abierto**: cualquiera que lo encuentre puede crear citas en el calendario del participante y gastar la clave. Pedir que no compartan el usuario del bot fuera del grupo, poner límite de gasto a las claves y comprobar en el cierre que todos los bots quedaron apagados.

Comprobar capacidades vivas de la instancia, sobre todo aprobación con botones dentro de Telegram (`chatApproval`). Probar callbacks nativos con el Telegram Trigger del principal; la instancia debe ser accesible por HTTPS. Una versión antigua no se rescata eliminando la confirmación.

### Ensayo antes del taller (20–30 min)

1. Descargar el ZIP desde GitHub, abrirlo en Codex y en Claude (pestaña Code) y preguntar «¿Qué skills del taller ves?».
2. Instalar el plugin `n8n-skills` y conectar el MCP en una prueba de n8n Cloud ([instalación](instalacion.md)).
3. Crear un bot con BotFather y las tres conexiones en n8n (Telegram, OpenAI, Google).
4. Recorrer el taller hasta la primera cita: botones Sí/No, evento en Calendar, un rechazo y «borra mi cita».
5. Cerrar y revocar. Registrar tiempos y fallos en `local/estado.json`.

## Agenda de 90 minutos

Ajustar a la diapositiva 8; la skill guía usa estos mismos bloques.

| Minutos | Actividad | Evidencia |
| --- | --- | --- |
| 0–10 | Bienvenida, cuentas y kit abierto en el asistente | El asistente nombra las seis skills |
| 10–18 | Dos IA, MCP, skills y controles en ejecución | El participante explica quién publica y quién aprueba citas |
| 18–32 | Conectar MCP, crear el bot en BotFather (en vivo), conexiones en n8n | Tabla de preparación sin pendientes críticos |
| 32–44 | Diseño: seis preguntas y aprobación del plan | Plan aprobado guardado en `local/` |
| 44–54 | **Seguridad y gobernanza**: semáforo y cinco reglas | El participante clasifica acciones por color |
| 54–80 | Construcción, revisión, publicación manual y primera cita | Borrador validado, publicado por el participante, evento aprobado |
| 80–84 | Pruebas negativas y una mejora pequeña | Rechazo, petición fuera de alcance, nuevo borrador |
| 84–90 | Cierre: resumen, desactivar el bot y revocar accesos | Bot detenido, esperas canceladas y accesos revocados |

La confirmación existe desde el principio. La mejora es tono/duración/contexto, no añadir tarde el control de aprobación. Los 30 minutos de construcción dependen de la preparación y del ensayo; registrar tiempos y corregir el material si no cabe.

## Ruta de rescate

1. Identificar si falta conexión, permiso, credencial, nodo, configuración o ejecución. Usar metadatos y errores sanitizados; no pedir capturas con tokens.
2. Dos intentos del mismo fallo sin nueva información: guardar checkpoint y pasar al respaldo con aprobación del mismo alcance.
3. Desactivar el principal antes de importar/activar otro con el mismo token. No mantener dos webhooks de Telegram compitiendo.
4. Crear tablas del manifiesto, importar subworkflow/principal/mantenimiento inactivos y enlazar sus IDs reales. El asistente genera configuración y asigna credenciales, el participante revisa y publica. Nunca retirar el guard para que «arranque».
5. Si no se puede hacer una prueba en vivo, registrarla pendiente; demostrar un JSON no equivale al bot funcionando.

## Ensayo adicional fuera de los 90 minutos

Inyectar fallos de servicios en espacio aislado; pruebas de reentrega, fecha límite, retención y recuperación tras reinicio requieren más tiempo que la demostración de aula. Registrar evidencias para el kit, sin exponer chats reales ni tokens. El facilitador coordina segundo usuario y cancela sus pruebas tras comprobar el filtro.

Si no quedan seis minutos para cierre, interrumpir mejoras. No salir dejando el bot publicado para compensar una demora.
