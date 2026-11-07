---
title: Hedged requests
summary: Send a second copy of a slow call and keep the first answer, so a rare slow server stops setting your tail latency.
section: patterns
group: Resilience
order: 507
aliases: hedge, hedged request, tail latency, backup request, p99, tail at scale
---

A hedged request cuts the tail by racing a second copy of a call that is taking too long.

## Use it when

- The p99 is far above the p50 because a few calls land on a slow replica or a busy moment.
- The call is read-only or safe to repeat.
- The callee has spare capacity for a little extra traffic.

## How it works

The caller sends a request and starts a clock. If no answer arrives by about the p95 latency, it sends the same request to another replica and uses whichever answer comes first. A call is slow only when both copies are slow, so the rare slow answer must happen twice. Google described this in "The Tail at Scale". Hedging only after the p95 means about 5% of calls get a second copy, not all of them.

## What it costs

The callee sees extra load, and a hedge at the wrong threshold doubles it. A hedge on a write can run it twice, so use it for reads or idempotent calls. It also hides a slow replica instead of fixing it, and during real overload the extra copies make things worse. Cancel the losing copy when the winner returns.

## In Quorum

::Design{id="hedged-database-call"}

**Hedge** is a setting on a Link, so each Link chooses for itself. It sends a second copy after a slow first one and keeps the faster answer: the tail drops, and the Database sees a small share of extra calls. [Hedged requests](/research/hedged-requests) unlocks it and needs [Tracing](/research/tracing). The glossary defines [hedged request](/glossary/hedged-request) and [tail at scale](/glossary/tail-at-scale).
