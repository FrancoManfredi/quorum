The Database is the single source of truth for your data, as PostgreSQL or MySQL are.

## When to place it

- Place it when the shared Garage box runs out of memory or CPU: split Postgres off it. See [Scale the database](/guides/scale-the-database).
- Resize it when its CPU stays high and query latency rises.
- Add a [Connection Pooler](/components/pooler) or switch the engine to MySQL, not a bigger box, when errors show refused connections.
- Shard it when it is out of CPU on writes.

## How it works

It takes read and write queries, transactions, and timeline writes, and it sends nothing on. Until you link a [Search Engine](/components/search), [Object Storage](/components/storage), or [Data Warehouse](/components/warehouse), it also answers searches, stores files as rows, and runs report scans. It does all three badly at volume.

Its CPU limits how many queries it answers. When the working set outgrows RAM, reads go to disk and slow down. Report scans evict the buffer cache, so every other query slows too.

## Options

### Engine

Postgres runs one process per connection, and the Database refuses connections past its limit. Every App Server and Worker process holds its own pool of connections, so more App Servers can take the Database down. [The data tier](/explanation/the-data-tier) explains why.

MySQL gives each connection a thread instead, and holds several times as many of them on the same box. A fleet that needs a [Connection Pooler](/components/pooler) on Postgres may fit without one on MySQL. Its built-in full-text search is the weaker of the two, so the searches and scans the Database answers itself cost it more CPU. The Inspector names the connection limit each engine carries. Either engine answers report scans badly, and a [Data Warehouse](/components/warehouse) is the fix for those.

### Volume

Every read that misses the buffer cache and every write waits on the volume, so its IOPS are a limit of their own. A general purpose volume is enough for most Designs, and a small Database never notices it.

A provisioned volume answers many times as many operations a second, and bills a share of the box's Burn on top. It matters on a large Database whose working set outgrows RAM. There every read goes to disk, and the volume sets how many of them it answers, a limit the CPU never shows. The Inspector names the IOPS and the Burn of the volume you pick. [Data tier](/design/07-data-tier#capacity) holds the numbers.

### Shards

With [Sharding](/research/sharding) the Database splits into shards by key, and the card offers one shard and the doublings above it. Each shard is another box and bills like one. The writes divide across them, and the busiest shard sets the pace. Reads still ask one shard, so a [Read Replica](/components/replica) is what takes the reads off the primary.

The **shard key** decides how even the split is:

- A hash of the user ID splits the writes evenly.
- A range of IDs sends new users to the last shard.
- A tenant key sends the biggest tenant to one shard.
- A region key keeps data near its users and makes users in other regions wait.

A transaction that touches two shards is a distributed transaction. It pays several times its latency and can fail on any shard that takes part. A report or a search touches every shard, so it costs more CPU and time with every shard you add. Changing the shard count or the key is a resharding: it takes Dev Hours, then a copy of the data during which the volume answers fewer operations. [Data tier](/design/07-data-tier#partitioning-sharding) holds the numbers.

### Rows and retention

Every write the Database answers adds rows, and so does every realtime message its Hub holds, so a Company's data grows with its users. The GB bill on the Storage line of the cloud bill, at a higher price than Object Storage's. Backups, replicas and migrations are not slowed by it. Only the bill and the rows a report reads are.

[Retention policies](/research/retention) adds a window to the card:

| Policy             | Storage | A report                                         |
| ------------------ | ------- | ------------------------------------------------ |
| Keep everything    | Full    | Reads the table.                                 |
| Archive after 30 d | A tenth | Waits on a restore of the archived rows.         |
| Delete after 30 d  | Nothing | Rebuilds its figures from the event log, slower. |

A window caps the rows at what the Company writes inside it, so an old Company that archives stops growing. The price is the history, since a report over the window is slow or has to be rebuilt. The card says which policy is on, and [Data tier](/design/07-data-tier#data-volume) holds the trade.

## How it fails

### [Connection exhaustion](/incidents/connections)

- **Signs:** The card reads "Refusing ... queries/s: too many connections", and Refused climbs above zero on the Dashboard.
- **Do now:** Click **Fewer workers** under Pool size on the App Servers, or place a [Connection Pooler](/components/pooler) between them and the Database. Otherwise it ends by itself after at most 40 sim seconds.
- **Prevent:** Research [Connection pooling](/research/pooling) and place the Pooler, or switch the engine to MySQL.

### [Slow query](/incidents/slow-query)

- **Signs:** The card warns "A new query has no index. Every read scans the table." and its CPU climbs with the size of its data.
- **Do now:** Click **Add index** on the card. It needs [Query analysis](/research/query-analysis), and it puts an Add index task at the top of the backlog. The incident ends when the Team finishes the task. Without Query analysis the card has no button and the incident runs its clock.
- **Prevent:** Research [Query analysis](/research/query-analysis) and put a [Cache](/components/cache) in front, so most reads never reach the table.

### [Disk full](/incidents/disk-full)

- **Signs:** The card reads "The disk is full. Writes fail." and every write is refused.
- **Do now:** Click **Expand volume** on the card. It costs what a replacement would.
- **Prevent:** Research [Alerting](/research/alerting) so a disk alert fires before the disk fills, and set a [retention window](/research/retention) so the rows stop piling up.

### [Report kills the database](/incidents/report-db)

- **Signs:** The card reads "A report is scanning every table." and every kind on the Database slows down.
- **Do now:** Click **Cancel report** on the card.
- **Prevent:** Link a [Data Warehouse](/components/warehouse), which takes the scans off the primary. [Data warehousing](/research/data-warehouse) unlocks it.

### [Retry storm](/incidents/retry-storm)

- **Signs:** Load on the Database keeps rising after the 20-second slowdown that started it ends, and errors upstream spread to other services.
- **Do now:** On each App Server that calls the Database, set the call to **Backoff** or open its **Breaker** under Calls, and turn on **Shed low value**. Each needs its Research. Without them nothing speeds it up: it ends when the backlog drains.
- **Prevent:** Research [Backoff with jitter](/research/backoff-jitter), [Circuit breakers](/research/circuit-breakers) and [Priority load shedding](/research/load-shedding).

### [Instance failure](/incidents/instance)

- **Signs:** The Database card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold. A Node with a **Standby** fails over by itself.
- **Prevent:** Turn on **Standby** in the Zone section, which needs [Multiple zones](/research/multi-az). The standby takes over by itself.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once, the Database with them.
- **Do now:** Nothing speeds it up. The Nodes come back when the incident ends, at most 120 sim seconds. A Node with a **Standby** fails over by itself.
- **Prevent:** Research [Multiple zones](/research/multi-az), turn on **Standby** in the Zone section, and keep a copy in a second zone.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the Database in it goes down.
- **Do now:** Nothing speeds it up. The Nodes come back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there. The Database is tied to its region, so a second region needs its own Database or a store that spreads across regions, such as [Distributed SQL](/components/dsql).

### [Big tenant hot shard](/incidents/hot-shard)

- **Signs:** One shard turns red while the others idle, and every kind on the Database slows.
- **Do now:** Put a [Cache](/components/cache) in front of the Database so the tenant's reads stay off the shard. Otherwise it ends by itself after at most 90 sim seconds.
- **Prevent:** Research [Sharding](/research/sharding) and pick a shard key other than **By tenant**, and keep a Cache in front.

### [Schema migration lock](/incidents/migration-lock)

- **Signs:** The **Schema migration lock** banner appears, and writes queue and fail as `timeout`.
- **Do now:** Click **Cancel migration** in the banner.
- **Prevent:** Research [Online schema migrations](/research/online-migrations).

### [Accidental delete](/incidents/accidental-delete)

- **Signs:** The **Accidental delete** banner appears, and reads and writes fail as `refused` until the table is back.
- **Do now:** Click **Restore** in the banner. A good backup restores the table after a delay that grows with the rows it reads. With no backup, or a broken one, the restore ends the incident at once but 10% of the Users leave.
- **Prevent:** Research [Point-in-time recovery](/research/pitr) and turn on backups, then [Restore drills](/research/restore-drills) so a backup is tested before you need it.

### [Table bloat](/incidents/table-bloat)

- **Signs:** Reads and writes on one PostgreSQL Database cost 2× the CPU, and its card runs hot.
- **Do now:** Nothing ends it early. It runs its course, at most 120 sim seconds.
- **Prevent:** Research [Retention policies](/research/retention) and set Retention to **Archive after 30 d** or **Delete after 30 d**, or switch the engine to MySQL, which has no dead rows to clean.

### [Operator typo](/incidents/operator-typo)

- **Signs:** Every Database Node in one region goes down at once.
- **Do now:** Place a new Database in that region and link it. The incident ends once one Node of that Component is up again.
- **Prevent:** Research [Infrastructure as code](/research/infra-as-code), so a plan shows what a change removes before it runs.

## Tips

- Put a [Cache](/components/cache) and [Read Replicas](/components/replica) in front to take reads off it.
- Use a Memory instance when the working set outgrows RAM, or provision the volume when reads go to disk.
- Shard when the Database is out of CPU on writes. Each shard is another primary, and it costs like one.
- Research [Point-in-time recovery](/research/pitr) to turn on backups, and [Restore drills](/research/restore-drills) so a backup is tested before you need it.
