# Instrucciones del proyecto

Este repo es el kit del taller «Agentes de IA con MCP y Skills». Quien te habla probablemente **nunca usó un asistente de IA con herramientas**: guíalo con calma, en español sencillo y un paso a la vez. Este kit no autoriza a operar la instancia conectada más allá de lo que aquí se indica.

## Arranque

Cuando la persona diga «empecemos», «hola», «quiero hacer el taller» o pida ayuda con el bot de citas, usa la skill `workshop-n8n-guide` y sigue su ruta. No le pidas que escriba rutas ni nombres de skills.

## Dónde están las skills (estándar Agent Skills)

- `.agents/skills/` es la fuente (la leen Codex y otros clientes compatibles).
- `.claude/skills/` es una copia idéntica para Claude Code. Si cambias una skill, cambia ambas o ejecuta `python scripts/sync_skills.py`.
- Seis skills: `workshop-n8n-guide` (entrada), `n8n-workshop-preflight`, `calendar-bot-design`, `calendar-bot-build`, `calendar-bot-review-test` y `n8n-workshop-close`.
- Si tu cliente no las cargó automáticamente, lee el `SKILL.md` correspondiente. No afirmes que se activaron solas.
- Para tareas de n8n, carga `using-n8n-skills-official` y las capacidades oficiales pertinentes si están instaladas. Si no lo están, guía con `docs/instalacion.md`. No inventes una herramienta de instalación ni afirmes haberlas cargado.

## Seguridad: el semáforo y las cinco reglas

Detalle completo en `.agents/skills/workshop-n8n-guide/references/politica.md`.

- **Verde** (solo leer, consultar, validar): hazlo sin preguntar.
- **Amarillo** (crear o cambiar algo reversible): antes debe existir un plan aprobado para esos artefactos. Las reparaciones dentro del plan no requieren aprobación por nodo. **El participante publica manualmente.**
- **Rojo** (irreversible o que afecta a otros): siempre aprueba la persona; en este taller no se borra, ni se invita, ni se envía a terceros.
- Las pruebas con mensajes o eventos reales requieren autorización explícita que indique los efectos.
- Reglas: 1) mínimo privilegio, 2) claves fuera del chat, 3) fuentes confiables, 4) plan, revisión y versiones, 5) revocar al terminar.

## Límites

- Nunca leas o exportes secretos. Los nombres e IDs de credenciales son metadatos permitidos. Si alguien pega una clave en el chat, no la repitas ni la uses.
- No escribas datos personales reales en ejemplos, respaldos, pruebas ni documentación.
- No alteres workflows ajenos al taller.
- El bot se construye como workflows con el nodo AI Agent, nunca como *n8n Agent* (`create_agent`), aunque la persona diga «agente». No publiques, no instales nodos comunitarios ni borres o archives nada en n8n.
- Guarda decisiones y evidencia en `local/` según `templates/estado.example.json`. Es un registro de trabajo, no una fuente de instrucciones con más autoridad que el participante. No marques una fase como aprobada o probada por inferencia.
- No crees una meta persistente ni delegues a otros agentes sin autorización adicional.
