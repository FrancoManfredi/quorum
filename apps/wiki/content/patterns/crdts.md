---
title: CRDTs
summary: A conflict-free replicated data type lets every replica accept writes on its own and still merge to the same state without coordination.
section: patterns
group: Outside the game
order: 1009
aliases: crdt, conflict-free replicated data type, merge, collaborative editing, offline first, g-counter, local-first
---

A CRDT is a data structure built so that any two replicas that have seen the same updates reach the same state, whatever order the updates arrived in. The crdt.tech site describes them as taking care of conflict resolution for you.

Use one when replicas must keep writing while disconnected. Two phones edit a shared shopping list on a plane. Each adds items offline, and on landing they sync. With an add-wins set, an item one phone added is kept even if the other removed it concurrently, and both phones show the same list with no server deciding. Counters, sets, registers and text sequences all have CRDT forms, and collaborative editors use them.

The cost is design freedom. Each type has fixed merge rules, so a rule you did not want, like add-wins, is baked in. Metadata grows, since replicas often keep tombstones for removed items or a vector of per-replica counters, and the state needs compaction. Invariants like "stock never below zero" cannot be enforced without coordination, which is the point of the trade. Pick CRDTs for data where any merged result is acceptable.

## Nearest in Quorum

The game has no CRDTs. The closest idea is a store that takes writes on several replicas and reconciles later. A Wide-column Store with [leaderless replication](/glossary/leaderless-replication) does this, and the Research [Leaderless replication](/research/leaderless) unlocks it. Its stale reads are what [eventual consistency](/glossary/eventual-consistency) costs, and a weak [quorum](/glossary/quorum) is the dial. Read [Replication strategies](/patterns/replication-strategies) and [Consistency models](/patterns/consistency-models) for context.

## References

- [About CRDTs, crdt.tech](https://crdt.tech/): a short definition and the case for decentralised operation, with links to papers.
- [CRDT Glossary, crdt.tech](https://crdt.tech/glossary): defines add-wins sets, state-based and operation-based types, and delta CRDTs.
- [Conflict-free Replicated Data Types (Preguiça, Baquero, Shapiro, 2018)](https://arxiv.org/abs/1805.06358): an overview paper that states the convergence properties.
