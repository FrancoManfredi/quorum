The Read Replica stands for a PostgreSQL or MySQL streaming replica: a copy of the primary that answers reads.

## When to place it

- Place it to add read capacity the Database cannot add without a restart. A resize restarts the Database and it comes back cold. A replica joins the Design and takes its share of reads while the primary keeps serving.
- Place it to move reports off the primary. A report is a scan: it cannot be cached, and it evicts the Database's buffer cache. With a replica linked, scans go to the replica and the primary's other queries keep their cache.
- Place it when the Database CPU is high from reads and a [Cache](/components/cache) cannot hold the hot data. A Cache answers repeated reads of hot rows; a replica answers any read, so it takes the long tail the Cache misses. Link the primary and the replicas to an L4 [Load Balancer](/components/lb), which needs the [L4 load balancer](/research/l4-lb) Research, and reads spread across them by its algorithm. Writes go to the primary only. With a [Connection Pooler](/components/pooler) in front, link the pooler into the Load Balancer, because the pooler takes one link out.
- Skip it when the mix is write-heavy. That needs a bigger primary, not more replicas.
- Skip it when every read must be fresh and you have no [Read-your-writes routing](/research/ryw-routing). A replica always lags, so some reads fail as `stale`.

| Need                              | Use                                                                    |
| --------------------------------- | ---------------------------------------------------------------------- |
| More writes                       | A bigger [Database](/components/database), or shards                   |
| Fewer reads that hit hot rows     | A [Cache](/components/cache), the cheapest fix while the hot data fits |
| More reads of any row, or reports | A Read Replica                                                         |

The [Stale Checkout](/sandboxes/stale-checkout) and [Missed Write](/sandboxes/missed-write) Sandboxes show stale reads.

::Sandbox{id="stale-checkout"}

## How it works

Link the Database into the replica: that link ships the write log, and it is the only way a replica copies anything. It carries no queries. A replica with no Database linked to it takes no reads, and its card reads "Nothing: link a Database to it". A replica copies one Database, so it follows that Database's engine. The App Servers, or an L4 Load Balancer, link to the replica to send it reads.

It uses the same capacity model as the [Database](/components/database), with an instance type and size, and it has its own connection limit. Only read queries and report scans reach it, and no Component sits downstream of it. It runs its primary's engine, so the connection limit follows the primary. Writes still go to the primary.

A replica costs less than a Database. It is cheaper to place, and its box bills 30% less than a Database of the same size, because it has no backups, no provisioned IOPS tier, and no write path to size for.

Replicas lag behind the primary, and the lag grows with the write rate: 20 ms plus 2 ms for each write per second. A quarter of the reads in that window ask for a row a write just changed, so that share of reads comes back stale, up to 15%. The card shows the lag. A stale answer fails an API read and a checkout that reads its own write, though page views accept it. See [replication lag](/glossary/replication-lag).

When the primary is gone, promote one: the replica becomes the primary and the old primary becomes its replica, fenced so writes never split. A synchronous replica has no writes in flight, so nothing is lost; an asynchronous one still held writes the primary had not shipped, so promotion loses them. The new primary starts cold. See [Failover](/design/07-data-tier#failover).

## Options

::Options{id="replica"}

- **Replication**: Synchronous makes every write on the primary wait for this replica. It then serves no stale read, and while it is down every write times out. Asynchronous is the default and can lag, which is what [read-your-writes routing](/patterns/read-your-writes) answers. See [Replication strategies](/patterns/replication-strategies).
- **Engine**: the replica runs its primary's engine; there is nothing to pick here. Connection limits, query costs, and lag all follow the primary.
- **Promote**: the replica becomes the primary and the old primary becomes its replica. A synchronous replica loses nothing; an asynchronous one loses writes still in flight.

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
- Link a replica from the App Servers, and reports leave the primary at once.
- Buy a bigger primary, not more replicas, for a write-heavy mix.

:::Note{tone="real"}
Asynchronous replication is the default in real Postgres, so real replicas lag too. See [read-your-writes consistency](/glossary/read-your-writes-consistency).
:::
