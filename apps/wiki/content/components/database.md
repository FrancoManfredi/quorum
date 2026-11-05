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

With [Sharding](/research/sharding) the Database splits into shards by key: the card offers one shard and the doublings above it. Each shard is another box and bills like one, and the writes divide across them, so N shards answer N times the writes. Reads still ask one shard, so a [Read Replica](/components/replica) is what takes the reads off the primary. A transaction that touches two shards pays several times its latency.

Not modelled: a hot shard, scatter-gather across shards, and the Dev Hours resharding takes.

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
- Research [Point-in-time recovery](/research/pitr) to turn on backups.
