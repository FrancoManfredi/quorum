---
title: Distributed tracing and tail sampling
summary: Follow one request across every service as a trace, and decide after it finishes which traces to keep, so the slow and failed ones survive sampling.
section: patterns
group: Operate and observe
order: 704
aliases: tracing, trace, span, opentelemetry, otel, jaeger, tempo, sampling, head sampling, tail sampling, sample rate, retention
---

Give each request an ID that every hop passes along, then keep the traces worth reading and drop the rest.

## Use it when

- A request is slow, the dashboard shows every service as healthy, and nobody knows which hop spent the time.
- A page calls many services and you need the slowest one, not the average one.
- Tracing every request costs more than the problems it finds.

## How it works

Each service records a **span**: its name, start and duration, with the trace ID it received. The spans of one request, joined by that ID, form a trace. A waterfall of it shows which hop was slow and which ones ran in parallel.

**Head sampling** decides at the first service, say keep 1 request in 100. It is cheap, but it drops 99% of the slow ones too. **Tail sampling** buffers a trace until it ends, then keeps every error and every request slower than a threshold, plus a small share of the rest. OpenTelemetry's collector does this with a tail-sampling processor, and the buffer holds spans for a decision window of about 30 seconds.

With a 1% error rate and 1% head sampling, 1 in 10,000 requests is an error you kept. Tail sampling keeps all of them.

## What it costs

Tail sampling needs every span of a trace on one collector, so it needs routing by trace ID and memory for the buffer. A trace is also only as complete as the services that propagate the ID. One service that drops it cuts every trace in two.

## In Quorum

Link Nodes into an [Analytics](/components/analytics) Node and it samples their traffic, as below.

::Design{id="tracing-sampled"}

[Distributed tracing](/research/tracing) names the slowest hop of each request kind, and [Tail-based sampling](/research/tail-sampling) makes sampled failures teach more Failure Insight. The game keeps no per-trace buffer, so tail sampling there changes the Insight earned, not what the tap records. The glossary defines [distributed tracing](/glossary/distributed-tracing), and [Insight and observability](/explanation/observability) covers the cost of a higher rate.
