A Cache answers repeated reads from memory so the [Database](/components/database) does not have to, as Redis, an in-memory store, does.

## When to place it

- Place it when reads dominate and Database CPU is high. The [Read Mostly](/sandboxes/read-mostly) Sandbox shows the symptom.
- Resize it when the hit ratio falls as users grow.
- Switch to Memcached when a single Redis thread is the limit.

## How it works

Put it in front of the Database or the [Connection Pooler](/components/pooler). It serves a share of read queries itself, its hit ratio, and passes the misses on. Writes go through and invalidate cached data, so a write-heavy mix pulls the hit ratio down.

The hit ratio rises with memory relative to your hot data, and your hot data grows with users. A longer TTL raises the ratio too, at the price of more stale reads. A new or restarted Cache starts cold and fills as reads arrive. See [cache hit rate](/glossary/cache-hit-rate) and [cache-aside](/glossary/cache-aside).

## Options

Two engines are on offer. Redis runs on one main thread and reloads part of its data after a restart. Memcached uses every core but comes back empty.

### Strategy

[Cache strategies](/research/cache-strategies) adds the three strategies a Cache can run besides cache-aside:

- **Cache-aside** (the default): reads come from the Cache and writes go around it. A write can race a concurrent miss, so the Cache may keep an old row until its TTL runs out.
- **Read-through**: the Cache loads a miss itself, which closes most of that race. Most of the TTL's own staleness is still there.
- **Write-through**: every write goes to the Cache and the Database together. Nothing behind the Cache is stale, and each write waits for one more cache write.
- **Write-behind**: the write returns from the Cache and reaches the Database late, so writes are fast and the Database takes less write load. A miss reads a Database that lags, and a Cache crash loses what it has not flushed.

The Inspector shows which way a write travels. [Data tier](/design/07-data-tier#strategies-a-tradeoff-card) holds the table.

### Stampede options

With [Stampede protection](/research/stampede-protection) the card has three switches. Coalescing makes one request reload a key while the others wait. Early expiration refreshes a key a little before it expires, so a short TTL keeps more of its hits and the Database takes a few extra reads. Stale-while-revalidate answers from the old value while one request refreshes it, so an expired key never misses, and those answers count as stale. [Data tier](/design/07-data-tier#stampedes) holds the numbers.

## How it fails

- [Cache stampede](/incidents/stampede): the Cache restarts empty, and every miss hits the Database at once. While the Database is overloaded, refills time out and the Cache stays cold. [Stampede protection](/research/stampede-protection) and [Cache warming](/research/cache-warming) prevent it.
- [Hot key](/incidents/hot-key): one key takes a large share of reads and saturates one shard. [Hybrid fan-out](/research/hybrid-fanout) lets you split hot keys.
- A long TTL serves stale data, which fails reads that need fresh data.
- When the hot data does not fit its memory, every refill pushes an older key out: the card and the Dashboard's Cache row show the evictions a second, and the hit ratio falls with them. A bigger Cache fits the data and stops them.
- A Cache does not reduce connections: it passes its callers' connections through.

::Sandbox{id="stampede"}

## Tips

- Turn on coalescing as soon as you own Stampede protection.
- Use Memcached when one Redis thread is the limit.
