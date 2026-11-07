---
title: Golden signals, RED and USE
summary: Watch four things on every service, latency, traffic, errors and saturation, and check three more on every resource, so a dashboard answers "what is broken" before anyone opens a log.
section: patterns
group: Operate and observe
order: 701
aliases: golden signals, four golden signals, red method, use method, monitoring, metrics, dashboard, saturation
---

Pick a small, fixed set of signals for every service and every resource, so an outage starts with a graph and not a guess.

## Use it when

- An alert says "something is slow" and nobody knows where to look first.
- Every team graphs a different set of numbers, so no two dashboards compare.
- You add a service and need a default dashboard on day one.

## How it works

Google's SRE book names four golden signals: **latency**, **traffic**, **errors** and **saturation**. Tom Wilkie's **RED method** keeps the first three for each request-driven service: rate, errors, duration. Brendan Gregg's **USE method** covers each resource, such as a CPU, a disk or a connection pool: utilization, saturation and errors.

Use RED for the thing users call and USE for the thing that call runs on. A checkout service at 2% errors and rising p99 (RED) with its database pool at full utilization and a growing wait list (USE) points straight at the pool.

Split latency by outcome. A fast error hides in an average, so a failed request and a successful one belong on different lines.

## What it costs

Every signal is a series that someone stores and pages on. Alert on symptoms users feel, such as errors and latency, and keep cause signals like CPU on the dashboard. Paging on CPU at 80% wakes people for machines that are fine.

## In Quorum

The Dashboard opens with [Metrics](/research/metrics), and its first rows chart the four golden signals: traffic, latency, errors and saturation. [Distributed tracing](/research/tracing) adds a Services row, which is RED for each request kind, and [Continuous profiling](/research/profiling) fills a Resources row, which is USE for each Node. [Percentiles](/research/percentiles) puts the p99 beside the mean, and [Alerting](/research/alerting) pages on errors, latency, saturation, queue age or budget burn. [Insight and observability](/explanation/observability) explains each, and [Read p99](/guides/read-p99) shows how to chase a tail. The glossary defines the [four golden signals](/glossary/four-golden-signals), the [RED method](/glossary/red-method) and the [USE method](/glossary/use-method).
