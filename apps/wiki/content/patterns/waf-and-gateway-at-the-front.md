---
title: WAF and gateway at the front
summary: Put a WAF and an API Gateway in front of the App Servers, so bots and bursts are stopped before they cost you capacity.
section: patterns
group: Scaling steps
order: 122
aliases: web application firewall, modsecurity, api gateway, kong, rate limit, throttle, bots, ddos, paranoia level
---

Filter traffic at the edge: a WAF drops bots, and a Gateway caps what is left.

## Move up when

- Bots take a large share of requests and load the App Servers.
- Logins spike from bots, or a burst from one client crowds out the rest.
- You want one place to see and cap API traffic.

## The Design

::Design{id="front-door"}

Users hit the WAF first, then the API Gateway, then the App Server and the Database. The WAF's **Paranoia level** sets how aggressive it is. The Gateway's **Rate limit** caps requests a second.

## Why it works

The WAF blocks a share of bots, so the App Server never spends CPU on them. A higher paranoia level blocks more bots, costs more CPU per request, and blocks more real users too, which is where the caption's errors come from. The Gateway's limit sits a little above the peak you want to serve. Requests past it fail as `throttled` at the edge and never reach the servers. Each layer protects the one behind it.

## What it costs

Both layers add a hop to every request. A paranoia level that is too high blocks shoppers, which costs more than the bots did. A rate limit caps volume and cannot tell a bot from a shopper, so it does not replace the WAF. The Gateway bills per request, so it is cheap at low volume and a real line on the bill at high volume. Under attack mode blocks nearly all junk and some real users, so use it only while an attack lasts.

## In Quorum

Place a [WAF](/components/waf) after [Web application firewall](/research/waf), and an [API Gateway](/components/gw) after [API gateway](/research/api-gateway). [Rate limiting](/research/rate-limiting) adds a token bucket for bursts, and [Bot management](/research/bot-management) challenges a client instead of blocking it. See [WAF and bot management](/patterns/waf-and-bot-management) and [API gateway patterns](/patterns/api-gateway-patterns). The next step is [Auth and TLS at the gateway](/patterns/auth-and-tls-at-the-gateway).
