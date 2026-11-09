---
title: Nine servers, one database: Stack Overflow
summary: Stack Overflow kept one SQL Server and a handful of big web servers, and put Redis and Elasticsearch beside it.
section: patterns
group: Ran in production
order: 950
aliases: stack overflow, stackexchange, monolith, scale up, one database, sql server, redis, elasticsearch
---

Stack Overflow served about 209 million HTTP requests a month in early 2016. Nine primary IIS web servers took them, behind four HAProxy load balancers, with one SQL Server primary, a hot standby, read-only copies, two Redis servers, and three Elasticsearch servers. Nick Craver's architecture series lists every box.

## The system

The site was one .NET application, multi-tenant across the whole Stack Exchange network, behind four HAProxy load balancers. Redis held an L1/L2 cache. Elasticsearch answered searches, so the database saw only the writes and the cache misses. The database stayed one big box with a hot standby, and when the team needed more it bought RAM and a faster disk before it considered sharding.

## The board

::Design{id="so-nine-servers"}

The Load Balancer stands for the four HAProxy boxes. Nine App Server copies stand for the nine primary IIS servers. The Cache is Redis, the Database is the SQL Server primary and its standby, and the Search Engine is the three Elasticsearch boxes. The links are the request path: the app reads the cache, a miss crosses to the database, and search goes to its own tier.

## Why it works

The shape spends money on three things that remove work from the database: a large buffer cache, a Redis tier, and a search tier. The database keeps the writes and the reads that miss the Redis tier. [Scale up first](/patterns/scale-up-first) is the same decision, and [search beside the database](/patterns/search-beside-the-database) is the third tier.

## Where the game stops

Quorum has no SQL Server, so the Database runs Postgres in the board, and the caption is Quorum's result, not the site's latency. The board cannot show a 384 GB buffer cache or the read-only SQL copies. It shows the shape: one primary database with a cache and a search tier beside it.

## Sources

- [Stack Overflow: The Architecture, 2016 Edition, Nick Craver](https://nickcraver.com/blog/2016/02/17/stack-overflow-the-architecture-2016-edition/): the server list, the request counts, and the cache and search tiers.
- [Stack Overflow: The Hardware, 2016 Edition, Nick Craver](https://nickcraver.com/blog/2016/03/29/stack-overflow-the-hardware-2016-edition/): the RAM, disk, and network of each box.
- [Engineering Stack Overflow with Roberta Arcoverde, Hanselminutes #847](https://hanselminutes.com/847/engineering-stack-overflow-with-roberta-arcoverde): the 2022 view of the same architecture and the team that runs it.
