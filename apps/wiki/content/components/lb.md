The Load Balancer spreads requests across your App Servers, or queries across a Database and its Read Replicas, as a reverse proxy such as NGINX or HAProxy does.

## When to place it

- Place it when you need a second App Server.
- Place it when hosts behind [DNS](/components/dns) have mixed sizes.
- Resize it when its card shows it near its throughput limit.
- Leave sticky sessions off until a cache or a Hub gains from them.

## How it works

It spans every zone, so a zone outage does not take it down. Every request kind comes in and goes on, and an L4 one also passes on every query kind, so it can sit in front of a [Database](/components/database) and its [Read Replicas](/components/replica). An L7 one reads HTTP and refuses queries. It adds a little latency, and each size step doubles its throughput limit.

By default it splits traffic by each target's capacity, so a large App Server gets a larger share. It drops a dead host at its next [health check](/glossary/health-check). It can also route by request kind: set which kinds each of its links carries, and send slow kinds such as exports to their own App Servers.

## Options

- **Algorithm**: round robin is on offer. The [Load balancing algorithms](/research/lb-algorithms) Research adds least connections, which suits App Servers of mixed sizes or runtimes, and [power of two choices](/glossary/power-of-two-choices), which handles more traffic with a little imbalance. Consistent hash gives every target an equal share of the keys whatever its load, and a target that leaves moves only its own keys.
- **Health checks**: the [Health checks](/research/health-checks) Research lets you change the interval and turn on deep checks.
- **Sticky sessions**: a switch on the card keeps users on the target they first reached. It helps in-process caches and realtime clients, because a user's next request finds the memory the last one filled. It also unbalances the load. Pinned users do not move when you add a copy, so the oldest target carries the most, and a target that dies takes its sessions with it.

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
