---
title: Layer 4 and layer 7 load balancing
summary: Choose between a balancer that forwards TCP connections quickly and one that reads each HTTP request so it can route by content.
section: patterns
group: Scaling reads and compute
order: 211
aliases: l4, l7, tcp load balancer, http load balancer, nlb, alb, content routing, path routing
---

A layer 4 balancer forwards connections without looking inside, and a layer 7 balancer reads the request and decides with what it finds.

## Use it when

- L7: you want to retry a failed call on another server, or check a target's health over HTTP.
- L4: raw throughput and low latency matter more than routing, or the traffic is not HTTP.
- Either: a single balancer is the busiest node on the board.

## How it works

An L4 balancer works on IP addresses and ports. It picks a backend and passes the bytes along, so it does little work per request and handles very large volumes. An L7 balancer terminates the connection, parses HTTP, and can send `/api` to one pool and `/images` to another, add headers, and retry. Real examples are AWS's Network Load Balancer for L4 and its Application Load Balancer for L7.

Splitting pools by kind also isolates them: a flood of page views cannot starve the API servers. Quorum gives that split to the [API Gateway](/components/gw) and leaves the balancer to spread what reaches it.

## What it costs

L7 does more work per request, so it has a lower ceiling, costs more per request, and adds latency. L4 cannot see paths or retry a request, and it spreads load by connection, so one long-lived connection can pin a server.

## In Quorum

A [Load Balancer](/components/lb) has a variant. L7 is the default, and L4 needs [L4 load balancing](/research/l4-lb). L4 forwards every kind of request on every Link. Neither variant routes by kind: putting `page` on one server group and `read` on another is the [API Gateway](/components/gw)'s job.

::Design{id="lb-layer-7"}

::Design{id="lb-layer-4"}

The glossary defines [load balancer](/glossary/load-balancer). Pair this with [Load balancing algorithms](/patterns/load-balancing-algorithms).
