## What it does

The Database stands for PostgreSQL or MySQL, the single source of truth for your data.

It takes read and write queries, transactions, and timeline writes. It sends nothing on. Until you link a [Search Engine](/components/search), [Object Storage](/components/storage), or [Data Warehouse](/components/warehouse), it also answers searches, stores files as rows, and runs report scans. It does all three badly at volume.

Its CPU limits how many queries it answers. When the working set no longer fits in RAM, reads go to disk and slow down. Report scans evict the buffer cache, so every other query slows too.

## Engine

Postgres runs one process per connection, and the Database refuses connections past its limit. Every App Server and Worker process holds its own pool of connections, so more App Servers can take the Database down. [The data tier](/explanation/the-data-tier) explains why.

MySQL gives each connection a thread instead, and holds several times as many of them on the same box: a fleet that needs a [Connection Pooler](/components/pooler) on Postgres may fit without one on MySQL. Its built-in full-text search is the weaker of the two, so the searches and scans the Database answers itself cost it more CPU. The Inspector names the connection limit each engine carries. Either engine also answers report scans badly; a [Data Warehouse](/components/warehouse) is the fix for those.

## Volume

Every read that misses the buffer cache and every write waits on the volume, so its IOPS are a limit of their own. A general purpose volume is enough for most Designs, and it is what a small Database never notices. A provisioned volume answers many times as many operations a second, and bills a share of the box's Burn on top. On a large Database whose working set no longer fits in RAM the volume becomes the limit the CPU never shows: every read goes to disk, and the volume sets how many of them it answers. The Inspector names the IOPS and the Burn of the volume you pick; [Data tier](/design/07-data-tier#capacity) holds the numbers.

## Shards

With [Sharding](/research/sharding) the Database splits into shards by key: the card offers one shard and the doublings above it. Each shard is another box and bills like one, and the writes divide across them, the busiest shard sets the pace. Reads still ask one shard, so a [Read Replica](/components/replica) is what takes the reads off the primary.

The **shard key** decides how even the split is. A hash of the user ID splits the writes evenly, a range of IDs sends new users to the last shard, and a tenant key sends the biggest tenant to one shard. A region key keeps data near its users and makes users in other regions wait. A transaction that touches two shards is a distributed transaction: it pays several times its latency and can fail on any shard that takes part. A report or a search touches every shard, so it costs more CPU and time with every shard you add. Changing the shard count or the key is a resharding: it takes Dev Hours, then a copy of the data during which the volume answers fewer operations. [Data tier](/design/07-data-tier#partitioning-sharding) holds the numbers.

## Rows and retention

Every write the Database answers adds rows, and every realtime message its Hub holds adds some too, so a Company's data grows with its users. The GB bill on the Storage line of the cloud bill, at a higher price than Object Storage's. Backups, replicas and migrations are not slowed by it: only the bill and the rows a report reads are.

[Retention policies](/research/retention) adds a window to the card:

| Policy             | Storage | A report                                         |
| ------------------ | ------- | ------------------------------------------------ |
| Keep everything    | Full    | Reads the table.                                 |
| Archive after 30 d | A tenth | Waits on a restore of the archived rows.         |
| Delete after 30 d  | Nothing | Rebuilds its figures from the event log, slower. |

A window caps the rows at what the Company writes inside it, so an old Company that archives stops growing. What it costs is the history: a report over the window is slow or has to be rebuilt. The card says which policy is on, and [Data tier](/design/07-data-tier#data-volume) holds the trade.

## When to place it

Split Postgres off the Garage box when the shared box runs out of memory or CPU. Resize it when its CPU stays high and query latency rises. When errors show refused connections, add a [Connection Pooler](/components/pooler) or switch the engine to MySQL, not a bigger box. See [Scale the database](/guides/scale-the-database).

## How it fails

- [Connection exhaustion](/incidents/connections): too many connections, and the Database refuses the excess.
- [Slow query](/incidents/slow-query): a query with no index scans the whole table. Add the index from its card after [Query analysis](/research/query-analysis).
- [Disk full](/incidents/disk-full): every write fails until you expand the volume.
- [Report kills the database](/incidents/report-db): a large scan slows every kind.
- [Retry storm](/incidents/retry-storm): a short slowdown, and retries keep it overloaded.
- [Instance failure](/incidents/instance) and [Zone outage](/incidents/zone) take a Database with no standby offline.

## Tips

- Put a [Cache](/components/cache) and [Read Replicas](/components/replica) in front to take reads off it.
- Use a Memory instance when the working set outgrows RAM, or provision the volume when reads go to disk.
- Shard when the Database is out of CPU on writes: each shard is another primary, and it costs like one.
- Research [Point-in-time recovery](/research/pitr) to turn on backups, and [Restore drills](/research/restore-drills) so a backup is tested before you need it.
