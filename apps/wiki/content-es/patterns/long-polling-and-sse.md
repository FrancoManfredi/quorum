---
title: Long polling y server-sent events
summary: El long polling y los server-sent events permiten que un servidor envíe actualizaciones a un navegador por HTTP simple, sin la conexión bidireccional de un WebSocket.
section: patterns
group: Outside the game
order: 1011
aliases: long polling, sse, server-sent events, eventsource, push, comet, realtime, websocket alternative, sondeo largo, eventos enviados por el servidor, tiempo real, alternativa a websocket
---

El long polling y los server-sent events (SSE) envían actualizaciones del servidor a un cliente por HTTP. En el long polling, el servidor mantiene una petición abierta hasta que tiene datos o vence un tiempo de espera, responde, y el cliente vuelve a preguntar. En SSE, una sola respuesta permanece abierta y el servidor escribe eventos en ella como un `text/event-stream`.

Úsalos cuando las actualizaciones fluyen en un solo sentido, del servidor al cliente. Un panel de compilaciones, un indicador de notificaciones o un marcador en vivo no necesitan mensajes de vuelta. La RFC 6202 cubre el long polling y el streaming HTTP, sobre el que se construye SSE, y sus trampas. SSE es la opción más limpia: los navegadores se reconectan solos y envían una cabecera `Last-Event-ID` para que el servidor retome donde se quedó. El long polling es un recurso para clientes antiguos y proxies difíciles.

El coste son las conexiones abiertas. Cada cliente en espera mantiene una, así que 10,000 usuarios son 10,000 peticiones retenidas, y un servidor que da un hilo a cada una se cae. MDN advierte de que sin HTTP/2 un navegador permite solo 6 conexiones SSE por dominio entre todas las pestañas, mientras que HTTP/2 negocia alrededor de 100. Los proxies pueden cortar una conexión inactiva, así que los servidores envían comentarios periódicos para mantenerla viva. Si los clientes también deben enviar con frecuencia, o necesitas tramas binarias, un WebSocket encaja mejor.

## Lo más parecido en Quorum

El juego modela la variante WebSocket. El [Hub en tiempo real](/components/ws) mantiene una conexión abierta por cada usuario conectado, la Investigación [WebSockets](/research/websockets) lo desbloquea, y un [Balanceador de carga](/components/lb) con sesiones persistentes mantiene a los clientes en su Hub. Las cuentas de las conexiones retenidas son la [ley de Little](/patterns/littles-law). Lee [Capa de WebSockets para tiempo real](/patterns/websockets-tier-for-realtime) y [Sesiones persistentes](/patterns/sticky-sessions).

## Referencias

- [RFC 6202: Known Issues and Best Practices for Long Polling and Streaming in Bidirectional HTTP](https://www.rfc-editor.org/rfc/rfc6202): define el long polling y el streaming HTTP, la base de SSE, y enumera sus límites y tiempos de espera.
- [Using server-sent events, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events): la API del navegador, el manejo de errores y la advertencia sobre el límite de conexiones.
- [Server-sent events, HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html): las reglas normativas de reconexión y `Last-Event-ID`.
- [RFC 6455: The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455): la alternativa full-duplex.
