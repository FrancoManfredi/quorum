---
title: Distributed SQL and leaderless stores
summary: Replace hand-made shards with a store that replicates by itself, either leaderless with tunable quorums or SQL on Raft, and pick by whether you need every read correct.
section: patterns
group: Scaling steps
order: 127
aliases: cassandra, cockroachdb, raft, quorum, leaderless replication, wide column, newsql, tunable consistency, n r w
---

Let the store handle replication and splitting: a leaderless store for speed, or distributed SQL for correctness.

## Move up when

- Resharding by hand costs Dev Hours you do not have, and cross-shard transactions fail.
- A feed or log workload writes far more than a single primary can take.
- A checkout must be right everywhere, and a replica that lags is not acceptable.

## The Design

::Design{id="quorum-store"}

The leaderless Wide-column Store replicates each key to N nodes. A read asks R of them and a write waits for W. A Database stays beside it for the kinds the store does not take.

::Design{id="distributed-sql"}

Distributed SQL puts a SQL store on Raft. Each write waits for a majority of its replicas, so every read sees it.

## Why it works

When R plus W is above N, a read always meets a node that took the latest write. Lower R or W makes it faster and lets stale reads through. Distributed SQL gives that guarantee for transactions and costs more latency per write.

Even a strong quorum is not a transaction. A checkout on the wide-column store still goes wrong now and then, so use distributed SQL for money and a leaderless store for feeds.

## What it costs

Both bill several nodes at once, and distributed SQL bills the most. Neither takes searches or uploads, so a Database stays for them. A split can lose a replica, and a quorum that needs every replica then refuses. Both can also **Spread** across regions, which the multi-region step uses. The game does not model a lightweight transaction on the wide-column store.

## In Quorum

Place a [Wide-column Store](/components/wide) or [Distributed SQL](/components/dsql). Research [Leaderless replication](/research/leaderless) or [Consensus databases](/research/consensus). Read [quorums](/glossary/quorum), [Raft](/glossary/raft) and [The data tier](/explanation/the-data-tier). The next step, [logs, metrics and traces](/patterns/logs-metrics-and-traces), shows where these stores spend their time.
