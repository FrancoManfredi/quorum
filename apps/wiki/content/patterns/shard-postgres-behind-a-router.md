---
title: Shard Postgres behind a router: Figma
summary: Figma kept Postgres and built a query router in front of horizontal shards, after vertical partitioning ran out.
section: patterns
group: Ran in production
order: 958
aliases: figma, postgres, sharding, dbproxy, query router, scatter gather
---

Figma ran one Postgres database on AWS's largest physical instance in 2020. Two years later it had caching, read replicas, and a dozen vertically partitioned databases, and the biggest tables still held several terabytes and billions of rows. `VACUUM` on those tables risked the transaction ID limit, and the smallest unit of vertical partitioning is one table.

## The system

The team sharded horizontally at the application layer, then moved the shards to physical databases. A service called DBProxy parses each SQL query and sends it to the shard that holds the key. A query without a sharding key becomes a scatter-gather across every shard, so the application has to supply the key. The first table took about nine months, and Figma kept unsharded Postgres as a rollback path.

## The board

::Design{id="figma-shard-router"}

The Connection Pooler stands for DBProxy: every write and transaction goes through it to the Database. The Database has four shards on a hash key. The Cache answers repeated reads before they reach the router. The board keeps the router on the write path, because a read without a key is the expensive case.

## Why it works

Postgres stays, so the product code and the relational model stay. The router hides the shard map from the application, and the cache keeps the hottest rows out of the scatter-gather path. [Shard the database](/patterns/shard-the-database) and [connection pooling](/patterns/connection-pooling) are the two pieces.

## Where the game stops

The game's Connection Pooler is PgBouncer, not a query engine. It cannot parse SQL, route by key, or scatter-gather. The board shows the shape: one router, many shards, a cache in front. The caption is Quorum's result, not Figma's query latency.

## Sources

- [How Figma's databases team lived to tell the scale, Figma](https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale): the vertical partitions, DBProxy, the shard rollout, and the nine-month first table.
- [PostgreSQL documentation: VACUUM](https://www.postgresql.org/docs/current/sql-vacuum.html): why the transaction ID limit forces the split.
- [PostgreSQL documentation: Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html): the transaction ID wraparound and the cost of a growing table.
