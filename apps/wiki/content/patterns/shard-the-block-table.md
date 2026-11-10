---
title: Shard the block table: Notion
summary: Notion split its block table into 480 logical shards, then streamed changes through Kafka to a data lake.
section: patterns
group: Ran in production
order: 957
aliases: notion, postgres, sharding, cdc, data lake, kafka, s3
---

Notion kept every block, the unit a page is made of, in one Postgres database for five years. By 2021 the block table held more than 20 billion rows, and `VACUUM` had started to stall. The team split it into 480 logical shards across 32 physical databases, then grew to 96 physical databases in 2023 while keeping 480 logical shards.

## The system

A logical shard is a Postgres schema, and a physical database holds several of them. The application knows the shard, so a query goes to one database when it has the key. The analytics path moved off the primary: Debezium reads the Postgres write-ahead log, Kafka carries the changes, and Hudi writes them to S3. By 2024 the lake handled tens of megabytes a second of row changes, and the block table had passed 200 billion rows.

## The board

::Design{id="notion-block-shards"}

The Database has four shards on a hash key, standing for the 480 logical shards. The CDC Connector is Debezium, the Event Stream is Kafka, and the Data Warehouse is the lake that the changes land in. The app never writes twice: it writes the block, and the connector reads the change.

## Why it works

The shard keeps the online table small enough for `VACUUM` and for one machine's IOPS. The log keeps analytics off the primary, and it gives the lake an ordered stream of changes. [Change data capture](/patterns/change-data-capture) and [object storage and lifecycle rules](/patterns/object-storage-and-lifecycle-rules) are the two paths.

## Where the game stops

The board has four shards, not 480, and no schemas inside a physical database. It does not show Hudi, the 480 Fivetran connectors the team replaced, the S3 layer the lake writes to, or the dark reads that made the cutover safe. The caption is Quorum's result, not Notion's change rate.

## Sources

- [Herding elephants: Lessons learned from sharding Postgres at Notion, Notion](https://www.notion.com/blog/sharding-postgres-at-notion): the 480 logical shards, the 32 physical databases, and the migration.
- [The Great Re-shard: adding Postgres capacity (again) with zero downtime, Notion](https://www.notion.com/blog/the-great-re-shard): the move to 96 physical databases and the shard map.
- [Building and scaling Notion's data lake, Notion](https://www.notion.com/blog/building-and-scaling-notions-data-lake): Debezium, Kafka, Hudi, S3, and the 200 billion block rows.
