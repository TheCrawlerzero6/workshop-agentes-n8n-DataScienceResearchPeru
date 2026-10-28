# Respaldo importable

`workflows/01-conversacion.json`, `02-agenda-protegida.json` y `03-retencion.json` son exports de n8n inactivos. El manifiesto define las dos tablas necesarias. Los archivos `.sdk.ts` describen el grafo para validarlo por MCP, no para que el participante escriba código. Los `.settings.json` acompañantes deben aplicarse con `setWorkflowSettings` al construir por SDK: el grafo SDK no incluye políticas de caller, zona ni retención de ejecuciones. El export JSON sí contiene esas opciones.

## Bloqueo deliberado

El respaldo público lleva `ready=false`, IDs de ejemplo y ninguna credencial. No puede usarse directamente como bot. El agente debe personalizarlo desde la configuración no secreta, después del preflight y aprobación. No basta con cambiar solo `ready`.

## Personalizar sin editar nodos a mano

Estas son instrucciones para el constructor, no tareas del participante:

1. Crea tablas a partir de `manifest.json` en el proyecto del participante y obtén IDs reales. Crea/importa los tres borradores sin publicar para obtener IDs de workflow.
2. Completa `templates/config.example.json` en una copia dentro de `local/`: calendario, modelo, IDs de tablas/workflows y referencias id/name de credenciales. Elige modelo real por catálogo. Para un proveedor distinto, usa el adaptador `modelNode` según el esquema vivo del MCP.
3. Ejecuta `node scripts/build_backup.mjs local/config.json local/rendered` desde la raíz del kit. El generador escribe archivos locales; no llama servicios ni publica nada.
4. Aplica los parámetros/credenciales generados a los borradores conservando sus IDs. Configura callerIds del subworkflow con el ID real del principal y el tool con el ID real del subworkflow. No reimportes creando nuevos IDs sin actualizar ambos enlaces.
5. Valida nodo por nodo y SDK, lee detalles guardados y revisa conexiones. Comprueba aprobación en chat y soporte de espera dentro del subworkflow. Publica manualmente siguiendo la revisión.

No activar respaldo y original con el mismo token simultáneamente. El generador produce un ejemplo de adaptador OpenAI sin credenciales; no obliga a usar ese proveedor. No hay valores secretos ni datos de una cuenta real en el paquete.

## Límites que deben ensayarse

La espera humana dentro de una herramienta/subworkflow, su recuperación y los callbacks deben probarse con la versión real de n8n. La validación de esquema no demuestra esos comportamientos. La memoria se carga explícitamente desde tablas al contexto de cada petición; no se usa Memory Manager ni se promete persistencia de Simple Memory. Debe ensayarse la continuidad real tras reinicio.

Las tablas no ofrecen locks transaccionales. Se descartan updates repetidos, se registra la propuesta y se usa un event ID estable, sin promesa universal de exactamente una vez. Tras una operación incierta hay que revisar el calendario; no repetir con otro ID.
