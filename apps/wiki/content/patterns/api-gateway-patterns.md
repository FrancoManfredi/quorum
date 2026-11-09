---
title: API gateway patterns
summary: Put one front door before your services, so rate limits, authentication and request merging happen once instead of in every service.
section: patterns
group: Security and edge
order: 801
aliases: api gateway, gateway, kong, rate limit, token bucket, auth offloading, gateway offloading, request coalescing, throttling
---

An API gateway is the single entry point for client calls, and it takes the cross-cutting jobs off every service behind it.

## Use it when

- Several services each implement their own auth check and rate limit, and they disagree.
- One noisy client can flood a backend, and the backend has no way to say no early.
- Clients need one address while the services behind it move.

## How it works

The gateway routes by host and path, and applies policy before the call reaches a service. The common jobs are **rate limiting**, **authentication offload** (verify a token once, pass the identity on), **TLS termination**, and **request coalescing**, where identical reads in flight at once become one backend call. A **token bucket** limiter refills at the allowed rate and lets a short burst spend the saved tokens.

Example: a limit of 50 requests per second with a bucket of 30 lets a client burst 30 extra requests, then holds the average at 50. A flat cap would have rejected the burst.

A gateway can also aggregate calls and translate protocols, though aggregation belongs in a [backend for frontends](/patterns/backends-for-frontends) when it grows.

## What it costs

Every request pays one more hop, and the gateway is now a single point of failure, so run several behind a load balancer. Most gateways bill per request. The usual mistake is putting business logic in it, which turns the front door into a monolith.

## In Quorum

Place a Gateway between Users and the App Server, as below.

::Design{id="gateway-front-door"}

The Gateway is the only Node with a route table: each Link carries the request kinds you give it, so page views and API calls can reach different App Server groups. Past its limit it answers throttled. Coalescing merges only read kinds, and auth at the edge helps only the kinds that need a login. Unlock the Gateway with [API gateway](/research/api-gateway) and the bucket with [Rate limiting](/research/rate-limiting). The [Gateway](/components/gw) page lists the details, and the glossary defines [rate limiting](/glossary/rate-limiting) and the [token bucket](/glossary/token-bucket). For the layer in front of it, see [WAF and bot management](/patterns/waf-and-bot-management).
