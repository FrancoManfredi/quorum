---
title: Chaos engineering
summary: Break your own system on a schedule and under watch, so you find the weak link before an outage does.
section: patterns
group: Resilience
order: 510
aliases: chaos, chaos monkey, fault injection, game day, failure experiment
---

Chaos engineering runs small, planned failures in a live system to check that it survives them.

## Use it when

- You believe a failover, retry or fallback works but have never seen it run.
- The system is stable enough that a small failure will teach you something, not just cause an outage.
- Dashboards and alerts are good enough to show what the experiment did.

## How it works

State what normal looks like, such as an error rate under 1%. Pick one failure, such as a killed instance or an added 300 ms of latency. Run it against a small share of traffic, watch the same measure, and stop if it passes a limit. If normal held, you confirmed a defense. If not, you found a gap and fixed it on a quiet afternoon. Netflix's Chaos Monkey began this by terminating random instances in production.

## What it costs

Real users can feel an experiment, so start small, in staging or on a slice, and keep a stop button. A team without runbooks and on-call has no use for it, because it only produces failures nobody can handle. The mistake is chaos without a hypothesis, which is just breaking things.

## In Quorum

The game has no Node or Link setting for this, so it has no Design. [Chaos engineering](/research/chaos-engineering) needs [Runbooks](/research/runbooks) and unlocks a switch for the whole Company. While it is on, the game periodically fails a share of the weakest Node's calls for a few seconds and names it, and the experiment earns Failure Insight. It does not run in a Sandbox. The [Split brain](/incidents/split-brain) incident lists chaos experiments as its prevention. The glossary defines [chaos engineering](/glossary/chaos-engineering) and [blast radius](/glossary/blast-radius).
