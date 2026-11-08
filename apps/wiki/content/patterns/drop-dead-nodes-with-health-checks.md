---
title: Drop dead nodes with health checks
summary: Have the Load Balancer probe each server and stop sending traffic to one that has failed, so a dead host costs seconds instead of a share of requests.
section: patterns
group: Scaling steps
order: 106
aliases: health check, failover, dead host, probe, liveness, readiness, deep check, drain
---

Tighten the Load Balancer's health check so a failed App Server leaves the rotation within seconds.

## Move up when

- An App Server dies and a fixed share of requests fail until someone notices.
- The Load Balancer still lists a host that no longer answers.

## The Design

::Design{id="slow-health-checks"}

::Design{id="fast-health-checks"}

Both pictures show the same moment, ten seconds after one of three servers died. With a slow check the Load Balancer still sends that host a third of the traffic. With a fast check it has already dropped the host and the other two share the load.

## Why it works

The interval is how long a dead host keeps its share. Errors in the first picture are exactly the share the dead server would have taken. In the second they are gone, and the two healthy servers absorb the load with room to spare.

A deep check goes further. It also takes out any server whose Database is down or overloaded. That needs the Health check endpoint task from your Team, and it is sharp: if the Database fails, every server fails the check.

## What it costs

A short interval means more probe traffic and more chance of removing a host over a blip. Real teams keep deep checks narrow for this reason. A check also only helps if you run spare capacity, because the survivors must carry the dead host's share.

## In Quorum

Research [Health checks](/research/health-checks) to change the interval or turn on deep checks. The same research unlocks draining a Node. An [Instance failure](/incidents/instance) shows the gap. The glossary defines a [health check](/glossary/health-check). The next step is a [pooler between servers and database](/patterns/pooler-between-servers-and-database).
