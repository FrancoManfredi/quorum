DNS answers one domain with several addresses, as a managed name service such as Route 53 does.

## When to place it

- Place it when one App Server is not enough and you cannot yet afford a [Load Balancer](/components/lb). The symptom is a board that refuses a second link from Users.

## How it works

It turns the one link from [Users](/components/users) into many. It takes every request kind and sends it on unchanged. It splits traffic evenly across its links, one equal share each, which is round robin. It adds no latency and has no capacity limit. See [DNS round robin](/glossary/dns-round-robin).

DNS ignores size, so a small App Server gets the same share as a large one. It also has no health checks, so a dead host keeps its share and those requests fail.

## Options

- **TTL**: the [Health checks](/research/health-checks) Research makes DNS drop a dead host once its TTL runs out, and lets you set the TTL. A short TTL drops a dead host faster, and a long one keeps sending users to it.

## How it fails

- [Instance failure](/incidents/instance): a host goes down, and its share of requests fails until DNS drops it, or never without Health checks.
- Mixed sizes overload the smallest host first, because each gets an equal share. Keep hosts the same size.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the DNS in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

:::Note{tone="real"}
Real clients cache DNS answers for the TTL and often longer, so DNS is a slow, coarse load balancer. Real teams put a Load Balancer behind it.
:::

## Tips

- Keep every host behind DNS the same size.
- Replace DNS with a Load Balancer when you research [Load balancing](/research/load-balancing).
