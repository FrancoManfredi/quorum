---
title: Move shards online: Stripe
summary: Stripe moved hundreds of millions of objects without downtime, then built a Data Movement Platform that copies chunks between MongoDB shards while the app keeps writing.
section: patterns
group: Ran in production
order: 963
aliases: stripe, docdb, mongodb, sharding, online migration, kafka, oplog
---

In 2017 Stripe migrated hundreds of millions of Subscriptions in four phases, with dual writes and a MapReduce backfill, and kept serving throughout. Later it built DocDB on MongoDB, with a Data Movement Platform that moves chunks between shards online.

## The system

DocDB is a self-managed MongoDB fleet. The Data Movement Platform reads each shard's oplog, sends it to Kafka, archives it to object storage, and replays mutations on the target shard. The cutover is kept shorter than a planned primary failover, because that is the retry budget the product applications already have. Stripe reports 99.999% uptime across the migrations.

## The board

::Design{id="stripe-online-shards"}

The Database has four shards on a hash key, standing for DocDB's shards. The CDC Connector is the oplog reader, the Event Stream is Kafka, and the Data Warehouse stands in for the target shard that replays the changes. The app keeps writing to the old shard while the change stream catches the new one up. The chunk copy and the dual-write cutover are outside the board.

## Why it works

A shard move is a copy plus a change stream, not a dump and restore. The app writes once, and the change stream carries the same write to the target. The cutover only has to cover the last few seconds, so the read-only window fits the retry budget. [Online migrations](/patterns/online-migrations) and [change data capture](/patterns/change-data-capture) are the two mechanisms.

## Where the game stops

The game's Database is not MongoDB or DocDB, and the board has no chunk copy or dual-write cutover. It shows the sharded store and the change stream, which are the parts a Design can carry. The caption is Quorum's result, not Stripe's uptime.

## Sources

- [How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations, Stripe](https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations): DocDB, the Data Movement Platform, the oplog to Kafka and S3, and the failover-sized cutover.
- [Online migrations at scale, Stripe](https://stripe.com/blog/online-migrations): the four-phase Subscriptions migration and the MapReduce backfill.
- [Sharding, MongoDB documentation](https://www.mongodb.com/docs/manual/sharding/): the shard, chunk, and move operations DocDB builds on.
