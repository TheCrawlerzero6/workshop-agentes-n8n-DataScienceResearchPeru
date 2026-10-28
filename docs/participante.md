# Tu bot de citas, paso a paso

Llega con la guía de configuración del Drive completada: asistente instalado, n8n Cloud creado, Google y Telegram listos y este kit descargado. El bot de Telegram y las conexiones se crean **en vivo** durante el taller.

**Regla de oro:** las claves (token de Telegram, clave de OpenAI) se pegan solo dentro de n8n, nunca en el chat del asistente ni en el grupo.

## 1. Abre el kit y empieza

Abre en tu asistente la carpeta que contiene `AGENTS.md` y escribe:

> Empecemos el taller.

El asistente comprobará que ve el kit y te dirá qué falta. Si te pide abrir otra carpeta, hazle caso: suele ser la carpeta de dentro.

## 2. Prepara las conexiones (con el facilitador)

El asistente te guía, una cosa a la vez:

- **Conectar n8n con tu asistente** (MCP). Autorizas en el navegador y lees los permisos antes de aceptar.
- **Crear tu bot** en Telegram con [@BotFather](https://t.me/BotFather): `/newbot`, un nombre y un usuario que termine en `bot`. Copia el token.
- **Guardar tres conexiones en n8n:** Telegram (token del paso anterior), OpenAI (la clave del Drive del taller) y Google Calendar (botón *Sign in with Google*).

## 3. Define tu bot

Cinco preguntas rápidas: nombre y personalidad (si te trata de tú o de usted, estilo, emojis), tu ciudad (para la zona horaria), duración habitual, el calendario y el modelo. Cada pregunta trae una opción recomendada; basta con responder «ok».

Cualquiera que le escriba podrá usarlo: cada persona tiene su propia conversación, que se recuerda siete días. Compártelo solo con quien quieras, porque sus citas entrarán a tu calendario. Antes de crear una cita, el bot muestra algo así:

> ¿Creo esta cita?
> Revisión del proyecto
> Martes, 15:00–16:00 (tu zona horaria)
> [Sí, crear cita] [No crear]

Solo quien pidió la cita puede pulsar esos botones.

## 4. Aprueba el plan

> Apruebo ese plan.

Con eso el asistente construye un borrador **sin encenderlo** y te entrega los enlaces. No volverá a preguntarte por cada pieza.

## 5. Revisa y enciende (publica) tu bot

> Muéstrame qué debo revisar antes de encenderlo.

Mira en n8n lo que te indique: que solo te atienda a ti, el calendario elegido, la única acción (agendar) y los botones. Luego **tú** publicas desde n8n; el asistente no lo hace por ti.

## 6. Prueba de verdad

> Sí, autorizo probar en mi chat y crear eventos de prueba en mi calendario solo cuando pulse Sí.

Escribe a tu bot: «Agéndame una reunión mañana a las 3 pm para revisar el proyecto». Antes de pulsar Sí, mira tu calendario: aún no debe existir. Pulsa Sí y comprueba fecha, hora y título. Prueba también pulsar No y pedirle algo que no puede hacer («borra mi cita»). Puedes borrar tú mismo los eventos de prueba desde Google Calendar.

## 7. Una pequeña mejora

> Quiero que responda más breve y use 30 minutos si no digo duración. Propón el cambio antes de hacerlo.

Apruebas, revisas y vuelves a publicar tú. El asistente también te deja tu skill de reglas personales en `local/skills/` para reutilizarla en otros proyectos ([plantilla](../templates/mis-reglas-n8n/SKILL.md)).

## 8. Cierra

> Ayúdame a cerrar el taller: apagar el bot y revocar accesos.

Apagas los flujos del bot, cancelas aprobaciones pendientes, desconectas el asistente de n8n, revocas el token en BotFather (`/revoke`) y quitas el acceso de n8n a tu cuenta de Google. La clave de OpenAI del taller la revoca el facilitador. Si algo no se pudo comprobar, debe quedar como «pendiente».
