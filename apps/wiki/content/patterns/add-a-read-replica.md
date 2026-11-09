---
title: Add a read replica
summary: Copy the Database to a replica that answers reads, so the primary's capacity goes to writes and read traffic scales out.
section: patterns
group: Scaling steps
order: 111
aliases: replica, replication, follower, read scaling, replication lag, stale read, standby reads
---

Link the App Server to a Read Replica as well as the primary, so reads split between them.

## Move up when

- The primary's load bar is full from reads, and the hot data is too big or too varied for a Cache.
- The primary shows a disk limit and p99 climbs.

## The Design

::Design{id="primary-alone"}

::Design{id="primary-and-replica"}

In the first picture one Database takes everything. In the second, the App Server writes to the primary and sends reads to both. The replica takes only reads.

## Why it works

The replica copies the primary and answers read queries, so each Database carries about half the reads. The primary's load bar falls under full, and p99 falls from seconds to normal.

## What it costs

A replica lags behind the primary, so some reads come back stale. In the ledger that shows as stale errors, since a stale read fails an API read or a checkout that reads its own write, though a page view accepts it. The lag grows with the write rate. Writes do not scale at all, so a write-heavy load needs a bigger primary or sharding. You also pay for a second Database.

## In Quorum

Research [Read replicas](/research/replication) to unlock the [Read Replica](/components/replica), then link the Database into it: that link ships the write log and puts both in one Data Group. The [Stale Checkout](/sandboxes/stale-checkout) Sandbox shows the stale read, and [Replication lag](/incidents/repl-lag) is the incident. [Read-your-writes routing](/research/ryw-routing) is the repair. [Read replicas](/patterns/read-replicas) covers the pattern. The next step is to [route reads and writes apart](/patterns/route-reads-and-writes-apart).
