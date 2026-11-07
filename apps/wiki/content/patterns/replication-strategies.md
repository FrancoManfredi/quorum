---
title: Replication strategies
summary: Choose how copies of the data stay in step, trading write latency and lost writes against stale reads and complexity.
section: patterns
group: Scaling data
order: 305
aliases: leader follower, primary replica, async replication, sync replication, multi-leader, leaderless, raft, master slave
---

Replication keeps more than one copy of the data, and the strategy decides when a write counts as done.

## Use it when

- One machine failing must not lose data or stop reads.
- Reads outnumber writes and one copy cannot serve them all.
- Users in other regions need a copy near them.

## How it works

There are four common shapes.

- **Leader and followers, asynchronous.** The leader confirms at once and followers catch up. Writes are fast, a follower can lag, and a leader that dies can lose the last writes.
- **Leader and followers, synchronous.** The leader waits for a follower. Nothing confirmed is lost, and every write pays the round trip.
- **Leaderless.** A client writes to several replicas and reads from several, and the [quorum](/patterns/quorum-reads-and-writes) rule decides what a read sees.
- **Consensus.** A majority must agree on each write, so the group survives a minority failing. See [consensus and leader election](/patterns/consensus-and-leader-election).

## What it costs

Each shape gives up something. Asynchronous copies serve stale reads and lose writes in a crash, synchronous ones slow every write and stop writes if the replica goes down, and leaderless stores need quorum math. Accepting writes on more than one node, as multi-leader and leaderless setups do, adds write conflicts that someone must resolve. Replication also does not protect against a bad delete, because the delete replicates too, so keep backups.

## In Quorum

::Design{id="sync-replica"}

A [Read Replica](/components/replica) is asynchronous by default, so it lags and some reads come back stale. Turning on **Synchronous** makes every write wait for it, which removes stale reads and adds a round trip, and if the replica goes down, writes time out until it returns. It needs [Synchronous replication](/research/sync-replication) after [Read replicas](/research/replication).

The [Wide-column Store](/components/wide) is leaderless, and [Distributed SQL](/components/dsql) is consensus. The [Replication lag](/incidents/repl-lag) incident shows the asynchronous cost. The glossary defines [synchronous replication](/glossary/synchronous-replication) and [replication lag](/glossary/replication-lag).
