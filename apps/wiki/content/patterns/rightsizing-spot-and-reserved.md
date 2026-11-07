---
title: Rightsizing, spot and reserved
summary: Match each machine to the load it carries, then buy the steady part on a commitment and the interruptible part at a deep discount.
section: patterns
group: Cost
order: 901
aliases: rightsizing, right sizing, spot instances, reserved instances, savings plans, on-demand, instance family, arm, graviton, compute cost, finops
---

Shrink machines to the load they carry, then pay the cheapest price each part of the fleet can accept.

## Use it when

- Utilization graphs sit under about a third at peak, so you pay for idle capacity.
- Load has a steady floor that never goes away, which is the part to commit to.
- Some work can be interrupted and retried, such as batch jobs or stateless workers.

## How it works

Rightsizing comes first, because a discount on an oversized machine saves less than removing the oversize. Pick the instance family by the bottleneck: memory-heavy for caches, compute-heavy for CPU-bound code. ARM families, such as AWS Graviton, run many workloads for about 20% less if the software ports.

Then buy by predictability. **On-demand** has no commitment. **Reserved** instances or savings plans trade a one- or three-year commitment for roughly 30 to 70% off. **Spot** capacity, up to about 90% off, can be reclaimed with a two-minute warning on AWS.

Example: eight web servers where six are always busy and two handle peaks. Reserve the six, run the two on spot behind the same load balancer, and the loss of a spot box only trims capacity.

## What it costs

Commitments are paid whether the box is used or not, so reserving before rightsizing locks in waste. Spot fails at the worst moment unless the app shuts down cleanly and a non-spot copy stays up. Never put a primary database on spot.

## In Quorum

Pricing is a setting on compute Nodes from Series A, and the Design below splits one fleet three ways.

::Design{id="fleet-pricing"}

[Reserved instances](/research/reserved-instances) and [Spot instances](/research/spot-instances) both need [Autoscaling](/research/autoscaling). A reserved Node cannot go back to on-demand until its term ends. [Rightsizing report](/research/rightsizing) marks Nodes that never get close to busy at peak, and [ARM instances](/research/arm-instances) add a cheaper family. [Savings plans](/research/savings-plans) discount every compute Node without a per-Node term. The [Spot reclaim](/incidents/spot-reclaim) incident shows what an interruption costs a fleet with no on-demand copy. The [spot instance](/glossary/spot-instance) glossary entry and [Cut the cloud bill](/guides/cut-the-cloud-bill) cover the rest.
