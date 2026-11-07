---
title: Scale up first
summary: Give the App Server a bigger instance before you add a second one. It is the cheapest change that adds capacity.
section: patterns
group: Stack ladder
order: 104
aliases: vertical scaling, scale up, bigger instance, resize, instance size, upgrade the server
---

Resize the App Server to the next instance size before you reach for a second machine.

## Move up when

- The App Server's CPU bar is full while the Database has room.
- p99 climbs and some requests are dropped, though no one component is broken.

## The Design

::Design{id="small-box-full"}

::Design{id="bigger-box"}

Same Users, same Database. The only change is one size step on the App Server.

## Why it works

A size step doubles the vCPUs and costs a little more Burn. Nothing else changes: no balancer, no second copy, no question about shared state. In the second picture the App Server's load bar drops well under full, the dropped requests stop, and p99 falls back to normal.

Scaling up is also reversible. If the peak was short, resize down and the bill follows.

## What it costs

A resize restarts the Node and it comes back cold, so do it before the peak and not during. Sizes top out, and one box is still one failure. Price rises with size, so you pay for capacity you use only at the peak.

A runtime that runs one process cannot use extra cores. Plain Node.js is one event loop, so doubling its vCPUs buys little, and a second copy or a cluster runtime helps more. Check the runtime before you pay for cores.

## In Quorum

Resize from the Node's Inspector, and read the cost before you commit. [Find the bottleneck](/guides/find-the-bottleneck) shows how to tell the App Server from the Database. The glossary defines [vertical and horizontal scaling](/glossary/vertical-and-horizontal-scaling). The next rung is [several App Servers behind a Load Balancer](/patterns/several-app-servers-behind-a-load-balancer).
