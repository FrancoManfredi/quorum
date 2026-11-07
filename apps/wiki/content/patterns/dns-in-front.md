---
title: DNS in front
summary: Put DNS ahead of several Load Balancers so the entry point is not a single machine, and set its TTL to match how fast you need failover.
section: patterns
group: Stack ladder
order: 108
aliases: dns round robin, route 53, ttl, multiple load balancers, redundant load balancer, domain
---

Point the domain at DNS, and let DNS hand out the addresses of two or more Load Balancers.

## Move up when

- The Load Balancer is itself the single point of failure.
- Users can take only one link, and you need more than one entry point.

## The Design

::Design{id="dns-slow-ttl"}

::Design{id="dns-fast-ttl"}

Both pictures show one minute after a Load Balancer died. DNS splits traffic evenly between two Load Balancers, and both reach the same two App Servers. A long TTL keeps sending users to the dead one. A short TTL has dropped it.

## Why it works

DNS answers are cached by resolvers for the TTL. With a long TTL, half the requests keep going to the dead Load Balancer until the TTL runs out. With a short one, DNS stops handing out the dead address within a lookup or two, and errors return to zero.

## What it costs

DNS has no health checks until you research them, so a dead host keeps its share. It also ignores size, so a small host gets as much as a large one. A short TTL means more lookups, and some resolvers hold answers longer than you ask. The TTL is a promise about the best case, not a guarantee.

## In Quorum

The [DNS](/components/dns) Component unlocks with [DNS round robin](/research/dns-rr). Changing the TTL needs [Health checks](/research/health-checks), and DNS drops a dead host only once your Team has also built the Health check endpoint. The glossary defines [DNS round robin](/glossary/dns-round-robin). The next rung is [static files on object storage and a CDN](/patterns/static-files-on-object-storage-and-a-cdn).
