The Read Replica stands for a PostgreSQL or MySQL streaming replica: a copy of the primary that answers reads.

## When to place it

- Place it when the Database CPU is high from reads and a [Cache](/components/cache) cannot hold the hot data. Link your App Servers to both the primary and the replicas, and reads spread across them.
- Skip it when the mix is write-heavy. That needs a bigger primary, not more replicas.

The [Stale Checkout](/sandboxes/stale-checkout) and [Missed Write](/sandboxes/missed-write) Sandboxes show stale reads.

::Sandbox{id="stale-checkout"}

## How it works

It uses the same capacity model as the [Database](/components/database), with an instance type and size, and it has its own connection limit. Only read queries reach it, and no Component sits downstream of it. Its engine is its own choice too: a MySQL replica gives each connection a thread, and holds more of them than a Postgres one. Writes still go to the primary.

Replicas lag behind the primary, and the lag grows with the write rate. A read that hits a lagging replica can come back stale. A stale answer fails an API read and a checkout that reads its own write, though page views accept it. See [replication lag](/glossary/replication-lag).

## Options

With [Synchronous replication](/research/sync-replication) a replica can be made synchronous. Every write on the primary then waits for it, more across zones and regions, and it serves no stale read. If it goes down, every write times out until it is back. Keep one when a read must never be stale and the writes can afford the wait.

## How it fails

- Like every Database, it refuses connections past its limit.

### [Replication lag](/incidents/repl-lag)

- **Signs:** A burst of writes leaves the replicas seconds behind, and reads after a write come back as `stale` errors.
- **Do now:** On the App Servers that serve the reads, set the picker to **Read your writes**, so they send those reads to the primary. It needs [Read-your-writes routing](/research/ryw-routing).
- **Prevent:** Research [Read-your-writes routing](/research/ryw-routing) and turn on **Read your writes** on the App Servers that serve checkouts. A **Synchronous** replica also keeps up, with [Synchronous replication](/research/sync-replication).

### [Instance failure](/incidents/instance)

- **Signs:** The replica's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and its share of reads fails.
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

- Turn on read-your-writes on App Servers that serve checkouts.
- Buy a bigger primary, not more replicas, for a write-heavy mix.

:::Note{tone="real"}
Asynchronous replication is the default in real Postgres, so real replicas lag too. See [read-your-writes consistency](/glossary/read-your-writes-consistency).
:::
