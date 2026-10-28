---
name: calendar-bot-build
description: Construye por MCP oficial de n8n el borrador aprobado del bot de citas, sus tablas, memoria y herramienta protegida. Úsala tras diseño aprobado o para reparar ese mismo alcance; no publica ni prueba efectos reales sin autorización.
metadata:
  version: "1.0.0"
---

# Construir el borrador

Lee [política común](../workshop-n8n-guide/references/politica.md), [arquitectura](references/arquitectura.md) y [prompt del bot](references/prompt.md). Carga las skills oficiales de lifecycle, configuración, expresiones, AI nodes, tablas y subworkflows; debugging solo si corresponde.

## Antes de mutar

Construye workflows (Workflow SDK) con el nodo AI Agent, no un *n8n Agent* de primera clase (`create_agent`), aunque la persona diga «agente». No propongas otro diseño: ver «Decisión de diseño» en la arquitectura. Revisa la tabla de herramientas MCP en la política.

Comprueba plan aprobado, referencias inequívocas de credenciales, calendario, modelo y capacidades. Lee preferencias de n8n y busca artefactos existentes del taller por ID/nombre; conserva sus IDs. No dupliques el bot al retomar. Lee el SDK y los esquemas actuales antes de escribir código de workflow.

## Construcción

1. Usa `backup/` y `scripts/build_backup.mjs` (raíz del repo) como base probada localmente. Fija siempre `timezone` con la zona confirmada en el diseño; el valor de los archivos de ejemplo no es una elección. El agente prepara la configuración no secreta. El modelo predeterminado del taller es OpenAI (adaptador incluido en el generador) con la credencial que la persona creó con la clave del taller. Si eligió otro proveedor, inspecciona su tipo y genera `modelNode` con tipo, versión, parámetros y referencia de credencial; no cambies de proveedor sin acuerdo.
2. Crea las dos tablas del manifiesto, sin columnas de sistema propias. Guarda los IDs reales. Crea/actualiza el principal y el subworkflow de agenda en borrador y enlaza sus IDs mutuamente: la herramienta apunta al subworkflow y éste solo permite al principal como caller.
3. Aplica las opciones `.settings.json` con `setWorkflowSettings` cuando crees desde SDK; el SDK del respaldo describe el grafo, no esas opciones. Verifica en detalles callerPolicy/callerIds, zona y retención de ejecuciones. Configura el mantenimiento horario solo sobre esas tablas. Desactivar el bot no debe desactivar silenciosamente el mantenimiento si se prometió retención automática.
4. Asigna credenciales reales por ID después de resolver sus nombres. Calendar y credenciales son fijos; chat de respuesta y de botones y sesión salen del remitente verificado; solo título/inicio/fin usan datos del modelo.
   **Nunca edites a mano los bloques de configuración dentro de los nodos Code, ni quites validaciones para que el flujo «arranque».** La configuración está copiada en varios nodos: cámbiala en `local/config.json`, vuelve a generar con `scripts/build_backup.mjs` y aplica todos los nodos generados juntos.
   El código de los nodos Code sale siempre de `scripts/runtime.mjs`. No escribas código nuevo en ellos con globales que el sandbox de n8n no ofrece (por ejemplo `URL`): la prueba local pasa, pero en n8n la verificación falla y el bot responde «no pude confirmar» aunque la cita sí se creó.
5. Valida cada nodo cambiado con el esquema instalado; valida el SDK completo. Después de crear/editar, lee los detalles y revisa conexiones `main`, `ai_tool`, `ai_memory`, `ai_languageModel`, filtros, columnas y referencias. No marques publicación disponible por haber pasado solo el esquema.
6. Si usas el respaldo JSON importado manualmente, personaliza todos los marcadores y sigue las mismas comprobaciones. Nunca publiques el JSON de distribución sin configurar: el guard lo bloquea y las credenciales están ausentes.

Las pruebas locales del kit no consumen APIs. Si una validación remota es rechazada, informa el error concreto y corrige dentro del plan. Tras dos fallos idénticos sin nueva evidencia, guarda el estado y pide el dato faltante. No añadas manejo de errores con notificaciones a otros canales sin acordarlo.

Mientras construyes, informa avances en una línea («Creando las tablas… listo»); no pidas confirmación por cada nodo.

## Entrega

Enlaces de borradores y tablas; nodos/credenciales por nombre; evidencia de validación; lista de revisión y pendientes humanos. No llames `publish_workflow`. Entrega a `calendar-bot-review-test`.
