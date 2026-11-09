---
title: Put the shard in the ID: Pinterest
summary: Pinterest ran 4,096 MySQL shards and encoded the shard number in each object's 64-bit ID, so a read needed no lookup service.
section: patterns
group: Ran in production
order: 960
aliases: pinterest, sharding, mysql, shard id, 4096 shards, memcached, redis
---

In 2012 Pinterest started sharding its MySQL fleet. It ran eight EC2 servers, created 4,096 virtual shards, and put the shard number in the top 16 bits of every 64-bit object ID. A Pin ID names its shard, its type, and its row, so the application connects straight to the right database.

## The system

Each shard is a MySQL database, and a configuration table maps ranges of shards to a master and its standby. The pair is master-master replicated, and production reads and writes only the master, so a lagging copy cannot serve a stale row. Objects live in Memcached and mappings in Redis, because the two access patterns fit different stores. A busy range splits onto a new pair, so capacity grows a range at a time.

## The board

::Design{id="pinterest-id-shards"}

The Database has eight shards on a hash key, standing for the 4,096. The key stands for the shard number in the ID, which the game has no field for. The Cache is the Memcached and Redis tier collapsed into one node, and the App Server is the API that decodes the ID.

## Why it works

The ID carries the shard, so a read needs one ID decode and one database query. No lookup service sits in front of the fleet, and no rehash is needed when a range splits. [Shard the database](/patterns/shard-the-database) covers the general trade, and [hot keys and hot shards](/patterns/hot-keys-and-hot-shards) is the failure the split answers.

## Where the game stops

The board has eight shards, not 4,096, and no configuration table or master-master pair. The hash key is by user, not by object ID. It also keeps one cache, where Pinterest runs Memcached and Redis side by side. The caption is Quorum's result, not Pinterest's traffic.

## Sources

- [Sharding Pinterest: How we scaled our MySQL fleet, Pinterest Engineering](https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f): the eight servers, 4,096 shards, the 64-bit ID, the config table, and the two caches.
- [Shard or Do Not Shard: Pinterest's Hand-Built MySQL Fleet, behindscale](https://www.behindscale.com/articles/pinterest-sharding-mysql): a detailed walkthrough of the ID-encoded shard and the range split.
- [MySQL replication, MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/replication.html): how the master-master pair is set up and how a standby is promoted.
