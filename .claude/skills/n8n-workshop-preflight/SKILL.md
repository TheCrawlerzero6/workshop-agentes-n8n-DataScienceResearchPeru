---
name: n8n-workshop-preflight
description: Verifica y guía la preparación del taller del bot de citas: MCP oficial de n8n, skills oficiales, bot de Telegram con BotFather y conexiones de Telegram, Google Calendar y OpenAI en n8n. Úsala al inicio o para diagnosticar; no crea credenciales por la persona ni publica workflows.
metadata:
  version: "1.1.0"
---

# Preparar y verificar

Lee [la política común](../workshop-n8n-guide/references/politica.md). Instalación y conexión por cliente: `docs/instalacion.md` en la raíz. Carga las skills oficiales de credenciales/seguridad y configuración.

Todo lo de este paso es **verde** (consultar) o **humano** (la persona hace clic en su cuenta). La única excepción es la prueba «hola» opcional, que se explica abajo.

## Orden sugerido (una acción por mensaje)

1. **MCP y skills oficiales.** Descubre las herramientas por nombre y esquema. Usa el MCP oficial de instancia, no MCP Server Trigger ni servidores comunitarios. Si falta, guía la instalación del plugin oficial `n8n-skills` según `docs/instalacion.md` (incluye MCP y skills). Comprueba la conexión listando workflows; una lista vacía no prueba permiso de escritura.
2. **Permisos y preferencias.** Lee `get_user_preferences` antes de cualquier creación; si falla, no supongas que no existen. Comprueba proyecto, permisos de crear/editar/ejecutar y acceso a tablas. Publicar por MCP no es requisito del kit.
3. **Bot de Telegram (en vivo, con el facilitador).** Guía: abrir https://t.me/BotFather → `/newbot` → nombre visible → usuario que termine en `bot`. BotFather entrega un token: **no lo pegues aquí**; cópialo directo a n8n en el paso 4. Si la persona pega el token en el chat, no lo repitas ni lo uses y sugiere `/revoke` en BotFather para generar otro.
4. **Conexiones guardadas en n8n** (la persona las crea; tú indicas el camino exacto y luego compruebas por metadatos):
   - Telegram: *Credentials → Create → Telegram API* → pegar el token de BotFather.
   - OpenAI: *Credentials → Create → OpenAI* → pegar la clave del Drive del taller (o la propia).
   - Google Calendar: *Credentials → Create → Google Calendar OAuth2* → en n8n Cloud, botón **Sign in with Google** con una cuenta personal.
   Busca después por metadatos. Reutiliza una coincidencia inequívoca; si hay varias, muestra nombres y pregunta. Nunca leas secretos.
5. **Capacidades vivas.** Telegram Trigger; Send and Wait con `chatApproval` (botones dentro del chat); AI Agent; modelo con herramientas; Data Table; subworkflows; Calendar availability/create. El respaldo recuerda mediante tablas y contexto explícito, sin depender de Simple Memory. Si falta aprobación nativa en chat, detén esa parte, informa versión/capacidad y avisa al facilitador; no omitas el control.
6. **Calendario y modelo.** Resuelve calendarios y modelos con los métodos de búsqueda de `get_node_types` y las credenciales reales. Si el nodo interno no usa credencial y el explorador la exige, usa la herramienta oficial de tablas; no inventes credenciales.

La prueba de escritura «hola» es opcional y también es amarilla: termina como borrador. No des por habilitado MCP en el workflow nuevo; lee `settings.availableInMCP` y comprueba acceso a detalles/edición. La documentación y la versión instalada pueden diferir.

## Salida

Tabla breve en lenguaje sencillo: qué se revisó, listo/pendiente y siguiente paso. Guarda en `local/estado.json` los IDs/nombres de credenciales, calendario/modelo elegidos y capacidades. No hace falta verificar un dueño: el bot es abierto (ver la política). No pruebes el consumo del modelo ni Calendar como si fueran simples consultas.
