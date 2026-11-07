---
title: Quorum reads and writes
summary: Keep several copies of each key and let a read and a write each ask enough of them to overlap, so reads see the latest write without a leader.
section: patterns
group: Scaling data
order: 306
aliases: quorum, n r w, tunable consistency, dynamo, cassandra, leaderless, sloppy quorum
---

A quorum store keeps N copies of each key, waits for W of them on a write, and asks R of them on a read.

## Use it when

- The store must keep taking writes while a replica is down.
- You can pick a consistency level per query, trading speed for freshness.
- Data is spread over several machines or regions and no single leader should be a bottleneck.

## How it works

If R + W is greater than N, any read set and any write set share at least one replica, so a read meets the latest acknowledged write. With N of 3, W of 2 and R of 2 satisfies it and survives one replica down. W of 1 and R of 1 is the fastest setting, but a read can miss the latest write.

Overlap is weaker than it sounds. Concurrent writes, a write that failed on some replicas, and sloppy quorums can still return old values, so a quorum is not linearizability. Money needs a [consensus](/patterns/consensus-and-leader-election) store.

## What it costs

A write costs N replica operations and a read costs R, so stronger settings use more capacity and wait for the slowest replica they need. A setting that needs every replica fails when one is lost. Weak settings serve stale reads, which the app must tolerate.

## In Quorum

The [Wide-column Store](/components/wide) takes N, R and W on its card, and the two Designs differ only in R and W.

::Design{id="quorum-strong"}

::Design{id="quorum-weak"}

The strong one reads the latest write and the weak one takes fewer replica operations but serves some stale reads. Neither is safe for checkouts, because overlap is not linearizability and a share still goes wrong. The store unlocks with [Leaderless replication](/research/leaderless). The glossary defines [quorum](/glossary/quorum) and [eventual consistency](/glossary/eventual-consistency). The [Hot key](/incidents/hot-key) incident shows one key overloading its replicas.
