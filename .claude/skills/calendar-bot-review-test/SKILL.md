---
name: calendar-bot-review-test
description: Revisa seguridad y ejecuta pruebas autorizadas del bot de citas con Telegram, memoria y Calendar. Úsala antes de publicación o tras cambios; entrega evidencia y guía publicación manual, sin afirmar pruebas reales no realizadas.
metadata:
  version: "1.0.0"
---

# Revisar y probar

Lee [política común](../workshop-n8n-guide/references/politica.md) y [aceptación](references/aceptacion.md). Carga las skills oficiales de lifecycle, configuración, seguridad y debugging cuando sea necesario.

1. Revisa el grafo guardado, no solo el código propuesto: guard de chat privado antes de modelo/historial; sesión por chat; un solo ai_tool; botones y respuesta = chat del remitente (nunca un número escrito a mano ni el ID del bot), sin «Restrict Who Can Approve»; «Descartar repetición» sin *Always Output Data*; historial ordenado por `createdAt` descendente; Calendar solo en subworkflow protegido; ramas negativas sin camino a create; modelo y credenciales correctos; caller restringido; historia y mantenimiento con sus tablas reales.
2. Ejecuta primero pruebas locales sin servicios. Etiqueta resultados: local, esquema MCP, vivo o pendiente. Validación de nodos no demuestra OAuth, callbacks, memoria tras reinicio ni comportamiento del modelo.
3. Antes de pruebas reales (amarillo), indica en lenguaje sencillo qué se enviará al chat, qué evento se creará y en qué calendario. Obtén autorización específica, por ejemplo: «Sí, autorizo probar en mi chat y crear eventos de prueba en mi calendario solo cuando pulse Sí». Las pruebas de Calendar que escriben NO son lectura ni están autorizadas por una simple aprobación del borrador.
4. Guía con clics, uno a la vez, la publicación manual (para la persona: «encender el bot») del subworkflow según la versión y del principal/mantenimiento. Una vez publicado, prueba por Telegram real. Para manuales no sustituyas silenciosamente el webhook activo; usa un bot separado o coordina desactivación/restauración.
5. Ejecuta los casos de aceptación. Cada evento exitoso debe abrirse en Google Calendar y contrastarse. La persona borra manualmente los eventos de ensayo si lo desea; no agregues una herramienta de borrado.
6. Tras corregir un fallo, la persona debe **publicar de nuevo** el workflow cambiado: el bot usa la versión publicada, no el borrador. Antes de repetir la prueba, comprueba en los detalles que `activeVersion.sameAsDraft` sea true. Si una cita queda «incierta», lee el campo `reason` de su fila en la tabla de operaciones (error, id, cancelled, link, start, end): indica qué comprobación falló, porque el kit no guarda ejecuciones. Repite los casos afectados. Guarda evidencia mínima sin transcripciones privadas. Si hay fallo de seguridad, deja el bot desactivado y vuelve a build dentro del alcance aprobado.

## Resultado

Lista corta para la revisión humana y matriz con esperado, observado y evidencia. No marques «listo el taller» hasta hacer el ensayo con persona no técnica y cierre. No llames publicación/revocación por MCP en nombre del participante.
