---
title: Load balancing algorithms
summary: Pick how a load balancer chooses among servers, because the right rule depends on whether servers differ and whether requests do.
section: patterns
group: Scaling reads and compute
order: 210
aliases: round robin, least connections, power of two choices, p2c, consistent hash, weighted, sticky sessions, slow start
---

A load balancer needs a rule for choosing a server, and the simplest rule fails when servers or requests are uneven.

## Use it when

- One server runs hot while its neighbours idle.
- Servers differ in size, or some requests take far longer than others.
- A new server falls over when it joins, because it gets full traffic while still cold.

## How it works

Round robin deals requests out in turn, so a small server gets as many as a large one. Weighted round robin gives each server a share by size. Least connections sends the next request to the server with the fewest open ones, which adapts to slow requests. Power of two choices picks two servers at random and takes the less busy, and it needs no shared state, so it scales across many balancers. Consistent hashing sends the same key to the same server, which helps caches.

Slow start ramps traffic to a new server over its first seconds. Sticky sessions pin a user to one server, which keeps local state working but unbalances the load.

## What it costs

Least connections needs the balancer to track every connection. Power of two choices compares only two servers, so it can still pick a busy one, and the game also splits a little of its traffic evenly whatever the load. Hashing ignores load, so a hot key overloads one server. Sticky sessions make a restart log users out.

## In Quorum

A [Load Balancer](/components/lb) has a policy. Weighted and round robin are open from the start, and least connections, two choices, and consistent hash need [Load balancing algorithms](/research/lb-algorithms). Sticky and slow start are switches. The Design mixes a larger and a smaller server and uses least connections.

::Design{id="lb-least-conn"}

The glossary defines [load balancer](/glossary/load-balancer) and [power of two choices](/glossary/power-of-two-choices), and [consistent hashing](/glossary/consistent-hashing) is the third.
