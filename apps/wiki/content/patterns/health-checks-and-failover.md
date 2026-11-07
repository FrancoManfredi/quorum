---
title: Health checks and failover
summary: Probe each server and stop sending it traffic when it stops answering, then move to a standby when a whole zone goes.
section: patterns
group: Resilience
order: 509
aliases: health check, failover, standby, liveness, readiness, multi-az, zone, deep check
---

A health check finds a dead server before users do, and failover moves its work somewhere else.

## Use it when

- Several copies of a service sit behind a load balancer, and one can die without anyone noticing.
- A single data store has a replacement waiting in another zone.
- Slow detection is costing errors, and you can see them in the gap between a failure and the first healthy answer.

## How it works

The load balancer calls an endpoint on every server at a fixed interval. A server that fails stays out of rotation until it passes again. A shallow check asks only whether the process is up. A deep check also asks whether its database answers, which catches a server that is alive but useless. The interval sets the cost of a failure: a 30-second interval leaves a dead server in rotation for up to 30 seconds. Failover for data works the same way, with a standby that takes over when the primary stops responding.

## What it costs

A short interval adds probe load, and a deep check can take every server out at once when the shared database blips. A standby is a second machine you pay for and rarely use, and a failover that has never been tested often does not work. Keep checks cheap and make failure of the check itself safe.

## In Quorum

::Design{id="lb-health-checks"}

Two settings on the Load Balancer shorten the gap. **Health check interval** sets how soon it notices a dead server, and **Deep health check** also removes App Servers whose Database is down or overloaded. Both need [Health checks](/research/health-checks), and the deep check also needs the Health check endpoint task done by the team. The two App Servers sit in different **Zones**, and the Database has a **Standby**, which takes over within seconds when its zone fails and doubles that Node's Burn. Zones and standbys need [Multiple zones](/research/multi-az). The [Zone outage](/incidents/zone) incident tests this Design. The glossary defines [health check](/glossary/health-check) and [availability zone](/glossary/availability-zone).
