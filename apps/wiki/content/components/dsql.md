Distributed SQL keeps transactions correct across regions, as CockroachDB does on [Raft](/glossary/raft) consensus.

## When to place it

- Place it when your Company runs in several regions and checkouts must stay correct everywhere. It unlocks with [Consensus databases](/research/consensus). See [Go global](/guides/go-global).
- Skip it for traffic that a [Database](/components/database) or [Wide-column Store](/components/wide) can serve. It is the most expensive data Component, the right store for checkouts and an expensive one for feeds.

## How it works

Its capacity is counted in transactions, and a read costs a fraction of one. Each size step doubles that capacity. Read queries, write queries, and transactions come in, and it passes none of them on to another Node.

Every write waits for a majority of its replicas. In one region that costs a few milliseconds. Spread across regions, a write waits for a cross-region round trip, so write latency rises. Reads stay local. When spread, its Burn grows with each region.

## Options

::Options{id="dsql"}

- **Regions**: One keeps every write in one region, so writes pay local latency and a region outage takes the store down. Spread replicates across the open regions, so the store survives a region outage and every write waits for a cross-region round trip. It needs two open regions, and its Burn grows with each one. See [Distributed SQL and leaderless stores](/patterns/distributed-sql-and-leaderless-stores).

## How it fails

- Spread across regions, every write pays the round trip. Write-heavy kinds feel it in p99.
- Overloaded, it drops queries like any data Node.

### [Instance failure](/incidents/instance)

- **Signs:** The Distributed SQL card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold.
- **Prevent:** Run a second Node of the Component, so one is still serving while the other is replaced.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once. A Node spread across regions keeps replicas in every zone, so only a Node on **One** region is hit.
- **Do now:** Nothing speeds it up. The Node comes back when the incident ends, at most 120 sim seconds.
- **Prevent:** Research [Multiple zones](/research/multi-az), or turn on **Spread** under Regions.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey. A Node on **One** region goes with it.
- **Do now:** Nothing speeds it up. Spread across three regions, it survives with no data loss, because a majority remains, and needs nothing from you.
- **Prevent:** Open a third region, then turn on **Spread** under Regions. [Multiple regions](/research/multi-region) unlocks the regions, and [GeoDNS](/research/geo-dns) sends users to the one that lives.

### [Network partition](/incidents/partition)

- **Signs:** The **Network partition** banner appears, and calls between regions time out. On a leader-based store the writes diverge.
- **Do now:** Click **Fence leader** in the banner. See [network partition](/glossary/network-partition).
- **Prevent:** Research [Consensus databases](/research/consensus) and use this Component: a consensus store keeps one leader, so writes do not diverge.

### [Operator typo](/incidents/operator-typo)

- **Signs:** Every Distributed SQL Node in one region goes down at once.
- **Do now:** Place a new Distributed SQL in that region and link it. The incident ends once one Node of that Component is up again.
- **Prevent:** Research [Infrastructure as code](/research/infra-as-code), so a plan shows what a change removes before it runs.

:::Note{tone="real"}
Consensus trades latency for correctness. Real teams use it for money and keep cheaper stores for the rest.
:::

## Tips

- Open a third region before you count on it to survive a region outage.
