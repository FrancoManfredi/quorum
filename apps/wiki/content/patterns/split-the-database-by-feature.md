---
title: Split the database by feature
summary: Give each feature its own App Server and Database, so one feature's load and failures stay in its own lane.
section: patterns
group: Scaling steps
order: 115
aliases: federation, functional partitioning, database per service, split by domain, vertical partitioning
---

Route each feature to its own servers and its own Database, so the browse load cannot slow the orders.

## Move up when

- One table or one feature takes most of the primary's load, and a slow report or search there slows checkouts.
- Teams step on each other because they share one schema and one deploy.
- You want to size, tune, and fail one feature without touching the others.

## The Design

::Design{id="split-by-feature"}

Splitting by feature needs two Data Groups, because a group holds one dataset. The Services card's
Database picker decides which group a Service reads and writes, so the orders Service and the browse
Service own different rows. A Load Balancer sends each request kind down a different Link, which
stands for routing by feature. The browse side takes pages and reads, and the orders side takes
writes and checkouts. Each App Server calls its own Database, and only orders reaches the Payment
Provider.

The two Databases sit in different boxes. Boxed together, one group would hold one dataset: Sharded
would split those rows across both Databases, and Multi-leader would copy every row to each one, so
naming another leader would not lift the shared-database coordination penalty.

## Why it works

Each Database holds less, so its cache fits its own hot rows and its load bar tracks one feature. A failure in one lane leaves the other serving. You can also give the orders Database a stronger setup than the catalog one.

## What it costs

A query that joins across the split no longer works. The app has to call both sides and merge, and a change touching both is no longer one transaction. Each Database is a Node to run and pay for. Moving a table later is a data migration, so choose the seams along ownership, not along tables.

## In Quorum

Draw it as above, with one Link setting that carries only some request kinds from a [Load Balancer](/components/lb). Separate codebases and teams come with [Service boundaries](/research/service-boundaries). The pattern is on [Federation](/patterns/federation), and the opposite move, spreading one table, is [Sharding](/patterns/sharding). The next step moves slow work off the request: [Slow work to a queue and workers](/patterns/slow-work-to-a-queue-and-workers).
