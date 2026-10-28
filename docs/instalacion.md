# Instalación y compatibilidad

Este documento es para el asistente y el facilitador. El participante no necesita leerlo: el asistente lo guía con clics.

## 1. Abrir la carpeta correcta

Hay que abrir **la carpeta que contiene `AGENTS.md`**. El ZIP de GitHub se descomprime como `workshop-agentes-n8n-DataScienceResearchPeru-<rama>` (p. ej. `-master`), y a veces queda una carpeta con el mismo nombre dentro de otra.

| App | Dónde se abre | Qué lee automáticamente |
| --- | --- | --- |
| Codex (app de ChatGPT o app de Codex) | Al elegir proyecto/carpeta | `AGENTS.md` y las skills de `.agents/skills/` |
| Claude Desktop, pestaña **Code** | Al elegir carpeta de proyecto | `CLAUDE.md` (que importa `AGENTS.md`) y `.claude/skills/` |

El chat normal de Claude (sin la pestaña Code) **no** ve carpetas: hay que usar Code. Las carpetas `.agents` y `.claude` están ocultas en el Explorador y en Finder, pero vienen en el ZIP.

La app pedirá permiso para leer o ejecutar dentro de la carpeta: se acepta para esa carpeta y se rechaza cualquier acción fuera de ella.

**Prueba rápida:** escribir «¿Qué skills del taller ves?». Debe nombrar seis, empezando por la guía del taller (`workshop-n8n-guide`). Si el cliente no las descubre solas, igual puede leerlas: `AGENTS.md` indica dónde están.

## 2. Activar el MCP en n8n

En la instancia: **Settings → Instance-level MCP → Enable MCP access** (requiere ser owner/admin; el dueño de una prueba de n8n Cloud lo es). En **Connect a client** está la Server URL, que termina en `/mcp-server/http`. Leer los permisos antes de aprobar.

## 3. Instalar el plugin oficial de n8n (MCP + skills)

El plugin `n8n-skills` de [n8n-io/skills](https://github.com/n8n-io/skills#install) instala las skills oficiales y la conexión MCP. Requiere n8n 2.2.0 o superior. Comandos tomados del README oficial; si cambian, manda el README.

**Claude Desktop (pestaña Code)**
1. En el cuadro de mensaje: `/plugin marketplace add n8n-io/skills`
2. Botón **+** junto al cuadro → **Plugins** → **Add plugin** → **n8n-skills**. Escribir la URL de la instancia (p. ej. `https://tunombre.app.n8n.cloud`). Si no aparece el aviso: `/plugin configure n8n-skills@n8n-io` y recargar.
3. **Settings → Connectors** → **n8n-mcp** → conectar en el navegador.

**Codex** (0.142.0 o superior)
1. `codex plugin marketplace add n8n-io/skills`
2. `codex plugin add n8n-skills@n8n-io`, reiniciar Codex y aprobar la confianza del hook.
3. MCP en la app de escritorio: **Settings → MCP servers → Add server** → Streamable HTTP → pegar la Server URL → guardar y reiniciar. Autenticar con OAuth en el primer uso o con **Authenticate**.

Los pasos 1 y 2 de Codex usan la terminal: el asistente puede ejecutarlos si la persona lo autoriza, o el facilitador los hace con ella.

**Otros clientes:** `npx skills add n8n-io/skills` desde la carpeta del proyecto. `AGENTS.md` ya indica cargar `using-n8n-skills-official`, porque una instalación sin plugin no trae el hook que la carga sola.

Regla 3, fuentes confiables: solo el plugin oficial; leer su README antes de instalar. Registrar en `local/estado.json` la versión usada.

## 4. Mantener las skills del kit

- La fuente es `.agents/skills/`. Tras editarla, ejecutar `python scripts/sync_skills.py` para actualizar `.claude/skills/`.
- `python scripts/validate_kit.py` falla si las dos copias difieren.
- Formato: `SKILL.md` con `name` y `description` ([Agent Skills](https://agentskills.io/specification)). `agents/openai.yaml` es metadato opcional de Codex. Los permisos reales vienen del cliente y del MCP.

## Estado de compatibilidad

| Elemento | Estado |
| --- | --- |
| Formato de las seis skills y referencias | Validación local incluida |
| Descubrimiento en `.agents/skills` (Codex) y `.claude/skills` (Claude Code) | Estructura lista; pendiente de ensayo por cliente |
| Plugin oficial n8n-skills en Codex/Claude Desktop | Pendiente de ensayo |
| MCP en prueba de n8n Cloud, OAuth, calendario real | Pendientes de ensayo autorizado |

Fuentes: [Agent Skills](https://agentskills.io/specification), [n8n skills](https://github.com/n8n-io/skills), [MCP n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/).
