---
title: Rate limiting
summary: Cap how many requests a client or a service may send per second, so one noisy caller cannot use up capacity that everyone shares.
section: patterns
group: Resilience
order: 506
aliases: rate limit, throttle, token bucket, 429, quota, api limit
---

A rate limit refuses requests above an agreed rate before they reach the service behind it.

## Use it when

- One client, bot or tenant can send far more than its share.
- A backend has a fixed ceiling, such as a paid third-party API or a database.
- You need to tell callers to slow down with a clear answer, such as HTTP 429.

## How it works

A token bucket holds tokens that refill at the limit rate. Each request takes one, and a request that finds the bucket empty is refused. The bucket's size sets the burst: a bucket of 50 with a refill of 10 per second lets a spike of 50 pass at once, then holds the average at 10. A common place for it is the gateway, so refused calls cost the services behind it nothing.

## What it costs

A limit set below real demand throws away good traffic, and one set too high protects nothing. Limits per client need an identity to count against, which costs a lookup. A refused request is still an error to the caller, so well-behaved clients must back off. Rate limiting is not [load shedding](/patterns/load-shedding): a limit looks at who is sending, and shedding looks at how full the server is.

## In Quorum

::Design{id="gateway-rate-limit"}

The limit is a setting on an API Gateway, chosen from a short list of rates or turned off. It is one cap for the whole Gateway, not one per client. Above the limit, the Gateway answers `throttled` and the App Server never sees those requests, which is why the caption shows errors from the limit and not from capacity. The Gateway needs [API gateway](/research/api-gateway). [Rate limiting](/research/rate-limiting) adds a token bucket to the Gateway, so a short burst passes whole while the average holds at the limit. The glossary defines [rate limiting](/glossary/rate-limiting) and the [token bucket](/glossary/token-bucket). In a [Bot surge](/incidents/bot-surge) the cap throttles real Users along with the bots, so the game's fix is a WAF.
