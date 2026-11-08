---
title: Several app servers behind a load balancer
summary: Put a Load Balancer in front of identical App Servers so traffic splits across them and capacity grows by adding copies.
section: patterns
group: Scaling steps
order: 105
aliases: horizontal scaling, scale out, load balancer, nginx, reverse proxy, fleet, round robin
---

Place a Load Balancer in front of two or more identical App Servers and let it split the traffic.

## Move up when

- The biggest instance size you can afford has a full CPU bar, or the next size costs more than a second box.
- One App Server is a single point of failure you can no longer accept.

## The Design

::Design{id="one-server-saturated"}

::Design{id="two-servers-balanced"}

The first picture is one App Server over capacity. In the second, Users reach the Load Balancer, which passes each request to one of two App Servers. Both call the same Database.

## Why it works

Each server now takes half the requests, so its load bar falls under full, drops stop, and p99 returns to normal. The default algorithm splits by capacity. With identical servers that is an even split, and with mixed sizes each server takes a share that matches its capacity. Least connections follows live load instead, which helps when servers slow unevenly, and needs research.

This works because the previous steps left no state on the server. If a user's next request lands on the other copy, it finds the same rows and files.

## What it costs

The Load Balancer is one more hop and one more Node to size. Alone, it is the new single point of failure. Both servers hold their own connections to the Database, so the connection count roughly doubles with each copy, which is the next problem. Turning on sticky sessions pins users to a copy and unbalances the load.

## In Quorum

Research [Load balancing](/research/load-balancing) to unlock the [Load Balancer](/components/lb), then link it to each [App Server](/components/server). [Load balancing algorithms](/research/lb-algorithms) adds least connections. The glossary defines the [load balancer](/glossary/load-balancer). The next step is [dropping dead nodes with health checks](/patterns/drop-dead-nodes-with-health-checks).
