---
title: Online migrations
summary: Change a live database without locking it, so writes keep flowing while the schema or the data moves.
section: patterns
group: Deploys and change
order: 606
aliases: online schema change, ghost, pt-osc, backfill, alter table, lock, zero downtime
---

An online migration changes a big table while the application keeps reading and writing it.

## Use it when

- An ALTER TABLE on a large table would hold a lock for minutes.
- The table takes writes all day, and downtime is not allowed.
- You need to move data to a new table, column or engine.

## How it works

A plain ALTER can lock the table while it rewrites every row, and writes queue behind it until they time out. Online tools such as gh-ost or pt-online-schema-change build a shadow copy with the new shape, copy rows in small batches, replay new writes into it, then swap the names in one quick step. The batches are throttled when the database is busy, so the migration yields to real traffic. A 500 GB table can take days this way, and no user notices.

## What it costs

The copy needs extra disk and extra write load, and the swap still takes a very short lock. A tool may not handle foreign keys or triggers. Schema changes that old and new code must both accept still need [expand and contract](/patterns/expand-and-contract). Watch replication lag while the copy runs.

## In Quorum

The game has no Design for this, because it changes how a migration behaves, not a Node. [Online migrations](/research/online-migrations) changes a big table without holding its lock, and [Expand and contract](/research/expand-contract) goes further. Without them, the [Migration lock](/incidents/migration-lock) incident queues writes and times them out until you cancel the migration. Features that change a relational schema cost extra Dev Hours once you own either. A Document Store has no schema to migrate. The glossary defines [expand and contract](/glossary/expand-and-contract).
