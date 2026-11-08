The App Server stands for a virtual machine that runs your code.

## When to place it

- Add a copy, or a size step, when its card shows CPU, workers, or memory near full and p99 climbs.
- Put a [Load Balancer](/components/lb) in front before the second copy.
- Fix the backends first when the limit is workers while CPU is low: the box is waiting on them. See [Find the bottleneck](/guides/find-the-bottleneck).

## How it works

It answers page views and bots itself, and turns every other request kind into backend calls: read and write queries, auth calls, tasks, charges, and more. Its capacity depends on its instance type, its [runtime, and its framework](/runtimes). The tightest of four limits sets it: CPU, worker slots, memory, and network.

A request holds its worker slot while it waits on each backend call. So a slow Database also lowers the capacity of runtimes that hold a worker while they wait. This is [Little's law](/glossary/littles-law).

The Garage box runs Postgres on the same machine. When you link it to a [Database](/components/database), [Connection Pooler](/components/pooler), or [Cache](/components/cache), Postgres moves off the box for good. A Burstable box earns CPU credits while idle and is throttled when they run out.

## Options

::Options{id="server"}

### Stack

The Stack is the language, its runtime, and the framework. It sets how the box shares work, how fast each request runs, the memory each process holds, and whether the runtime can keep a connection open.

- **Runtime**: the server that runs your code. Each one uses a model such as a process per request, a thread pool, or an event loop, and the model decides how a request waits on a backend. See [Runtimes](/runtimes).
- **Framework**: the library around the runtime. It adds CPU and memory to every request, and it buys velocity. The picker lists the frameworks for the runtime's language.
- **Pool size**: how many worker processes serve requests. A request holds one slot while it waits on each backend call, so a slow Database fills the pool while CPU stays idle. The figure beside the control says how many workers the box's RAM fits. Go past it and the box swaps, then kills a process.
- **Process manager**: PHP-FPM keeps a pool of worker processes, and the process manager decides which of them stay running. Static keeps the whole pool resident, so no request waits for a fork, and the box holds that memory even when idle. Dynamic keeps the busy workers plus two spares, so a burst makes a small share of requests wait a moment for a fork. On demand keeps only the busy workers, so idle RAM is lowest and more requests wait. Pick Static when RAM is spare, Dynamic for most Designs, and On demand when memory is the limit and the tail can wait.
- **Recycle workers**: restarts each process now and then. It caps a memory leak before the process runs out, and every restart comes back cold. Turn it on for a runtime that keeps memory between requests.
- **Compression**: Gzip on the responses that shrink well. It cuts their size, the egress they bill, and the time they take to reach a user, and it costs CPU on each one. Uploads and media do not shrink.
- **Service**: which Service the Node belongs to. It appears once the app splits into more than one Service.

### Garbage collection

- **Collector**: a Java runtime's garbage collector. G1 balances pause against throughput. Parallel is a little faster and pauses longer, with a little less memory. ZGC keeps pauses tiny at less throughput and more memory. Pick ZGC when a spike in p99 hurts more than CPU.
- **GOGC**: a Go runtime's collection target. A lower value collects more often, so memory stays small and CPU goes to the collector. A higher value does the reverse. Go collects without a long pause either way.

### Overload

- **Shedding**: [Priority load shedding](/patterns/load-shedding) answers a full Node by dropping whole request kinds, lowest value first, until it is back under its line. The default, Drop evenly, refuses a share of every kind instead of whole kinds. The kinds it keeps stay fast, and the dropped ones count as errors.
- **Degradation**: [Graceful degradation](/patterns/graceful-degradation) drops the kinds that cost the most CPU first, so the cheap, high-volume kinds keep their latency. A Node with both settings on degrades first.
- **Read your writes**: sends a read that follows a write to the primary, so a lagging replica cannot answer it with old data. See [Read your writes](/patterns/read-your-writes).

### Feeds

- **Feeds**: how the App Server serves a feed. Pull merges the accounts a user follows at read time. Push writes a copy into each follower's timeline. Push becomes the hybrid with [Hybrid fan-out](/research/hybrid-fanout). See [Fan-out on write and on read](/patterns/fan-out-on-write-and-on-read).

## How it fails

- Overloaded, it queues requests, then drops them.
- A box with too little RAM swaps, and a pool sized too big for its RAM is killed.

### [Instance failure](/incidents/instance)

- **Signs:** The App Server's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host. A copy inside a Cluster is rescheduled by itself.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

### [Memory leak](/incidents/leak)

- **Signs:** The card's Inspector reads "Memory grows: N GB leaked." Left alone, the process runs out of memory and restarts cold.
- **Do now:** Press **Restart** in the Inspector. It frees the leaked memory and comes back cold.
- **Prevent:** Turn on **Recycle workers** (periodic restarts), do the Fix memory leak task, or run a runtime that does not persist, such as PHP-FPM. Research [Metrics](/research/metrics) and [Alerting](/research/alerting) to see it sooner.

### [Event loop block](/incidents/loop)

- **Signs:** p99 rises on every kind that service answers, because a CPU-heavy kind such as `login` holds the event loop.
- **Do now:** Press **Move login** on the banner. It needs an L7 [Load Balancer](/components/lb) in front of an App Server on an event loop, and another App Server behind it on a runtime without one: the Load Balancer then sends `login` there only, and the incident ends once no login reaches a loop. Without that, it ends on its own after at most 35 s.
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
- **Do now:** Press **Restart** on the banner or in the Inspector. It resets the cache and ends the incident.
- **Prevent:** Research [Continuous delivery](/research/ci). A CI/CD Pipeline resets the cache on every deploy.

### [Library incompatibility](/incidents/gevent-compat)

- **Signs:** A busy gevent App Server fails 15% of its requests.
- **Do now:** Press **Restart** on the banner or in the Inspector. It ends the incident.
- **Prevent:** Research [Automated tests](/research/testing-culture).

### [Runtime compatibility](/incidents/bun-compat)

- **Signs:** A busy Bun App Server fails 20% of its requests.
- **Do now:** Press **Restart** on the banner or in the Inspector. It ends the incident.
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
