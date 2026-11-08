---
title: Vertical and horizontal scaling
summary: Make one machine bigger, or run more machines, and know which one to reach for first.
section: patterns
group: Scaling reads and compute
order: 207
aliases: scale up, scale out, scaling, bigger box, more servers, single point of failure
---

Scaling vertically means a bigger machine, and scaling horizontally means more machines sharing the work.

## Use it when

- Vertical: one box is the limit, the code keeps state in memory, and a restart is acceptable.
- Horizontal: you need to survive losing a machine, or one box of the biggest size is not enough.
- Either: a load bar is red on a single tier, which tells you what to grow.

## How it works

Going vertical changes one number, and nothing else in the system notices. A 4 vCPU server becomes an 8 vCPU one. The ceiling is the largest machine you can rent, and the price per core climbs near the top.

Going horizontal puts a load balancer in front of several copies. Two 2 vCPU servers hold as much CPU as one 4 vCPU server, but they need a place to share state, usually the database, because a user's next request may land on the other copy.

## What it costs

Vertical scaling has a hard ceiling and one point of failure, and resizing a box usually means a restart. Horizontal scaling adds a balancer, health checks, and the rule that servers hold no local state. It also multiplies database connections, which is why people add a [connection pool](/patterns/connection-pooling) soon after.

Start vertical because it is cheap in engineering time, then go horizontal when you need failure tolerance or run out of box.

## In Quorum

The two Designs serve the same Users with the same total CPU. The first has one larger [App Server](/components/server), and the second has two smaller ones behind a [Load Balancer](/components/lb). Compare the Burn and the caption of each.

::Design{id="scale-up"}

::Design{id="scale-out"}

The [Scale up first](/patterns/scale-up-first) and [Several app servers behind a load balancer](/patterns/several-app-servers-behind-a-load-balancer) steps cover one approach each. The glossary defines [vertical and horizontal scaling](/glossary/vertical-and-horizontal-scaling), and [Survive a traffic spike](/guides/survive-a-traffic-spike) uses both.
