A Cache answers repeated reads from memory so the [Database](/components/database) does not have to, as Redis, an in-memory store, does.

## When to place it

- Place it when reads dominate and Database CPU is high. The [Read Mostly](/sandboxes/read-mostly) Sandbox shows the symptom.
- Place it before a [Read Replica](/components/replica) when the same hot rows are read again and again: it costs the least of the three. When the hot data outgrows its memory, or reads are spread over many rows, add a replica.
- Resize it when the hit ratio falls as users grow.
- Switch to Memcached when a single Redis thread is the limit.

## How it works

Put it in front of the Database or the [Connection Pooler](/components/pooler). It serves a share of read queries itself, its hit ratio, and passes the misses on. Writes go through and invalidate cached data, so a write-heavy mix pulls the hit ratio down.

The hit ratio rises with memory relative to your hot data, and your hot data grows with users. A longer TTL raises the ratio too, at the price of more stale reads. A new or restarted Cache starts cold and fills as reads arrive. See [cache hit rate](/glossary/cache-hit-rate) and [cache-aside](/glossary/cache-aside).

## Options

::Options{id="cache"}

### Strategy

[Cache strategies](/research/cache-strategies) adds the three strategies a Cache can run besides cache-aside:

- **Cache-aside** (the default): reads come from the Cache and writes go around it. A write can race a concurrent miss, so the Cache may keep an old row until its TTL runs out.
- **Read-through**: the Cache loads a miss itself, which closes most of that race. Most of the TTL's own staleness is still there.
- **Write-through**: every write goes to the Cache and the Database together. Nothing behind the Cache is stale, and each write waits for one more cache write.
- **Write-behind**: the write returns from the Cache and reaches the Database late, so writes are fast and the Database takes less write load. A miss reads a Database that lags, and a Cache crash loses what it has not flushed.

The Inspector shows which way a write travels. [Data tier](/design/07-data-tier#strategies-a-tradeoff-card) holds the table.

### Stampede options

[Stampede protection](/research/stampede-protection) adds three switches. All three answer the moment a popular key expires and every request misses at once.

- **Coalesce**: one request reloads the key while the others wait. The Database sees one miss instead of the whole wave.
- **Early expiry**: refreshes a key a little before it expires, so a short TTL keeps more of its hits and the Database takes a few extra reads.
- **Stale while revalidating**: answers from the old value while one request refreshes it, so an expired key never misses, and those answers count as stale.

See [Cache stampede protection](/patterns/cache-stampede-protection).

### Engine and TTL

- **Engine**: Redis runs on one main thread and reloads part of its data after a restart. Memcached uses every core and comes back empty.
- **TTL**: how long a value stays. A longer TTL keeps more of the hits and serves staler data.
- **Warming**: with [Cache warming](/research/cache-warming), Warm start fills the Cache before it takes traffic, so a restart does not begin cold. See [Cache warming and tiered caching](/patterns/cache-warming-and-tiered-caching).
- **Hot keys**: with [Hybrid fan-out](/research/hybrid-fanout), Split puts a hot key on its own shard, so one key stops setting the pace. See [Hot keys and hot shards](/patterns/hot-keys-and-hot-shards).

## How it fails

- A long TTL serves stale data, which fails reads that need fresh data.
- When the hot data does not fit its memory, every refill pushes an older key out: the card and the Dashboard's Cache row show the evictions a second, and the hit ratio falls with them. A bigger Cache fits the data and stops them.
- A Cache does not reduce connections: it passes its callers' connections through.

### [Cache stampede](/incidents/stampede)

- **Signs:** The Hit ratio on the card falls toward zero, and the Database behind it turns amber, then red. While the Database stays overloaded, refills time out and the Cache stays cold.
- **Do now:** Take load off the Database: turn on **Coalesce** on the Cache card, turn on **Shed low value** on the App Servers, or size the Database up. Coalesce needs [Stampede protection](/research/stampede-protection), and Shed low value needs [Priority load shedding](/research/load-shedding).
- **Prevent:** Research [Stampede protection](/research/stampede-protection) and [Cache warming](/research/cache-warming), then turn on **Coalesce** and **Warm start**.

### [Hot key](/incidents/hot-key)

- **Signs:** One Cache turns red while the others idle, because one key takes a large share of the reads.
- **Do now:** Set Hot keys on the Cache card to **Split**. It needs [Hybrid fan-out](/research/hybrid-fanout).
- **Prevent:** Research [Hybrid fan-out](/research/hybrid-fanout) and leave **Split** on.

### [Stale reads](/incidents/stale-read)

- **Signs:** `stale` errors appear on API reads and checkouts, and the Cache's answers are older than the writes behind them.
- **Do now:** Shorten the TTL on the Cache card.
- **Prevent:** Keep a short TTL on write-heavy data, switch the strategy to **Write-through** after [Cache strategies](/research/cache-strategies), or turn on read-your-writes routing ([Read-your-writes routing](/research/ryw-routing)).

### [Instance failure](/incidents/instance)

- **Signs:** The Cache card goes grey and its callout reads "The host under this VM died. It still bills." Requests sent to it are stranded.
- **Do now:** Select the Node and click **Replace**. It costs Cash and comes back cold. A Node with a **Standby** fails over by itself, or at once when you press **Fail over**.
- **Prevent:** Turn on **Standby** in the Zone section, which needs [Multiple zones](/research/multi-az), or run a second Cache.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once, the Cache with them.
- **Do now:** Press **Fail over** on the banner, or on the Node's card. It needs [Multiple zones](/research/multi-az) and promotes the Node's **Standby** at once; the Node then keeps no standby until you give it one. A Node with no standby stays down until the incident ends, at most 120 sim seconds, and one with a standby also fails over by itself after a share of that time.
- **Prevent:** Research [Multiple zones](/research/multi-az), turn on **Standby** in the Zone section, and keep a copy in a second zone.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the Cache in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

::Sandbox{id="stampede"}

## Tips

- Turn on coalescing as soon as you own Stampede protection.
- Use Memcached when one Redis thread is the limit.
