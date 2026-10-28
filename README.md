# Taller: tu bot de citas con IA, MCP y Agent Skills

Construye en 90 minutos un bot de Telegram que agenda citas en tu Google Calendar, **sin escribir código**. Un asistente de IA (Codex o Claude) lo construye por ti en n8n siguiendo las *skills* de este kit, y tú decides, revisas y publicas.

Repositorio: https://github.com/TheCrawlerzero6/workshop-agentes-n8n-DataScienceResearchPeru

## Si eres participante

1. Abre esta carpeta en tu asistente (Codex o la pestaña **Code** de Claude).
2. Escribe: «Empecemos el taller». El asistente te guiará paso a paso.

¿Aún no preparaste tus cuentas? Sigue la guía de configuración que te compartió el facilitador en el Drive del taller.

No pegues claves ni tokens en el chat: van solo dentro de n8n. Paso a paso detallado: [guía del participante](docs/participante.md).

## Cómo trabajamos seguro

**La IA actúa con tus permisos.** Por eso:

| Color | Qué hace la IA | Control |
| --- | --- | --- |
| Verde | Solo lee: lista, explica, consulta | Lo hace sola |
| Amarillo | Crea o cambia algo reversible: un flujo, un evento | Revisas antes de publicar |
| Rojo | Algo irreversible o que afecta a otros: borrar, enviar a terceros, pagar | Siempre apruebas tú |

Cinco reglas: **mínimo privilegio** (el bot solo crea eventos), **claves fuera del chat** (se guardan en n8n), **fuentes confiables** (MCP y skills oficiales de n8n), **plan, revisión y versiones** (la IA propone, tú publicas) y **revocar al terminar**. Detalle: [política del taller](.agents/skills/workshop-n8n-guide/references/politica.md).

## Si eres facilitador

- [Guía del facilitador](docs/facilitador.md): agenda, claves del taller y rescates.
- [Instalación por cliente](docs/instalacion.md): Codex, Claude Code, MCP y skills oficiales de n8n.

## Cómo está organizado

| Carpeta / archivo | Para qué sirve |
| --- | --- |
| `AGENTS.md` / `CLAUDE.md` | Instrucciones que el asistente lee al abrir la carpeta |
| `.agents/skills/` | Las seis skills del taller ([estándar Agent Skills](https://agentskills.io/specification)); fuente para Codex y otros clientes |
| `.claude/skills/` | Copia idéntica para Claude Code (`python scripts/sync_skills.py`) |
| `docs/` | Guías para participante y facilitador, instalación y validación |
| `backup/` | Tres flujos de respaldo importables, inactivos y sin credenciales |
| `templates/` | Contratos de configuración/estado y plantilla de tu skill personal de reglas |
| `scripts/`, `tests/` | Generador del respaldo y validaciones locales |
| `local/` | Se crea durante el taller con tu estado; no se sube a GitHub |

Las carpetas `.agents` y `.claude` están ocultas en el Explorador de Windows y en Finder, pero vienen en el ZIP. No las borres ni las muevas.

Las seis skills: guiar (`workshop-n8n-guide`), preparar (`n8n-workshop-preflight`), diseñar (`calendar-bot-design`), construir (`calendar-bot-build`), revisar y probar (`calendar-bot-review-test`) y cerrar (`n8n-workshop-close`). Dependen de las [skills oficiales de n8n](https://github.com/n8n-io/skills), que no se copian aquí.

## Alcance del bot

Abierto a quien le escriba por chat privado: cada persona tiene su conversación y aprueba sus propias citas con botones. Un calendario fijo, eventos individuales con el nombre de quien los pidió y confirmación desde la primera versión. Compártelo solo con quien deba usarlo y apágalo al terminar. Consulta libre/ocupado sin leer la agenda. Recuerda siete días de historial y usa los últimos veinte mensajes. Duración predeterminada de 60 minutos; la zona horaria se toma de la ciudad del participante. El bot ejecutado por n8n **no lee estas skills**: sus controles quedan instalados en el flujo.

## Verificación local

`python scripts/validate_kit.py` y `node --test tests/*.test.mjs` no usan APIs ni credenciales. No sustituyen el ensayo real con Telegram, Google y una persona no técnica.
