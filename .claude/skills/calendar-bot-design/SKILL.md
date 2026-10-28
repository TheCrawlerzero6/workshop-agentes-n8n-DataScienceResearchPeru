---
name: calendar-bot-design
description: Define con preguntas breves un bot de citas de Telegram y Calendar abierto a quien le escriba, con memoria por persona y aprobación con botones. Úsala antes de construir o cambiar comportamiento; produce un plan, no publica ni crea eventos.
metadata:
  version: "1.0.0"
---

# Diseñar el bot

Lee [política común](../workshop-n8n-guide/references/politica.md) y [cuestionario](references/cuestionario.md). Usa los resultados del preflight; no repitas preguntas respondidas ni preguntes valores descubribles.

1. Recoge las cinco decisiones del cuestionario en bloques de hasta tres preguntas, con la opción recomendada lista para aceptar. Explica valores predeterminados; no asumas ciudad ni zona horaria por idioma. Mantén los controles obligatorios fuera de opciones que puedan desactivarlos por accidente.
2. Resume: nombre/tono, acceso abierto (cualquiera por chat privado; cada persona aprueba sus citas), calendario fijo, modelo/costo, zona, duración, siete días de historial, veinte mensajes de contexto, herramienta única y botones de confirmación desde el inicio.
3. Presenta el grafo de alto nivel, tablas, efectos de las pruebas, publicación manual y cierre. Explica que skills instruyen al constructor y el workflow controla al bot.
4. Pide aprobación del plan antes de crear/editar (amarillo): una sola aprobación cubre construir y reparar dentro de ese plan. Guarda la respuesta exacta relevante, fecha y alcance, sin transcribir mensajes privados. Genera las reglas propias usando `templates/mis-reglas.md` y la skill válida `templates/mis-reglas-n8n/SKILL.md` (ambas en la raíz del repo). Guarda una copia personalizada en `local/skills/`, sin instalarla globalmente ni pedir que el participante escriba Markdown. Permite personalizar redacción conservando los límites acordados y verifica nombre/descripción.

## Cambios posteriores

Duración, tono o nombre: propone el cambio concreto y pide aprobación antes de editar. Añadir usuarios, agendas completas, terceros o capacidades nuevas cambia el alcance: explica el impacto y diseña una extensión aparte; no lo incluyas como arreglo rutinario.

## Salida

Ficha legible para la persona y configuración sin secretos para el constructor. Usa `templates/config.example.json` como contrato del respaldo, no como formulario que deba editar el participante. Si faltan calendario o credenciales, deja el plan pendiente en esos puntos y continúa solo con materiales locales.
