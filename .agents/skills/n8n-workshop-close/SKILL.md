---
name: n8n-workshop-close
description: Guía el cierre humano del taller de n8n, desactiva conceptualmente el recorrido y verifica revocaciones y retención sin borrar calendarios o workflows. Úsala al terminar o abandonar el taller; no revoca ni elimina accesos por iniciativa propia.
metadata:
  version: "1.0.0"
---

# Cerrar el taller

Lee [política común](../workshop-n8n-guide/references/politica.md). Es la regla 5, «Revocar al terminar». El cierre lo realiza la persona desde sus cuentas; acompaña con enlaces concretos y comprobación, sin solicitar claves.

1. En n8n, guía a despublicar el principal y el subworkflow de agenda. **Despublicar puede no cancelar ejecuciones esperando aprobación**: revisar Executions y cancelar todas las esperas del bot antes de dar el cierre por seguro.
2. Verificar con un mensaje nuevo que el bot no responde. Si responde, buscar workflows alternativos con el mismo token antes de continuar.
3. Explicar retención: dejar solo el mantenimiento de tablas activo cumple limpieza horaria sin Google/Telegram/modelo. Alternativa si quiere cerrar absolutamente todo: borrar manualmente el historial y operaciones del taller y desactivar también mantenimiento. No prometer borrado a siete días si se apaga el limpiador conservando tablas.
4. En Settings → Instance-level MCP → Connected clients, revocar el cliente usado. Desde **ese cliente**, intentar listar workflows y comprobar rechazo. Otro cliente todavía conectado puede funcionar; eso no verifica el cliente revocado. Hacer esta prueba antes de depender otra vez de MCP.
5. En BotFather usar `/revoke` para el bot correcto; después revocar el acceso de n8n en permisos de la cuenta Google. No revocar otras integraciones sin que la persona las identifique. Una verificación por captura/observación de la persona se etiqueta como tal.
6. Modelo: si usó la clave de OpenAI del taller, basta con borrar esa credencial en n8n; el facilitador revoca la clave al terminar. Si usó una clave propia, explicar que revocar MCP no la revoca y que decide desde su proveedor considerando otros usos; el kit no la revoca solo.
7. Revisar retención de ejecuciones y datos de Telegram por separado; las tablas no borran esas copias. No borrar eventos o workflows: la persona puede retirar eventos de prueba manualmente.

## Resultado

Registro de cierre: bot detenido, esperas canceladas, cliente MCP revocado/verificado, token Telegram revocado, acceso Google revocado, decisión del modelo e historial. Distingue comprobado, informado por la persona y pendiente. No marcar todo como completado si ya no se puede verificar por falta de acceso.
