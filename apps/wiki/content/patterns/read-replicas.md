---
title: Read replicas
summary: Copy the database to followers that serve reads, so read traffic scales out while one primary takes the writes.
section: patterns
group: Scaling reads and compute
order: 205
aliases: replica, replication, replication lag, read scaling, stale read, read your writes
---

A read replica is a copy of the primary database that answers queries but accepts no writes.

## Use it when

- Reads far outnumber writes, and the primary's CPU is mostly read queries.
- Reports or search jobs slow down the queries users wait for.
- Some pages can tolerate data that is a moment old.

## How it works

The primary streams its changes to each replica, which applies them in order. The app sends writes to the primary and spreads reads across replicas. Three replicas can serve roughly three times the read volume, while the primary keeps its full capacity for writes.

Replication is usually asynchronous, so a replica trails the primary by some milliseconds, and by minutes if it falls behind. A user who saves a profile and reloads can read the old one. The usual repair is read-your-writes: send a user's reads to the primary for a short time after they write.

## What it costs

You buy stale reads and a routing rule in exchange for read capacity. Writes do not scale at all, so a write-heavy load needs [sharding](/patterns/sharding), not more replicas. Each replica also repeats every write, so replicas fall behind first when the write rate climbs.

## In Quorum

Place a [Read Replica](/components/replica) beside the Database and link the App Server to both, after researching [Read replicas](/research/replication). Reads go to either, and writes go to the primary only. Synchronous replication is an option that makes every write wait for the replica, and it needs [Synchronous replication](/research/sync-replication).

::Design{id="read-replica"}

Watch for the [Replication lag](/incidents/repl-lag) and [Stale reads](/incidents/stale-read) incidents. [Read-your-writes routing](/research/ryw-routing) is the fix, and [Scale the database](/guides/scale-the-database) puts it in order. The glossary defines [read replicas](/glossary/read-replica) and [replication lag](/glossary/replication-lag).
