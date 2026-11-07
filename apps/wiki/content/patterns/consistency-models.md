---
title: Consistency models
summary: A consistency model says which values a read may return after a write, and the stronger ones cost latency and availability.
section: patterns
group: Foundations
order: 13
aliases: consistency, linearizability, linearizable, causal consistency, eventual consistency, sequential, read your writes, stale read
---

A consistency model is a promise about which values a read may return once writes have happened somewhere in the system. Jepsen defines one as a set of histories that a system can legally produce, and the models differ in how much of the real-time order they keep.

Here is the same story under three models. A user posts a comment, and the write lands on the primary at `12:00:00.000`. A replica applies it 200 ms later.

- **Linearizable.** Every operation looks instant and in real-time order. Once the write is acknowledged, every read anywhere returns it, including a read at `12:00:00.050`. The price is that the replica must check with the primary, or the write must wait for the replica.
- **Read-your-writes.** The author always sees the comment. Other users may see the old page for 200 ms. The usual fix sends a user's reads to the primary for a short time after they write.
- **Eventual.** If writes stop, all replicas converge. In the meantime anyone, including the author, can read the old page. This is the cheapest model, and a refresh may make the comment vanish and return.

Between them sits causal consistency, which keeps cause before effect: nobody sees a reply before the comment it answers.

## What it changes about a design

Use the weakest model that keeps your invariants true. A like counter can be eventual, since a count that is 200 ms behind harms nobody. A user who just changed a password should read their own write. A bank transfer that checks a balance needs a stronger model, because two readers acting on stale balances can both spend it.

Stronger models cost two things. Every read or write waits on more nodes, so latency goes up ([CAP and PACELC](/patterns/cap-and-pacelc) covers the trade), and during a partition some requests must fail. Weaker models cost bugs: a stale read becomes a duplicate order unless the code expects it.

A cheap middle path sends only the reads that care to the primary ([Read your writes](/patterns/read-your-writes), [Replication strategies](/patterns/replication-strategies)).

## In Quorum

A Read Replica lags behind writes, and the stale share of its reads follows the lag, which the [Replication lag](/incidents/repl-lag) Incident multiplies. [Stale reads](/incidents/stale-read) shows the same symptom from a Cache that outruns its invalidation. The Research [Read-your-writes routing](/research/ryw-routing) sends checkout reads to the primary, and the glossary defines [eventual consistency](/glossary/eventual-consistency), [read-your-writes consistency](/glossary/read-your-writes-consistency), and [replication lag](/glossary/replication-lag).
