---
title: Sharding
summary: Split one dataset across several databases by a key, so writes and storage scale past what one machine holds.
section: patterns
group: Scaling data
order: 301
aliases: shard, partition, horizontal partitioning, shard key, scatter-gather, resharding
---

Sharding gives each database a slice of the data, chosen by a key in every row.

## Use it when

- The primary is at its write limit or disk limit after replicas, caching and a bigger machine.
- Most queries name one customer or one user, so each touches one slice.

## How it works

A shard key such as `user_id` goes through a hash, and the result picks the shard. With 4 shards, user 8191 might land on shard 3, and every read and write for that user goes there. Writes divide across the shards, so two shards take about twice the writes of one.

The key decides everything. A good key spreads load evenly and keeps related rows together. A bad one builds a hot shard: shard by country and the largest country carries most of the traffic. [Consistent hashing](/patterns/consistent-hashing) is how a real system adds a shard without moving most of the data.

## What it costs

Queries that span shards, like a report across all users, become slow scatter-gather jobs. A transaction across shards is slower and fails more often, and joins are hard or impossible. Changing the key or the shard count later means copying the data, which takes engineering time and calendar time. Treat sharding as the last step, after [read replicas](/patterns/read-replicas), caching and query fixes have run out.

## In Quorum

::Design{id="sharded-hash-key"}

The Database card has a shard count and a shard key. A hash key spreads users evenly, a range key piles new users onto the last shard, a tenant key keeps a tenant together but lets a big one run hot, and a region key keeps users near their data at the price of a far round trip for the rest. [Hot keys and hot shards](/patterns/hot-keys-and-hot-shards) puts the range key on a Board.

Research [Sharding](/research/sharding) to unlock it. The [Hot shard](/incidents/hot-shard) incident lands the biggest tenant on one shard. [The data tier](/explanation/the-data-tier) shows where it fits, and the glossary defines [sharding](/glossary/sharding).
