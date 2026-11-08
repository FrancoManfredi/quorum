The API Gateway is one front door that every API call comes through before it reaches your services, as Kong, AWS API Gateway, or Apigee are.

## When to place it

- Place it when you want to protect your services from a burst or from abusive clients without turning them away at the WAF. It unlocks with [API gateway](/research/api-gateway).
- Place it when you want one place to see and cap API traffic.
- Skip it as a bot filter. A rate limit caps volume and does not tell a bot from a shopper, so a [WAF](/components/waf) still belongs in front of it if bots are the problem.

## How it works

Its rate limit caps the Node at a number of requests a second, and the requests past that limit fail as `throttled` rather than reach your services. A limit of Off lets everything through. It sits after [Users](/components/users) and passes every request kind through to the App Servers you link, adding a hop of its own. See [rate limiting](/glossary/rate-limiting) and the [token bucket](/glossary/token-bucket) it still wants.

Unlike every other Component, which bills per second of uptime, the gateway bills per request. It is cheap at low volume and expensive at high volume, and it is the Requests line of the bill. It has one size and a flat capacity of its own, so a Design past that capacity drops requests at the gateway like any other flat-capacity Node.

## Options

::Options{id="gw"}

- **Rate limit**: the requests a second the gateway lets through. Past it, requests fail as `throttled` instead of reaching your services. Off lets everything through.
- **Burst**: Flat cap refuses every request over the limit. Token bucket holds a small reserve, so a short burst passes whole while the long-run average still holds. It needs [Rate limiting](/research/rate-limiting).
- **Auth**: Auth at the edge validates each token once, at the gateway, and the services behind it skip the check. Services check leaves the validation to every service.
- **Coalescing**: merges identical reads that are in flight at once. The busier the gateway, the more it saves.

## How it fails

- A limit below your demand throttles real users, and a throttled request earns nothing, so a limit you set must leave room for the traffic you want.
- Past its own capacity it drops requests, whatever the rate limit says.
- It is a single hop in front of everything, so an overloaded or misconfigured gateway fails every request kind at once.

### [Instance failure](/incidents/instance)

- **Signs:** The API Gateway card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second copy behind a [Load Balancer](/components/lb) that skips dead hosts. [Load balancing](/research/load-balancing) and [Health checks](/research/health-checks) unlock them.

### [Certificate expired](/incidents/certificate)

- **Signs:** The **Certificate expired** banner appears, and every request through the API Gateway fails, as through every other TLS Node.
- **Do now:** Click **Renew** in the banner.
- **Prevent:** Research [Certificate automation](/research/cert-automation) and place a [Secrets and Certificates](/components/pki) Node, which renews the certificates before they run out.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the API Gateway in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

## Tips

- Leave the limit Off until you know your peak, then set it a little above the peak you want to serve.
- Watch the Requests line, not just the rate limit, because per-request pricing grows with traffic.
