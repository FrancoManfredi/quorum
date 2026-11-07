---
title: Functions for spiky jobs
summary: Run bursty or rare work on a Serverless Function that bills per use and scales from zero, and keep steady load on boxes.
section: patterns
group: Stack ladder
order: 118
aliases: serverless, lambda, cloud functions, cold start, scale to zero, faas
---

Put work with sharp peaks and long quiet stretches on a Serverless Function, so you pay only while it runs.

## Move up when

- Traffic is spiky, and boxes sit idle most of the day or fall over at the peak.
- One endpoint needs its own capacity without a second box to run.
- The work is short, since a function has a time limit.

## The Design

::Design{id="function-front"}

Users call the Function directly, and it calls the Database. There is no App Server. The Function takes its **Runtime** from your Stack, and the runtime sets how fast it runs and how long a cold start takes.

## Why it works

Nothing stands while it idles, so a quiet hour costs almost nothing. Capacity follows demand up to a concurrency cap, with no Autoscaler to tune and no boxes to boot. A compiled runtime starts cold in a fraction of a second, where a JVM needs seconds, so the language you choose changes the cost of scale to zero.

## What it costs

An environment that sat idle is gone, so the next call pays a cold start. Past the cap the provider throttles and drops the excess. Each execution opens its own database connections, so a spike lands on the Database, and a pooler is worth having. Above a steady share of an equal VM's load, a function costs more than the box. Long work such as an export belongs on a Worker, because a function stops after a fixed time.

## In Quorum

Place a [Serverless Function](/components/fn) after [Serverless](/research/serverless), and a runtime Research such as Go for the **Runtime**. Put a [CDN](/patterns/cdn-push-and-pull) or [Cache](/components/cache) in front, because every request that reaches a function bills. The glossary has [cold start](/glossary/cold-start). The next rung scales boxes: [Autoscale the compute tier](/patterns/autoscale-the-compute-tier).
