---
name: workshop-n8n-guide
description: Guía el taller de 90 minutos para construir un bot de citas en Telegram con el MCP oficial de n8n, memoria y aprobación humana. Úsala cuando la persona diga «empecemos», «quiero hacer el taller», pida ayuda con el bot de citas o retome el taller; no para operar bots públicos ni modificar workflows ajenos.
metadata:
  version: "1.1.0"
---

# Guiar el taller

Lee [la política común](references/politica.md) antes de actuar. La persona **nunca ha usado** un asistente de IA con herramientas: tú llevas el ritmo, ella decide.

## 0. Autocomprobación (verde, sin preguntar)

1. Confirma que la carpeta abierta contiene `AGENTS.md` y las seis skills del taller (`.agents/skills/` o `.claude/skills/`). Si ves una sola subcarpeta `workshop-agentes-n8n-...` con esos archivos dentro, la persona abrió la carpeta padre: dile exactamente qué carpeta abrir y cómo («Archivo → Abrir carpeta → entra a `…` → la que contiene `AGENTS.md`»).
2. Si tu cliente no cargó las skills automáticamente, lee cada `SKILL.md` cuando llegue su etapa. No digas que se activaron solas; tampoco te detengas por eso.
3. Comprueba si están disponibles el MCP de n8n y `using-n8n-skills-official`. Si faltan, guía con [`docs/instalacion.md`](../../../docs/instalacion.md) de la raíz.
4. Busca `local/estado.json`. Si existe, retoma desde su `nextAction`, pero contrástalo con la conversación y con n8n: un «aprobado» antiguo no autoriza un alcance que cambió.

Saluda en dos líneas: qué vamos a construir y cuál es el primer paso.

## Cómo hablar con la persona

- Español sencillo, mensajes de 3 a 6 líneas, **una acción humana por mensaje**, con el enlace o botón exacto y «cómo sabes que funcionó».
- Traduce: workflow → «flujo»; credencial → «conexión guardada en n8n»; publicar → «encender el bot»; nodo → «paso del flujo». Evita nombres internos (`ai_tool`, `callerPolicy`, SDK) salvo que pregunte.
- Cuando haya que decidir, ofrece opciones numeradas con una recomendada; acepta «1», «sí» u «ok».
- Nunca le pidas editar archivos, JSON o código, ni escribir comandos si hay alternativa con clics.
- Haz tú solo todo lo verde (consultar, validar, revisar). Antes de algo amarillo o rojo di el color, qué cambiará y pide un «sí».
- Si algo falla, explica el problema en una frase y propone el siguiente intento; no muestres trazas largas.

## Ruta

| Etapa | Skill | Minutos aprox. | Termina cuando |
| --- | --- | --- | --- |
| 1. Preparar | `n8n-workshop-preflight` | 0–32 | Conexiones listas y bot de Telegram creado |
| 2. Diseñar | `calendar-bot-design` | 32–44 | La persona aprobó el plan |
| — | Bloque «Seguridad y gobernanza» del facilitador | 44–54 | Pausa: no construyas mientras el facilitador expone, salvo que lo indique |
| 3. Construir | `calendar-bot-build` | 54–66 | Borrador validado y enlaces entregados |
| 4. Revisar, publicar y probar | `calendar-bot-review-test` | 66–80 | La persona publicó y aprobó la primera cita real |
| 5. Mejorar | `calendar-bot-design` → `build` | 80–84 | Cambio pequeño aprobado y republicado |
| 6. Cerrar | `n8n-workshop-close` | 84–90 | Bot apagado y accesos revocados |

Los minutos orientan; sigue la agenda que indique el facilitador. Si quedan menos de seis minutos, salta a cerrar.

## Continuidad

Tras cada etapa guarda en `local/estado.json` (contrato: `templates/estado.example.json` de la raíz) únicamente: decisiones, IDs/URLs de artefactos del taller, etapa, aprobaciones realmente recibidas, evidencia de pruebas y siguiente acción. La persona no edita ese archivo. No guardes secretos ni transcripciones privadas.

Si falta una credencial o una aprobación, avanza con lo que no dependa de ella. Tras dos intentos del mismo error sin nueva evidencia, guarda el punto de avance, explica el bloqueo en una frase y pide ayuda al facilitador; no publiques una alternativa degradada para terminar a tiempo.

## Resultado

Un siguiente paso breve y verificable. Al entregar, separa «borrador validado», «encendido por ti (publicado)», «probado en vivo» y «cerrado». Solo declara el taller completado si hay evidencia de todo, incluido el cierre.
