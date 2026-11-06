The API Gateway is one front door that every API call comes through before it reaches your services, as Kong, AWS API Gateway, or Apigee are.

## When to place it

- Place it when you want to protect your services from a burst or from abusive clients without turning them away at the WAF. It unlocks with [API gateway](/research/api-gateway).
- Place it when you want one place to see and cap API traffic.
- Skip it as a bot filter. A rate limit caps volume and does not tell a bot from a shopper, so a [WAF](/components/waf) still belongs in front of it if bots are the problem.

## How it works

Place it after [Users](/components/users) and link your App Servers to it. It takes every request kind and sends on what it lets through, adding its own hop. A limit of Off lets everything through. Any other limit caps the Node at that many requests a second, and the requests past it fail as `throttled` rather than reach your services. See [rate limiting](/glossary/rate-limiting) and the [token bucket](/glossary/token-bucket) it still wants.

Unlike every other Component, which bills per second of uptime, the gateway bills per request. It is cheap at low volume and expensive at high volume, and it is the Requests line of the bill. It has one size and a flat capacity of its own, so a Design past that capacity drops requests at the gateway like any other flat-capacity Node.

## Options

- **Rate limit**: Off, or a cap in requests a second.
- **Auth at the edge**: validates each token once at the gateway. It adds to the gateway's hop and takes the token check off every service.
- **Request coalescing**: merges identical reads that are in flight at once, so the busier the gateway, the less it sends on.

## How it fails

- A limit below your demand throttles real users, and a throttled request earns nothing, so a limit you set must leave room for the traffic you want.
- Past its own capacity it drops requests, whatever the rate limit says.
- It is a single hop in front of everything, so an overloaded or misconfigured gateway fails every request kind at once.

## Tips

- Leave the limit Off until you know your peak, then set it a little above the peak you want to serve.
- Watch the Requests line, not just the rate limit, because per-request pricing grows with traffic.
