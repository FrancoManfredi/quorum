---
title: The data tier
summary: Why state is the hard part of scaling, and how the Database, Cache, Read Replica, and quorum stores trade speed for freshness.
section: explanation
order: 7
era: 1
aliases: database, postgres, cache, redis, replica, replication lag, stale, slow query, index, n+1, quorum, wide-column, distributed sql, warehouse, hot key
gdd: /design/07-data-tier
---

State is the hard part of scaling. App Servers are easy to copy because they hold no data, so ten
copies are as correct as one. Data is different, because every copy must agree with the others or
users see the wrong answer. That is why the data tier becomes the long-term challenge of every
Company.

## The Database is the source of truth

The [Database](/components/database) answers read queries, write queries, and transactions. Until you
link a better Component, it also does three other jobs badly: full-text search, uploaded files stored
as rows, and report scans. Each costs far more CPU than a normal read. A
[Search Engine](/components/search), [Object Storage](/components/storage), and a
[Data Warehouse](/components/warehouse) take those jobs away.

Four limits cap a Database:

- **CPU.** Every query costs CPU, and a cold Database, just restarted, needs more of it per query.
- **Connections.** Postgres runs one process per connection and accepts a fixed number. MySQL gives
  each connection a thread and holds several times as many. Read
  [Errors and retries](/explanation/errors-and-retries) for why more App Servers make this worse.
- **The volume's IOPS.** Every write and every read that misses the buffer cache waits on the disk.
  A general purpose volume answers 3,000 of those a second, a provisioned one 64,000.
- **The buffer cache.** Report scans fill memory with cold data. Other reads then go to disk, and
  writes wait behind the scans. This is why analytics and transactions should not share a Database.
  See [OLTP and OLAP](/glossary/oltp-and-olap).

A bigger box lifts the first two limits. Sharding lifts the CPU limit on writes, because each shard
takes its share of them, but each shard bills like a Database of its own.

## Two engines, two shapes of work

Postgres and MySQL are the same job with different costs. Postgres holds 100 connections at about
8 MB each and answers reads, scans, and full-text search about 5–10% cheaper than MySQL. MySQL
holds 500 connections at about 1 MB each and answers writes and checkouts about 30% cheaper,
because InnoDB updates the row in place. It also changes schema online, while many Postgres
`ALTER`s take the table lock, and only Postgres keeps dead rows for VACUUM, so only Postgres meets
Table bloat. A read-heavy Company wants Postgres; a write-heavy one wants MySQL.

Replicas always run their primary's engine, and one topology runs one engine, so a change lands on
every Database at once. Replication only copies between matching engines.

## More than one Database: pick a topology

A second Database is not a follower; the Design picks one topology and every Database follows it.
Single primary (the start) takes writes on one Database and reads on Read Replicas. Sharded gives
each Database its partition of the rows, so writes scale but cross-shard transactions cost up to 3×
and can fail on either shard. Multi-leader copies every row to every Database and lets each take
writes, so local writes are fast but certification drops conflicting writes (first commit wins) and
every write costs 1.25× the CPU to replicate. Switching the topology moves the rows: 24 Dev Hours
and a minute a GB, like a resharding.

Quorum stores ([Wide-column Store](/components/wide)) and consensus ([Distributed SQL](/components/dsql))
are the other answers to "writes on more than one node": a quorum waits for R of N on a read and W
of N on a write, while consensus waits for a majority on every write. See
[Topologies](/design/07-data-tier#topologies).

## Slow queries hide until you grow

Two code problems cost little at first and a lot later.

An **unindexed query** scans the table. Its cost grows with the number of rows, and the rows grow with
your users, so it is invisible in the Garage and becomes the bottleneck later. The
[Slow query](/incidents/slow-query) incident is this problem. [Query analysis](/research/query-analysis)
shows it, and the Add index task fixes it.

An **N+1 query** comes from an ORM that sends one query per item in a list. Laravel, Rails, and Django
make extra reads on page views and API reads until you ship Eager loading. See
[N+1 query](/glossary/n1-query).

## The Cache: memory in front of the Database

A [Cache](/components/cache) answers read queries from memory and sends misses on to the Database. Its
hit ratio decides how much load it takes off:

```latex
\text{hit ratio} = \sqrt{\frac{\text{memory}}{\text{hot data}}} \times \text{TTL factor} \times \text{write penalty} \times \text{warmth}
```

The square root models skewed access. Most reads ask for a few hot keys, so a small Cache already
holds the hottest ones, and the first gigabyte is worth more than the tenth. Hot data grows with your
users, so a Cache that was big enough last Era may be too small in the next.

Writes invalidate keys, so a write-heavy mix lowers the hit ratio. A longer TTL keeps more hits but
serves more stale data. A Cache that restarts comes back cold, and every miss goes to the Database at
once, which is a [cache stampede](/glossary/cache-stampede).
[Stampede protection](/research/stampede-protection) and [Cache warming](/research/cache-warming)
soften it.

:::Note{tone="real"}
Redis answers commands on one main thread, so one core caps a Redis node and one slow command blocks
every client. Memcached uses every core but keeps nothing on restart. Quorum models both as Cache
engines with different limits.
:::

## Read Replicas: more reads, older data

A [Read Replica](/components/replica) runs like a Database but answers only reads. Writes go to the
primary and then stream to the replica, so the replica is always a little behind, and the lag grows
with your write rate. See [replication lag](/glossary/replication-lag).

A read from a lagging replica can return old data. Whether that matters depends on the kind:

- A page view accepts slightly old data.
- An API read that comes back stale fails as `stale`.
- A checkout that reads its own write fails as `stale`, which costs real money.

[Read-your-writes routing](/research/ryw-routing) sends the reads that care to the primary. That
fixes most stale errors, at the price of some read load on the primary.

::Sandbox{id="stale-checkout"}

## Quorums: the game's namesake

A [Wide-column Store](/components/wide) keeps each key on N replicas. You choose two numbers: R, the
replicas a read asks, and W, the replicas a write waits for.

```latex
\begin{aligned}
R + W &> N && \qquad \text{every read asks at least one replica that has the latest write} \\
R + W &\leq N && \qquad \text{a read can miss the latest write: eventual consistency}
\end{aligned}
```

Smaller R and W are faster, because each operation waits for an earlier reply, and they cost fewer
replica operations. The price is that a weak quorum serves stale reads. A quorum that needs every
replica fails while one replica is down. See [quorum](/glossary/quorum).

::Quiz{question="A Wide-column Store keeps N = 3 replicas. Which setting makes every read see the latest write?" options="R = 1, W = 1|R = 1, W = 2|R = 2, W = 2" answer="3" explain="Only R = 2 and W = 2 gives R + W > N. The other settings let a read ask only replicas that missed the latest write."}

Overlap does not give a single, ordered history. Concurrent writes can still conflict, so even a
strong quorum gets an occasional stale read or duplicate on checkouts. A
[Distributed SQL](/components/dsql) Node fixes that with consensus: every write waits for a majority of
its replicas. Inside one region, that is cheap, but across regions every write pays a long round trip.
See [Raft](/glossary/raft).

## Hot keys

Spreading data across nodes only helps if the load spreads too. In the [Hot key](/incidents/hot-key)
incident, a large share of reads asks for one key, such as a celebrity's post. That key lives on one
shard, so that shard saturates while the others idle. [Hybrid fan-out](/research/hybrid-fanout) lets you split
hot keys across shards. See [hot key](/glossary/hot-key).

## The pattern behind all of it

Every data choice in Quorum trades among speed, freshness, and survival. A Cache and a replica buy
speed with freshness, and a strong quorum and consensus buy freshness with speed. Copies in other
zones and regions buy survival with Burn. The Data track shows the research behind each tool:

::Track{track="data"}

For practical steps, see [Scale the database](/guides/scale-the-database) and
[Fix slow queries](/guides/fix-slow-queries).
