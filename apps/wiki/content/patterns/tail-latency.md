---
title: Tail latency
summary: The slowest few percent of requests set how a service feels, and a request that fans out to many servers meets that tail almost every time.
section: patterns
group: Foundations
order: 15
aliases: tail latency, p99, p999, tail at scale, fan-out, stragglers, hedging, long tail
---

Tail latency is the latency of your slowest requests, usually the p99 or p99.9, and it decides how a service feels because users who hit it remember it.

A GC pause adds 150 ms to 2% of requests on a service that normally answers in 40 ms. The mean moves to 43 ms, which looks like noise. The p99 is now about 190 ms, nearly five times the usual 40, a change the mean hid.

Fan-out makes this worse. Jeff Dean and Luiz Barroso's paper "The Tail at Scale" gives the case: each server answers in 10 ms but takes a full second 1% of the time. A request served by one server is slow 1 time in 100. A request that must collect answers from 100 such servers is slow if any one is, which is 1 − 0.99^100, about 63% of requests. The slowness is rare on each server and common for the user.

The fix the paper reports is a hedged request. Send the request to one replica, and if it has not answered by the 95th percentile of normal latency, send a copy to another and take whichever replies first. In a Google benchmark that read 1,000 keys from 100 servers, hedging after 10 ms cut the 99.9th percentile from 1,800 ms to 74 ms for 2% more requests.

## What it changes about a design

Measure percentiles, never only the mean ([Percentiles, not averages](/patterns/percentiles-not-averages)). Set SLOs on p99, and watch p99 per route, because a quick page and a slow export share nothing.

Shrink fan-out. A page that calls 30 services in parallel inherits the tail of the worst of them, so fewer calls beat faster ones. Where you cannot, hedge reads that are safe to repeat ([Hedged requests](/patterns/hedged-requests)), cap each call with a [timeout](/patterns/timeouts), and drop optional calls that run late.

Remove the causes where you can: GC pauses, cold caches, noisy neighbors and queues that run near full. Queues are a common cause, so keep utilization down ([Latency vs throughput](/patterns/latency-vs-throughput)).

## In Quorum

A request collects the tail events of every Node on its path, so a long chain has a worse p99 than any one Node in it. The [Percentiles](/research/percentiles) Research swaps the HUD's mean for p99, and [Hedged requests](/research/hedged-requests) unlocks the fix. The [GC pause storm](/incidents/gc-storm) Incident shows a tail event, [Read the p99](/guides/read-p99) walks through the Dashboard, and the glossary defines [tail at scale](/glossary/tail-at-scale) and [percentiles](/glossary/percentile-p50-p95-p99).
