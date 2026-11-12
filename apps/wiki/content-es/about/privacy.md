---
title: Privacidad
summary: Qué registra Quorum, qué no registra, quién lo procesa y cómo desactivarlo.
section: about
order: 2
aliases: privacy policy, data, analytics, tracking, opt out, gdpr, política de privacidad, datos, analítica, seguimiento, rastreo, desactivar, RGPD
---

Quorum registra datos de uso anónimos para mejorar el juego. Esta página enumera qué se registra, qué no
y cómo desactivarlo.

## Qué se registra

Cuando juegas, el juego envía eventos a PostHog, nuestro procesador de analítica:

- Una sesión empieza y termina, con cuánto duró y cuánto de ese tiempo estuvo activo el juego.
- Una muestra de la Empresa cada dos minutos mientras el juego está abierto: Era, Usuarios, Caja,
  ingresos, Gasto, Apdex, proporción de errores, el cuello de botella, número de Nodos y de Enlaces,
  velocidad, tamaño del equipo y número de regiones abiertas.
- Una Empresa se funda, alcanza una Era o hace Exit, con su Emprendimiento, sus Mutadores y las cifras
  de ese momento.
- Una encuesta de Exit, si respondes una después de que termine una Empresa: tus dos respuestas, el tipo
  de Exit, la Era, el pago, el Legado, el Emprendimiento y los Mutadores, y el idioma de tu interfaz.
  Nada sale del navegador hasta que pulsas **Enviar**.
- Una encuesta enviada también envía un evento a PostHog con las cifras del Exit, tu idioma y la longitud
  de cada respuesta. Las respuestas en sí van a la base de datos, no a PostHog.
- Se coloca un Nodo, se crea un Enlace, se completa un elemento de Investigación o se rechaza una acción,
  con el Componente, la Era y el motivo.
- La página que abriste, el sitio que te remitió y cualquier parámetro UTM del enlace.
- El idioma de tu interfaz, el tamaño de la ventana, si el acceso para agentes está activado y si el
  juego se ejecuta como aplicación instalada.
- Un identificador aleatorio de dispositivo, guardado en tu navegador, para que una visita posterior
  cuente como el mismo jugador.
- Un informe de fallo si el juego lanza un error: el error y su traza de pila.
- Datos de rendimiento: cuánto tardan algunas acciones (guardar, cargar, un paso de la simulación, una
  petición al servidor), cuánto tarda en cargar la página y una muestra de perfiles a nivel de función en
  algunos navegadores Chromium. Un informe de error también incluye el tipo de pantalla, la Era y la
  versión de las reglas del juego. Nunca incluye tu Empresa ni su nombre.
- En la wiki, la página que lees y el sitio que te remitió.
- Mientras una Empresa está en línea, un apodo que eliges, que se muestra a los demás jugadores de la
  Sala. Cloudflare lo almacena solo mientras la Sala existe, se elimina con ella y nunca se envía a
  PostHog.
- Una clave de función que introduces en Ajustes, para que el servidor la compruebe. El servidor guarda
  un hash de cada clave aceptada, nunca la clave en sí, y la clave nunca llega a PostHog.

PostHog deduce un país aproximado a partir de tu dirección IP y descarta la dirección. El juego no envía
tu dirección IP por sí mismo.

## Qué no se registra

- Tu nombre, tu correo electrónico ni ningún dato de cuenta. Quorum no tiene cuentas. El apodo de una
  Sala es lo que tú escribas, y desaparece con la Sala.
- El nombre que le das a una Empresa.
- Grabaciones de sesión, pulsaciones de teclas ni el contenido del portapapeles. El único texto que
  escribes y que sale del navegador es una encuesta de Exit que decides enviar y una clave de función que
  introduces para desbloquear una función.
- Identificadores publicitarios. No se vende nada a nadie.

## Por qué

Los datos responden a cuatro preguntas: cuántas personas juegan, dónde se detienen los jugadores nuevos,
cómo construyen y progresan los jugadores y si el cliente está sano. Una encuesta de Exit dice por qué
un jugador dejó de jugar y qué quería más. La usamos para ajustar el ritmo, la dificultad y la
incorporación, y nunca para publicidad.

## Quién lo procesa

- **PostHog** (US Cloud) almacena los eventos en Estados Unidos. Consulta la
  [política de privacidad de PostHog](https://posthog.com/privacy).
- **Sentry** almacena los informes de fallos y los datos de rendimiento. Consulta la
  [política de privacidad de Sentry](https://sentry.io/privacy/).
- **Cloudflare** sirve el juego, reenvía las peticiones de analítica y almacena las respuestas de la
  encuesta de Exit en su base de datos D1. Consulta la
  [política de privacidad de Cloudflare](https://www.cloudflare.com/privacypolicy/).

## Cuánto tiempo

PostHog conserva los eventos durante un año en el plan gratuito. Sentry conserva los errores y los datos
de rendimiento durante 90 días. Las respuestas de la encuesta de Exit permanecen en la base de datos D1
mientras sean útiles para el diseño. Llevan un identificador aleatorio de dispositivo, no tu identidad.

## Desactivarlo

1. Abre **Ajustes** en el juego.
2. Desactiva **Compartir datos de uso anónimos**.

El juego deja de enviar eventos, informes de fallos y datos de rendimiento de inmediato, y recuerda la
elección en tu navegador. También respeta el ajuste No rastrear (Do Not Track) de tu navegador. Borrar el
almacenamiento de tu navegador elimina el identificador de dispositivo y la elección guardada.

La encuesta de Exit es independiente. No envía nada hasta que pulsas **Enviar**, así que desactivar la
analítica no la oculta.

Desactivar la analítica no afecta al juego. Todas las funciones funcionan igual.

## Contacto

Abre una incidencia en [github.com/elianiva/quorum](https://github.com/elianiva/quorum/issues).

## Cambios

Esta página cambia cuando cambian los datos. La fecha de abajo es la del último cambio.

Última actualización: 10 de noviembre de 2026.
