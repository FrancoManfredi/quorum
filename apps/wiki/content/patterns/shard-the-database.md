---
title: Shard the database
summary: Split the Database into shards by a key, so writes divide across several primaries once one box at its largest size is full.
section: patterns
group: Scaling steps
order: 126
aliases: partitioning, horizontal partitioning, shard key, resharding, scatter gather, cross shard transaction, hash sharding, range sharding
---

Split one Database into several shards on a key, so each shard takes a share of the writes.

## Move up when

- The primary is at its largest size and still saturates on writes, with replicas already added.
- Disk operations queue on the primary even after you buy faster volumes.
- Vertical growth has run out, so the next step cannot be a bigger box.

## The Design

::Design{id="sharded-database"}

The App Server calls one Database Node. The Node now stands for several shards, each a copy of its size. A request goes to the shard that owns its key.

## Why it works

Reads and writes scale with the shard count, because each shard sees only its slice. The key decides how even that slice is. A hash of the user ID spreads Users evenly. A range key sends new Users to the last shard, and a tenant key sends a large tenant to one shard, so those leave a hot shard. A region key keeps data near its Users but pays a round trip for far ones.

## What it costs

Every shard bills as a full Database. A report or search touches every shard, so each shard past the first adds CPU and a little latency. A transaction that spans shards commits on each, and any one can fail it. Changing the count or the key later is a resharding that costs Dev Hours and a long copy, so choose the key early. The game offers no consistent-hashing option for the shard map, only these four keys.

## In Quorum

Set **Shards** and **Shard key** on a [Database](/components/database). Research [Sharding](/research/sharding). The [Big tenant hot shard](/incidents/hot-shard) incident shows a bad key. See [sharding](/patterns/sharding), [hot keys and hot shards](/patterns/hot-keys-and-hot-shards) and [Scale the database](/guides/scale-the-database). The next step, [distributed SQL and leaderless stores](/patterns/distributed-sql-and-leaderless-stores), moves the splitting into the store itself.
