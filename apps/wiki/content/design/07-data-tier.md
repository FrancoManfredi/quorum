---
title: 7. Data tier
summary: Databases, caches, replicas, quorums, consistency, and storage.
section: design
order: 7
---

Stateless app servers are easy to copy. State is hard to copy. This document defines the Components
that hold state and the mechanics that make the data tier the long-term challenge of the game:
connections, indexes, caches, replication, consistency, partitioning, and quorums.

## Data volume

The game tracks stored data in GB, in two places. Object Storage holds the files it is sent
([Object Storage](#object-storage)); the Databases hold rows, and every `q-write` and every `rt`
message a Realtime Hub carries adds one. Data never shrinks by itself.

- The rows bill on the Storage line of the cloud bill at 3.5× the Object Storage price, the price of
  gp3 block storage against S3 Standard.
- A Database answers an unindexed query or a report from its rows, so more rows mean a slower scan.
- Research "Retention policies" puts a window on the Database and archives or deletes what passes
  it, which trades cheap storage for slower reads or a rebuild (see [Rows and retention](#rows-and-retention),
  built below).

**Built:** data volume, and the two figures it lives in — `stored` for Object Storage and `data` for
the Databases. A row costs 10 KB, its indexes and its share of the WAL included. Growth bills, and it
is what a retention window caps.

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
history loses part of its value when retention deletes that history
([Rows and retention](#rows-and-retention)).

## Relational database

Real products: PostgreSQL (start), MySQL (variant).

The source of truth. It serves `q-read`, `q-write`, and `q-tx`. It can also serve `q-search` with
built-in full-text search and `q-scan`, both badly at volume.

### Capacity

```text
capacity = min(cpu_limit, connection_limit, iops_limit)
```

| Limit        | Detail                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CPU          | Each query kind has a CPU cost. Missing indexes multiply it.                                                                                                             |
| IOPS         | Reads that miss the buffer cache and every write go to disk. Storage class sets IOPS: general purpose (3,000 base) or provisioned (up to 64,000 at higher cost).         |
| Connections  | Postgres forks one process per connection, 5 to 10 MB each. `max_connections` is 100 by default. MySQL uses a thread per connection and handles more connections per GB. |
| Buffer cache | RAM that holds hot data. When the working set exceeds RAM, reads go to disk and latency jumps. This is why a Memory instance can beat a Compute instance for a database. |

**Built:** the IOPS limit. A general purpose volume answers 3,000 disk operations a second and a
provisioned one 64,000, and provisioned storage bills 1.5× the Database's box. A disk operation waits 1 / IOPS ms and queues as the volume
fills, so a Database whose working set outgrows RAM meets the volume before its CPU: at 96 vCPU a
general purpose volume caps reads at 3,000 a second while the CPU would answer 8,000. A shard brings
its own volume.

### Variants

| Variant    | Profile                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PostgreSQL | Rich features: JSONB, full-text search, extensions such as pgvector. Process per connection, so it needs a pooler early. MVCC leaves dead rows that `VACUUM` must clean; heavy update load without tuning causes bloat (incident "Table bloat"). |
| MySQL      | Thread per connection, cheaper connections. Fewer built-in features: no pgvector, weaker full-text search. Replication is simple and widely used.                                                                                                |

**Built:** both engines, chosen on the Database's card and on a Read Replica's. Postgres holds 100
connections, MySQL 500, so a fleet that exhausts `max_connections` on Postgres fits on MySQL. MySQL's
`q-search` costs twice the CPU of Postgres's.

PostgreSQL meets the **Table bloat** incident (Series A, sev 2, 120 s): heavy updates outrun
`VACUUM`, the table fills with dead rows, and every read and write on the busiest Database costs 2×
the CPU until the incident ends. It weighs 1.5 on a Database that keeps everything and 0.5 on one with
a retention window, and 0 on MySQL, which has no dead rows to clean. Changing a Database's engine is
a migration: the card queues 0.8 of the codebase in Dev Hours, then copies the data at one minute a
GB, and the Database serves on its old engine until the copy ends
([Migrations](/design/08-team-and-velocity#migrations)).

### Indexes

Each feature the player ships adds query shapes. Some of them have no index.

- An unindexed query costs `table_rows × 0.0001` ms of CPU instead of a constant. It is invisible at
  small scale and becomes the bottleneck as data grows. This is incident "Slow query"
  ([Incidents](/design/11-incidents#catalog)).
- Adding an index costs 4 Dev Hours and covers one unindexed query shape, which lowers the Slow query
  weight. Each index makes every write cost 5% more CPU, on every Database, so many indexes slow
  the writes.
- Research "Query analysis" (`EXPLAIN`) shows which query shapes lack an index.

### Schema migrations

Some features need a schema change. An `ALTER TABLE` that rewrites a large table locks it. Writes
fail or queue while the lock is held.

| Approach                         | Effect                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Run it directly                  | Free, and causes a write outage proportional to table size.                         |
| Online migration tool (research) | Copies the table in the background. Costs Dev Hours and extra IOPS for a while.     |
| Expand and contract (research)   | Adds the new shape, backfills, then removes the old shape. No lock, more Dev Hours. |

**Built:** both research items, as a weight on the Schema migration lock Incident
([Incidents](/design/11-incidents#catalog)). A Database with neither takes the lock in full (weight
2.5); online migrations leave it a fifth of a chance (0.3); expand and contract removes it entirely
(0), because no step of the change ever holds a write back. Both cost Dev Hours on a relational Database: a Feature that adds a query shape costs 10% more
with online migrations and 25% more with expand and contract.

## Rows and retention

Research "Retention policies" (Pre-IPO, 250,000 ◇) puts a window on the Database's card.

| Policy             | Storage             | A report                                        |
| ------------------ | ------------------- | ----------------------------------------------- |
| Keep everything    | Every GB, full rate | Reads the table.                                |
| Archive after 30 d | A tenth of the rate | Waits on a restore of the archived rows.        |
| Delete after 30 d  | Nothing             | Rebuilds its figures from the event log, at 3×. |

The window is the trade: a Database that keeps everything grows without bound and bills for it; one
that archives or deletes stops growing at the rows it writes inside its window, and the history it
gave up is what a report over that range costs. Archive adds 200 ms to a report's scan; delete makes
it rebuild, at three times the scan CPU. The window is 30 calendar days.

**Built:** the three policies and the window that caps the rows. The `data` figure never grows past
the window's worth of writes, and a Database whose Company has not researched Retention policies
stays on Keep everything. Dashboards and Recommendations read history: on a Company with a Database
that deletes it, each has half its effect.

## Connection Pooler

Real products: PgBouncer, ProxySQL.

Sits between app servers and the database. Many client connections share a few server connections.

| Mode        | Server connections needed  | Limitation                                                                                                                                                           |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session     | One per client session     | Barely helps.                                                                                                                                                        |
| Transaction | One per active transaction | Session state breaks: session-level prepared statements, advisory locks, and `SET` commands. A service that uses them gets `crash` errors until it spends Dev Hours. |
| Statement   | One per statement          | Multi-statement transactions are impossible. `q-tx` fails.                                                                                                           |

**Built:** all three modes, chosen on the card. Transaction and Statement modes share the same 20
server connections, so Statement's extra packing buys nothing in the game; what it costs is every
`q-tx` through it, which fails as `refused`. Session mode holds one server connection per arriving
client. Session state breaks in both pooled modes, until the task removes it.

Teaches: [connection pooling](/design/glossary#connection-pooling), and why "just add more app servers"
can take the database down ([Simulation](/design/04-simulation#connections)).

## Cache

Real products: Redis (start), Memcached (variant), Valkey (the open fork made after Redis changed
its license in 2024). Redis added AGPLv3 as a license option in 2025.

Serves `q-read` from memory. A hit costs 0.5 ms. A miss costs the cache lookup plus the database read.

### Variants

| Variant   | Profile                                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis     | Data structures (sorted sets, streams), optional persistence, replication. Executes commands on one main thread, so one core caps a node and one slow command (for example `KEYS *`) blocks all clients. |
| Memcached | Multi-threaded, simple keys and values only, no persistence. Scales up on one big box better than Redis. Restart means a cold cache.                                                                     |

### Hit ratio

```text
hit_ratio = working_set_coverage × ttl_factor × (1 − invalidation_rate) × warmth
working_set_coverage = min(1, cache_memory / hot_data_size) ^ 0.5
invalidation_rate = min(0.5, 2 × write_share)
```

The square root models a skewed access pattern: a small cache already holds the hottest keys, so the
first GB of cache is worth more than the tenth. `ttl_factor` is the Cache's row in [TTL](#ttl), and
`warmth` is 1 on a warm Node, falling while a restarted Cache fills.

### Strategies (a Tradeoff card)

| Strategy      | Read latency        | Write latency     | Staleness                               | Risk                                                           |
| ------------- | ------------------- | ----------------- | --------------------------------------- | -------------------------------------------------------------- |
| Cache-aside   | Hit fast, miss slow | Unchanged         | Until TTL or invalidation               | Race between a write and a concurrent miss can store old data. |
| Read-through  | Same as cache-aside | Unchanged         | Until TTL                               | The cache library owns loading.                                |
| Write-through | Hit fast            | +1 cache write    | None for keys written through the cache | Write latency up; caches data that may never be read.          |
| Write-behind  | Hit fast            | Fast (cache only) | None in cache; the database lags        | A cache crash loses writes not yet flushed.                    |

**Built:** all four, on the Cache's card, with research "Cache strategies" (Seed, 600 ◇). Cache-aside
is the default and keeps the TTL's own stale share of hits. The rest are four numbers:
read-through removes the aside race, so it serves three quarters of that share; write-through has no
stale hits and adds half a millisecond to each write; write-behind halves the stale share, answers the
write at the Cache's own hop, and flushes half of each write to the Database. Read-through's own cost,
the library that owns loading, is not modelled; write-behind caches nothing across a restart, so a
crash still loses what it had not flushed, and the Cache counts only the slower reads of a lagging
Database, not the loss.

### TTL

| TTL    | Hit-ratio factor | Stale reads on `write`-heavy data    |
| ------ | ---------------- | ------------------------------------ |
| 10 s   | 0.6×             | 0.5% of hits per unit of write share |
| 60 s   | 0.85×            | 2% of hits per unit of write share   |
| 1 hour | 0.97×            | 10% of hits per unit of write share  |

A stale read counts as a `stale` error only for kinds that need fresh data, such as `write` followed
by `read` of the same record (read-your-writes) and `buy`. For `page` and `feed`, staleness is
acceptable up to a limit set by the Venture.

### Stampedes

When a hot key expires, or the cache restarts, many requests miss at once and hit the database
together. This is a [cache stampede](/design/glossary#cache-stampede).

| Protection (research)          | Effect                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Request coalescing             | One request reloads the key while the others wait for it.                            |
| Probabilistic early expiration | Keys refresh slightly before they expire, at random, so they do not expire together. |
| Stale-while-revalidate         | Serves the old value while one request refreshes it.                                 |
| Cache warming                  | Fills a new or restarted cache before it takes traffic.                              |

**Built:** all four, as switches on the Cache's card. Coalescing, early expiration and
stale-while-revalidate need research `stampede-protection`; warming needs `cache-warming`. Early
expiration wins back half the hit ratio a short TTL loses and costs 2% of the hits as extra refresh
reads on the Database. Stale-while-revalidate keeps the whole TTL-free hit ratio: the reads an
expired key would have missed are answered from the old value, and they count as stale hits.

## Read Replica

Real products: PostgreSQL streaming replication, MySQL replication, Aurora replicas.

A copy of the primary that serves `q-read`. Writes still go to the primary.

| Option                              | Effect                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asynchronous (start)                | No write cost. Replicas lag by `base_lag + write_rate × lag_factor`. Under heavy writes, lag reaches seconds. A read after a write on a lagging replica is `stale`. |
| Synchronous                         | No lag on the synchronous replica. Every write waits for it: +2 ms in the same zone, more across zones. If the replica is down, writes stall.                       |
| Read-your-writes routing (research) | Sends a user's reads to the primary for a few seconds after that user writes. Removes most `stale` errors and keeps some read load on the primary.                  |

**Built:** synchronous replication, a switch on each Read Replica's card, with research
`sync-replication`. Every write and checkout on the primary waits for its synchronous replicas: 2 ms
in the same zone, a zone hop more across zones, a region round trip more across regions, for the
slowest of them. A synchronous replica serves no stale read. If one is down, every write the primary
takes times out until it is back. An asynchronous replica lags by `base_lag + write_rate × lag_factor`,
and no write waits for it.

Replicas behind a misconfigured route are a common bug: sending `q-write` to a replica fails every
write. The card shows a red "Read-only" row.

## Partitioning (sharding)

Research "Sharding" splits one database into N shards by a key.

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

**Built:** sharding the Database, as the write-side counterpart to the Read Replica. With research
`sharding` the card offers 1, 2, 4, or 8 shards. Each shard is another box: a Database with N shards
bills N times the box. Each shard brings its own volume, so sharding lifts the IOPS limit with the
CPU limit. A read asks the one shard that holds its key, so the reads do not divide; a Read Replica
is still what takes reads off the primary.

The card also picks the shard key. The key sets how the writes fall on the shards, how many
transactions span shards, and what a report costs:

| Key             | Writes on the busiest shard | Transactions that span shards | Other cost                                   |
| --------------- | --------------------------- | ----------------------------- | -------------------------------------------- |
| Hash of user ID | 1/N, an even split          | `1 − 1/N`                     | None                                         |
| Range of IDs    | `0.5 + 0.5/N`: a hot shard  | `1 − 1/N`                     | None                                         |
| By tenant       | `0.3 + 0.7/N`: a hot shard  | A tenth of the hash key's     | None                                         |
| By region       | 1/N                         | A fifth of the hash key's     | Users in other regions wait up to 70 ms more |

The busiest shard sets the pace, so the write capacity is the CPU's over its share. A report or a
search touches every shard (scatter-gather): each shard past the first adds 15% CPU and 2 ms to it.
A `q-tx` that spans shards is a distributed transaction: 3× the latency, and it fails as a timeout
with a 0.5% chance on each shard that takes part. The card shows the busiest shard's share and the
share of transactions that span shards.

In a Company, changing the shard count or the key is a resharding. It queues 24 Dev Hours, then
copies the data at a minute a GB for at least a calendar day, and the volume runs at half its IOPS
while it copies. The Database keeps its old shards and key until the copy ends. The Hot key incident
still hits a Cache or Wide-column Store.

## Fan-out

When one user request becomes many backend requests, the tail grows
([Simulation](/design/04-simulation#percentiles)).

`feed` is the main example. It has two designs, which is the real Twitter timeline problem:

| Design                  | Read cost                                      | Write cost                            | Problem                                                                                            |
| ----------------------- | ---------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Fan-out on read (pull)  | 20 × `q-read` per `feed`                       | 1 × `q-write` per post                | Slow feeds, a long tail, and heavy read load.                                                      |
| Fan-out on write (push) | 1 cache read per `feed`                        | One cache write per follower per post | A post by an account with millions of followers creates millions of writes: the celebrity problem. |
| Hybrid (research)       | Push for normal accounts, pull for celebrities | Bounded                               | Costs Dev Hours, and it is what real systems do.                                                   |

## Search Engine

A Search Engine has a size and 400 queries per second per size step.

**Built:** every option below, on the card. The refresh interval is 1 s, 5 s, or 60 s. A longer
interval answers 1.1× or 1.3× the queries and serves 5% or 25% of them staler than the index; 1 s
serves nothing stale.

Shards are 1, 2, or 4 and replicas 0, 1, or 2. A query fans out to every shard, so each shard past
the first adds 20% of one shard's work: the capacity is `shards / (1 + 0.2 × (shards − 1))` of one
shard's. Each replica adds a whole copy of the capacity, a box, and a copy of the index. The index is
30% of the Company's rows on a gp3 volume, and each replica holds one more copy, so the volume bills on
the Storage line at the Database's row price. Every shard and every replica is another box.

The heap is 25%, 50%, or 75% of the RAM. At 25% the JVM garbage-collects too often: 5% of the
answers pause 150 ms. At 50% nothing pauses. At 75% the file system cache is small, so the Node
answers 0.85× the queries, and 2% of the answers pause 400 ms.

Elasticsearch and OpenSearch share a profile and take every option. Meilisearch runs one node with no
shards, replicas, or heap, answers 1.5× the queries in an 8 ms hop instead of 15 ms, and bills 0.6×
the box. Its relevance falls as the index grows: each user makes 0.00005% of its answers stale, at
most 25%.

Real products: Elasticsearch, OpenSearch (variant), Meilisearch (variant).

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

Feeding the index: either dual writes from the app or a CDC Connector
([keeping copies in sync](#keeping-copies-in-sync)).

## Object Storage

Real products: Amazon S3, Cloudflare R2, Google Cloud Storage.

Unlimited capacity. It burns a flat $0.01/s plus $0.000032 per GB stored per second, and it charges
per request and per GB of egress.

| Variant | Profile                                                                 |
| ------- | ----------------------------------------------------------------------- |
| S3      | Standard. Egress costs money unless it goes through a CDN.              |
| R2      | No egress fees. Slightly higher first-byte latency outside its own CDN. |

| Storage class     | Storage price | Retrieval                                                      |
| ----------------- | ------------- | -------------------------------------------------------------- |
| Standard          | 1.0×          | Instant                                                        |
| Infrequent access | 0.5×          | Instant, retrieval fee                                         |
| Archive           | 0.1×          | Hours. A `media` request for archived data fails as `timeout`. |

**Built:** the three classes, chosen on the card. The class multiplies the price of the GB the store
holds, and Infrequent access bills $0.01 per GB read back out (S3's own Standard-IA rate) on the
Storage line of the bill. Archive bills a tenth and fails every `blob-get` as `timeout`: an archived
object must be restored first.

Research "Lifecycle rules" (Series A, 1,500 ◇) moves old objects to cheaper classes automatically.

**Built:** the rule, on the card: Off, or after 30, 90, or 365 calendar days. An object past the window drops one class, so Standard becomes Infrequent
access and Infrequent access becomes Archive. The store ages from its GB and its upload rate:
a store that fills at a steady rate holds its oldest object for `stored / uploads`, and the share past
the window is the older share. That share bills at the cheaper class, and a read of it into Archive
fails as `timeout`, so the cheaper bill costs the oldest reads. A store in Standard needs two windows
before a read fails; one in Infrequent access needs only one.

**Built:** the product, on the card: S3, or R2 with research `egress-optimization`. R2 has no egress
to the internet: the share of a server's egress that `upload` and `media` traffic into an R2 store
accounts for bills $0 ([Economy](/design/09-economy#egress)). A read from R2 waits 15 ms more for its
first byte unless a CDN is on the board. Each read and write bills at its product's price on the
Requests line ([Economy](/design/09-economy#base-prices)).

## Document Store

Real products: MongoDB, Firestore, Amazon DynamoDB (AWS lists it as a key-value and document
database).

Serves `q-read` and `q-write` on documents.

- Flexible schema: features that change data shape cost −25% Dev Hours and skip schema migrations.
- Joins happen in the app: `report` and `q-tx` across documents cost 3× and lose atomicity unless the
  multi-document transaction option is on (+50% write latency).
- Scales out by size: eight sizes, each one more ops a second. A hot key overloads one node's share, which the Hot key incident shows.

**Built:** the Component, its flat rate, its joins and its Dev Hours. It answers 3,000 ops a second
at its first size, over eight sizes, and a read or a write is one op while a `q-tx` or a `q-scan`
is three: a report reaches it only when no Data Warehouse is linked. It holds no connections, so an
App Server needs no pooler to reach it, and it has no buffer cache or IOPS volume to run out of.
Without multi-document transactions a share of checkouts lands half-applied and bills as a
duplicate; with them, every write waits half again its latency. A Feature costs 10% more Dev Hours
for the access pattern it adds, and 25% less when it changes the data shape, because there is no
migration to run. The half-applied share is 2%, and the access pattern's extra Dev Hours 10%. The
`doc` Component has no shard count, so the Hot key incident divides its rate the way it divides a
Cache's.

## Data Warehouse

Real products: BigQuery, Snowflake, ClickHouse.

Serves `q-scan`. Columnar storage makes scans cheap.

- Pay per scan (BigQuery style) or per running warehouse (Snowflake style). A careless `report`
  feature that scans everything can cost more than it earns.
- Data arrives by batch ETL (hourly, cheap, stale) or by CDC (seconds, more Burn).
- Running `report` on the primary database instead harms every other kind: scans evict the buffer
  cache and hold locks. Separating analytics from transactions is the Series B lesson.
- A **materialized view** answers a report from a stored result instead of scanning: half the CPU,
  and the figures are as old as the last refresh. Research `precompute` puts one on a Database's
  card ([Progression](/design/10-progression#track-performance)). The build charges half the scan
  CPU and marks 5% of report answers stale.

## Vector Index

Real products: pgvector, Pinecone, Qdrant.

Holds embeddings for retrieval-augmented generation. With a Vector Index in the `ai` path, `ai` value
rises, because answers use the company's own data.

| Option     | Effect                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| Index type | Exact (perfect recall, slow at scale) or approximate HNSW (fast, memory-heavy, 95% recall). |

**Built:** the Component, its two index types, and the retrieval lift. It answers nearest-neighbour
lookups (`q-search`) at 500 a second per size step. Exact gives every lookup its true neighbour;
HNSW answers twice as many, bills twice the Burn for the graph it holds in memory, and reaches 95%
recall, so one search in twenty comes back stale. A Node that answers `ai` and links into a live
index pays one lookup per prompt and earns 35% more for it, times the index's recall; and Python's
ML ecosystem bonus (06) now needs an index in the path, which is the condition the Runtimes page
describes. The lift is 35%, the HNSW capacity 2× and its Burn 2×. The index is always its own Node.

## Wide-column Store

Real products: Apache Cassandra, ScyllaDB.

This Component is the game's namesake. It replicates each key to N nodes and uses quorums for reads
and writes.

```text
N = replication factor (1 to 5)     W = nodes that must acknowledge a write     R = nodes asked on a read
R + W > N  →  every read asks at least one replica that acknowledged the latest write
R + W ≤ N  →  a read can miss the latest write: eventual consistency
```

At its base size the store answers 30,000 replica operations per second — three nodes at 10,000
each — and a write costs N of them, a read R.

| Setting (N = 3)   | Write latency          | Read latency           | Consistency      | Survives                             |
| ----------------- | ---------------------- | ---------------------- | ---------------- | ------------------------------------ |
| W=1, R=1          | Fastest                | Fastest                | Eventual         | 2 node failures for reads and writes |
| W=2, R=2 (QUORUM) | Second-fastest replica | Second-fastest replica | Read-after-write | 1 node failure                       |
| W=3, R=1          | Slowest replica        | Fastest                | Read-after-write | 0 node failures for writes           |
| W=1, R=3          | Fastest                | Slowest replica        | Read-after-write | 0 node failures for reads            |

- **Overlap is not linearizability.** Concurrent writes, sloppy quorums, hinted handoff, and clock
  skew can still return old or conflicting values, so `buy` on this store gets `stale` and
  `duplicate` errors. Cassandra offers lightweight transactions for a linearizable write, at a
  latency of several round trips. A Distributed SQL Node is the real fix.
- Latency at a quorum is the latency of the k-th fastest replica, so quorum reads have a better tail
  than "all" reads and a worse tail than "one" reads.
- Writes scale linearly with nodes, until the partition key is skewed.
- No joins and no ad hoc queries. Each query pattern needs its own table, designed for it: +Dev Hours
  per feature.
- Across regions, `LOCAL_QUORUM` keeps latency local and gives up global consistency. A spread
  Wide-column Store pays no cross-region latency.

## Distributed SQL

Real products: CockroachDB, Google Spanner, YugabyteDB.

SQL with transactions across shards and regions, built on consensus ([Raft](/design/glossary#raft)).

- Every write waits for a majority of replicas. In one region that costs a few milliseconds. Across
  three regions it costs a cross-region round trip, 70 ms or more.
- Survives a whole region outage with no data loss.
- Expensive per node. The right tool for `buy` in a multi-region company, and the wrong tool for
  `feed`.

## Keeping copies in sync

Once data lives in more than one place (database, cache, search index, warehouse), the copies can
disagree.

| Approach                        | Risk                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Dual writes from the app        | If one write fails, the copies diverge until a repair job runs. The game counts divergence as `stale` on search results.        |
| Transactional outbox (research) | The app writes the change and an outbox row in one transaction. A relay publishes it. Correct, with a little lag and Dev Hours. |
| CDC Connector                   | Reads the database log. Correct, with lag, and no app changes.                                                                  |

**Built:** all three. From Series B, 0.5% of a Search Engine's answers are stale from a lost publish
(it starts in the Era that offers the outbox, so the fix arrives with the problem). The research `outbox`, or a CDC Connector on
the Board, takes that share to zero: the write and its event land together, and no answer waits on a
repair job.

## Delivery semantics

Queues and streams deliver messages with one of three guarantees.

| Guarantee                  | Behavior                                            | Game effect                                                                              |
| -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| At most once               | A message is never delivered twice and may be lost. | A crash loses in-flight `task`.                                                          |
| At least once              | A message is never lost and may be delivered twice. | Non-idempotent jobs run twice. `push` sends duplicate notifications, which raises churn. |
| Exactly once (effectively) | At least once plus idempotent processing.           | Needs research "Idempotency keys" and Dev Hours per consumer.                            |

## Multi-region data

From the Series C Era, the player must decide where each kind of data lives.

| Pattern                         | Reads                                           | Writes                        | On a region outage                                               |
| ------------------------------- | ----------------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| Single primary, remote replicas | Local, possibly stale                           | Cross-region to the primary   | Writes stop until failover. Recent writes may be lost (RPO > 0). |
| Partition by region             | Local                                           | Local                         | That region's users are down, others are fine.                   |
| Leaderless (wide-column)        | Local quorum                                    | Local quorum                  | Fine, with eventual consistency across regions.                  |
| Consensus (distributed SQL)     | Local (follower reads, stale) or remote (fresh) | Majority across regions, slow | Fine, no data loss.                                              |

[RPO and RTO](/design/glossary#rpo-and-rto) are scored in the Pre-IPO Era, when a disaster recovery audit
is part of the IPO checklist ([Progression](/design/10-progression#era-6-pre-ipo)).

## Backups

| Option                                 | RPO        | Cost                                   |
| -------------------------------------- | ---------- | -------------------------------------- |
| None                                   | Everything | Free until "Accidental delete" happens |
| Nightly snapshot                       | 24 hours   | Storage                                |
| Point-in-time recovery (WAL archiving) | Minutes    | Storage and IOPS                       |

Incident "Accidental delete" (a real class of outage) deletes a table. With no backup, the company
loses users and data. Restore time grows with data volume. Untested backups have a 20% chance to fail
on restore until research "Restore drills".

**Built:** the 20%, and the drill that finds it. A backup written without research "Restore drills"
(Series A, 2,000 ◇) rolls the design's own 20% as it is taken: it either restores or it does not, and
the card says which. A broken backup restores nothing, so the DR drill reads an infinite RPO and the
checklist names "Restore failed". A **Restore drill** button on the card costs 4 Dev Hours and writes a new backup and tests it: 20% broken without the research, never broken with it, and the
research also tests every new backup as it is taken.

A broken backup shows up in the DR drill and in the **Accidental delete** incident. Restoring a good
backup takes 5 calendar minutes plus half a minute per GB of rows, twice the GB for point-in-time
recovery ([Data volume](#data-volume)); a broken one, or none, restores nothing and costs 10% of the
Users.
