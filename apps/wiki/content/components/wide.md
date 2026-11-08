The Wide-column Store stands for Apache Cassandra, the Component the game is named after.

## When to place it

- Place it when writes outgrow one [Database](/components/database), for example timeline writes from fan-out on write. It unlocks with [Leaderless replication](/research/leaderless).
- Skip it for checkouts. Use [Distributed SQL](/components/dsql) instead.

## How it works

It copies each key to N replicas and uses [quorums](/glossary/quorum) to read and write. It takes read and write queries, transactions, and timeline writes. It sends nothing on.

When R + W is greater than N, every read asks at least one replica that has the latest write. When it is not, a read can miss the latest write: [eventual consistency](/glossary/eventual-consistency). A write costs N replica operations and a read costs R, so higher settings use more capacity. Latency is the time of the slowest replica you wait for.

You can spread it across your open regions. Each region then keeps its own replicas, and the Burn grows with each region.

## Options

::Options{id="wide"}

- **N**: how many replicas hold each key. A higher N survives more lost replicas and stores more copies.
- **W**: how many replicas must confirm a write. A higher W is safer and slower.
- **R**: how many replicas a read asks. A higher R is more consistent and slower.

A read sees the latest write when R + W is greater than N. When it is not, a read can come back stale. See [Quorum reads and writes](/patterns/quorum-reads-and-writes).

- **Hot keys**: with [Hybrid fan-out](/research/hybrid-fanout), Split moves a hot key off its shard, so one key stops setting the pace. See [Hot keys and hot shards](/patterns/hot-keys-and-hot-shards).
- **Regions**: Spread keeps a quorum in every open region, so the store serves through a region outage. Each region adds Burn, and a write waits for the regions its quorum needs.

## How it fails

- A weak quorum serves stale reads.
- Checkouts still go wrong now and then, even with a strong quorum, because some come back stale or duplicate. Overlap is not linearizability.
- When a replica is lost, a quorum that needs every replica cannot form, and those calls fail.

### [Instance failure](/incidents/instance)

- **Signs:** The store loses one replica. Calls whose quorum needs every replica fail.
- **Do now:** Nothing to click: no Replace button appears, because the store keeps serving the quorums it can still form. It ends on its own after at most 60 s.
- **Prevent:** Raise N and pick a quorum that survives one lost replica, such as W and R of 2 with N of 3.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner; it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting. A spread store keeps replicas in every zone.

### [Hot key](/incidents/hot-key)

- **Signs:** One shard goes red while the others sit idle.
- **Do now:** Set **Hot keys** to **Split** on the store. It needs [Hybrid fan-out](/research/hybrid-fanout); without it, the incident ends on its own after at most 90 s.
- **Prevent:** Research [Hybrid fan-out](/research/hybrid-fanout) and set **Hot keys** to **Split**.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, unless the store is spread.
- **Do now:** Nothing speeds it up; it ends on its own after at most 180 s.
- **Prevent:** Turn on **Spread**, so every region keeps its own quorum. Research [Multiple regions](/research/multi-region).

### [Operator typo](/incidents/operator-typo)

- **Signs:** Every Node of the store in its region goes down. The director picks the busiest Database first, so it reaches a Wide-column Store only when the Design has no busy Database.
- **Do now:** Place a new Wide-column Store Node in the same region. The incident ends once one serves.
- **Prevent:** Research [Infrastructure as code](/research/infra-as-code).

## Tips

- Use W and R of 2 with N of 3 for read-after-write with one failure to spare.

::Sandbox{id="hot-key"}
