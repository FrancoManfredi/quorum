import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Cache engines. Redis runs one main thread; Memcached uses every core. Redis reloads its data after a restart. */
export const CACHE_ENGINES = {
  redis: { name: 'Redis', scales: false, warmAfterRestart: 0.5 },
  memcached: { name: 'Memcached', scales: true, warmAfterRestart: 0 },
} as const
/** Cache TTLs in seconds, with the share of hot reads each keeps and the share of hits it serves stale per unit of write share. */
export const CACHE_TTLS = [
  { ttl: 10, factor: 0.6, stale: 0.005 },
  { ttl: 60, factor: 0.85, stale: 0.02 },
  { ttl: 3_600, factor: 0.97, stale: 0.1 },
] as const
/** KB of hot data per user: 5,000 users is about 1 GB (16 D11). */
export const HOT_KB_PER_USER = 200
/** Operations per second one cache thread answers. */
export const CACHE_OPS = 50_000

/** Seconds of writes a write-behind Cache holds before it flushes them to the Database. */
export const WRITE_BEHIND_SECONDS = 10

/**
 * Cache strategies (07 "Strategies"): what the Cache does on a write. `stale` multiplies the
 * TTL's stale share of hits, `write` says where a write goes (`bypass` the Cache, `through` it,
 * or `ahead` of it), and `flush` is the share a write-behind Cache passes on to the Database.
 * Cache-aside keeps the TTL's own stale share; read-through removes the race between a write and
 * a concurrent miss, so it serves three quarters of it; write-through and write-behind keep the
 * Cache's copy fresh. `loadMs` is what the library that owns loading adds to a miss. A write-behind
 * Cache holds the writes it has not flushed for `WRITE_BEHIND_SECONDS`, and a crash loses them.
 */
export const CACHE_STRATEGIES = {
  aside: { name: 'Cache-aside', stale: 1, write: 'bypass', writeMs: 0, flush: 1, loadMs: 0 },
  'read-through': {
    name: 'Read-through',
    stale: 0.75,
    write: 'bypass',
    writeMs: 0,
    flush: 1,
    loadMs: 1,
  },
  'write-through': {
    name: 'Write-through',
    stale: 0,
    write: 'through',
    writeMs: 0.5,
    flush: 1,
    loadMs: 0,
  },
  'write-behind': {
    name: 'Write-behind',
    stale: 0.5,
    write: 'ahead',
    writeMs: 0,
    flush: 0.5,
    loadMs: 0,
  },
} as const

/** With Stampede protection, a cold Cache sends at most this share of its misses on: the rest wait on one fetch. */
export const COALESCED = 0.25
/** How warm a Cache comes back from a restart with Cache warming. */
export const WARMED = 0.8

/** Share of the hits a short TTL loses that early expiration wins back, and the extra reads it costs. */
export const EARLY_LIFT = 0.5
export const EARLY_REFRESH = 0.02

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const cacheGlossary: ReadonlyArray<string> = [
  'cache-hit-rate',
  'cache-aside',
  'hot-key',
  'write-through-cache',
]

export const CacheEngine = Schema.Literals(['redis', 'memcached'])
export type CacheEngine = typeof CacheEngine.Type

/** What a Cache does on a write (07 "Strategies"). */
export const CacheStrategy = Schema.Literals([
  'aside',
  'read-through',
  'write-through',
  'write-behind',
])
export type CacheStrategy = typeof CacheStrategy.Type

/** The saved properties of a cache Node, with the defaults an old save decodes to. */
export const cacheFields = {
  /** A Cache refreshes a key a little before it expires, at random (07 "Stampedes"). */
  earlyExpiry: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Cache serves the old value while one request refreshes it (07 "Stampedes"). */
  swr: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  engine: CacheEngine.pipe(Schema.withDecodingDefaultKey(Effect.succeed('redis' as const))),
  /** What a Cache does on a write (07 "Strategies"). */
  cacheStrategy: CacheStrategy.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('aside' as const)),
  ),
  /** A Cache coalesces misses for the same key (Stampede protection). */
  coalesce: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Cache refills before it takes traffic after a restart (Cache warming). */
  warming: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Cache splits hot keys across its shards. */
  split: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const cacheDef = def({
  id: 'cache',
  code: 'kv',
  name: 'Cache',
  product: 'Redis',
  group: 'data',
  blurb:
    'Answers read queries from memory while the hot data fits. Writes pass through and invalidate.',
  cost: 150,
  burn: 0.06,
  latency: 0.5,
  accepts: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan'],
  unlock: 'caching',
  steps: 8,
  sends: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  limiting: true,
  coldStart: true,
})
