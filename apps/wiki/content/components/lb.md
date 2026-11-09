The Load Balancer spreads requests across your App Servers, or queries across a Database and its Read Replicas, as a reverse proxy such as NGINX or HAProxy does.

## When to place it

- Place it when you need a second App Server.
- Place it when hosts behind [DNS](/components/dns) have mixed sizes.
- Resize it when its card shows it near its throughput limit.
- Leave sticky sessions off until a cache or a Hub gains from them.

## How it works

It spans every zone, so a zone outage does not take it down. Every request kind comes in and goes on, and an L4 one also passes on every query kind, so it can sit in front of a [Database](/components/database) and its [Read Replicas](/components/replica). An L7 one reads HTTP and refuses queries. It adds a little latency, and each size step doubles its throughput limit.

By default it splits traffic by each target's capacity, so a large App Server gets a larger share. It drops a dead host at its next [health check](/glossary/health-check). It sends every kind it receives to every target, so an [API Gateway](/components/gw) in front is what sends page views and API calls to different server groups.

## Options

::Options{id="lb"}

- **Variant**: L7 terminates HTTP, so it can retry a failed call and check health. L4 forwards TCP and passes queries too, so it can sit in front of a [Database](/components/database) and its [Read Replicas](/components/replica). L4 carries far more traffic, adds less latency, and bills less, and it gives up retries and HTTP awareness. See [Layer 4 and layer 7 load balancing](/patterns/layer-4-and-layer-7-load-balancing).
- **Policy**: how it picks a target. Weighted, the default, shares by each target's capacity, so a larger App Server gets a larger share. Round robin gives every target an equal turn. Least connections suits mixed sizes or runtimes. Two choices handles more traffic with a little imbalance. Consistent hash keeps a key on its target, and a target that leaves moves only its own keys. See [Load balancing algorithms](/patterns/load-balancing-algorithms).
- **Sessions**: Sticky keeps a user on the target it first reached, so an in-process cache or a realtime client finds its memory. It also unbalances the load, because pinned users do not move when you add a copy, and a target that dies takes its sessions with it. See [Sticky sessions](/patterns/sticky-sessions).
- **Slow start**: a target that just joined takes a growing share of traffic instead of its full share. A new JVM copy then never answers at its cold speed, and the [JVM warmup under load](/incidents/jvm-warmup) incident is much less likely. See [Cold start](/glossary/cold-start).
- **Health checks**: how often the Load Balancer asks each target whether it is alive. A shorter interval drops a dead target sooner and adds checks. A **Deep** check also asks about the Database behind the target, so a slow Database can remove every target at once. An interval other than the default and a deep check both need [Health checks](/research/health-checks). See [Drop dead nodes with health checks](/patterns/drop-dead-nodes-with-health-checks).

## How it fails

- Overloaded, it drops requests before they reach any App Server.
- A deep check takes out every App Server whose Database is down or overloaded. If that is all of them, the Load Balancer has nowhere to send traffic, so a slow Database becomes a full outage.

### [Instance failure](/incidents/instance)

- **Signs:** The Load Balancer card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second Load Balancer. A short health check interval stops it routing to a dead App Server behind it, and a long one keeps sending that host its share. [Health checks](/research/health-checks) sets the interval.

### [Certificate expired](/incidents/certificate)

- **Signs:** The **Certificate expired** banner appears, and every request through the Load Balancer fails, as through every other TLS Node.
- **Do now:** Click **Renew** in the banner.
- **Prevent:** Research [Certificate automation](/research/cert-automation) and place a [Secrets and Certificates](/components/pki) Node, which renews the certificates before they run out.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the Load Balancer in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

:::Note{tone="real"}
Health checks can cause outages as well as prevent them. Real teams keep deep checks narrow for this reason.
:::

## Tips

- Use least connections when App Servers have mixed sizes or runtimes.
- Route slow kinds, such as exports, to their own App Servers.
