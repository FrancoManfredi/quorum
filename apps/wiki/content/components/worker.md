The Worker stands for a background job runner such as Sidekiq: your code, off the request path.

## When to place it

- Place a Worker when you place a Queue, because without one tasks have nowhere to go.
- Add copies when Queue depth keeps growing.

## How it works

It pulls tasks from a [Queue](/components/queue) and runs the async part of each kind. It sends read and write queries, push messages, and calls to customer servers. It runs the same [runtimes and frameworks](/runtimes) as an App Server, with an instance type and size. Users never wait for it, and its throughput decides whether the Queue drains or grows.

An export runs many read queries in its task, so link the Worker to the data it reads: the [Database](/components/database), a [Cache](/components/cache), or a [Read Replica](/components/replica). Link it to the [Push Provider](/components/msgp) for notifications.

## Options

- **Prefetch:** how many tasks each process takes ahead of time. Higher prefetch spends less time waiting on the broker, but a crash loses every task a process had taken.

## How it fails

- Too slow, and the Queue backlog grows until its max length refuses new tasks.
- A crash loses the tasks it had prefetched. A planned restart hands them back first.

### [Instance failure](/incidents/instance)

- **Signs:** The Worker's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
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

### [Poison message](/incidents/poison)

- **Signs:** The Queue's depth climbs without end while Workers stay busy, and its Inspector reads "A task keeps failing. Workers retry it forever."
- **Do now:** Select the Queue and press **Delete message**. With a dead-letter queue on, nothing is needed; it ends on its own after at most 120 s.
- **Prevent:** Turn on the **Dead-letter queue** on the Queue and set max attempts. No Research is needed.

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

## Tips

- Link Workers to an [Autoscaler](/components/autoscaler) to follow the backlog.
- Keep prefetch low on Workers that crash often.

:::Note{tone="real"}
Real queues deliver at least once, so a job can run twice. See [at-least-once delivery](/glossary/at-least-once-delivery).
:::
