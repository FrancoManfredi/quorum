---
title: Add a cache
summary: Put a Cache between the App Server and the Database so repeated reads are answered from memory and the Database keeps its capacity for writes.
section: patterns
group: Stack ladder
order: 110
aliases: redis, memcached, ttl, hit ratio, in memory, read heavy, cache aside
---

Place a Cache between the App Server and the Database to answer repeated reads from memory.

## Move up when

- Database CPU is high and most of its work is read queries.
- p99 climbs with Users while the App Server has room.

## The Design

::Design{id="reads-hit-database"}

::Design{id="cache-in-front"}

In the first picture every read query reaches the Database. In the second, the App Server calls the Cache, and the Cache calls the Database only on a miss. Writes pass through.

## Why it works

The Cache serves its hit ratio of reads itself. The Database sees a smaller share of them, so its load bar drops and p99 falls. Redis answers on one thread, which is far more than this traffic needs. The TTL trades hit ratio for freshness: a longer one holds more hits and serves older data.

## What it costs

You buy stale reads. A write invalidates data, but a cache-aside race can keep an old row until its TTL ends, so the ledger shows a small stale share. A write-heavy mix pulls the hit ratio down. A new or restarted Cache starts cold, and the Database takes the full load until it fills. Memory that is too small for the hot data lowers hits as Users grow.

## In Quorum

Research [Caching](/research/caching) to unlock the [Cache](/components/cache). The [Read Mostly](/sandboxes/read-mostly) Sandbox shows the symptom. [Cache-aside](/patterns/cache-aside) covers the pattern, and [Stampede protection](/research/stampede-protection) handles a cold start. The next rung is to [add a read replica](/patterns/add-a-read-replica).
