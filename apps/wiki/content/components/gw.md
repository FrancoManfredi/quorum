## What it does

The API Gateway stands for Kong, AWS API Gateway, or Apigee: one front door that every API call
comes through before it reaches your services.

Place it after [Users](/components/users) and link your App Servers to it. It takes every request
kind and sends on what it lets through, adding its own hop. Its **rate limit** is the reason to
place one. A limit of Off lets everything through; any other limit caps the Node at that many
requests a second, and the requests past it fail as `throttled` rather than reach your services.
See [rate limiting](/glossary/rate-limiting) and the [token bucket](/glossary/token-bucket) it
still wants.

The gateway bills per request, unlike every other Component, which bills per second of uptime. It
is cheap at low volume and expensive at high volume, and it is the Requests line of the bill. It
has one size and a flat capacity of its own, so a Design past that capacity drops requests at the
gateway like any other flat-capacity Node.

## When to place it

Place it when you want to protect your services from a burst or from abusive clients without
turning them away at the WAF, or when you want one place to see and cap API traffic. It unlocks
with [API gateway](/research/api-gateway).

## How it fails

- A limit below your demand throttles real users, and a throttled request earns nothing, so a
  limit you set must leave room for the traffic you want.
- Past its own capacity it drops requests, whatever the rate limit says.
- It is a single hop in front of everything: an overloaded or misconfigured gateway fails every
  request kind at once.

## Tips

- Watch the Requests line, not just the rate limit: per-request pricing grows with traffic.
- Leave the limit Off until you know your peak, then set it a little above the peak you want to
  serve.
- A [WAF](/components/waf) still belongs in front of it if bots are the problem; a rate limit caps
  volume, it does not tell a bot from a shopper.
