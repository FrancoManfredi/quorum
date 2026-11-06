The App Server stands for a virtual machine that runs your code.

## When to place it

- Add a copy, or a size step, when its card shows CPU, workers, or memory near full and p99 climbs.
- Put a [Load Balancer](/components/lb) in front before the second copy.
- Fix the backends first when the limit is workers while CPU is low: the box is waiting on them. See [Find the bottleneck](/guides/find-the-bottleneck).

## How it works

It takes every request kind. It answers page views and bots itself, and turns other kinds into backend calls: read and write queries, auth calls, tasks, charges, and more. Its capacity depends on its instance type, its [runtime, and its framework](/runtimes). The tightest of four limits sets it: CPU, worker slots, memory, and network.

A request holds its worker slot while it waits on each backend call. So a slow Database also lowers the capacity of runtimes that hold a worker while they wait. This is [Little's law](/glossary/littles-law).

The Garage box runs Postgres on the same machine. When you link it to a [Database](/components/database), [Connection Pooler](/components/pooler), or [Cache](/components/cache), Postgres moves off the box for good. A Burstable box earns CPU credits while idle and is throttled when they run out.

## How it fails

- Overloaded, it queues requests, then drops them.
- A box with too little RAM swaps, and a pool sized too big for its RAM is killed.

### [Instance failure](/incidents/instance)

- **Signs:** The App Server's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host. A copy inside a Cluster is rescheduled by itself.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner; it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up; it ends on its own after at most 180 s.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

### [Memory leak](/incidents/leak)

- **Signs:** The card's Inspector reads "Memory grows: N GB leaked." Left alone, the process runs out of memory and restarts cold.
- **Do now:** Press **Restart** in the Inspector. It frees the leaked memory and comes back cold.
- **Prevent:** Turn on **Recycle workers** (periodic restarts), do the Fix memory leak task, or run a runtime that does not persist, such as PHP-FPM. Research [Metrics](/research/metrics) and [Alerting](/research/alerting) to see it sooner.

### [Event loop block](/incidents/loop)

- **Signs:** p99 rises on every kind that service answers, because a CPU-heavy kind such as `login` holds the event loop.
- **Do now:** Nothing speeds it up; it ends on its own after at most 35 s.
- **Prevent:** Research [libuv thread pool](/research/libuv-pool) and [Managed identity](/research/auth-provider), which move the heavy work off the loop.

### [GC pause storm](/incidents/gc-storm)

- **Signs:** p99 spikes while p50 stays normal, on a runtime with a garbage collector whose heap is above 90% of RAM.
- **Do now:** Press **Restart** in the Inspector. A restart clears the heap.
- **Prevent:** Give the box more RAM, switch Java to [ZGC](/research/zgc) in the **Collector** section, or tune Go with [Go GC tuning](/research/gogc-tuning) and the **GOGC** setting.

### [JVM warmup under load](/incidents/jvm-warmup)

- **Signs:** Copies an Autoscaler adds during a spike answer at the runtime's cold speed, and p99 gets worse for 30 s.
- **Do now:** Press **Drain** on the cold copy. It needs [Health checks](/research/health-checks) and ends the incident when the Node is empty. Otherwise wait for the warmup.
- **Prevent:** Turn on **Slow start** on the Load Balancer, research [GraalVM native image](/research/graal-native), or scale on a schedule with [Scheduled scaling](/research/scheduled-scaling).

### [Stale OPcache](/incidents/stale-opcache)

- **Signs:** A busy PHP App Server with OPcache fails 30% of its requests, running the old code against the new schema.
- **Do now:** Press **Restart** in the Inspector. It resets the cache.
- **Prevent:** Research [Continuous delivery](/research/ci). A CI/CD Pipeline resets the cache on every deploy.

### [Library incompatibility](/incidents/gevent-compat)

- **Signs:** A busy gevent App Server fails 15% of its requests.
- **Do now:** Press **Restart** in the Inspector.
- **Prevent:** Research [Automated tests](/research/testing-culture).

### [Runtime compatibility](/incidents/bun-compat)

- **Signs:** A busy Bun App Server fails 20% of its requests.
- **Do now:** Press **Restart** in the Inspector.
- **Prevent:** Research [Automated tests](/research/testing-culture).

### [Spot reclaim](/incidents/spot-reclaim)

- **Signs:** Its Inspector reads "The provider reclaims this Spot Node in N s. Replace it with on-demand." After 10 s the Node goes grey.
- **Do now:** Press **Switch to on-demand** before the warning runs out. Otherwise it comes back by itself once the incident ends.
- **Prevent:** Keep Nodes on the request path on On-demand or Reserved pricing, and use Spot only on a fleet that can lose a Node.

### [Bad deploy](/incidents/bad-deploy)

- **Signs:** The error rate jumps right after a deploy, and a "Bad deploy" banner appears with a **Roll back** button.
- **Do now:** Press **Roll back** on the banner. It needs [Continuous delivery](/research/ci); without it the incident ends on its own after at most 120 s.
- **Prevent:** Research [Continuous delivery](/research/ci) and [Automated tests](/research/testing-culture). A Canary deploy strategy and Feature Flags cap how much a bad deploy breaks.

### [Bad config push](/incidents/config)

- **Signs:** App Servers and Workers crash together, and a "Bad config push" banner appears with a **Roll back** button.
- **Do now:** Press **Roll back** on the banner. They restart on the old config.
- **Prevent:** Research [GitOps](/research/gitops) and stage the rollout, so a push reaches one region first.

### [Connection exhaustion](/incidents/connections)

- **Signs:** The Database's card reads "Refusing N queries/s: too many connections."
- **Do now:** Nothing on the App Servers ends it; it ends on its own after at most 40 s. A [Connection Pooler](/components/pooler) between the App Servers and the Database caps the connections it holds.
- **Prevent:** Research [Connection pooling](/research/pooling) and place a Connection Pooler in front of the Database.

### [Supply-chain compromise](/incidents/supply-chain)

- **Signs:** Users fall 10% at once as the reputation goes, and a "Supply-chain compromise" banner appears with a **Pin and redeploy** button.
- **Do now:** Press **Pin and redeploy** on the banner.
- **Prevent:** Research [Dependency scanning](/research/dependency-scanning) or [Deno](/research/deno). A Security team lowers the odds again.

### [Leap second or clock skew](/incidents/leap-second)

- **Signs:** Every Node in the App Server's region answers 1,000 ms late, and 10% of its answers time out. A banner appears with a **Restart Nodes** button.
- **Do now:** Press **Restart Nodes** on the banner. One click resyncs the whole region.
- **Prevent:** Research [Leap smearing](/research/leap-smearing).

## Tips

- Match the instance family to the runtime: Compute for CPU-bound runtimes, Memory for many workers.
- Restart a leaking server to free its memory. It comes back cold.

:::Note{tone="real"}
Stateless servers are easy to copy. That is why real teams scale them out first. See [vertical and horizontal scaling](/glossary/vertical-and-horizontal-scaling).
:::
