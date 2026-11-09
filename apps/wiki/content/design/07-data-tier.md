---
title: 7. Data tier
summary: Databases, caches, replicas, quorums, consistency, and storage.
section: design
order: 7
---

Stateless App Servers are easy to copy, and state is not. The data tier is where the player spends
the long game, because every Component here holds state and every copy of it can disagree with the
others. This page defines those Components and their mechanics: connections, indexes, caches,
replication, consistency, partitioning, and quorums.

## Data volume

Data volume is stored data in GB, and the Simulation tracks it in two figures. `stored` is what
Object Storage holds, the files it is sent ([Object Storage](#object-storage)). `data` is what the
Databases hold: every `q-write` adds a row, and so does every `rt` message a Realtime Hub carries. A
row costs 10 KB, its indexes and its share of the WAL included. Data never shrinks by itself.

- The rows bill on the Storage line of the cloud bill at 3.5× the Object Storage price, the price of
  gp3 block storage against S3 Standard.
- A Database answers an unindexed query or a report from its rows, so more rows mean a slower scan.
- Research "Retention policies" puts a window on the Database and archives or deletes what passes
  it. That trades cheap storage for slower reads or a rebuild
  ([Rows and retention](#rows-and-retention)).

Volume also sets how long the slow operations take, in calendar time (one sim second is a calendar
minute):

| Operation                       | Time                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| Restore of a backup             | 5 minutes plus half a minute per GB; point-in-time recovery reads twice the GB |
| A new Read Replica's first copy | Half a minute per GB (at least the 15 s of any cold Node) before it serves     |
| Schema migration lock           | 150 s plus 0.1 s per GB of rows, at most four times 150 s                      |
| Database engine change          | One minute per GB of rows, after its Dev Hours                                 |
| Resharding                      | One minute per GB of rows, at least a calendar day, after its Dev Hours        |

A large Company takes longer to back up, copy, and migrate than a small one. A Feature that reads
history also loses part of its value when retention deletes that history
([Rows and retention](#rows-and-retention)).

## Relational database

Real products: PostgreSQL (start), MySQL (variant).

The Database is the source of truth. It serves `q-read`, `q-write`, and `q-tx`. It can also serve
`q-search` with built-in full-text search, and `q-scan`, but both run badly at volume.

### Capacity

```latex
\text{capacity} = \operatorname{min}\left(\text{cpu limit},\ \text{connection limit},\ \text{iops limit}\right)
```

| Limit        | Detail                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CPU          | Each query kind has a CPU cost. Missing indexes multiply it.                                                                                                                   |
| IOPS         | Reads that miss the buffer cache and every write go to disk. Storage class sets IOPS: general purpose (3,000 base) or provisioned (up to 64,000 at higher cost).               |
| Connections  | Postgres forks one process per connection, about 8 MB each. `max_connections` is 100 by default. MySQL uses a thread per connection, about 1 MB each, and handles 500 of them. |
| Buffer cache | RAM that holds hot data. When the working set exceeds RAM, reads go to disk and latency jumps. This is why a Memory instance can beat a Compute instance for a database.       |

A general purpose volume answers 3,000 disk operations a second and a provisioned one 64,000, and provisioned storage bills 1.5× the Database's box. A disk
operation waits 1 / IOPS ms and queues as the volume fills. So a Database whose working set outgrows
RAM meets the volume before its CPU: at 96 vCPU a general purpose volume caps reads at 3,000 a
second while the CPU would answer 8,000. A shard brings its own volume.

### Variants

| Variant    | Connections          | CPU shape                                     | Schema changes               | Replication                          |
| ---------- | -------------------- | --------------------------------------------- | ---------------------------- | ------------------------------------ |
| PostgreSQL | 100, about 8 MB each | read 0.95×, scan 0.9×, write 1.15×, search 1× | many `ALTER`s lock the table | streaming; lags more under writes    |
| MySQL      | 500, about 1 MB each | read 1.05×, scan 1.1×, write 0.85×, search 2× | online DDL for most changes  | row-based; keeps up with more writes |

Postgres forks a process for every connection, so a backend holds its own memory and
`max_connections` is 100. MySQL gives each connection a thread: 500 fit on one box, and each costs
about an eighth of a Postgres backend. A Connection Pooler cuts the number of server connections it
holds, not the memory each one costs, so a busy Postgres box has less RAM left for its buffer cache.

The engine is a shape of the same work, not a better or worse number. Postgres costs less CPU per read
and per scan, and its full-text search is the stronger one. MySQL costs less per write and per
checkout, because InnoDB's write path updates the row in place. A read-heavy Company wants Postgres; a
write-heavy one wants MySQL.

The player picks the engine on the Database's card and on a Read Replica's. A replica runs its
primary's engine; MySQL's row-based replication applies writes faster than Postgres's streaming
replication, so its replicas lag less under the same write load.

Only PostgreSQL meets the **Table bloat** incident (Series A, sev 2, 120 s). Heavy updates outrun
`VACUUM`, the table fills with dead rows, and every read and write on the busiest Database costs 2×
the CPU until the incident ends. The weight is 1.5 on a Database that keeps everything and 0.5 on one
with a retention window. On MySQL it is 0, because MySQL has no dead rows to clean.

A schema change is a migration on both engines, but not the same migration. MySQL's online DDL keeps
most `ALTER`s from blocking writes, so its Schema migration lock incident weighs 0.75× and its lock
grows 0.75× as fast with the rows it copies. Postgres takes the table lock for more changes, so its
incident weighs and grows 1.25×. Online migrations and expand and contract still remove the lock, as
they do on either engine.

Changing a Database's engine is a migration. The card queues 0.8 of the codebase in Dev Hours, then
copies the data at one minute a GB, and the Database serves on its old engine until the copy ends
([Migrations](/design/08-team-and-velocity#migrations)).

### Indexes

Each Feature the player ships adds query shapes, and some of them have no index.

- An unindexed query costs `table_rows × 0.0001` ms of CPU instead of a constant. That is invisible
  at small scale and becomes the bottleneck as data grows, which is incident "Slow query"
  ([Incidents](/design/11-incidents#catalog)).
- An index costs 4 Dev Hours and covers one unindexed query shape, which lowers the Slow query
  weight. But each index makes every write cost 5% more CPU, on every Database, so many indexes slow
  the writes.
- Research "Query analysis" (`EXPLAIN`) shows which query shapes lack an index.

### Schema migrations

Some Features need a schema change, and an `ALTER TABLE` that rewrites a large table locks it.
Writes fail or queue while the lock is held.

| Approach                         | Effect                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Run it directly                  | Free, and causes a write outage proportional to table size.                         |
| Online migration tool (research) | Copies the table in the background. Costs Dev Hours and extra IOPS for a while.     |
| Expand and contract (research)   | Adds the new shape, backfills, then removes the old shape. No lock, more Dev Hours. |

Both research items act as a weight on the Schema migration lock incident
([Incidents](/design/11-incidents#catalog)). A Database with neither takes the lock in full (weight
2.5). Online migrations leave it about eight times less likely (0.3). Expand and contract removes it entirely
(0), because no step of the change ever holds a write back. Both cost Dev Hours on a relational
Database: a Feature that adds a query shape costs 10% more with online migrations and 25% more with
expand and contract.

## Rows and retention

Research "Retention policies" (Pre-IPO, 250,000 ◇) puts a window on the Database's card.

| Policy             | Storage             | A report                                        |
| ------------------ | ------------------- | ----------------------------------------------- |
| Keep everything    | Every GB, full rate | Reads the table.                                |
| Archive after 30 d | A tenth of the rate | Waits on a restore of the archived rows.        |
| Delete after 30 d  | Nothing             | Rebuilds its figures from the event log, at 3×. |

The window is the trade. A Database that keeps everything grows without bound and bills for it. One
that archives or deletes stops growing at the rows it writes inside its window, but a report over the
history it gave up costs more. Archive adds 200 ms to a report's scan, and delete makes the report
rebuild, at three times the scan CPU. The window is 30 calendar days.

The `data` figure never grows past the window's worth of writes. A Database whose Company has not
researched Retention policies stays on Keep everything. Dashboards and Recommendations read history,
so on a Company with a Database that deletes it, each has half its effect.

## Connection Pooler

Real products: PgBouncer, ProxySQL.

The Connection Pooler sits between App Servers and the Database, so that many client connections
share a few server connections. It takes one link out, as PgBouncer sends every connection to one host
and reads no SQL. An L4 Load Balancer after it spreads reads across the Database and its Read Replicas.

| Mode        | Server connections needed  | Limitation                                                                                                                                                           |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session     | One per client session     | Barely helps.                                                                                                                                                        |
| Transaction | One per active transaction | Session state breaks: session-level prepared statements, advisory locks, and `SET` commands. A service that uses them gets `crash` errors until it spends Dev Hours. |
| Statement   | One per statement          | Multi-statement transactions are impossible. `q-tx` fails.                                                                                                           |

The player picks the mode on the card. Transaction and Statement modes share the same 20 server
connections, so Statement's extra packing buys nothing here. What it costs is every `q-tx` through
it, which fails as `refused`. Session mode holds one server connection per arriving client. Session
state breaks in both pooled modes until the task removes it.

The Component teaches [connection pooling](/glossary/connection-pooling), and why "just add
more app servers" can take the database down ([Simulation](/design/04-simulation#connections)).

## Cache

Real products: Redis (start), Memcached (variant), Valkey (the open fork made after Redis changed
its license in 2024). Redis added AGPLv3 as a license option in 2025.

The Cache serves `q-read` from memory. A hit costs 0.5 ms, and a miss costs the cache lookup plus
the database read.

### Variants

| Variant   | Profile                                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis     | Data structures (sorted sets, streams), optional persistence, replication. Executes commands on one main thread, so one core caps a node and one slow command (for example `KEYS *`) blocks all clients. |
| Memcached | Multi-threaded, simple keys and values only, no persistence. Scales up on one big box better than Redis. Restart means a cold cache.                                                                     |

### Hit ratio

```latex
\begin{aligned}
\text{hit ratio} &= \text{working set coverage} \times \text{ttl factor} \times \left(1 - \text{invalidation rate}\right) \\ &\quad \times \text{warmth} \\
\text{working set coverage} &= \sqrt{\operatorname{min}\left(1{,}\ \text{cache memory} / \text{hot data size}\right)} \\
\text{invalidation rate} &= \operatorname{min}\left(0.5,\ 2 \times \text{write share}\right)
\end{aligned}
```

The square root models a skewed access pattern. A small cache already holds the hottest keys, so the
first GB of cache is worth more than the tenth. `ttl_factor` is the Cache's row in [TTL](#ttl), and
`warmth` is 1 on a warm Node and falls while a restarted Cache fills.

### Strategies (a Tradeoff card)

| Strategy      | Read latency        | Write latency     | Staleness                                     | Risk                                                           |
| ------------- | ------------------- | ----------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Cache-aside   | Hit fast, miss slow | Unchanged         | Until TTL or invalidation                     | Race between a write and a concurrent miss can store old data. |
| Read-through  | Same as cache-aside | Unchanged         | Three quarters of the TTL's stale share       | The cache library owns loading.                                |
| Write-through | Hit fast            | +0.5 ms per write | None for keys written through the cache       | Write latency up; caches data that may never be read.          |
| Write-behind  | Hit fast            | Fast (cache only) | Half the TTL's stale share; the database lags | A cache crash loses writes not yet flushed.                    |

All four strategies sit on the Cache's card, behind research "Cache strategies" (Seed, 600 ◇).
Cache-aside is the default and keeps the TTL's own stale share of hits. The others change that share
and the write path:

- Read-through removes the aside race, so it serves three quarters of that share. Its library adds 1
  ms to each miss.
- Write-through has no stale hits and adds half a millisecond to each write.
- Write-behind halves the stale share, answers the write at the Cache's own hop, and flushes half of
  each write to the Database.

A write-behind Cache holds the writes it has acknowledged and not flushed, ten seconds of them. A
crash loses what it holds, and the lost writes spend the error budget like failed requests.

### TTL

| TTL    | Hit-ratio factor | Stale reads on `write`-heavy data    |
| ------ | ---------------- | ------------------------------------ |
| 10 s   | 0.6×             | 0.5% of hits per unit of write share |
| 60 s   | 0.85×            | 2% of hits per unit of write share   |
| 1 hour | 0.97×            | 10% of hits per unit of write share  |

A stale read counts as a `stale` error only for kinds that need fresh data, such as a `write`
followed by a `read` of the same record (read-your-writes) and `buy`. For `page` and `feed`,
staleness is acceptable up to a limit set by the Venture.

### Stampedes

A hot key that expires, or a cache that restarts, makes many requests miss at once and hit the
database together. That is a [cache stampede](/glossary/cache-stampede).

| Protection (research)          | Effect                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Request coalescing             | One request reloads the key while the others wait for it.                            |
| Probabilistic early expiration | Keys refresh slightly before they expire, at random, so they do not expire together. |
| Stale-while-revalidate         | Serves the old value while one request refreshes it.                                 |
| Cache warming                  | Fills a new or restarted cache before it takes traffic.                              |

Each protection is a switch on the Cache's card. Coalescing, early expiration and
stale-while-revalidate need research `stampede-protection`, and warming needs `cache-warming`.

Early expiration wins back half the hit ratio a short TTL loses, and it costs 2% of the hits as
extra refresh reads on the Database. Stale-while-revalidate keeps the whole TTL-free hit ratio,
because an expired key never misses: the reads it would have missed are answered from the old value,
and they count as stale hits.

## Read Replica

Real products: PostgreSQL streaming replication, MySQL replication, Aurora replicas.

A Read Replica is a copy of the primary that serves `q-read`. Writes still go to the primary.

| Option                              | Effect                                                                                                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Asynchronous (start)                | No write cost. Replicas lag by `base_lag + write_rate × lag_factor`. Under heavy writes, lag reaches seconds. A read after a write on a lagging replica is `stale`. MySQL's replica falls behind at 0.8× the write rate; Postgres's at 1×. |
| Synchronous                         | No lag on the synchronous replica. Every write waits for it: +2 ms in the same zone, more across zones. If the replica is down, writes stall.                                                                                              |
| Read-your-writes routing (research) | Sends a user's reads to the primary for a few seconds after that user writes. Removes most `stale` errors and keeps some read load on the primary.                                                                                         |

Synchronous replication is a switch on each Read Replica's card, behind research `sync-replication`.
Every write and checkout on the primary waits for its synchronous replicas, for the slowest of them:
2 ms in the same zone, a zone hop more across zones, and a region round trip more across regions. A
synchronous replica serves no stale read, but if one is down, every write the primary takes times out
until it is back. An asynchronous replica lags by `base_lag + write_rate × lag_factor`, and no write
waits for it.

A misconfigured route is a common bug: sending `q-write` to a replica fails every write. The card
shows a red "Read-only" row.

## Topologies

A second Database is not a follower. The Design picks one topology, and every Database follows it.

| Topology       | Rows per Database  | Writes go to | What costs                                                                  |
| -------------- | ------------------ | ------------ | --------------------------------------------------------------------------- |
| Single primary | All of them, once  | The primary  | Reads that miss the primary stall writes; take them off with a Read Replica |
| Sharded        | Its partition      | Each shard   | Cross-shard transactions and scatter-gather reports                         |
| Multi-leader   | All of them, twice | Any leader   | Write replication and certification conflicts                               |

Placing a second Database while the Design is still on Single primary is refused: pick Sharded or
Multi-leader first, or place a Read Replica for single-leader reads. The card sets one topology for
every Database.

### Single primary

One Database takes writes. Reads split between it and its Read Replicas. This is the starting point,
and the right answer until the primary's write CPU, not its reads, is the limit. A Read Replica is
what answers reads without touching the primary.

### Sharded

Each Database holds one partition of the rows, by the shard key. Writes divide across them, so a
Design that is out of write CPU buys capacity with Boards, not with a bigger box. A read asks the one
Database that holds its key. A transaction that spans two Databases touches two of them, so it costs
up to 3× and can fail as a timeout on either. A report or a search touches every Database, and each
one past the first adds 15% CPU and 2 ms. Keep transactions inside one shard where you can; a
cross-shard transaction is the Vitess 2PC, paid only when unavoidable.

### Multi-leader

Every Database holds every row, and every one takes writes. Local writes are fast, which is why this
topology exists, and the copies must agree. Certification drops conflicting writes: when two leaders
touch the same row at once, the first commit wins and the loser rolls back as refused. The share
scales with the leaders: 2% per extra leader on writes, checkouts, and file puts. Every write also
replicates to the other leaders before it answers, so it costs 1.25× the CPU. Avoid conflicts by
routing related writes to one leader; merging after the fact is the expensive alternative.

### Failover

Promote a Read Replica to the primary when the primary is gone. The replica becomes the Database and
the old primary becomes its replica, fenced so writes never split between two primaries. A
synchronous replica has no writes in flight, so nothing is lost. An asynchronous one still held
writes the primary had not shipped, so promotion loses 2% of the rows. The new primary starts cold.

## Partitioning (sharding)

Research "Sharding" splits one Database into N shards by a key.

| Choice          | Effect                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Hash of user ID | Even load. Queries across users touch every shard (scatter-gather), which is slow and fans out ([fan-out](#fan-out)). |
| Range of IDs    | Simple to split further. New users all land on the last shard: a hot shard.                                           |
| By tenant       | Natural for B2B. One large customer is a hot shard.                                                                   |
| By region       | Data residency for free. Cross-region users are slow.                                                                 |

- Resharding (changing N) costs Dev Hours and IOPS for a calendar day.
- `q-tx` that touches two shards needs a distributed transaction: 3× latency and a failure mode on
  each shard.
- A hot key (a celebrity, a big tenant) overloads one shard while others idle. The card shows the
  skew.

Sharding is the write-side counterpart to the Read Replica. With research `sharding` the card offers
1, 2, 4, or 8 shards. Each shard is another box, so a Database with N shards bills N times the box.
Each shard also brings its own volume, so sharding lifts the IOPS limit along with the CPU limit. A
read asks the one shard that holds its key, so reads do not divide. A Read Replica is still what
takes reads off the primary.

The card also picks the shard key. The key sets how the writes fall on the shards, how many
transactions span shards, and what a report costs:

| Key             | Writes on the busiest shard | Transactions that span shards | Other cost                                   |
| --------------- | --------------------------- | ----------------------------- | -------------------------------------------- |
| Hash of user ID | 1/N, an even split          | `1 − 1/N`                     | None                                         |
| Range of IDs    | `0.5 + 0.5/N`: a hot shard  | `1 − 1/N`                     | None                                         |
| By tenant       | `0.3 + 0.7/N`: a hot shard  | A tenth of the hash key's     | None                                         |
| By region       | 1/N                         | A fifth of the hash key's     | Users in other regions wait up to 70 ms more |

The busiest shard sets the pace, so the write capacity is the CPU's over its share. A report or a
search touches every shard (scatter-gather), and each shard past the first adds 15% CPU and 2 ms to
it. A `q-tx` that spans shards is a distributed transaction: 3× the latency, and it fails as a
timeout with a 0.5% chance on each shard that takes part. The card shows the busiest shard's share
and the share of transactions that span shards.

In a Company, changing the shard count or the key is a resharding. It queues 24 Dev Hours, then
copies the data at a minute a GB for at least a calendar day, and the volume runs at half its IOPS
while it copies. The Database keeps its old shards and key until the copy ends. The Hot key incident
still hits a Cache or Wide-column Store.

## Fan-out

When one user request becomes many backend requests, the tail grows
([Simulation](/design/04-simulation#percentiles)). `feed` is the main case, and it has two designs.
They are the two sides of the Twitter timeline problem:

| Design                  | Read cost                                      | Write cost                            | Problem                                                                                            |
| ----------------------- | ---------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Fan-out on read (pull)  | 20 × `q-read` per `feed`                       | 1 × `q-write` per post                | Slow feeds, a long tail, and heavy read load.                                                      |
| Fan-out on write (push) | 1 cache read per `feed`                        | One cache write per follower per post | A post by an account with millions of followers creates millions of writes: the celebrity problem. |
| Hybrid (research)       | Push for normal accounts, pull for celebrities | Bounded                               | Costs Dev Hours, and it is what real systems do.                                                   |

## Search Engine

Real products: Elasticsearch, OpenSearch (variant), Meilisearch (variant).

A Search Engine has a size and answers 400 queries per second per size step. Its card carries every
option below.

The refresh interval is 1 s, 5 s, or 60 s. A longer interval answers 1.1× or 1.3× the queries and
serves 5% or 25% of them staler than the index. An interval of 1 s serves nothing stale.

Shards are 1, 2, or 4 and replicas 0, 1, or 2. A query fans out to every shard, so each shard past
the first adds 20% of one shard's work. The capacity is `shards / (1 + 0.2 × (shards − 1))` of one
shard's. Each replica adds a whole copy of the capacity, a box, and a copy of the index. The index is
30% of the Company's rows on a gp3 volume, and each replica holds one more copy, so the volume bills
on the Storage line at the Database's row price. Every shard and every replica is another box.

The heap is 25%, 50%, or 75% of the RAM:

- At 25% the JVM garbage-collects too often, and 5% of the answers pause 150 ms.
- At 50% nothing pauses.
- At 75% the file system cache is small, so the Node answers 0.85× the queries, and 2% of the
  answers pause 400 ms.

Elasticsearch and OpenSearch share a profile and take every option. Meilisearch runs one node with no
shards, replicas, or heap. It answers 1.5× the queries in an 8 ms hop instead of 15 ms, and it bills
0.6× the box. Its relevance falls as the index grows: each user makes 0.00005% of its answers stale,
at most 25%.

| Option              | Effect                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Refresh interval    | 1 s by default: new documents become searchable within 1 s. Shorter is fresher and costs indexing CPU. Longer is cheaper and staler. |
| Shards and replicas | More shards parallelize large indexes and fan out every query. Replicas add query capacity and memory.                               |
| Heap                | The JVM heap holds caches. Too small: GC pauses. Too large: long pauses and less file system cache.                                  |

| Variant       | Profile                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Elasticsearch | Full features, JVM, heavy memory. Its license moved to SSPL and ELv2 in 2021, and AGPL was added in 2024. |
| OpenSearch    | The Apache-licensed fork from 2021. Same profile.                                                         |
| Meilisearch   | Simple and fast for small and medium indexes. One node until research. Lower relevance at scale.          |

The index is fed either by dual writes from the app or by a CDC Connector
([keeping copies in sync](#keeping-copies-in-sync)).

## Object Storage

Real products: Amazon S3, Cloudflare R2, Google Cloud Storage.

Object Storage has unlimited capacity. It burns a flat $0.01/s plus $0.000032 per GB stored per
second, and it charges per request and per GB of egress.

| Variant | Profile                                                                 |
| ------- | ----------------------------------------------------------------------- |
| S3      | Standard. Egress costs money unless it goes through a CDN.              |
| R2      | No egress fees. Slightly higher first-byte latency outside its own CDN. |

| Storage class     | Storage price | Retrieval                                                      |
| ----------------- | ------------- | -------------------------------------------------------------- |
| Standard          | 1.0×          | Instant                                                        |
| Infrequent access | 0.5×          | Instant, retrieval fee                                         |
| Archive           | 0.1×          | Hours. A `media` request for archived data fails as `timeout`. |

The player picks the class on the card. The class multiplies the price of the GB the store holds.
Infrequent access also bills $0.01 per GB read back out (S3's own Standard-IA rate) on the Storage
line of the bill. Archive bills a tenth and fails every `blob-get` as `timeout`, because an archived
object must be restored first.

Research "Lifecycle rules" (Series A, 1,500 ◇) moves old objects to cheaper classes automatically.
The rule is Off, or it applies after 30, 90, or 365 calendar days. An object past the window drops
one class: Standard becomes Infrequent access, and Infrequent access becomes Archive.

The store ages from its GB and its upload rate. A store that fills at a steady rate holds its oldest
object for `stored / uploads`, and the share past the window is the older share. That share bills at
the cheaper class, and a read of it into Archive fails as `timeout`, so the cheaper bill costs the
oldest reads. A store in Standard needs two windows before a read fails, and one in Infrequent
access needs only one.

The product is S3, or R2 with research `egress-optimization`. R2 has no egress to the internet, so
the share of a server's egress that `upload` and `media` traffic into an R2 store accounts for bills
$0 ([Economy](/design/09-economy#egress)). A read from R2 waits 15 ms more for its first byte unless
a CDN is on the board. Each read and write bills at its product's price on the Requests line
([Economy](/design/09-economy#base-prices)).

## Document Store

Real products: MongoDB, Firestore, Amazon DynamoDB (AWS lists it as a key-value and document
database).

The Document Store serves `q-read` and `q-write` on documents. Its schema is flexible and its joins
happen in the app:

- A Feature that changes data shape costs −25% Dev Hours and skips schema migrations.
- A `report` or `q-tx` across documents costs 3× and loses atomicity, unless the multi-document
  transaction option is on (+50% write latency).
- It scales out by size: eight sizes, each one more ops a second. A hot key overloads one node's
  share, which the Hot key incident shows.

It answers 3,000 ops a second at its first size. A read or a write is one op, and a `q-tx` or a
`q-scan` is three, so a report reaches it only when no Data Warehouse is linked. It holds no
connections, so an App Server needs no pooler to reach it, and it has no buffer cache or IOPS volume
to run out of.

Without multi-document transactions, 2% of checkouts land half-applied and bill as a duplicate. With
them, every write waits half again its latency. A Feature costs 10% more Dev Hours for the access
pattern it adds, and 25% less when it changes the data shape, because there is no migration to run.
The Hot key incident never picks a `doc` Node: it targets only a Cache or a Wide-column Store.

## Data Warehouse

Real products: BigQuery, Snowflake, ClickHouse.

The Data Warehouse serves `q-scan`, and its columnar storage makes scans cheap.

- Pay per scan (BigQuery style) or per running warehouse (Snowflake style). A careless `report`
  feature that scans everything can cost more than it earns.
- Data arrives by batch ETL (hourly, cheap, stale) or by CDC (seconds, more Burn).
- Running `report` on the primary database instead harms every other kind, because scans evict the
  buffer cache and hold locks. Separating analytics from transactions is the Series B lesson.
- A **materialized view** answers a report from a stored result instead of scanning, so the figures
  are as old as the last refresh. Research `precompute` puts one on a Database's card
  ([Progression](/design/10-progression#track-performance)). A view costs half the scan CPU and
  marks 5% of report answers stale.

## Vector Index

Real products: pgvector, Pinecone, Qdrant.

The Vector Index holds embeddings for retrieval-augmented generation. With one in the `ai` path, `ai`
value rises, because answers use the company's own data.

| Option     | Effect                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| Index type | Exact (perfect recall, slow at scale) or approximate HNSW (fast, memory-heavy, 95% recall). |

The index answers nearest-neighbour lookups (`q-search`) at 500 a second per size step. Exact gives
every lookup its true neighbour. HNSW answers twice as many and bills twice the Burn for the graph it
holds in memory, but it reaches 95% recall, so one search in twenty comes back stale.

A Node that answers `ai` and links into a live index pays one lookup per prompt and earns 35% more
for it, times the index's recall. Python's ML ecosystem bonus ([Runtimes](/design/06-runtimes)) needs
an index in the path, which is the condition the Runtimes page describes. The index is always its own
Node.

## Wide-column Store

Real products: Apache Cassandra, ScyllaDB.

The Wide-column Store is the game's namesake. It replicates each key to N nodes and uses quorums for
reads and writes.

```latex
\begin{aligned}
N &= \text{replication factor} \left(1\ \text{to}\ 5\right) \\
W &= \text{nodes that must acknowledge}\ a\ \text{write} \\
R &= \text{nodes asked on}\ a\ \text{read} \\
R + W &> N \\
&\quad \text{every read asks at least one replica that acknowledged the latest write} \\
R + W &\leq N && \qquad \text{a read can miss the latest write: eventual consistency}
\end{aligned}
```

At its base size the store answers 30,000 replica operations per second, from three nodes at 10,000
each. A write costs N of them and a read costs R.

| Setting (N = 3)   | Write latency          | Read latency           | Consistency      | Survives                             |
| ----------------- | ---------------------- | ---------------------- | ---------------- | ------------------------------------ |
| W=1, R=1          | Fastest                | Fastest                | Eventual         | 2 node failures for reads and writes |
| W=2, R=2 (QUORUM) | Second-fastest replica | Second-fastest replica | Read-after-write | 1 node failure                       |
| W=3, R=1          | Slowest replica        | Fastest                | Read-after-write | 0 node failures for writes           |
| W=1, R=3          | Fastest                | Slowest replica        | Read-after-write | 0 node failures for reads            |

- **Overlap is not linearizability.** Concurrent writes, sloppy quorums, hinted handoff, and clock
  skew can still return old or conflicting values, so `buy` on this store gets `stale` and
  `duplicate` errors. Cassandra offers lightweight transactions for a linearizable write, at the
  cost of several round trips. A Distributed SQL Node is the real fix.
- Latency at a quorum is the latency of the k-th fastest replica, so quorum reads have a better tail
  than "all" reads and a worse tail than "one" reads.
- Writes scale linearly with nodes, until the partition key is skewed.
- No joins and no ad hoc queries. Each query pattern needs its own table, designed for it: +Dev Hours
  per feature.
- Across regions, `LOCAL_QUORUM` keeps latency local and gives up global consistency. A spread
  Wide-column Store pays no cross-region latency.

## Distributed SQL

Real products: CockroachDB, Google Spanner, YugabyteDB.

Distributed SQL gives SQL transactions across shards and regions, built on consensus
([Raft](/glossary/raft)).

- Every write waits for a majority of replicas. In one region that costs a few milliseconds. Across
  three regions it costs a cross-region round trip, 70 ms or more.
- Survives a whole region outage with no data loss.
- It is expensive per node. It is the right tool for `buy` in a multi-region company and the wrong
  tool for `feed`.

## Keeping copies in sync

Data that lives in more than one place (database, cache, search index, warehouse) can disagree with
itself. Each approach below trades correctness against lag and Dev Hours.

| Approach                        | Risk                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Dual writes from the app        | If one write fails, the copies diverge until a repair job runs. The game counts divergence as `stale` on search results.        |
| Transactional outbox (research) | The app writes the change and an outbox row in one transaction. A relay publishes it. Correct, with a little lag and Dev Hours. |
| CDC Connector                   | Reads the database log. Correct, with lag, and no app changes.                                                                  |

From Series B, 0.5% of a Search Engine's answers are stale from a lost publish. The problem starts
in the Era that offers the outbox, so the fix arrives with it. The research `outbox`, or a CDC
Connector on the Board, takes that share to zero: the write and its event land together, and no
answer waits on a repair job.

## Delivery semantics

A Queue or stream delivers messages with one of three guarantees.

| Guarantee                  | Behavior                                            | Game effect                                                                              |
| -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| At most once               | A message is never delivered twice and may be lost. | A crash loses in-flight `task`.                                                          |
| At least once              | A message is never lost and may be delivered twice. | Non-idempotent jobs run twice. `push` sends duplicate notifications, which raises churn. |
| Exactly once (effectively) | At least once plus idempotent processing.           | Needs research "Idempotency keys" and Dev Hours per consumer.                            |

## Multi-region data

From the Series C Era, the player decides where each kind of data lives.

| Pattern                         | Reads                                           | Writes                        | On a region outage                                               |
| ------------------------------- | ----------------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| Single primary, remote replicas | Local, possibly stale                           | Cross-region to the primary   | Writes stop until failover. Recent writes may be lost (RPO > 0). |
| Partition by region             | Local                                           | Local                         | That region's users are down, others are fine.                   |
| Leaderless (wide-column)        | Local quorum                                    | Local quorum                  | Fine, with eventual consistency across regions.                  |
| Consensus (distributed SQL)     | Local (follower reads, stale) or remote (fresh) | Majority across regions, slow | Fine, no data loss.                                              |

In a region outage or the DR drill, **Fail over** starts the stateless Nodes again in another region
but never moves a single-region data store, so data that does not live in both regions stays down
([Incidents](/design/11-incidents#mitigation-toolbox)).

[RPO and RTO](/glossary/rpo-and-rto) are scored in the Pre-IPO Era, when a disaster recovery audit
is part of the IPO checklist ([Progression](/design/10-progression#era-6-pre-ipo)).

## Backups

| Option                                 | RPO        | Cost                                   |
| -------------------------------------- | ---------- | -------------------------------------- |
| None                                   | Everything | Free until "Accidental delete" happens |
| Nightly snapshot                       | 24 hours   | Storage                                |
| Point-in-time recovery (WAL archiving) | Minutes    | Storage and IOPS                       |

Incident "Accidental delete" deletes a table. With no backup, the company loses users and data, and
restore time grows with data volume. Untested backups have a 20% chance to fail on restore until
research "Restore drills".

A backup written without research "Restore drills" (Series A, 2,000 ◇) rolls that 20% as it is
taken. It either restores or it does not, and the card says which. A broken backup restores nothing,
so the DR drill reads an infinite RPO and the checklist names "Restore failed".

A **Restore drill** button on the card costs 4 Dev Hours. It writes a new backup and tests it: 20%
broken without the research, never broken with it. With the research, every new backup is tested as
it is taken.

A broken backup shows up in the DR drill and in the **Accidental delete** incident. Restoring a good
backup takes 5 calendar minutes plus half a minute per GB of rows, twice the GB for point-in-time
recovery ([Data volume](#data-volume)). A broken backup, or none, restores nothing and costs 10% of
the Users.
