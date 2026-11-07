---
title: Availability and the nines
summary: Each extra nine of uptime cuts the allowed downtime tenfold, and every hard dependency in a chain pulls the total down.
section: patterns
group: Foundations
order: 11
aliases: availability, nines, uptime, 99.9, 99.99, downtime, sla, slo, redundancy
---

Availability is the share of time, or of requests, that a service answers correctly, and people state it in nines. Google's SRE book tabulates what each level allows:

| Availability | Down per year | Down per month |
| ------------ | ------------- | -------------- |
| 99%          | 3.65 days     | 7.2 hours      |
| 99.9%        | 8.76 hours    | 43.2 minutes   |
| 99.99%       | 52.6 minutes  | 4.32 minutes   |
| 99.999%      | 5.26 minutes  | 25.9 seconds   |

A 99.99% target gives you about four minutes a month. One slow deploy that takes the site down for ten minutes spends more than two months of it.

## Chains multiply

When a request needs service A and service B and a database, all three must be up, so you multiply their availabilities. Three components at 99.9% each give 0.999 × 0.999 × 0.999, which is 99.7%, or about 26 hours down a year. The chain is always worse than its weakest link.

Redundancy works the other way. Two independent copies at 99% fail together only when both are down, which happens 0.01 × 0.01 = 0.0001 of the time, so the pair is 99.99% available. The word "independent" carries the whole claim. Two copies in one rack, or two that share a config push, fail together and give you nothing.

## What it changes about a design

Pick the target from what users need and what you can pay for, then work backward. Each nine costs roughly an order of magnitude more effort, so a hobby site does not need four of them. A shop that loses money by the minute might.

Cut hard dependencies from the request path. If a recommendations call at 99.5% sits in front of every page, the page cannot beat 99.5% unless it can skip the call ([Graceful degradation](/patterns/graceful-degradation)). Spread copies across failure domains, and detect a dead copy fast enough that the pair actually behaves as the formula says ([Health checks and failover](/patterns/health-checks-and-failover)).

The gap between your target and 100% is an error budget, the failures you may spend on releases and experiments ([SLOs and error budgets](/patterns/slos-and-error-budgets)).

## In Quorum

Each Era sets an [SLO](/glossary/slo-sla-sli), and the failures it allows are your [error budget](/glossary/error-budget). Placing copies in different [Zones](/glossary/availability-zone) needs the [Multiple zones](/research/multi-az) Research, and [Incidents](/explanation/incidents) explains how the game picks failures to test the weak link in your Design.
