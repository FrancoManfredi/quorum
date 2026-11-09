---
title: Move tables between clusters: GitHub
summary: GitHub split one MySQL cluster into schema domains, then moved tables to separate clusters with Vitess and a write cutover.
section: patterns
group: Ran in production
order: 954
aliases: github, mysql, vitess, proxysql, partitioning, schema domains, monolith
---

GitHub.com ran on one MySQL cluster called `mysql1` for about a decade. By 2019 the cluster answered close to a million queries a second, and every feature shared the same tables. The team split the code first: tables went into named schema domains, and a linter failed a build when a query crossed a domain boundary. Only then did the tables move.

## The system

The move used two independent methods. Vitess put a proxy in front of MySQL and copied whole tables between clusters in the background. A custom write cutover rode on ordinary MySQL replication and ProxySQL, and the read-only window lasted tens of milliseconds. By 2021 the same tables answered 1.2 million queries a second across several clusters, and the average load on each host had halved.

## The board

::Design{id="github-move-tables"}

The two App Servers are the two schema domains, core and feature. Each has its own Connection Pooler, which stands for ProxySQL, and its own Database. The Read Replica is one of the read copies that took load off the primary. The Load Balancer's kinds stand for the domain split, not a real read/write split.

## Why it works

The split is virtual before it is physical. Once the code cannot join across a domain, the tables can move one domain at a time, and a mistake stays inside one cluster. [Split the database by feature](/patterns/split-the-database-by-feature) and [expand and contract](/patterns/expand-and-contract) are the two steps that make the move safe.

## Where the game stops

The game's Connection Pooler is PgBouncer, not Vitess or ProxySQL, and it cannot route a query by table. The board shows two domains and two databases, not the linters, the VTGate processes, or the 130 tables that moved in one cutover. The caption is Quorum's result, not GitHub's query rate.

## Sources

- [Partitioning GitHub's relational databases to handle scale, The GitHub Blog](https://github.blog/engineering/infrastructure/partitioning-githubs-relational-databases-scale): the schema domains, the linters, Vitess, and the write cutover.
- [Vitess documentation](https://vitess.io/docs/): the proxy, the VTGate and VTTablet processes, and the sharding model.
- [ProxySQL](https://proxysql.com/): the connection pooler GitHub used for the cutover.
