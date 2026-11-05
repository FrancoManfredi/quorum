## What it does

The Event Stream stands for Apache Kafka, Redpanda and Amazon Kinesis: a partitioned, replicated **log**. Producers append, consumers read at their own pace, and the messages stay after they are read.

That last part is what makes it a log rather than a [Queue](/components/queue). A Queue hands a task to one Worker and forgets it. A log keeps it for as long as its retention window, so a consumer can read it twice, a second consumer can read it at all, and a new index or a rebuilt Worker can replay it without touching the [Database](/components/database).

It takes `task` from the Nodes that produce async work, and sends `task` on to the Workers that consume it. One broker appends **100,000 messages a second** at its first size, doubling at each of its six sizes, and each append waits five milliseconds times its acknowledgement setting.

| Option             | What it decides                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Partitions         | How many consumers can read at once. A consumer group uses one consumer per partition, so a stream reads at most one partition's rate per partition: 20,000 messages a second each.      |
| Partition key      | Order. A key keeps one entity's events in one partition, so they stay in order; the price is a hot partition when one key takes the traffic. Round robin spreads evenly and loses order. |
| Replication factor | Safety. Each replica is another copy of every partition, and bills half a broker's Burn again.                                                                                           |
| Acknowledgements   | Latency. `0` does not wait, `1` waits for the partition leader, `all` for every replica.                                                                                                 |
| Retention          | How long a message stays. Ten hours, two and a half days, or a week.                                                                                                                     |

**Consumer lag** is the game stat: the events a stream holds that its consumers have not read. It is the log's version of queue depth, and it is the earliest sign that its Workers are too slow.

## When to place it

Place it when more than one consumer needs the same events, or when the events must survive: a search index fed from the log, a warehouse fed from the log, a second service reading what the first one acted on. It unlocks with [Event streaming](/research/event-streaming) in Series B, for 15,000 ◇, after Message queues.

## How it fails

- **Retention.** A consumer further behind than the window loses the oldest events, and the work they carried never happens. A longer window costs nothing in this build but time: it is a real disk bill in the real product.
- **Ordering.** Round robin with more than one partition loses order, and a superseded write can land after the one that replaced it: the value a consumer writes is the older one, and the game counts it as a stale result.
- **Partitions.** One partition means one consumer, so a slow consumer holds everyone behind it. More partitions read faster and split the order more finely.
- **A hot key.** One key's traffic fills one partition, whatever the partition count, and that partition is the whole stream's speed. Incident [Hot key](/incidents/hot-key) shows it.
- **With no Worker linked**, nothing consumes the stream, and every task that reaches it is stranded.

## Tips

- Watch lag, not latency: a producer never waits for its consumers, so the first harm is a growing log rather than a slow request.
- Keep the partition key on the entity whose order matters (an order, an account), and set more partitions than you have consumers.
- A log is not free to keep. `acks=all` and three replicas is the honest setting for money, and the cheapest is one replica with no acknowledgement at all.
