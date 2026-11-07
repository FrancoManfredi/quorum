---
title: Percentiles, not averages
summary: Report p50, p95 and p99 instead of the mean, because a mean averages away the slow requests that real users complain about.
section: patterns
group: Operate and observe
order: 703
aliases: percentile, p99, p95, p50, mean, average latency, histogram, tail
---

Measure latency as percentiles, since the mean says almost nothing about the slow requests users remember.

## Use it when

- The mean latency looks healthy but users report slowness.
- A page makes many calls, so one slow call spoils the whole page.
- You set or check a latency target.

## How it works

The p99 is the time that 99 of 100 requests beat. If a GC pause adds 150 ms to 2% of requests, the p99 jumps by 150 ms and the mean moves by 3 ms. Both numbers are true, but only one matches what the slowest users felt.

Store histograms and not precomputed percentiles. You cannot average a p99 across servers, but you can add their histogram buckets and read a fleet-wide p99 from the sum.

Tails also compound. A page that waits on 100 backend calls, each slow 1% of the time, hits a slow call on about 63% of loads. Jeff Dean and Luiz Barroso described this in "The Tail at Scale".

## What it costs

High percentiles are noisy at low traffic, since a p99 over 50 requests is one request. Histograms need agreed bucket bounds, and a bucket that is too wide hides a shift. Do not chase p99.99 unless the product earns from it.

## In Quorum

[Percentiles](/research/percentiles) shows p50, p95 and p99 next to the mean on the HUD, and the Users Node shows them for each request kind. [Read p99](/guides/read-p99) walks through finding the kind and the Node behind a tail, and [Latency and percentiles](/explanation/latency) says why the mean misleads. [Tail latency](/patterns/tail-latency) is the foundation behind it, and the glossary defines [percentiles](/glossary/percentile-p50-p95-p99) and [tail at scale](/glossary/tail-at-scale).
