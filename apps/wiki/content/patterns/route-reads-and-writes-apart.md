---
title: Route reads and writes apart
summary: Send writes to the primary and reads to a replica, and send reads that follow a write back to the primary so users never see their own change missing.
section: patterns
group: Stack ladder
order: 112
aliases: read write split, read replica routing, read your writes, replica lag, stale read, primary and replica
---

Link the App Server to both the primary Database and a Read Replica, and turn on read-your-writes so a fresh write is never read from a stale copy.

## Move up when

- The Database load bar is red and most of its work is read queries.
- Reads after a write come back `stale`, or a Replication lag incident shows up on the banner.
- A [Cache](/patterns/cache-aside) cannot hold the data, because it changes too often or varies too much.

## The Design

::Design{id="read-write-split"}

Users call the App Server. The App Server sends writes to the Database and spreads reads over both Nodes. The Replica applies every write the primary takes and answers reads only. **Read your writes** is a setting on the App Server, not on the Replica, because the App Server decides where a read goes.

## Why it works

Reads outnumber writes in most products, so moving them off the primary leaves it free for writes and for the reads that must be fresh. The Database load bar drops.

Read-your-writes covers the weak point. A replica lags the primary by a moment, so a user who saves a profile and reloads can read the old copy. With the setting on, the App Server sends a checkout's read, and most reads that follow a write, to the primary.

## What it costs

The second box repeats every write, so a write-heavy mix gains nothing. A small share of reads can still be stale, because the routing hides most lag and not all of it. A synchronous replica removes staleness, but every write then waits for it.

Writes do not scale at all. When they fill the primary, reach for [sharding](/patterns/sharding), not more replicas.

## In Quorum

Place a [Read Replica](/components/replica) after the [Read replicas](/research/replication) Research, and turn on **Read your writes** on the [App Server](/components/server) once [Read-your-writes routing](/research/ryw-routing) is done. Watch for [Replication lag](/incidents/repl-lag) and [Stale reads](/incidents/stale-read), which is a Cache incident that the same setting also prevents. [Scale the database](/guides/scale-the-database) orders the steps, and [Read replicas](/patterns/read-replicas) covers the pattern. The next rung moves search to its own box: [Search beside the database](/patterns/search-beside-the-database).
