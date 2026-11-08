The Event Stream stands for Apache Kafka, Redpanda and Amazon Kinesis: a partitioned, replicated **log** that keeps messages after they are read.

## When to place it

- Place it when more than one consumer needs the same events, such as a search index, a warehouse, or a second service reading what the first one acted on.
- Place it when the events must survive. It unlocks with [Event streaming](/research/event-streaming) in Series B, for 15,000 ◇, after Message queues.

## How it works

Producers append, consumers read at their own pace, and the messages stay after they are read. That separates it from a [Queue](/components/queue). A Queue hands a task to one Worker and forgets it. A log keeps it for the retention window, so a consumer can read it twice, a second consumer can read it at all, and a new index or a rebuilt Worker can replay it without touching the [Database](/components/database).

It takes `task` from the Nodes that produce async work and sends `task` on to the Workers that consume it. One broker appends **100,000 messages a second** at its first size, and the rate doubles at each of its six sizes. Each append waits five milliseconds times its acknowledgement setting.

**Consumer lag** is the stat to watch: the events a stream holds that its consumers have not read. It is the log's version of queue depth. A producer never waits for its consumers, so the first harm of a slow Worker is a growing log, not a slow request.

## Options

::Options{id="log"}

- **Partitions**: how many consumers read at once. A consumer group uses one consumer per partition, so a stream reads at its partition rate for each partition it has.
- **Partition key**: Keyed keeps one entity's events in one partition, so they stay in order, and a hot key fills one partition. Round robin spreads evenly and loses order.
- **Replicas**: copies of every partition. Each replica bills again. With one replica, a broker that fails takes every event it held. With more, the acknowledgements decide what is lost.
- **Acknowledgements**: what a producer waits for before it moves on. No ack does not wait, Leader waits for the partition leader, and All replicas waits for every copy. A longer wait is a safer write.
- **Retention**: how long a message stays. A consumer further behind than the window loses the oldest events, and the tasks they carried never happen.

## How it fails

- **A failed broker.** With one replica it takes the only copy of every event it held. With more replicas, `all` loses none, `1` loses the events the followers had not copied, and `0` loses the producer's latest events. The lost events spend the error budget.
- **Retention.** A consumer further behind than the window loses the oldest events, and the work they carried never happens. A longer window costs nothing but time here, where a real product bills the disk.
- **Ordering.** Round robin with more than one partition loses order, so a superseded write can land after the one that replaced it. The value a consumer writes is the older one, and the game counts it as a stale result.
- **Partitions.** One partition means one consumer, so a slow consumer holds everyone behind it. More partitions read faster and split the order more finely.
- **A hot key.** One key's traffic fills one partition, whatever the partition count, and that partition sets the whole stream's speed. Incident [Hot key](/incidents/hot-key) shows it.
- **No Worker linked.** Nothing consumes the stream, and every task that reaches it is stranded.

### [Instance failure](/incidents/instance)

- **Signs:** The Event Log's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Nothing speeds it up. **Fail over** moves only Nodes that hold no data, so this one stays down until the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts. A store spread across regions needs nothing from you.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Watch lag, not latency.
- Key the stream on the entity whose order matters, such as an order or an account.
- Set more partitions than you have consumers.
- Use `acks=all` with three replicas for money. The cheapest setting is one replica with no acknowledgement at all.
