---
title: A WebSockets tier for realtime
summary: Hold realtime connections open on a Realtime Hub that runs a runtime built for them, and route only realtime traffic to it, so chat and live updates stop eating App Server workers.
section: patterns
group: Scaling steps
order: 125
aliases: websocket, realtime, chat, live updates, socket.io, presence, reconnect, long lived connections, connection count
---

Give realtime traffic its own Hub, because a connection that stays open for minutes cannot share a worker pool with requests that last milliseconds.

## Move up when

- Realtime messages fail as refused, or App Server workers sit waiting on open connections.
- Chat or live updates arrive late while pages and reads are fine.
- After a restart, clients reconnect all at once and the Hub refuses half of them.

## The Design

::Design{id="realtime-hub"}

The API Gateway splits traffic by request kind. Realtime goes to the Hub and every other kind goes to the App Server. The Hub takes realtime and sends nothing on.

## Why it works

A runtime that holds a worker for each connection holds none, so the Hub refuses everything. An event loop or a green thread holds each connection for a few KB, so a Node.js Stack lets the Hub keep many open. Clustering lets bigger Hub sizes add room, and without it one box takes every connection and a larger size only adds Burn.

Presence earns more per message because social features pay for knowing who is online, and it spends CPU on every join. Reconnect backoff spreads a returning wave over time instead of refusing it.

## What it costs

A Hub is a stateful Node. A restart drops every connection and invites a reconnect wave, which is the [Reconnect storm](/incidents/reconnect). Clustering needs a pub/sub backbone, and a split cluster loses the messages that cross the cut. The game has no long polling or server-sent events option, so it cannot show a cheaper fallback for light use.

## In Quorum

Place a [Realtime Hub](/components/ws) and link it from an [API Gateway](/components/gw). Set the Link's kinds so only realtime reaches it. Research [WebSockets](/research/websockets), and a runtime such as [Node.js](/research/lang-node). The next step, [sharding the database](/patterns/shard-the-database), splits the data tier once one primary cannot take the writes.
