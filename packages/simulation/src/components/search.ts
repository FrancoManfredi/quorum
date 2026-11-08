import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Search queries per second one Search Engine answers at size 1 (05 "Stats"). */
export const SEARCH_QPS = 400

/**
 * A Search Engine's refresh interval (07 "Search Engine"): how long a new document waits to
 * become searchable. A longer interval saves indexing CPU, so the Node answers more queries, and
 * a bigger share of its answers are staler than the index. 1 s is the design's default and fresh
 * enough to serve nothing stale; 5 s and 60 s, their capacity and their stale shares are proposed.
 */
export const SEARCH_REFRESH = [
  { seconds: 1, capacity: 1, stale: 0 },
  { seconds: 5, capacity: 1.1, stale: 0.05 },
  { seconds: 60, capacity: 1.3, stale: 0.25 },
] as const

export const SEARCH_SHARDS = [1, 2, 4] as const
export const SEARCH_REPLICAS = [0, 1, 2] as const
/** Each shard past the first fans every query out: it adds this share of one shard's work. */
export const SEARCH_FANOUT = 0.2
/**
 * The JVM heap holds caches. Too small and garbage collection pauses; too large and the file
 * system cache is small, so the Node answers fewer queries and its pauses are long.
 */
export const SEARCH_HEAPS = {
  small: { name: '25% of RAM', capacity: 1, tailP: 0.05, tailMs: 150 },
  half: { name: '50% of RAM', capacity: 1, tailP: 0, tailMs: 0 },
  large: { name: '75% of RAM', capacity: 0.85, tailP: 0.02, tailMs: 400 },
} as const
/**
 * The three products. Elasticsearch and OpenSearch share a profile and run on a JVM, so they take
 * the options above. Meilisearch answers half again as many queries in a shorter hop, runs one
 * node with no shards, replicas or heap, and a smaller Burn, and its relevance falls with the
 * index: each user adds `relevance` of staleness, at most `cap`.
 */
export const SEARCH_VARIANTS = {
  elasticsearch: {
    name: 'Elasticsearch',
    jvm: true,
    capacity: 1,
    fixedMs: 15,
    burn: 1,
    relevance: 0,
    cap: 0,
  },
  opensearch: {
    name: 'OpenSearch',
    jvm: true,
    capacity: 1,
    fixedMs: 15,
    burn: 1,
    relevance: 0,
    cap: 0,
  },
  meilisearch: {
    name: 'Meilisearch',
    jvm: false,
    capacity: 1.5,
    fixedMs: 8,
    burn: 0.6,
    relevance: 0.0000005,
    cap: 0.25,
  },
} as const
/** Share of a Search Engine's RAM and index the volume under it holds, per GB of rows. */
export const SEARCH_INDEX_SHARE = 0.3

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const searchGlossary: ReadonlyArray<string> = ['inverted-index']

/** A Search Engine's refresh interval, in seconds (07 "Search Engine"). */
export const SearchRefresh = Schema.Finite
export type SearchRefresh = typeof SearchRefresh.Type

/** A Search Engine's product (07 "Search Engine"). */
export const SearchVariant = Schema.Literals(['elasticsearch', 'opensearch', 'meilisearch'])
export type SearchVariant = typeof SearchVariant.Type

/** The share of a Search Engine's RAM the JVM heap takes (07 "Search Engine"). */
export const SearchHeap = Schema.Literals(['small', 'half', 'large'])
export type SearchHeap = typeof SearchHeap.Type

/** The saved properties of a search Node, with the defaults an old save decodes to. */
export const searchFields = {
  /** A Search Engine's product, and its replicas and heap (07 "Search Engine"). */
  searchVariant: SearchVariant.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('elasticsearch' as const)),
  ),
  searchShards: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  searchReplicas: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  heap: SearchHeap.pipe(Schema.withDecodingDefaultKey(Effect.succeed('half' as const))),
  /** Seconds a Search Engine waits before a new document is searchable (07 "Search Engine"). */
  refresh: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
} as const

export const searchDef = def({
  id: 'search',
  code: 'fts',
  name: 'Search Engine',
  product: 'Elasticsearch',
  group: 'data',
  blurb: 'Answers search queries. 400 per second per size step.',
  cost: 300,
  burn: 0.25,
  latency: 15,
  accepts: ['q-search'],
  maxOut: 0,
  unlock: 'full-text-search',
  steps: 8,
  limiting: true,
})
