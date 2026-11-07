---
title: CAP and PACELC
summary: When the network splits, a replicated store must refuse some requests or serve stale ones, and even when it is healthy it trades latency for consistency.
section: patterns
group: Foundations
order: 12
aliases: cap theorem, pacelc, partition tolerance, consistency vs availability, ap, cp, pa/el, pc/ec
---

CAP says that when a network partition splits a replicated system, it can stay consistent or stay available, not both. PACELC adds what CAP leaves out: when there is no partition, you still choose between latency and consistency.

Picture a ticket seller with one database in Frankfurt and a copy in Virginia, and the link between them goes down. A **CP** design refuses writes on the side that cannot reach the majority, so no seat is sold twice, but some customers see errors. An **AP** design keeps selling on both sides and reconciles later, so everyone gets an answer, and seat 14C may be sold to two people. The partition is not a choice. You only choose what to give up while it lasts.

Partitions are rare, so the long stretches between them matter more. Here PACELC asks: Else, Latency or Consistency? A write that must reach Virginia before it is acknowledged adds a round trip of roughly 90 ms between Frankfurt and Virginia. A write acknowledged locally is fast, and a reader on the other side may see old data for a while. Daniel Abadi, who proposed PACELC, sorts real systems this way. Dynamo, Cassandra and Riak are PA/EL: they give up consistency for availability in a partition and for latency otherwise. VoltDB and BigTable are PC/EC. MongoDB is PA/EC.

## What it changes about a design

Decide per piece of data, not per company. A shopping cart can be AP, because a duplicated line item is easy to fix. An account balance or a seat count should be CP. One system often holds both, so you want a store you can tune per query ([Quorum reads and writes](/patterns/quorum-reads-and-writes)).

CAP is also narrower than people use it. Its "consistency" means linearizability, and its "availability" means every non-failing node answers. Strictly, a system that errors on 0.1% of writes during a partition is not available in CAP's sense, though its users would call it up. See [Consistency models](/patterns/consistency-models) for the weaker guarantees in between.

## In Quorum

The [Network partition](/incidents/partition) Incident cuts calls between regions and diverges leader-based writes, and [Split brain](/incidents/split-brain) shows what two halves of a realtime cluster cost. A Distributed SQL Node keeps one Raft leader, which is the CP choice, while a Wide-column Store with a weak [quorum](/glossary/quorum) is the AP one. The Research [Consensus databases](/research/consensus) and [Leaderless replication](/research/leaderless) unlock both. Read [Consensus and leader election](/patterns/consensus-and-leader-election) for how the CP side works.
