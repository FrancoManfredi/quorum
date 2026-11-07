---
title: Consensus and leader election
summary: Make a group of servers agree on one order of writes through a majority vote, so the data stays correct while a minority fails.
section: patterns
group: Scaling data
order: 307
aliases: raft, paxos, leader election, etcd, zookeeper, cockroachdb, majority, split brain, fencing
---

Consensus lets a group of servers agree on a single log of writes, and it elects one leader to append to it.

## Use it when

- The data must be correct, such as money or inventory, and a stale or lost write is unacceptable.
- The system must survive a server or a zone failing without a person stepping in.
- You need one owner for a lock, a lease or a configuration value.

## How it works

The leader appends each write to its log and sends it to the followers. The write commits once a majority has stored it, so with 5 servers any 3 are enough and the group rides out 2 failures. If the leader dies, the followers hold an election and the one with the most up-to-date log wins. Raft and Paxos are the usual algorithms, and etcd and CockroachDB use Raft.

A network partition is the hard case. Only the side that still holds a majority may elect a leader and commit, so the minority side stops taking writes instead of diverging.

## What it costs

Every write waits for a majority, so latency is at least the round trip to the replica that completes the majority, and across regions that is tens of milliseconds. Throughput is lower than a leaderless store, and you need an odd number of servers to keep a clear majority. Do not use it for data that tolerates staleness, where a cheaper store is enough.

## In Quorum

::Design{id="consensus-store"}

[Distributed SQL](/components/dsql) stands for CockroachDB and runs on [Raft](/glossary/raft). Its card has **Spread**, which replicates across the open regions, and with a third open region a majority survives losing one. A write waits for a majority, reads stay local, and it is the right store for checkouts and an expensive one for feeds.

It unlocks with [Consensus databases](/research/consensus). A [Network partition](/incidents/partition) is less likely with it, because it keeps one leader. On a leader-based store the writes diverge until **Fence leader** ends the partition. The [Go global](/guides/go-global) guide covers regions.
