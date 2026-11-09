---
title: A cache in front of the graph: Meta
summary: Meta put a write-through memcached tier in front of sharded MySQL, and kept one primary region for each shard.
section: patterns
group: Ran in production
order: 956
aliases: meta, facebook, tao, memcached, social graph, write through, sharding
---

Facebook built TAO in 2013 to answer the social graph's read-heavy queries without sending every one to MySQL. TAO is a write-through cache: a read is served from memcached, and a write goes through the cache to the shard that owns the object. The data set is split into hundreds of thousands of shards, and each shard has one primary region.

## The system

The API is small and fixed: get an object, get its outgoing edges, count them, and iterate a range. TAO servers keep the cache consistent across regions, and MySQL replication carries each shard's updates from its primary region to the secondary regions. A secondary region forwards writes to the primary, and its write-through cache keeps read-after-write consistency for the member who made the change. By 2022 TAO served more than 10 billion requests a second.

## The board

::Design{id="meta-cache-graph"}

The Cache is TAO's memcached tier, on write-through, so a write updates the cache and the database. The Database has eight shards on a hash key, standing for the hundreds of thousands of TAO shards. The board shows one region. A second region reads through its own cache and forwards writes to the primary, which the board does not draw.

## Why it works

A read-heavy graph spends most of its queries on the same popular objects. A write-through cache keeps those objects in memory and keeps the cache correct on a write, so the database sees the writes and the misses. [Write-through and write-behind](/patterns/write-through-and-write-behind) and [shard the database](/patterns/shard-the-database) are the two halves.

## Where the game stops

The game has one primary region per Database, not one per shard, and the board draws one region. It does not show TAO's API, its per-shard primary map, or the memcached fleet. The caption is Quorum's result, not Meta's 10 billion requests a second.

## Sources

- [TAO: The power of the graph, Engineering at Meta](https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph): the API, the write-through cache, the shards, and the per-shard primary region.
- [Open-sourcing TAOBench, Engineering at Meta](https://engineering.fb.com/2022/09/07/core-infra/taobench): the 10 billion requests a second figure and the workload shape.
- [Scaling Memcache at Facebook, NSDI 2013](https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf): the cache fleet and the consistency model behind it.
