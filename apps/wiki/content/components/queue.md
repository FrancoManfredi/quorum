The Queue stands for RabbitMQ: a broker that holds work now so that [Workers](/components/worker) can do it later.

## When to place it

- Place it when slow kinds hold App Server slots, for example uploads from slow clients or exports.
- Resize it or add Workers when its depth keeps growing: that is the earliest sign that Workers are too slow.

## How it works

When an App Server links to a Queue, kinds that can go async hand most of their work to it as tasks: uploads, exports, webhooks, and notifications. The user waits only for the enqueue. The Queue offers its Workers what arrives, plus part of its backlog when they have room. It has a throughput limit, and each size step doubles it.

Queue depth is the number of tasks waiting. A large backlog slows each enqueue a little.

## Options

- **Max length**: refuses new tasks when full, instead of growing without limit. See [backpressure](/glossary/backpressure).
- **Dead-letter queue**: moves a task aside after its max attempts. Without one, a failing task retries forever. See [dead-letter queue](/glossary/dead-letter-queue).

## How it fails

- With no Worker linked, every task is stranded.
- A full Queue refuses what its Workers cannot take, and those requests fail as dropped.

### [Instance failure](/incidents/instance)

- **Signs:** The Queue's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host. A **Standby** (Zone section, needs [Multiple zones](/research/multi-az)) takes over by itself, with no click.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Press **Fail over** on the banner, or on the Node's card. It needs [Multiple zones](/research/multi-az) and promotes the Node's **Standby** at once; the Node then keeps no standby until you give it one. A Node with no standby stays down until the incident ends, at most 120 sim seconds, and one with a standby also fails over by itself after a share of that time.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting. Give it a **Standby**.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up. **Fail over** moves only Nodes that hold no data, so this one stays down until the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts. A store spread across regions needs nothing from you.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

### [Poison message](/incidents/poison)

- **Signs:** The Queue's depth climbs without end while Workers stay busy, and its Inspector reads "A task keeps failing. Workers retry it forever."
- **Do now:** Select the Queue and press **Delete message**. With a dead-letter queue on, nothing is needed; it ends on its own after at most 120 s.
- **Prevent:** Turn on the **Dead-letter queue** on the Queue and set max attempts. No Research is needed.

## Tips

- Turn on the dead-letter queue as soon as you place a Queue.
- Watch depth, not latency: users do not feel a backlog until it hits the max length.
