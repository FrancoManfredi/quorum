---
title: Federation
summary: Split the data by feature into separate databases, so each service owns its tables and one busy feature cannot slow the rest.
section: patterns
group: Scaling data
order: 304
aliases: functional partitioning, database per service, split by feature, vertical partitioning, polyglot persistence
---

Federation gives each feature its own database, so orders, users and the catalog stop sharing one machine.

## Use it when

- One database serves unrelated features, and a slow report or a busy feed slows checkouts.
- Teams want to deploy and size their own data without asking each other.
- The features rarely join each other's tables.

## How it works

Pick the seams where tables do not join: orders on one database, the catalog on another, sessions on a third. Each service talks to its own database, and anything it needs from another feature comes through that service's API, not a join. If orders get 1,000 writes a second and the catalog 20, they stop competing for the same disk.

Unlike [sharding](/patterns/sharding), every database holds different tables, so federation spreads load by feature, not by row. The two combine: shard the biggest federated database later.

## What it costs

A query or transaction that crossed features now crosses services. Joins become application code, and a change that touches two databases needs a [saga](/patterns/saga) or an accepted gap. You also run more databases, with more backups and more things to patch. Federation helps only up to the number of features, and the busiest one is still one database.

## In Quorum

::Design{id="federated-by-kind"}

The game has no per-table split, so the Design splits by request kind. The [Load Balancer](/components/lb) Links carry a list of request kinds, so writes, checkouts and logins reach the orders service and everything else reaches the catalog service. Each [App Server](/components/server) has its own [Database](/components/database), sized apart from the other.

[Split the database by feature](/patterns/split-the-database-by-feature) is the step, and [The data tier](/explanation/the-data-tier) covers the choices.
