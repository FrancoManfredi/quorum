---
title: Long polling and server-sent events
summary: Long polling and server-sent events let a server push updates to a browser over plain HTTP, without the two-way connection of a WebSocket.
section: patterns
group: Outside the game
order: 1011
aliases: long polling, sse, server-sent events, eventsource, push, comet, realtime, websocket alternative
---

Long polling and server-sent events (SSE) both push server updates to a client over HTTP. In long polling the server holds a request open until it has data or a timeout passes, answers, and the client asks again. In SSE one response stays open and the server writes events into it as a `text/event-stream`.

Use them when updates flow one way, from server to client. A build dashboard, a notification badge, or a live score needs no messages back. RFC 6202 covers long polling and HTTP streaming, which SSE builds on, and their pitfalls. SSE is the cleaner choice: browsers reconnect on their own and send a `Last-Event-ID` header so the server can resume where it left off. Long polling is a fallback for old clients and awkward proxies.

The cost is open connections. Each waiting client holds one, so 10,000 users mean 10,000 held requests, and a server that gives each a thread falls over. MDN warns that without HTTP/2 a browser allows only 6 SSE connections per domain across all tabs, while HTTP/2 negotiates around 100. Proxies may time out an idle connection, so servers send periodic comments to keep it alive. If clients must also send often, or you need binary frames, a WebSocket fits better.

## Nearest in Quorum

The game models the WebSocket form. The [Realtime Hub](/components/ws) holds an open connection for every online user, the Research [WebSockets](/research/websockets) unlocks it, and a sticky [Load Balancer](/components/lb) keeps clients on their Hub. The held-connection math is [Little's law](/patterns/littles-law). Read [WebSockets tier for realtime](/patterns/websockets-tier-for-realtime) and [Sticky sessions](/patterns/sticky-sessions).

## References

- [RFC 6202: Known Issues and Best Practices for Long Polling and Streaming in Bidirectional HTTP](https://www.rfc-editor.org/rfc/rfc6202): defines long polling and HTTP streaming, the basis of SSE, and lists their limits and timeouts.
- [Using server-sent events, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events): the browser API, error handling, and the connection limit warning.
- [Server-sent events, HTML Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html): the normative rules for reconnection and `Last-Event-ID`.
- [RFC 6455: The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455): the full-duplex alternative.
