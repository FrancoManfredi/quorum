---
title: Two-phase commit
summary: Two-phase commit makes several databases commit or abort one transaction together, by voting first and committing second, at the price of blocking when the coordinator fails.
section: patterns
group: Outside the game
order: 1008
aliases: two-phase commit, 2pc, xa, distributed transaction, atomic commit, coordinator
---

Two-phase commit (2PC) is an atomic commitment protocol: a coordinator asks every participant to prepare, and only if all vote yes does it tell them to commit.

Reach for it when a transaction must be all-or-nothing across a few databases you control and the latency is acceptable. Moving money between two accounts held in two databases is the textbook case. In phase one the coordinator asks both to prepare, and each writes the change to its log and votes. In phase two, if both said yes, the coordinator tells them to commit, and if either said no, it tells them to abort.

It costs availability and speed. A participant that has voted yes holds its locks until it hears the verdict, so if the coordinator dies after the vote, they wait, and nothing else can touch those rows. Every transaction takes extra round trips and is as slow as the slowest participant. Pat Helland argued in 2007 that large scalable applications rarely assume distributed transactions, because their fragility puts unacceptable pressure on availability. Teams usually reach for sagas or an outbox instead, and accept eventual consistency.

## Nearest in Quorum

The game has no 2PC. A Distributed SQL Node gets agreement on every write another way, by waiting for a majority of its replicas with Raft, and the Research [Consensus databases](/research/consensus) unlocks it. See [Consensus and leader election](/patterns/consensus-and-leader-election), the [Distributed SQL](/components/dsql) Component, and [Raft](/glossary/raft). The workaround without distributed transactions is the [Transactional outbox](/patterns/transactional-outbox), and [Saga](/patterns/saga) covers the compensation side.

## References

- [Two-phase commit protocol, Wikipedia](https://en.wikipedia.org/wiki/Two-phase_commit_protocol): the voting and commit phases and the failure cases where manual repair is needed.
- [Life beyond Distributed Transactions, Pat Helland (CIDR 2007)](https://www.cidrdb.org/cidr2007/papers/cidr07p15.pdf): why scalable systems avoid distributed transactions.
- [Saga pattern, microservices.io](https://microservices.io/patterns/data/saga.html): the usual replacement in microservices, with its own trade-offs.
