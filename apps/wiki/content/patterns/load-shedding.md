---
title: Load shedding
summary: When demand passes capacity, refuse the cheapest work early so the work you keep still finishes on time.
section: patterns
group: Resilience
order: 505
aliases: shed load, overload, backpressure, priority, 503
---

Load shedding drops some requests on purpose, so the rest get a fast, correct answer.

## Use it when

- Traffic can exceed capacity for a while: a launch, a sale, a bot wave.
- Adding capacity takes minutes and the spike takes seconds.
- Some requests matter more than others, such as a checkout against a search suggestion.

## How it works

A server that accepts everything runs out of room and answers everyone slowly, then answers no one. A server that sheds checks its own queue or CPU on arrival. Past a threshold it returns an error immediately for the lowest-value kinds and keeps serving the rest. The refusal costs a few microseconds, where a doomed request would hold a thread for seconds.

At 130% of capacity with no shedding, every request waits behind a growing queue and most time out. With shedding, the 23% of arrivals beyond capacity get a quick 503, and the other 77% see normal latency.

## What it costs

Shed requests are lost revenue and visible errors, so the threshold and the ranking decide who pays. Clients that retry a 503 immediately undo the benefit, which is why shedding pairs with [backoff](/patterns/retry-with-backoff). It also hides an under-sized system, so alert on the shed rate instead of celebrating a green dashboard.

## In Quorum

::Design{id="shed-low-value"}

The App Server here is too small for its Users. **Shed low value** sits under **Overload** on the App Server and needs [Priority load shedding](/research/load-shedding). Past its load line, the App Server refuses whole request kinds, lowest value first, until it is back under the line, and the kinds it keeps stay fast. The dropped requests count as errors, so the caption still shows some. [Graceful degradation](/patterns/graceful-degradation) drops the dearest kinds instead.

[Survive a traffic spike](/guides/survive-a-traffic-spike) shows it in use. The glossary defines [load shedding](/glossary/load-shedding) and [backpressure](/glossary/backpressure).
