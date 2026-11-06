/* The Components a player can place, and how Analytics samples. */

import { COMPONENT_DEFS } from '../components/defs.ts'
import { MAX_CONNECTIONS } from './instances.ts'
import type { Kind, RequestKind } from './kinds.ts'
import type { ResearchId } from './research.ts'
import type { LanguageId } from './runtimes.ts'

export const COMPONENT_IDS = [
  'users',
  'payments',
  'analytics',
  'server',
  'database',
  'dns',
  'lb',
  'pooler',
  'cache',
  'replica',
  'auth',
  'search',
  'storage',
  'doc',
  'queue',
  'worker',
  'log',
  'fn',
  'cdn',
  'waf',
  'gw',
  'ws',
  'psp',
  'autoscaler',
  'ci',
  'cluster',
  'warehouse',
  'vec',
  'gpu',
  'edge',
  'llm',
  'msgp',
  'wide',
  'dsql',
  'cdc',
  'mesh',
  'ff',
  'pki',
] as const
export type ComponentId = (typeof COMPONENT_IDS)[number]

export type BuildGroup = 'edge' | 'compute' | 'data' | 'ops'

export const BUILD_GROUPS: ReadonlyArray<Readonly<{ key: BuildGroup; label: string }>> = [
  { key: 'edge', label: 'Edge' },
  { key: 'compute', label: 'Compute' },
  { key: 'data', label: 'Data' },
  { key: 'ops', label: 'Ops' },
]

/** The dock's seven groups: each wears the colour and badge shape of its `family`. */
export type DockGroup =
  | 'edge'
  | 'compute'
  | 'data'
  | 'messaging'
  | 'platform'
  | 'insight'
  | 'managed'

export const DOCK_GROUPS: ReadonlyArray<
  Readonly<{ key: DockGroup; label: string; family: BuildGroup }>
> = [
  { key: 'edge', label: 'Edge', family: 'edge' },
  { key: 'compute', label: 'Compute', family: 'compute' },
  { key: 'data', label: 'Data', family: 'data' },
  { key: 'messaging', label: 'Messaging', family: 'compute' },
  { key: 'platform', label: 'Platform', family: 'ops' },
  { key: 'insight', label: 'Observability', family: 'ops' },
  { key: 'managed', label: 'Managed', family: 'data' },
]

/** The dock group each Component is listed under. */
export const DOCK_OF: Readonly<Record<ComponentId, DockGroup>> = {
  users: 'edge',
  dns: 'edge',
  lb: 'edge',
  cdn: 'edge',
  waf: 'edge',
  gw: 'edge',
  server: 'compute',
  worker: 'compute',
  fn: 'compute',
  cluster: 'compute',
  gpu: 'compute',
  edge: 'compute',
  database: 'data',
  pooler: 'data',
  cache: 'data',
  replica: 'data',
  search: 'data',
  storage: 'data',
  doc: 'data',
  warehouse: 'data',
  vec: 'data',
  wide: 'data',
  dsql: 'data',
  queue: 'messaging',
  log: 'messaging',
  cdc: 'messaging',
  ws: 'messaging',
  autoscaler: 'platform',
  ci: 'platform',
  mesh: 'platform',
  ff: 'platform',
  pki: 'platform',
  analytics: 'insight',
  payments: 'insight',
  auth: 'managed',
  psp: 'managed',
  llm: 'managed',
  msgp: 'managed',
}

export type ComponentDef = Readonly<{
  id: ComponentId
  /** Short mark for chips on the board and in the dock. */
  code: string
  name: string
  /** Real-world product the Component stands for. */
  product: string
  group: BuildGroup
  blurb: string
  /** Cash to place the first copy. Each further copy costs 25% more. */
  cost: number
  /** Dollars per second for Components without an instance type. */
  burn: number
  /** Has an instance type (size and family). */
  sized: boolean
  /**
   * Largest size for Components without an instance type, from size 1. Each
   * step doubles capacity and Burn. 1 means it has one size.
   */
  steps: number
  /** Milliseconds of fixed overhead per request that passes through. */
  latency: number
  /** Kinds this Node takes on an inbound link. */
  accepts: ReadonlyArray<Kind>
  /** Kinds this Node sends on its routing links. */
  sends: ReadonlyArray<Kind>
  /**
   * Kinds it takes only when no linked Node takes them as its own job: Postgres
   * searches and stores files until a Search Engine or Object Storage is linked.
   */
  fallback: ReadonlyArray<Kind>
  /** Runs the Service's Stack, and holds a slot while it waits on each call. */
  stack: boolean
  /** Its capacity can limit the Design: the Bottleneck search weighs it and Instance failure can hit it. */
  limiting: boolean
  /** A new copy starts cold and warms up. */
  coldStart: boolean
  /** Most routing links out. Users resolve to one host until DNS. */
  maxOut: number
  /** Receives a copy of its parent's traffic instead of a share of it. */
  tap: boolean
  /** Takes a copy of the changes a Node writes, instead of a share of its traffic. */
  mirror: boolean
  /** Takes no traffic: App Servers and Workers link into it to come under its control. */
  control: boolean
  /** Research that unlocks it, or null for the starter kit. */
  unlock: ResearchId | null
  /** The player cannot place or sell it. */
  fixed: boolean
}>

/* ---------- functions (05 "Serverless Function", "Edge Function") ---------- */

/**
 * A Serverless Function's bill (09 "The cloud bill"): dollars per request, and dollars per
 * GB-second, × cost index, on the Requests line. AWS Lambda lists $0.20 per million requests and
 * $0.0000166667 per GB-second. At those straight rates a per-use bill is about 3,600× cheaper than
 * the time-billed compute beside it (09 "How prices map to real prices"), so a function would never
 * cost as much as the VM it replaces and 05's cost curve could not cross. Both are multiplied by
 * 1,200, which puts the crossover at about 30% of an equal VM's steady load.
 */
export const SERVERLESS_REQUEST_PRICE = 0.00024
export const SERVERLESS_GB_SECOND = 0.02
/** GB one execution bills for each second it runs: Lambda's common 1,024 MB (05).  */
export const SERVERLESS_MEMORY_GB = 1
/** Executions one Serverless Function runs at once, per region (05 "Concurrency cap"). */
export const SERVERLESS_CONCURRENCY = 1_000
/**
 * Sim seconds an execution environment stays warm after its last invocation (05 "Cold starts").
 * AWS reaps an idle environment after 5 to 15 minutes; one sim second is one calendar minute, so
 * 5 s.
 */
export const SERVERLESS_IDLE_SECONDS = 5
/**
 * Milliseconds a cold start costs by language (05 "Cold starts"): Rust and Go 50, Node and Python
 * 200, .NET 500, JVM 2,000. PHP, Ruby, Elixir, Zig and Haskell follow in the same order.
 */
export const COLD_START_MS: Record<LanguageId, number> = {
  go: 50,
  rust: 50,
  zig: 50,
  haskell: 100,
  node: 200,
  python: 200,
  php: 200,
  ruby: 300,
  csharp: 500,
  elixir: 500,
  java: 2_000,
}
/** Milliseconds a cold start costs an ahead-of-time binary: the design's GraalVM native image. */
export const NATIVE_COLD_MS = 100

/**
 * An Edge Function's bill (05 "Edge Function": Burn "Per request"): dollars per request × cost
 * index, on the Requests line. Cloudflare Workers list $0.30 per million requests, multiplied by
 * 1,200 like Lambda's, so a request served at the edge costs about what one served by a function
 * does, without the GB-seconds.
 */
export const EDGE_REQUEST_PRICE = 0.00036
/**
 * CPU milliseconds one request may spend at the edge before it fails as `timeout` (05 "Edge
 * Function": "CPU-heavy kinds fail as `timeout`"). Cloudflare's free plan gives 10 ms a request.
 */
export const EDGE_CPU_MS = 10
/** MB one edge isolate holds: the small memory ceiling a handler runs in (Cloudflare Workers). */
export const EDGE_MEMORY_MB = 128
/**
 * Languages that run at the edge (05 "Edge Function"): JavaScript and TypeScript, and Rust and Go
 * compiled to WebAssembly. A Stack in any other language is refused there.
 */
export const EDGE_LANGUAGES: ReadonlyArray<LanguageId> = ['node', 'rust', 'go']
/** Share of `read` a CDN answers from the edge key-value cache an Edge Function holds (05 "CDN"). */
export const EDGE_READ_HIT = 0.3

/* ---------- the Document Store, Vector Index and Event Stream (05, 07) ---------- */

/**
 * Ops a Document Store answers a second at size 1 (05 "Stats": 3,000). It has no buffer cache,
 * no IOPS volume and no connection limit: one flat rate covers reads and writes, which is the
 * shape that differs from a relational table (07 "Document Store").
 */
export const DOC_OPS = 3_000
/**
 * Ops one join costs it: a checkout spread over several documents, or a report scanning the whole
 * collection (07 "Document Store": "`report` and `q-tx` across documents cost 3×").
 */
export const DOC_JOIN_COST = 3
/** Milliseconds one op takes the store's own server.  */
export const DOC_OP_MS = 1
/** Multi-document transactions add this share to a write's latency (07 "Document Store": +50%). */
export const DOC_TXN_LATENCY = 0.5
/**
 * Share of checkouts that land half-applied without multi-document transactions, so a retry
 * charges again: the atomicity the option buys back (07 "Document Store").
 */
export const DOC_PARTIAL = 0.02
/**
 * Dev Hours every Feature pays on a Design with a Document Store (07 "Document Store"): no joins
 * means each new access pattern is its own collection and index to write and read, so it costs
 * this multiple of a Feature's hours.
 */
export const DOC_PATTERN_FACTOR = 1.1
/** A Feature that changes the data shape costs this share of its Dev Hours there (07: −25%). */
export const DOC_SHAPE_DH = 0.75

/** Nearest-neighbour queries one Vector Index answers a second at size 1 (05 "Stats": 500). */
export const VEC_QUERIES = 500
/**
 * Index types (07 "Vector Index"). Exact compares the query to every vector: perfect recall, and
 * slow once the index outgrows a scan. HNSW walks a graph instead: twice the queries, twice the
 * memory in Burn, and 95% recall. The 95% is the design's; the capacity and the Burn multiple
 * are 2 and 2.
 */
export const VEC_INDEXES = {
  exact: { name: 'Exact', recall: 1, queries: 1, burn: 1 },
  hnsw: { name: 'HNSW', recall: 0.95, queries: 2, burn: 2 },
} as const
/**
 * `ai` value with the company's own documents behind the answer (07 "Vector Index": "answers use
 * the company's own data").  An
 * approximate index takes its recall's share of the lift.
 */
export const VEC_AI_LIFT = 1.35

/** Messages a second one broker appends at size 1 (05 "Stats": 100,000 per broker). */
export const LOG_RATE = 100_000
/**
 * Messages a second one partition hands its consumer. A consumer group can use at most one
 * consumer per partition (07 "Event Stream"), so a stream reads no faster than its partitions.
 *
 */
export const LOG_READ_RATE = 20_000
/** Partitions a stream offers, as button values: parallelism, and the width of the order it keeps. */
export const LOG_PARTITIONS = [1, 3, 6, 12] as const
/**
 * Acknowledgements (07 "Event Stream"): what a producer waits for before it moves on. `0` does not
 * wait, `1` waits for the partition leader, `all` for every replica. Each is a multiple of the
 * 5 ms append. The multiples are
 */
export const LOG_ACKS = {
  '0': { name: 'No ack', latency: 0.4 },
  '1': { name: 'Leader', latency: 1 },
  all: { name: 'All replicas', latency: 1.5 },
} as const
/** Retention windows a stream offers, in sim seconds: 10 calendar hours, 2.5 days, and a week. */
export const LOG_RETENTION = [600, 3_600, 10_080] as const
/**
 * Burn each replica past the first adds to a broker, as a share of its own rate: every partition
 * is copied, and the copies are disk (07 "Event Stream": "costs more disk").
 */
export const LOG_REPLICA_BURN = 0.5
/** Replicas a stream keeps of each partition: 1, 2, or 3 (07 "Event Stream"). */
export const LOG_REPLICAS = [1, 2, 3] as const
/**
 * The share of the events a broker holds that a failure takes with it (07 "Event Stream":
 * `acks` trades write latency for durability). With one replica the failed broker held the only
 * copy. With more, `acks=all` waited for every replica, so none is lost; `acks=1` acknowledged
 * after the leader alone, so what the followers had not yet copied is lost; `acks=0` did not wait
 * at all, so the producer's last events never arrived.
 */
export const LOG_LOSS = { '0': 0.1, '1': 0.05, all: 0 } as const

/* ---------- the CDC Connector, Service Mesh, Feature Flags and Certificates (05) ---------- */

/** Changes a second a CDC Connector publishes at its one size (05 "Stats": 20,000). */
export const CDC_RATE = 20_000
/**
 * What counts as a change: every write the Database takes, a checkout included, and the timeline
 * writes a fan-out makes (07 "Fan-out"). A read changes nothing.
 */
export const CDC_CHANGES = ['q-write', 'q-tx', 'k-write'] as const

/** Milliseconds the sidecar adds to each hop a member of the mesh makes (05: +1 ms per hop). */
export const MESH_HOP_MS = 1
/** Share of a member's CPU its sidecar takes (05: "CPU and memory per sidecar, about 5%"). */
export const MESH_OVERHEAD = 0.05
/** Insight per-link metrics earn on top of what Analytics already samples (05: +20%). */
export const MESH_INSIGHT = 0.2
/**
 * Dev Hours the mesh takes from the product teams, in engineers, the same as a Cluster's:
 * 05 says "Platform Dev Hours" and gives no figure.
 */
export const MESH_TAX = 0.5

/**
 * The shares a Feature behind a flag can sit at (05 "Feature Flags", 08 "Rollout"): dark, then 5%,
 * 25%, 50% and every user. Dark is the "turn it off in one click" the design promises.
 */
export const ROLLOUT_STEPS = [0, 0.05, 0.25, 0.5, 1] as const
/** A Feature with no flag against it is live for every user. */
export const ROLLOUT_ALL = 1

/**
 * Calendar days a TLS certificate lasts: 90 until Series C, then 45 (05 "Secrets and Certificates",
 * following the industry maximum as it shrinks).
 */
export const CERT_DAYS = 90
export const CERT_DAYS_SHORT = 45
/**
 * A Serverless Function stops an execution after 15 minutes (05 \"Serverless Function\"). An export
 * (`job`) reads the rows the Databases hold, so its run time grows with them: `EXPORT_MS_PER_GB`
 * milliseconds for each GB. A Function that has to export more than the limit allows fails it
 * as `timeout`; a Worker behind a Queue has no limit.
 */
export const FUNCTION_LIMIT_MS = 900_000
export const EXPORT_MS_PER_GB = 4_000

/** The Components that terminate TLS, so each one holds a certificate of its own (05). */
export const TLS_TERMINATORS: ReadonlyArray<ComponentId> = ['lb', 'cdn', 'waf', 'gw', 'ws', 'edge']
/** The Era from which a Node's certificate is tracked: the one the Certificate expired incident starts in. */
export const CERT_FROM_STAGE = 2
/** The Era from which certificates last the shorter life: Series C. */
export const CERT_SHORT_FROM = 5
/**
 * Share of a certificate's life at which it renews itself. Let's Encrypt renews with a third of
 * the 90 days left, which is two thirds of the way through.
 */
export const CERT_RENEW = 2 / 3

export const COMPONENTS: Record<ComponentId, ComponentDef> = COMPONENT_DEFS

/** How a Load Balancer splits traffic, and the research each policy needs. */
export const LB_POLICIES = {
  weighted: { label: 'Weighted', research: null },
  'round-robin': { label: 'Round robin', research: null },
  'least-conn': { label: 'Least conn', research: 'lb-algorithms' },
  p2c: { label: 'Two choices', research: 'lb-algorithms' },
  hash: { label: 'Consistent hash', research: 'lb-algorithms' },
} as const
/** Power of two choices keeps no global state: its LB handles this much more traffic... */
export const P2C_CAPACITY = 1.5
/** ...at the price of this share of traffic split evenly, whatever the load. */
export const P2C_IMBALANCE = 0.1
/** Seconds between a Load Balancer's health checks. All but 10 s need Health checks. */
export const CHECK_INTERVALS = [2, 10, 30] as const
/**
 * What the L4 variant changes (05 "Load Balancer"): ten times the throughput, 0.2 ms instead of
 * 1 ms, and cheaper. The exact price cut is
 */
export const L4_CAPACITY = 10
export const L4_MS = 0.2
export const L4_BURN = 0.6
/** DNS TTLs, in seconds. */
export const DNS_TTLS = [30, 300, 3_600] as const

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

/** A CDN's hit ratio per kind at the default TTL (05 "CDN"): 70% of pages, 75% of video. */
export const CDN_HIT: Partial<Record<Kind, number>> = { page: 0.7, media: 0.75 }
/** With Tiered caching, a CDN answers this share of video. */
export const TIERED_MEDIA_HIT = 0.92
/** CDN TTLs in seconds, and what each does to the hit ratio.  */
export const CDN_TTLS = [
  { ttl: 60, factor: 0.8 },
  { ttl: 300, factor: 1 },
  { ttl: 3_600, factor: 1.2 },
] as const
/**
 * Share a page view gains with Edge-side includes (10 "Track: Infrastructure"): the CDN caches the
 * shared shell of a logged-in page and fills in the personal parts at the edge, which a logged-in
 * page could not cache at all (05 "CDN": "70% of anonymous traffic").
 */
export const ESI_PAGE_HIT = 0.2
/** Milliseconds a request crosses the internet to reach the origin. A CDN edge sits closer. */
export const INTERNET_MS = 30

/** WAF paranoia levels (05 "WAF"): bots blocked, real users blocked, and CPU per request. */
export const PARANOIA = [
  { level: 1, block: 0.6, falsePositive: 0.001, cpu: 1 },
  { level: 2, block: 0.8, falsePositive: 0.005, cpu: 1.5 },
  { level: 3, block: 0.92, falsePositive: 0.02, cpu: 2.5 },
  { level: 4, block: 0.98, falsePositive: 0.06, cpu: 4 },
] as const
/** "Under attack" mode challenges every request: it blocks nearly all junk and some real users, and adds latency. A challenge costs paranoia 1's CPU. */
export const UNDER_ATTACK = { block: 0.99, falsePositive: 0.01, latency: 40, cpu: 1 } as const
/**
 * Share by which Bot management lowers a WAF's false positives (10 "Track: Infrastructure"): a
 * suspicious client is challenged instead of blocked, so a real user it flags still gets through.
 * The design gives the direction and no rate, so half is
 */
export const BOT_MANAGEMENT_FALSE = 0.5

/** Messages per second one RabbitMQ node takes (05 "Queue"). */
export const QUEUE_RATE = 20_000
/** Milliseconds a backlog of one message adds to the enqueue: a large backlog slows the broker.  */
export const BACKLOG_MS = 0.01
/** A Queue offers its Workers its backlog over this many seconds. */
export const DRAIN_SECONDS = 10
/** While a poison message is stuck, Workers spend this share of their time on it.  */
export const POISON_SHARE = 0.9
/** Max attempts a Queue with a dead-letter queue offers (05 "Worker"). Sidekiq retries 25 times. */
export const MAX_ATTEMPTS = [1, 3, 10, 25] as const
/** A Queue with no dead-letter queue retries forever; the math stops at Sidekiq's 25. */
export const FOREVER_ATTEMPTS = 25
/** Seconds a failed task waits before its next attempt, with backoff.  */
export const TASK_RETRY_SECONDS = 30
/** Max lengths a Queue offers; 0 means no limit (RabbitMQ `x-max-length`). */
export const QUEUE_LENGTHS = [0, 1_000, 10_000, 100_000] as const
/** Tasks each Worker process takes from the Queue ahead of time (05 "Worker": Prefetch). */
export const PREFETCH = [1, 10, 100] as const
/** Milliseconds a Worker waits on the broker for each fetch, ack included.  */
export const FETCH_MS = 20

/**
 * Realtime Hub (05 "Realtime Hub", 06 "Realtime connections"): KB of RAM its first box gives to
 * open connections. Each size step doubles it. A box holds as many connections as fit at its
 * runtime's cost per connection, 1 MB for a Java platform thread down to about 5 KB for a BEAM
 * process, so the runtime decides how many a dollar holds.
 */
export const HUB_RAM_KB = 8 * 1_048_576
/** Presence spends this share of a Hub's CPU on joins and leaves, so a box holds fewer connections.  */
export const PRESENCE_CPU = 0.15
/** Presence earns this multiple of a realtime message: social features pay for who is online.  */
export const PRESENCE_VALUE = 1.25
/** Share of the reconnect wave a Hub that just came back refuses without jittered backoff.  */
export const HERD_REFUSED = 0.5

/** Search queries per second one Search Engine answers at size 1 (05 "Stats"). */
export const SEARCH_QPS = 400
/** MB in one uploaded file (04 "Request kinds"). */
export const UPLOAD_MB = 2
/**
 * Object Storage price per GB stored per second. Like every time-billed price, a sim second bills
 * a real hour: S3 Standard is $0.023 per GB-month, about $0.000032 per GB-hour.
 */
export const STORAGE_PRICE = 0.000032

/**
 * Object Storage classes (07 "Object Storage"): the share of the standard storage price the class
 * bills, the fee per GB read back out of it, and whether a read waits hours. Infrequent access is
 * half the storage price and pays S3's $0.01 per GB retrieved. Archive is a tenth, and its objects
 * must be restored before they can be read, so a `media` request for one fails as `timeout`.
 */
export const STORAGE_CLASSES = {
  standard: { name: 'Standard', price: 1, retrieval: 0, archived: false },
  infrequent: { name: 'Infrequent access', price: 0.5, retrieval: 0.01, archived: false },
  archive: { name: 'Archive', price: 0.1, retrieval: 0, archived: true },
} as const

/**
 * Relational database engines (07 "Variants"). Postgres forks a process for every connection, so
 * its `max_connections` (100) is a limit it meets early; MySQL gives each connection a thread and
 * holds more of them on one box. MySQL's full-text search is the weaker of the two, so `q-search`
 * costs it twice the CPU.
 */
export const DB_ENGINES = {
  postgres: { name: 'PostgreSQL', connections: MAX_CONNECTIONS, searchCost: 1 },
  mysql: { name: 'MySQL', connections: 500, searchCost: 2 },
} as const

/**
 * IOPS a Database's volume answers (07 "Capacity"): a read that misses the buffer cache and every
 * write goes to disk, and waits on it. A general purpose volume answers 3,000; a provisioned one
 * up to 64,000. Provisioned storage bills this multiple of the box's Burn: the
 * design says "at higher cost" and gives no rate.
 */
export const STORAGE_IOPS = {
  general: { name: 'General purpose', iops: 3_000, burn: 1 },
  provisioned: { name: 'Provisioned IOPS', iops: 64_000, burn: 1.5 },
} as const

/** Shard counts a Database splits into (07 "Partitioning"): writes scale with them.  */
export const SHARD_COUNTS = [1, 2, 4, 8] as const

/**
 * Retention policies (07 "Data volume", "Relational database"): what a Database does with rows
 * older than its window. Keep everything bills every GB and answers a report from the table;
 * archive moves old rows to cheap storage and a report waits on the restore; delete drops them,
 * so a report rebuilds its figures from the event log at three times the scan. The 30-day window
 * and the three prices are
 */
export const DB_RETENTIONS = {
  keep: { name: 'Keep everything', days: 0, price: 1, scanMs: 0, rebuild: 1 },
  archive: { name: 'Archive after 30 d', days: 30, price: 0.1, scanMs: 200, rebuild: 1 },
  delete: { name: 'Delete after 30 d', days: 30, price: 0, scanMs: 0, rebuild: 3 },
} as const
/** KB one row costs the Database: the row, its indexes, and its share of the WAL.  */
export const ROW_KB = 10
/**
 * How much dearer a Database's GB are than Object Storage's, per GB per second: gp3 is $0.08 per
 * GB-month and S3 Standard $0.023, so about 3.5×.
 */
export const DB_STORAGE_MULT = 3.5

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

/**
 * A Search Engine's refresh interval (07 "Search Engine"): how long a new document waits to
 * become searchable. A longer interval saves indexing CPU, so the Node answers more queries, and
 * a bigger share of its answers are staler than the index. 1 s is the design's default and fresh
 * enough to serve nothing stale; 5 s and 60 s, their capacity and their stale shares are
 */
export const SEARCH_REFRESH = [
  { seconds: 1, capacity: 1, stale: 0 },
  { seconds: 5, capacity: 1.1, stale: 0.05 },
  { seconds: 60, capacity: 1.3, stale: 0.25 },
] as const

/**
 * Lifecycle rules (07 "Object Storage"): an object older than this many calendar days moves one
 * class cheaper, so Standard becomes Infrequent access and Infrequent access becomes Archive.
 * Days offered, and the age model below, are
 */
export const LIFECYCLE_DAYS = [0, 30, 90, 365] as const

/** Share of backups an untested restore fails (07 "Backups"): the design's own 20%. */
export const RESTORE_FAILURE = 0.2
/** Dev Hours a manual restore drill costs: a half day of an engineer.  */
export const RESTORE_DRILL_DH = 4
/** Milliseconds one disk operation takes on a volume, before it queues: 1,000 / its IOPS. */
export const diskMs = (volume: keyof typeof STORAGE_IOPS): number =>
  1_000 / STORAGE_IOPS[volume].iops

/** Egress price per GB (09 "Egress"). */
export const EGRESS_ORIGIN = 0.09
export const EGRESS_CDN = 0.02

/** With Stampede protection, a cold Cache sends at most this share of its misses on: the rest wait on one fetch. */
export const COALESCED = 0.25
/** How warm a Cache comes back from a restart with Cache warming. */
export const WARMED = 0.8

/**
 * Payment Provider fee per successful checkout (09 "Third-party fees"): Stripe's standard US card
 * price, a share of the value plus a fixed part. The checkout value is real dollars, so the cost
 * index does not scale the fixed part.
 */
export const PSP_RATE = 0.029
export const PSP_FIXED = 0.3
/** What the second Payment Provider charges, against the first's fees: a smaller vendor, dearer per checkout. */
export const SECOND_PROVIDER_FEE = 1.15
/** Checkouts per second the Payment Provider takes at its first usage tier; each tier doubles it. */
export const PSP_CAPACITY = 1_000

/**
 * API Gateway (05 "API Gateway"): dollars per request served, × cost index. Its Burn is on the
 * Cost panel's Requests line, beside the functions'.
 */
export const GATEWAY_PRICE = 0.002
/** Rate limits a Gateway offers, in requests per second; 0 is no limit at all. */
export const GATEWAY_LIMITS = [0, 100, 500, 1_000, 2_500, 5_000] as const
/**
 * Requests a Gateway's token bucket holds on top of its rate limit, once Rate limiting is
 * researched (10 "Track: Infrastructure"). A burst up to this many requests passes whole and the
 * long-run average holds; the design gives the mechanism and no size, so 200 is
 */
export const GATEWAY_BURST = 200
/**
 * The kinds that carry a user's token: every request but the anonymous ones (pages, video,
 * realtime, bots, bids, pushes) and the login that issues it. A service validates the token on
 * each of them for `AUTH_CHECK_MS` of CPU, unless an API Gateway validates it once at the edge,
 * which adds `GATEWAY_AUTH_MS` to its hop (05 "API Gateway": "Auth at the edge").
 */
export const AUTHENTICATED_KINDS: ReadonlyArray<RequestKind> = [
  'read',
  'write',
  'search',
  'upload',
  'buy',
  'job',
  'report',
  'ai',
  'feed',
  'hook',
]
export const AUTH_CHECK_MS = 0.02
export const GATEWAY_AUTH_MS = 2
/**
 * Request coalescing (05 "API Gateway"): a Gateway merges identical reads that are in flight at
 * once. `COALESCE_HOT` of a read kind's requests ask for a few popular objects, and `COALESCE_WINDOW`
 * seconds is how long a read stays in flight, so at a rate of λ the share of the hot ones that
 * find an identical read in flight is λw / (1 + λw): spikes merge more.
 */
export const COALESCE_KINDS: ReadonlyArray<RequestKind> = ['page', 'read', 'feed', 'search']
export const COALESCE_HOT = 0.3
export const COALESCE_WINDOW = 0.05
/** A Load Balancer's variants (05 "Load Balancer"). */
export const LB_VARIANTS = {
  l7: { name: 'L7', research: null },
  l4: { name: 'L4', research: 'l4-lb' },
} as const
export type LbVariant = keyof typeof LB_VARIANTS

/** Zones a Node can sit in (05 "Zones and regions"). */
export const ZONES = ['a', 'b', 'c'] as const
/** A call between zones costs this much more than one inside a zone, and egress both ways. */
export const CROSS_ZONE_MS = 1
export const EGRESS_CROSS_ZONE = 0.01
/** KB one backend call moves between Nodes, for cross-zone egress.  */
export const BACKEND_KB = 4
/** Data Nodes that can keep a standby in another zone; App Servers and Workers spread copies instead. */
export const STANDBY_TYPES: ReadonlyArray<ComponentId> = [
  'database',
  'pooler',
  'cache',
  'search',
  'queue',
]
/** A Node with a standby fails over to it in this many seconds when its zone goes. */
export const FAILOVER_SECONDS = 20

/** Autoscaler (05 "Autoscaler"): seconds before a new copy serves, on VMs and in a Kubernetes Cluster. */
export const VM_REACTION = 180
export const POD_REACTION = 30
/** Seconds between two scaling actions on one Node. */
export const SCALE_COOLDOWN = 30
/** Targets, and the most copies, the player can pick. Zero copies means no max. */
export const SCALE_TARGETS = [0.4, 0.6, 0.8] as const
export const SCALE_MAXIMA = [4, 8, 16, 0] as const
/** A Node scales in when its load falls below this share of the target. */
export const SCALE_IN = 0.6
/**
 * Calendar minutes before the daily peak that Scheduled scaling provisions for it (10 "Track:
 * Infrastructure": "scale ahead of the daily peak"). Two hours is long enough for a VM to
 * boot and warm inside the lead.
 */
export const SCHEDULE_LEAD_MINUTES = 120
/** Kubernetes bin packing: members cost this share of their Burn (05 "Kubernetes Cluster"). */
export const POD_BURN = 0.85
/**
 * Noisy neighbours: a share of a member's requests wait `NOISY_MS`. The share grows with how
 * busy the shared nodes run: half of `NOISY_SHARE` when idle, twice it at full CPU.
 */
export const NOISY_SHARE = 0.01
export const NOISY_MS = 10
/** A rolling deploy stops after its first batch of pods: they take this share of a bad deploy.  */
export const ROLLOUT_SHARE = 0.25

/**
 * How a CI/CD Pipeline ships (05 "CI/CD Pipeline"): each strategy trades deploy time and Burn for
 * the share of traffic a bad deploy breaks. A bad deploy fails `BAD_DEPLOY_ERRORS` of App Server
 * requests for each Feature in its batch, up to the strategy's `blast`.
 *
 * Recreate swaps every server at once, so nothing shields the batch. Rolling (the default) stops
 * after its first batch. Blue-green keeps the old fleet serving while the new one comes up and
 * verifies it, so only that first fleet's slice sees the bug. Canary sends 5% of traffic first.
 *
 * The design's ceilings are Recreate's 100% and Canary's 5%; Rolling keeps 16's 40%. Blue-green is
 * the build's change from 05's 100%: a deploy never interrupts traffic here and rollback is instant
 * for every Company, so the design's "instant rollback" pays nothing, and its "the old fleet keeps
 * serving until the new one is up" is read as the shield instead.
 *
 * Deploy minutes and the Burn multiplier are  Burn multiplies the Pipeline's
 * own, since a second fleet and the canary's metrics would bill beside it.
 */
export const DEPLOY_STRATEGY_IDS = ['recreate', 'rolling', 'blue-green', 'canary'] as const
export type DeployStrategyId = (typeof DEPLOY_STRATEGY_IDS)[number]

export type DeployStrategyDef = Readonly<{
  id: DeployStrategyId
  name: string
  /** Minutes a deploy takes through a Pipeline on this strategy. */
  deployMinutes: number
  /** Most of App Server requests a bad deploy fails, as a share. */
  blast: number
  /** What the strategy costs, as a multiple of the Pipeline's Burn. */
  burn: number
}>

export const DEPLOY_STRATEGIES: Record<DeployStrategyId, DeployStrategyDef> = {
  // Every server stops and starts on the new code: the whole batch is live at once.
  recreate: { id: 'recreate', name: 'Recreate', deployMinutes: 2, blast: 1, burn: 1 },
  // Today's deploy: a slice of the fleet at a time, up to the cap 16 gives a bad deploy.
  rolling: { id: 'rolling', name: 'Rolling', deployMinutes: 5, blast: 0.4, burn: 1 },
  // The old fleet serves until the new one is up and checked, so the bug shows on its slice.
  'blue-green': { id: 'blue-green', name: 'Blue-green', deployMinutes: 7, blast: 0.1, burn: 2 },
  // A canary sends the design's 5% of traffic first and waits before the rest.
  canary: { id: 'canary', name: 'Canary', deployMinutes: 10, blast: 0.05, burn: 1.5 },
}

/**
 * The research a deploy strategy needs (10 "Track: Reliability"): Recreate and Rolling come with
 * the Pipeline, Blue-green and Canary each need their own.
 */
export const STRATEGY_RESEARCH: Partial<Record<DeployStrategyId, ResearchId>> = {
  'blue-green': 'blue-green',
  canary: 'canary',
}

/** Seconds a Cluster takes to reschedule a pod whose host died (self-healing). */
export const POD_RESCHEDULE = 30
/** Share of pod requests that fail while a forced Cluster upgrade breaks them.  */
export const UPGRADE_CRASHES = 0.3
/** Calendar quarters a Kubernetes version stays supported before the provider forces an upgrade. */
export const SUPPORTED_QUARTERS = 1
/** Engineers of Dev Hours each Cluster takes from the product teams without a Platform team (08). */
export const PLATFORM_TAX = 0.5

/** Data Warehouse price per scan (09 "Pricing models": per scan, BigQuery style).  */
export const SCAN_PRICE = 0.02

/** Tokens in one AI prompt and its answer.  */
export const TOKENS_PER_PROMPT = 400
/**
 * GPU types (05 "GPU Node"): dollars per second per GPU, at the real rental price per GPU-hour,
 * and tokens per second serving one model. T4 is cheap and slow; H100 is the cheapest per token,
 * and scarce. Prices: AWS g4dn.xlarge $0.526/h, the A100 80GB on-demand median $1.79/h, and the
 * H100 market median $3.33/h (October 2026). The H100 rate is SemiAnalysis's 2,056 tokens/s for a
 * 70B model at 30 tokens/s per user; the others follow memory bandwidth.
 */
export const GPU_TYPES = {
  t4: { name: 'T4', burn: 0.53, tokens: 200, gb: 16 },
  a100: { name: 'A100', burn: 1.8, tokens: 900, gb: 80 },
  h100: { name: 'H100', burn: 3.3, tokens: 2_000, gb: 80 },
} as const
/**
 * The model a GPU Node serves (05 "GPU Node": "Small, medium, large. Larger models earn more per
 * prompt and need more GPU memory"): the weights' GB at FP16, how many times the medium model's
 * tokens a second it serves, and what a prompt it answers is worth next to the medium model's. The
 * weights are a 3B, a 7B and a 34B model at two bytes a weight.
 */
export const GPU_MODELS = {
  small: { name: 'Small (3B)', gb: 6, speed: 2, value: 0.6 },
  medium: { name: 'Medium (7B)', gb: 14, speed: 1, value: 1 },
  large: { name: 'Large (34B)', gb: 68, speed: 0.25, value: 1.8 },
} as const
export type GpuModel = keyof typeof GPU_MODELS
/** GB of GPU memory each prompt in a batch holds for its attention cache. */
export const GPU_CACHE_GB = 0.25
/** Milliseconds to the first token on a GPU Node, and on the LLM API (05 "LLM API": 600 ms). */
export const GPU_FIRST_TOKEN_MS = 300
/**
 * A GPU Node's weight precision (05 "GPU Node"): INT8 and INT4 serve faster and use less memory,
 * and a lower-precision answer is worth less. The value penalties are the design's 5% and 15%; the
 * speed multipliers are 2× and 3×. Their weights take half and a quarter of the memory.
 */
export const GPU_PRECISIONS = {
  fp16: { name: 'FP16', speed: 1, value: 1, memory: 1 },
  int8: { name: 'INT8', speed: 2, value: 0.95, memory: 0.5 },
  int4: { name: 'INT4', speed: 3, value: 0.85, memory: 0.25 },
} as const
export type GpuPrecision = keyof typeof GPU_PRECISIONS

/**
 * A GPU Node's batch size (05 "GPU Node"): a larger batch raises throughput and raises the time to
 * the first token. Continuous batching serves new prompts as they arrive, so it keeps the
 * throughput and drops the added latency.
 */
export const GPU_BATCHES = [
  { batch: 1, gain: 1, ttft: 0 },
  { batch: 8, gain: 1.6, ttft: 150 },
  { batch: 32, gain: 2.2, ttft: 500 },
] as const
export const LLM_FIRST_TOKEN_MS = 600
/**
 * LLM API price per 1,000 tokens, × cost index. It is billed on the GPU's scale, a real hour per
 * sim second, because the two serve the same prompts: $0.69 per million tokens, inside the real
 * $0.23 to $0.88 for an open 70B model, is $2.50 per 1,000. An H100 is cheaper only while it is
 * about two-thirds busy.
 */
export const LLM_PRICE = 2.5
/** Prompts per second the LLM API takes at its first usage tier; each tier doubles it.  */
export const LLM_RATE = 100

/** A circuit breaker opens when this share of a Link's calls fail, and stays open this many seconds. */
export const BREAKER_THRESHOLD = 0.5
export const BREAKER_OPEN = 5

/**
 * Milliseconds a bulkheaded Link lets one call run before it fails it and frees the caller's slot
 * (10 "Track: Reliability", "Bulkheads"). The bulkhead is a cap on how long one dependency may hold
 * a caller's capacity; at the design's load, one second stands for a fixed number of slots (Little's
 * law).
 */
export const BULKHEAD_MS = 1_000
/** Extra calls a hedged Link sends for each call: the second copy that races the first. */
export const HEDGE_LOAD = 0.1
/**
 * Reference CPU ms one backend call costs its caller to serialise, before Binary RPC halves it
 * (10 "Track: Performance": "Inter-service serialization CPU −50%").
 */
export const SERIALIZE_MS = 0.02
/**
 * Share of search answers that are stale because a dual write lost its publish, until a
 * Transactional outbox or a CDC Connector carries the change (07 "Keeping copies in sync").
 *
 */
export const DUAL_WRITE_STALE = 0.005
/** Share of a report's scan CPU a materialized view saves (10 "Track: Performance": 50%). */
export const MATERIALIZED_SCAN = 0.5
/** Share of report answers a materialized view serves before its next refresh. */
export const MATERIALIZED_STALE = 0.05
/** Denormalization's CPU multipliers (10 "Track: Performance": read −30%, write +20%). */
export const DENORMALIZED_READ = 0.7
export const DENORMALIZED_WRITE = 1.2
/**
 * A chaos experiment (10 "Track: Reliability"): every CHAOS_EVERY sim seconds the weakest Node fails
 * CHAOS_FAILURE of its calls for CHAOS_SECONDS, and the experiment earns CHAOS_INSIGHT Failure
 * Insight a second. The design gives the mechanism and no numbers: all
 */
export const CHAOS_EVERY = 120
export const CHAOS_SECONDS = 10
export const CHAOS_FAILURE = 0.2
export const CHAOS_INSIGHT = 1
/**
 * Failure Insight a second while a Load test's readout runs (12 "Other Insight sources"), and
 * while a DR drill's outage runs: both push the Design past its limits on purpose.
 */
export const LOAD_TEST_INSIGHT = 2
export const DRILL_INSIGHT = 5

/** Auth Provider price, in dollars per second per user. */
export const AUTH_PRICE_PER_USER = 0.00006

export const SAMPLE_RATES = [0.01, 0.05, 0.1, 0.5, 1] as const
/** CPU overhead on tapped Nodes, per sample rate. */
export const SAMPLE_OVERHEAD = [0.002, 0.01, 0.02, 0.08, 0.15] as const
/** Milliseconds sampling adds to each tapped hop, per sample rate. */
export const SAMPLE_LATENCY = [0, 0.5, 1, 3, 5] as const
/** Storage Burn multiplier, per sample rate. */
export const SAMPLE_STORAGE = [0.1, 0.5, 1, 5, 10] as const
/** Insight the first successful request of a new kind teaches, once, to that kind's pool (16 D14). */
export const FIRST_KIND_INSIGHT = 20
/** Insight per second from one Component type and kind: this × √(sampled requests per second). */
export const INSIGHT_YIELD = 1
/** Seconds of traces Analytics keeps, and the Storage Burn multiplier of each window. */
export const RETENTION_WINDOWS = [900, 3_600, 21_600] as const
export const RETENTION_STORAGE = [1, 2, 4] as const
/** Failed and frustrated samples teach this many times more: a healthy Design fails rarely. */
export const FAILURE_YIELD = 3
/** A pool's cap never falls below this, so a new pool can hold its first grant. */
export const POOL_FLOOR = 100
/** Samples per second Analytics keeps at size 1. Each size step doubles it. */
export const ANALYTICS_CAPACITY = 4

/** Push Provider: messages per second, and the price of one × cost index (05 "Push and Email Provider"): Amazon SES's $0.10 per 1,000. */
export const MSGP_RATE = 10_000
export const MSGP_PRICE = 0.0001

/**
 * Wide-column Store (07 "Wide-column Store"): replica operations per second at size 1 (three
 * nodes at 10,000 each). A write costs N of them, a read R. The replication settings it offers.
 */
export const WIDE_OPS = 30_000
export const QUORUM_N = [1, 2, 3, 4, 5] as const
/** Share of a weak-quorum store's reads that miss the latest write, per unit of write share.  */
export const WIDE_STALE = 0.5
/** Overlap is not linearizability: checkouts on a quorum store still see these (07).  */
export const WIDE_TX_STALE = 0.02
export const WIDE_TX_DUPLICATE = 0.01

/** Distributed SQL: transactions per second at size 1 (three nodes at 2,000), and what a read costs of one. */
export const DSQL_TX = 6_000
export const DSQL_READ_COST = 0.25
/** A spread store replicates to at most this many regions. */
export const SPREAD_REGIONS = 3

/** Backups (07 "Backups"): RPO in calendar minutes, and Burn on top of the Database's. Costs  */
export const BACKUPS = {
  none: { name: 'None', rpo: Number.POSITIVE_INFINITY, burn: 0 },
  nightly: { name: 'Nightly', rpo: 1_440, burn: 0.05 },
  pitr: { name: 'PITR', rpo: 2, burn: 0.15 },
} as const

/** During a hot key, this share of reads asks for one key, which lives on one shard (07 "Fan-out"). */
export const HOT_KEY_SHARE = 0.3

/* ---------- pricing models (09 "Pricing models") ---------- */

/**
 * How a compute Node pays for its box. On-demand is the full rate, reserved a
 * discount for a calendar week's commitment, and spot a deeper one on capacity
 * the provider can take back. Serverless is not a box at all: a Serverless
 * Function bills each use on the Requests line, so it has no entry here.
 */
export const PRICING_IDS = ['on-demand', 'reserved', 'spot'] as const
export type PricingId = (typeof PRICING_IDS)[number]

export type PricingDef = Readonly<{
  id: PricingId
  name: string
  /** Share of the on-demand box price this model bills at. */
  price: number
  blurb: string
}>

export const PRICINGS: Record<PricingId, PricingDef> = {
  'on-demand': {
    id: 'on-demand',
    name: 'On-demand',
    price: 1,
    blurb: 'Full rate. Remove the Node at any time.',
  },
  reserved: {
    id: 'reserved',
    name: 'Reserved',
    price: 0.6,
    blurb:
      '0.6×, for a commitment of one calendar week. Selling before the term ends owes the Burn.',
  },
  spot: {
    id: 'spot',
    name: 'Spot',
    price: 0.3,
    blurb: '0.3×. The provider can reclaim the Node after 10 s of warning.',
  },
}

/**
 * Savings plans (10 "Track: Cost", `savings-plans`): 20% off every compute Node's box, on top of
 * its own pricing model, with no per-Node commitment.
 */
export const SAVINGS_PLAN_RATE = 0.8

/** From Series A, each compute Node has a pricing model. */
export const PRICING_FROM_STAGE = 3
/** A reserved term: one calendar week, in sim seconds (one sim second is one calendar minute). */
export const RESERVED_SECONDS = 7 * 1_440

/* ---------- sticky sessions, purges and cache keys (05) ---------- */

/**
 * Sticky sessions (05 "Load Balancer"): the share of a Load Balancer's traffic that belongs to
 * users already pinned to a target. Pinned users do not move when a copy is added, so the oldest
 * copy holds the most of them: each copy after the first holds `STICKY_DECAY` times the pinned
 * users of the one before. A pinned user whose target dies loses the session, and the rest of the
 * traffic follows the Load Balancer's algorithm as before.
 */
export const STICKY_SHARE = 0.4
export const STICKY_DECAY = 0.8
/** Share of its `q-read` calls an App Server behind a sticky Load Balancer answers from its own memory. */
export const STICKY_LOCAL_READ = 0.15
/** Share of the realtime reconnect wave a Hub behind a sticky Load Balancer takes back on its own box. */
export const STICKY_HERD = 0.5

/** Share of `page` answers a CDN that did not purge serves from the last deploy until its TTL passes. */
export const STALE_AFTER_DEPLOY = 0.3

/**
 * What a CDN's cache key holds (05 "CDN"). Each field a key leaves out raises the hit ratio, and
 * a page that depends on the field is then served to the wrong user: with Edge-side includes a
 * logged-in page is cached, so a key without the cookie leaks it. `leak` is the incident weight.
 */
export const CACHE_KEYS = {
  full: { name: 'Path, query and cookies', hit: 1, leak: 0 },
  query: { name: 'Path and query', hit: 1.1, leak: 1 },
  path: { name: 'Path only', hit: 1.2, leak: 2.5 },
} as const

/* ---------- Cache stampede options (07 "Stampedes") ---------- */

/** Share of the hits a short TTL loses that early expiration wins back, and the extra reads it costs. */
export const EARLY_LIFT = 0.5
export const EARLY_REFRESH = 0.02

/* ---------- sharding (07 "Partitioning") ---------- */

/**
 * The shard keys. `hot` is the share of the load one key puts on its busiest shard before the
 * even split: a range key sends new users to the last shard, a tenant key sends the big tenant to
 * one. `cross` is the share of transactions that span shards, as a multiple of the chance two
 * random keys differ. `farMs` is the round trip a user in another region pays.
 */
export const SHARD_KEYS = {
  hash: { name: 'Hash of user ID', hot: 0, cross: 1, farMs: 0 },
  range: { name: 'Range of IDs', hot: 0.5, cross: 1, farMs: 0 },
  tenant: { name: 'By tenant', hot: 0.3, cross: 0.1, farMs: 0 },
  region: { name: 'By region', hot: 0, cross: 0.2, farMs: 70 },
} as const
/** A report or a search touches every shard: each shard past the first adds this share of the CPU, and this many ms. */
export const SCATTER_CPU = 0.15
export const SCATTER_MS = 2
/** Chance a distributed transaction fails on one shard that takes part in it. */
export const DISTRIBUTED_TX_FAILURE = 0.005
/** Dev Hours to change a Database's shard count or key, and the share of its IOPS the copy leaves. */
export const RESHARD_DH = 24
export const RESHARD_IOPS = 0.5
/** Calendar minutes the data copy of a resharding takes per GB, at least a calendar day. */
export const RESHARD_MINUTES_PER_GB = 1

/* ---------- synchronous replication (07 "Read Replica") ---------- */

/** Milliseconds every write waits for a synchronous replica in the same zone. */
export const SYNC_MS = 2

/* ---------- Search Engine options (07 "Search Engine") ---------- */

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

/* ---------- Object Storage products (07 "Object Storage") ---------- */

/** Milliseconds R2 adds to a read outside its own CDN: with a CDN on the board there is none. */
export const R2_FIRST_BYTE_MS = 15
/**
 * What each product bills per request, before the cost index (09 "Base prices"). Per-use prices
 * take the list price times 1,200, the multiple the functions' prices take: S3 bills $0.0004 per
 * thousand reads and $0.005 per thousand writes, R2 $0.36 and $4.50 per million.
 */
export const STORE_VARIANTS = {
  s3: { name: 'S3', egress: true, get: 0.00048, put: 0.006 },
  r2: { name: 'R2', egress: false, get: 0.000432, put: 0.0054 },
} as const
/** A Queue bills each task as a message: SQS's $0.40 per million requests, three requests a message, times 1,200. */
export const QUEUE_MESSAGE_PRICE = 0.00144

/* ---------- autoscaler signals (05 "Autoscaler") ---------- */

/** Requests per second per vCPU, and tasks per copy, that read 100% on the request-rate and queue-depth signals. */
export const SCALE_RPS_PER_VCPU = 100
export const SCALE_QUEUE_DEPTH = 100

/* ---------- indexes and data volume (07) ---------- */

/**
 * What a schema-change tool adds to the Dev Hours of a Feature that adds a query shape on a
 * relational Database (07 \"Schema migrations\"): online migrations 10%, expand and contract 25%.
 */
export const ONLINE_MIGRATION_DH = 1.1
export const EXPAND_CONTRACT_DH = 1.25
/** Share of a write's CPU each index adds (07 "Indexes"). */
export const INDEX_WRITE_COST = 0.05
/**
 * Calendar minutes a restore takes per GB of rows, and the least it takes; a point-in-time
 * restore replays the log on top of a snapshot, so it reads twice the GB.
 */
export const RESTORE_MINUTES_PER_GB = 0.5
export const RESTORE_MIN_MINUTES = 5
/** Calendar minutes a new Read Replica copies per GB before it serves, and the least it takes. */
export const REPLICA_SYNC_MINUTES_PER_GB = 0.5
/** Sim seconds a schema migration's lock holds per GB of rows, on top of its base, and its most. */
export const MIGRATION_LOCK_PER_GB = 0.1

export { SERVERLESS_MS } from '../components/fn.ts'
export { EDGE_MS } from '../components/edge.ts'
export { CDC_MS } from '../components/cdc.ts'
