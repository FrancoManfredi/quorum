---
title: Logs, metrics and traces
summary: Tap the Nodes into Analytics and research the visibility track, so you can see error causes, history and the slow hop of each request instead of guessing.
section: patterns
group: Scaling steps
order: 128
aliases: observability, logging, metrics, tracing, opentelemetry, sampling, tail sampling, p99, dashboards, retention
---

Tap each Node into Analytics, and add the research that shows errors by cause, history, percentiles and per-hop traces.

## Move up when

- The p99 moves and you cannot say which hop caused it.
- Errors look like one number, with no cause behind it.
- You cannot tell a failing Node from a slow one without opening each card.

## The Design

::Design{id="logs-metrics-traces"}

Traffic flows through the Load Balancer, the App Server and the Database. Analytics receives a copy by Link and samples it. It carries no traffic itself.

## Why it works

Logs show errors split by cause. Metrics add history graphs and the Dashboard. Percentiles show p50, p95 and p99 next to the mean. Tracing names the slowest hop of each request kind, and researching it needs each kind sampled at several different Component types, so link Nodes of different types.

A lower sample rate keeps CPU and latency low on the tapped hops, and a higher one gives more Insight. Tail-based sampling keeps slow and failed traces, so it earns more Failure Insight from the same failures. Retention sets how long traces stay.

## What it costs

Sampling adds CPU and latency to every tapped Node and storage Burn to Analytics. Samples past its capacity are dropped evenly, so size it for the rate you set. Real tracers cost the same way and use sampling for the same reason. The game has no separate log store for application text, so Analytics is the one place the Board shows what it sees.

## In Quorum

Place [Analytics](/components/analytics) and link Nodes into it. Research [Structured logs](/research/logs), [Metrics](/research/metrics), [Percentiles](/research/percentiles), [Distributed tracing](/research/tracing) and [Tail-based sampling](/research/tail-sampling). Read [Insight and observability](/explanation/observability) and [distributed tracing](/glossary/distributed-tracing). The next step, [services with a mesh](/patterns/split-into-services-with-a-mesh), needs this view to be debuggable.
