---
title: Partition messages by channel: Discord
summary: Discord stored trillions of messages in a wide-column store, partitioned by channel and time, and read with a quorum.
section: patterns
group: Ran in production
order: 952
aliases: discord, cassandra, scylladb, wide column, quorum, hot partition, chat
---

Discord moved its messages from MongoDB to Cassandra in 2017, when it had 12 nodes and billions of messages. By early 2022 the cluster had 177 nodes and trillions of messages, and the team migrated it again, to ScyllaDB. The schema partitions messages by channel and a time bucket, and replicates each partition three times.

## The system

Every message row is keyed by channel and bucket, so a channel's recent messages sit together and a read is a range scan. Reads and writes use quorum consistency. The weak spot is the hot partition: a server with hundreds of thousands of members sends far more traffic to one channel than a small server does. Discord added data services in front of the store, with consistent-hash routing by channel, so requests for one channel coalesce on one service instance.

## The board

::Design{id="discord-channel-partitions"}

The Wide-column Store is the message cluster, with three replicas per key and a read and write quorum of two. The Realtime Hub is the gateway tier, on BEAM because a lightweight process per connection is what lets one box hold many. The Cache holds hot channel state.

## Why it works

A quorum read of two replicas overlaps the latest write of two, so a read sees the last message even after a node fails. Partitioning by channel keeps a conversation's history contiguous. [Quorum reads and writes](/patterns/quorum-reads-and-writes) and [hot keys and hot shards](/patterns/hot-keys-and-hot-shards) are the two ideas the schema leans on.

## Where the game stops

The board has one Wide-column Store, not 72 ScyllaDB nodes, and it does not show the data services or the per-channel partitions. The caption is Quorum's result, not Discord's p99. The game's Hot key incident is the same failure the data services were built to absorb.

## Sources

- [How Discord Stores Trillions of Messages, Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages): the Cassandra to ScyllaDB migration, the 177 to 72 node change, and the latency numbers.
- [How Discord Stores Billions of Messages, Discord](https://discord.com/blog/how-discord-stores-billions-of-messages): the original schema and why it bucketed messages by time.
- [How Discord Supercharges Network Disks for Extreme Low Latency, Discord](https://discord.com/blog/how-discord-supercharges-network-disks-for-extreme-low-latency): the storage topology behind the ScyllaDB cluster.
