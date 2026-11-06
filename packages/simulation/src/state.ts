import { Effect, Schema, SchemaGetter } from 'effect'
import { DownCause, Life, lifeOf } from './life.ts'
import {
  MUTATOR_IDS,
  VENTURE_IDS,
  COMPONENT_IDS,
  DATA_PATTERNS,
  FAMILY_IDS,
  FEATURE_IDS,
  FIXES,
  FRAMEWORK_IDS,
  INCIDENT_IDS,
  INSIGHT_POOLS,
  LANGUAGE_IDS,
  POLICY_IDS,
  PRICING_IDS,
  REQUEST_KINDS,
  REGIONS,
  RESEARCH_IDS,
  RUNTIME_IDS,
  DEPLOY_STRATEGY_IDS,
  START_KLOC,
  MIGRATION_STEPS,
  IAC_TOOLS,
  SYNC_MODES,
  ZONES,
  MOOD_START,
  DEVICES,
  NO_DEVICE_LATENCY,
} from './catalog.ts'

/* ==========================================================================
   The saved game. Everything the Simulation needs to continue lives here, and
   nothing else: the Ledger is derived from it on every Step.
   ========================================================================== */

export const ComponentId = Schema.Literals(COMPONENT_IDS)
export const FamilyId = Schema.Literals(FAMILY_IDS)
export const RuntimeId = Schema.Literals(RUNTIME_IDS)
export const FrameworkId = Schema.Literals(FRAMEWORK_IDS)
export const ResearchId = Schema.Literals(RESEARCH_IDS)
export const IncidentId = Schema.Literals(INCIDENT_IDS)

export const RequestKindId = Schema.Literals(REQUEST_KINDS)
export const LanguageId = Schema.Literals(LANGUAGE_IDS)
export const PolicyId = Schema.Literals(POLICY_IDS)
export const FeatureId = Schema.Literals(FEATURE_IDS)
export const FixId = Schema.Literals(FIXES)
export const VentureId = Schema.Literals(VENTURE_IDS)
export const MutatorId = Schema.Literals(MUTATOR_IDS)

export const LbPolicy = Schema.Literals(['weighted', 'round-robin', 'least-conn', 'p2c', 'hash'])
export type LbPolicy = typeof LbPolicy.Type

export const PmMode = Schema.Literals(['static', 'dynamic', 'ondemand'])
export type PmMode = typeof PmMode.Type

export const CacheEngine = Schema.Literals(['redis', 'memcached'])
export type CacheEngine = typeof CacheEngine.Type

/** A relational Database's engine (07 "Variants"). */
export const DbEngine = Schema.Literals(['postgres', 'mysql'])
export type DbEngine = typeof DbEngine.Type

/** The volume a Database's reads and writes wait on (07 "Capacity"). */
export const IopsClass = Schema.Literals(['general', 'provisioned'])
export type IopsClass = typeof IopsClass.Type

/** What a Database does with rows older than its window (07 "Data volume"). */
export const DbRetention = Schema.Literals(['keep', 'archive', 'delete'])
export type DbRetention = typeof DbRetention.Type

/** What a Cache does on a write (07 "Strategies"). */
export const CacheStrategy = Schema.Literals([
  'aside',
  'read-through',
  'write-through',
  'write-behind',
])
export type CacheStrategy = typeof CacheStrategy.Type

/** A Vector Index's type (07 "Vector Index"): exact, or approximate HNSW. */
export const VecIndexType = Schema.Literals(['exact', 'hnsw'])
export type VecIndexType = typeof VecIndexType.Type

/** What an Event Stream's producer waits for before it moves on (07 "Event Stream"). */
export const Acks = Schema.Literals(['0', '1', 'all'])
export type Acks = typeof Acks.Type

/** A Search Engine's refresh interval, in seconds (07 "Search Engine"). */
export const SearchRefresh = Schema.Finite
export type SearchRefresh = typeof SearchRefresh.Type

/** The class Object Storage keeps its objects in (07 "Object Storage"). */
export const StorageClass = Schema.Literals(['standard', 'infrequent', 'archive'])
export type StorageClass = typeof StorageClass.Type

export { DownCause } from './life.ts'

export const PoolerMode = Schema.Literals(['session', 'transaction', 'statement'])
export type PoolerMode = typeof PoolerMode.Type

export const Zone = Schema.Literals(ZONES)
export type Zone = typeof Zone.Type

/** A GPU Node's GPU type (05 "GPU Node"). */
export const GpuType = Schema.Literals(['t4', 'a100', 'h100'])
export type GpuType = typeof GpuType.Type

/** A Java App Server's garbage collector. */
export const Collector = Schema.Literals(['g1', 'parallel', 'zgc'])
export type Collector = typeof Collector.Type

/** What an Autoscaler reads: CPU, or the Node's whole load, slots and memory included. */
export const Region = Schema.Literals(REGIONS)
export type Region = typeof Region.Type

/** One figure for each region. */
export const PerRegion = Schema.Struct({
  na: Schema.Finite,
  eu: Schema.Finite,
  apac: Schema.Finite,
  sa: Schema.Finite,
})
export type PerRegion = typeof PerRegion.Type

export const Backup = Schema.Literals(['none', 'nightly', 'pitr'])
export type Backup = typeof Backup.Type

export const Fanout = Schema.Literals(['pull', 'push'])
export type Fanout = typeof Fanout.Type

/** What an Autoscaler reads (05 "Autoscaler"): CPU, the Node's whole load, requests per copy, or queue depth. */
export const ScaleSignal = Schema.Literals(['cpu', 'load', 'rps', 'queue'])
export type ScaleSignal = typeof ScaleSignal.Type

/** A compute Node's pricing model. */
export const Pricing = Schema.Literals(PRICING_IDS)
export type Pricing = typeof Pricing.Type

/** How a CI/CD Pipeline ships a deploy (05 "CI/CD Pipeline"). */
export const DeployStrategy = Schema.Literals(DEPLOY_STRATEGY_IDS)
export type DeployStrategy = typeof DeployStrategy.Type

/** What a CDN's cache key holds (05 "CDN"): path, query string and cookies, or less of them. */
export const CacheKey = Schema.Literals(['full', 'query', 'path'])
export type CacheKey = typeof CacheKey.Type

/** The key a Database shards on (07 "Partitioning"). */
export const ShardKey = Schema.Literals(['hash', 'range', 'tenant', 'region'])
export type ShardKey = typeof ShardKey.Type

/** A Search Engine's product (07 "Search Engine"). */
export const SearchVariant = Schema.Literals(['elasticsearch', 'opensearch', 'meilisearch'])
export type SearchVariant = typeof SearchVariant.Type

/** The share of a Search Engine's RAM the JVM heap takes (07 "Search Engine"). */
export const SearchHeap = Schema.Literals(['small', 'half', 'large'])
export type SearchHeap = typeof SearchHeap.Type

/** The product an Object Storage Node is (07 "Object Storage"). */
export const StoreVariant = Schema.Literals(['s3', 'r2'])
export type StoreVariant = typeof StoreVariant.Type

const NODE_FIELDS = {
  id: Schema.String,
  type: ComponentId,
  /** Stable per-Component ordinal for display. 0 on old saves until normalized. */
  ordinal: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  x: Schema.Finite,
  y: Schema.Finite,
  /** Index into SIZES for sized Components; the drawer or sampler size otherwise. */
  size: Schema.Finite,
  family: FamilyId,
  runtime: RuntimeId,
  framework: FrameworkId,
  /** Pool size for pooled runtimes. */
  workers: Schema.Finite,
  /** Postgres runs on this App Server. Only the starting box has it. */
  localDb: Schema.Boolean,
  /** Old saves' index into the sample rates. Unused: `sampleRate` holds the rate by value. */
  sample: Schema.Finite,
  /** Share of requests Analytics samples. */
  sampleRate: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0.1))),
  /** Seconds of traces Analytics keeps. */
  retention: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(900))),
  /** Burstable CPU credits, in core-seconds. */
  credits: Schema.Finite,
  /** GB leaked by a memory leak. */
  leak: Schema.Finite,
  /**
   * The Company shut this Node down to stop its Burn (09 "Runway and running
   * out of Cash"). A shut Node serves nothing and bills nothing, and stays on
   * the board until the player replaces or sells it.
   */
  shut: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /**
   * The player drained this Node (11 "Drain a Node"): it takes no new traffic and finishes the
   * work it holds, then rejoins. `drainAt` is the sim second it started.
   */
  draining: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  drainAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Supervised process crashes a BEAM App Server has absorbed (06 "Fault isolation"). */
  crashes: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A persistent App Server recycles its workers every so many requests (pm.max_requests, a worker killer). */
  recycle: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The App Server gzips page and read responses. */
  compress: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Sim time the Node last went down, so health checks and DNS notice it late. */
  downAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** How a Load Balancer splits traffic. */
  policy: LbPolicy.pipe(Schema.withDecodingDefaultKey(Effect.succeed('weighted' as const))),
  /** A Load Balancer keeps a user on one target (05 "Load Balancer"). */
  sticky: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The Payment Provider a checkout goes to: the first, or a second that an outage of the first leaves alone (18). */
  provider: Schema.Literals(['first', 'second']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('first' as const)),
  ),
  /** A Load Balancer lets a new copy take traffic gradually (11 "JVM warmup under load"). */
  slowStart: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A CDN clears its cache when a deploy ships (05 "CDN"). */
  purge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** What a CDN's cache key holds (05 "CDN"). */
  cacheKey: CacheKey.pipe(Schema.withDecodingDefaultKey(Effect.succeed('full' as const))),
  /** Sim time until a CDN that did not purge still serves the old deploy's pages. */
  staleUntil: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A Cache refreshes a key a little before it expires, at random (07 "Stampedes"). */
  earlyExpiry: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Cache serves the old value while one request refreshes it (07 "Stampedes"). */
  swr: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The key a Database shards on (07 "Partitioning"). */
  shardKey: ShardKey.pipe(Schema.withDecodingDefaultKey(Effect.succeed('hash' as const))),
  /** A Read Replica every write waits for (07 "Read Replica"). */
  sync: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Search Engine's product, and its replicas and heap (07 "Search Engine"). */
  searchVariant: SearchVariant.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('elasticsearch' as const)),
  ),
  searchShards: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  searchReplicas: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  heap: SearchHeap.pipe(Schema.withDecodingDefaultKey(Effect.succeed('half' as const))),
  /** The product an Object Storage Node is (07 "Object Storage"). */
  storeVariant: StoreVariant.pipe(Schema.withDecodingDefaultKey(Effect.succeed('s3' as const))),
  /** A Load Balancer's variant: L7 reads HTTP, L4 forwards TCP (05 "Load Balancer"). */
  variant: Schema.Literals(['l7', 'l4']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('l7' as const)),
  ),
  /** A Gateway validates each request's token once, so the services behind it skip it (05 "API Gateway"). */
  authEdge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Gateway merges identical reads that are in flight at once (05 "API Gateway"). */
  merge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Requests a Gateway's token bucket holds on top of its limit; 0 is a flat cap (05). */
  burst: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Seconds between a Load Balancer's health checks. */
  checkEvery: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(10))),
  /** A deep health check also checks the server's database. */
  deepCheck: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** DNS or Cache TTL, in seconds. */
  ttl: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(300))),
  /** PHP-FPM's process manager. */
  pm: PmMode.pipe(Schema.withDecodingDefaultKey(Effect.succeed('static' as const))),
  /** The sim second this Node's TLS certificate runs out, or null until one is issued (05 "Secrets and Certificates"). */
  certUntil: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The Cache's engine. */
  engine: CacheEngine.pipe(Schema.withDecodingDefaultKey(Effect.succeed('redis' as const))),
  /** The Database's or Read Replica's engine (07 "Variants"). */
  dbEngine: DbEngine.pipe(Schema.withDecodingDefaultKey(Effect.succeed('postgres' as const))),
  /** The Database's volume (07 "Capacity"): general purpose, or provisioned for more IOPS. */
  iops: IopsClass.pipe(Schema.withDecodingDefaultKey(Effect.succeed('general' as const))),
  /** Shards the Database splits into (07 "Partitioning"): writes scale with them. */
  shards: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** The class Object Storage keeps its objects in (07 "Object Storage"). */
  storageClass: StorageClass.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('standard' as const)),
  ),
  /** What a Database does with rows past its window (07 "Data volume"). */
  keep: DbRetention.pipe(Schema.withDecodingDefaultKey(Effect.succeed('keep' as const))),
  /** The class an object older than this many calendar days moves to (07 "Object Storage"). */
  lifecycle: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** What a Cache does on a write (07 "Strategies"). */
  cacheStrategy: CacheStrategy.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('aside' as const)),
  ),
  /** Seconds a Search Engine waits before a new document is searchable (07 "Search Engine"). */
  refresh: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** A backup that a restore drill found broken (07 "Backups"). */
  restore: Schema.Literals(['ok', 'failed']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('ok' as const)),
  ),
  /** The Connection Pooler's mode. Saves from before modes pooled by transaction. */
  mode: PoolerMode.pipe(Schema.withDecodingDefaultKey(Effect.succeed('transaction' as const))),
  /** Tasks waiting in a Queue. */
  depth: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A Queue moves a task that keeps failing to a dead-letter queue. */
  dlq: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Attempts a Queue with a dead-letter queue gives a task before it parks it there. */
  attempts: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(25))),
  /** Most tasks a Queue holds; past it, new tasks are refused. 0 means no limit. */
  maxLength: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Tasks each Worker process takes from its Queue ahead of time. */
  prefetch: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(10))),
  /** Sim time a Kubernetes Cluster was last upgraded. */
  upgradedAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A Cache coalesces misses for the same key (Stampede protection). */
  coalesce: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Cache refills before it takes traffic after a restart (Cache warming). */
  warming: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A WAF's paranoia level, 1 to 4. */
  paranoia: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(2))),
  /** A WAF challenges every request. */
  underAttack: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Requests per second an API Gateway lets through; 0 is no limit (05 "API Gateway"). */
  rateLimit: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** How a CI/CD Pipeline ships: Recreate, Rolling, Blue-green or Canary (05 "CI/CD Pipeline"). */
  strategy: DeployStrategy.pipe(Schema.withDecodingDefaultKey(Effect.succeed('rolling' as const))),
  /** A Realtime Hub tracks who is online: more per message, and CPU spent on each join. */
  presence: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Realtime Hub lets clients reconnect with jittered backoff after a restart. */
  backoff: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Realtime Hub runs several boxes behind one pub/sub backbone; without it, one box takes all. */
  clustering: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The zone the Node runs in. */
  zone: Zone.pipe(Schema.withDecodingDefaultKey(Effect.succeed('a' as const))),
  /** A data Node keeps a standby in another zone and fails over to it. */
  standby: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** How a compute Node pays for its box (09 "Pricing models"). */
  pricing: Pricing.pipe(Schema.withDecodingDefaultKey(Effect.succeed('on-demand' as const))),
  /** Sim time a reserved term ends; null for every other model. */
  pricingUntil: Schema.NullOr(Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
  /** Copies of an App Server or Worker that serve now. */
  replicas: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** Copies an Autoscaler has asked for that are still booting, and the seconds until they serve. */
  pending: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  readyIn: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Sim time an Autoscaler last changed this Node's copies. */
  scaledAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** An Autoscaler's signal, target load, and copy limits. A max of 0 means none. */
  signal: ScaleSignal.pipe(Schema.withDecodingDefaultKey(Effect.succeed('cpu' as const))),
  target: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0.6))),
  minCopies: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  maxCopies: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(8))),
  /** A GPU Node's GPU type. */
  gpu: GpuType.pipe(Schema.withDecodingDefaultKey(Effect.succeed('t4' as const))),
  /** A GPU Node's weight precision: FP16, INT8 or INT4 (05 "GPU Node"). */
  precision: Schema.Literals(['fp16', 'int8', 'int4']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('fp16' as const)),
  ),
  /** The model a GPU Node serves: small, medium or large (05 "GPU Node"). */
  gpuModel: Schema.Literals(['small', 'medium', 'large']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('medium' as const)),
  ),
  /** A GPU Node's batch size (05 "GPU Node"). */
  batch: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** A Java App Server's collector, and a Go App Server's GOGC. */
  collector: Collector.pipe(Schema.withDecodingDefaultKey(Effect.succeed('g1' as const))),
  gogc: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(100))),
  /** A saturated App Server drops the lowest-value kinds first (Priority load shedding). */
  shed: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A saturated App Server drops its most expensive kinds first (Graceful degradation). */
  degrade: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** An Autoscaler provisions for the coming daily peak (Scheduled scaling). */
  schedule: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Database answers reports from a stored view, at half the scan CPU (Materialized views). */
  materialized: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** An App Server sends reads that follow a write to the primary (Read-your-writes routing). */
  ryw: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  region: Region.pipe(Schema.withDecodingDefaultKey(Effect.succeed('na' as const))),
  /** Wide-column Store: replicas per key, replicas a read asks, replicas a write waits for. */
  n: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  r: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  w: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** Sim seconds one of its replicas stays lost (a Wide-column Store keeps serving). */
  lost: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A Wide-column Store or Distributed SQL Node replicates across regions. */
  spread: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  backup: Backup.pipe(Schema.withDecodingDefaultKey(Effect.succeed('none' as const))),
  fanout: Fanout.pipe(Schema.withDecodingDefaultKey(Effect.succeed('pull' as const))),
  /** A Cache splits hot keys across its shards. */
  split: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Document Store runs multi-document transactions: atomic checkouts, and slower writes (07). */
  transactions: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Vector Index's type: exact, or approximate HNSW (07 "Vector Index"). */
  indexType: VecIndexType.pipe(Schema.withDecodingDefaultKey(Effect.succeed('exact' as const))),
  /** Partitions an Event Stream splits into (07 "Event Stream"): its readers, and its order. */
  partitions: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  /** What a producer waits for before it moves on: `0`, `1`, or `all` (07 "Event Stream"). */
  acks: Acks.pipe(Schema.withDecodingDefaultKey(Effect.succeed('all' as const))),
  /** Sim seconds an Event Stream keeps a message, for replay (07 "Event Stream"). */
  retain: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3_600))),
  /** An Event Stream keys its partitions by entity, so one entity's events stay in order (07). */
  keyed: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
} as const

/** A save from before the machine carries these three fields instead of `life`. */
const GameNodeStored = Schema.Struct({
  ...NODE_FIELDS,
  down: Schema.optionalKey(Schema.Finite),
  downCause: Schema.optionalKey(DownCause),
  warm: Schema.optionalKey(Schema.Finite),
  life: Schema.optionalKey(Life),
})

/** The live Node: one lifecycle state, never the three old fields. */
const GameNodeLive = Schema.Struct({ ...NODE_FIELDS, life: Life }).pipe(Schema.toType)

/**
 * A Node keeps its lifecycle as one tagged state. Decoding derives it from the
 * old fields, so a save from before the machine still opens; encoding writes
 * the state, so the phase is explicit in the save too.
 */
export const GameNode = GameNodeStored.pipe(
  Schema.decodeTo(GameNodeLive, {
    decode: SchemaGetter.transform((stored) => {
      const { down, downCause, warm, life, ...rest } = stored
      return {
        ...rest,
        life: life ?? lifeOf(down ?? 0, warm ?? 1, downCause ?? 'restart'),
      }
    }),
    encode: SchemaGetter.transform((live) => live),
  }),
)
export type GameNode = typeof GameNode.Type

export const Retries = Schema.Literals(['none', 'naive', 'backoff'])
export type Retries = typeof Retries.Type

/** A directed network call, with its timeout, retry policy, and the kinds it carries. */
export const GameLink = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  /** Seconds before the caller gives up. */
  timeout: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(30))),
  retries: Retries.pipe(Schema.withDecodingDefaultKey(Effect.succeed('none' as const))),
  /** The request kinds a Load Balancer sends on this link, or null for every kind. */
  kinds: Schema.NullOr(Schema.Array(RequestKindId)).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
  /** A circuit breaker on the Link (Circuit breakers). */
  breaker: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A bulkhead caps how long one call may hold its caller's slot (Bulkheads). */
  bulkhead: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The Link sends a second copy of a slow call and keeps the faster answer (Hedged requests). */
  hedge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Seconds the breaker stays open: the Link fails fast and sends nothing. */
  open: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /**
   * Share of calls that failed on the Link last Step, for Links that retry or break. Retries
   * carry it into the next Step, which is what keeps a retry storm going.
   */
  failure: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type GameLink = typeof GameLink.Type

export const Incident = Schema.Struct({
  kind: IncidentId,
  /** Sim seconds left. */
  remaining: Schema.Finite,
  nodeId: Schema.NullOr(Schema.String),
  startedAt: Schema.Finite,
  /** Revenue per second when it started, to measure what it cost. */
  baseline: Schema.Finite,
  usersAtStart: Schema.Finite,
  /** Seconds with more than 1% of requests failing: the MTTR. */
  impaired: Schema.Finite,
  lostRevenue: Schema.Finite,
  failed: Schema.Finite,
  /**
   * The sim second its first signal landed: the pager when the Company has Alerting, else the
   * board (11 "The incident loop"). Null until it does, and in a save from before the field.
   */
  signalAt: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The sim second a player first acted on it, or the on-call rotation answered the page. */
  ackAt: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** SEV level now: it starts at the incident's own and can step up once. */
  severity: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  /** How many times normal demand a spike sends. */
  magnitude: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  /** The zone a zone outage took down. */
  zone: Schema.NullOr(Zone).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  region: Schema.NullOr(Region).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /**
   * The Service whose code failed, for a bad deploy: only its traffic breaks (08 "Services",
   * 11 "Bad deploy"). Absent for an incident that hits the Design rather than one codebase, and
   * in a save from before Services were named.
   */
  service: Schema.optionalKey(Schema.NullOr(Schema.String)),
  /**
   * The incident that was left alone and started this one, or null when the director picked it
   * (11 "One at a time, early"). Null in a save from before cascades.
   */
  causedBy: Schema.NullOr(IncidentId).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
})
export type Incident = typeof Incident.Type

export const Postmortem = Schema.Struct({
  id: Schema.Finite,
  kind: IncidentId,
  target: Schema.NullOr(Schema.String),
  duration: Schema.Finite,
  mttr: Schema.Finite,
  /**
   * Seconds from the start to the first signal, and from that signal to the acknowledgement
   * (11 "The incident loop"). Null in a save from before the fields, and for a run whose signal
   * or acknowledgement never came.
   */
  mttd: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  mtta: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  lostUsers: Schema.Finite,
  lostRevenue: Schema.Finite,
  failed: Schema.Finite,
  /** The research this postmortem opens as an action item. */
  action: Schema.NullOr(ResearchId),
  /** The SEV level it ended at. */
  severity: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  /**
   * The sim second it ended at, so the Dashboard can place it on a time axis
   * (12 "The Dashboard"). Null in a Save from before the field, which has no
   * time to place it at.
   */
  endedAt: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The Design resolved it by itself, with no player action (11 "Runbooks"). */
  auto: Schema.optionalKey(Schema.Boolean),
  /**
   * The incident left alone that started this one, so the card shows the chain (11 "Cascades").
   * Null for an incident the director picked, and in a save from before cascades.
   */
  causedBy: Schema.NullOr(IncidentId).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The Service whose code failed, so the card can name the team that was paged. */
  service: Schema.optionalKey(Schema.NullOr(Schema.String)),
})
export type Postmortem = typeof Postmortem.Type

/** One second of history, for the sparklines. */
export const Sample = Schema.Struct({
  users: Schema.Finite,
  demand: Schema.Finite,
  served: Schema.Finite,
  revenue: Schema.Finite,
  burn: Schema.Finite,
  /** Cash in the bank at the end of the second; 0 in a Sample saved before the series. */
  cash: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  latency: Schema.Finite,
  p99: Schema.Finite,
  apdex: Schema.Finite,
  errors: Schema.Finite,
  /**
   * Mean milliseconds from each device's side: `latency` plus that device's own round trip (12
   * "The visibility ladder", `rum`). 0 for every device on a Sample saved before `rum` landed.
   */
  device: Schema.Record(Schema.Literals(DEVICES), Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(NO_DEVICE_LATENCY)),
  ),
  /**
   * The Request kind with the highest p99 that second: the trace an exemplar on the latency Chart
   * opens (12 "Dashboard"). Null when nothing was served, and in a Sample saved before the field.
   */
  slow: Schema.NullOr(RequestKindId).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
})
export type Sample = typeof Sample.Type

/** One calendar hour of requests users sent and the share that failed, for the error budget. */
export const BudgetHour = Schema.Struct({
  hour: Schema.Finite,
  requests: Schema.Finite,
  failed: Schema.Finite,
  /** Users at the end of the hour, for growth over the week (09 "Valuation"); 0 when unknown. */
  users: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type BudgetHour = typeof BudgetHour.Type

/** Seconds each alert condition has held, for the pager. */
export const Alarms = Schema.Struct({
  errors: Schema.Finite,
  latency: Schema.Finite,
  saturation: Schema.Finite,
  queue: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  budget: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type Alarms = typeof Alarms.Type

/**
 * Alert thresholds: error share, p99 as a multiple of the Apdex target, Node load, the age in
 * seconds of the oldest task in any Queue, and the error budget's burn rate.
 */
export const AlertRules = Schema.Struct({
  errors: Schema.Finite,
  latency: Schema.Finite,
  saturation: Schema.Finite,
  queue: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(30))),
  budget: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(10))),
})
export type AlertRules = typeof AlertRules.Type

/** Alerts that fired with no incident running, per rule, in the calendar day `day`. */
export const FalseAlarms = Schema.Struct({
  day: Schema.Finite,
  errors: Schema.Finite,
  latency: Schema.Finite,
  saturation: Schema.Finite,
  queue: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  budget: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type FalseAlarms = typeof FalseAlarms.Type

/* ---------- the Team (08) ---------- */

/** An engineer on the payroll. The founder is not one: every Company has them. */
export const Engineer = Schema.Struct({
  id: Schema.String,
  team: Schema.String,
  /** The language they were hired for, which sets their salary. */
  language: LanguageId,
  /** Sim time they joined, for the ramp-up. */
  hiredAt: Schema.Finite,
  /**
   * The salary index they are paid at (08 "Hiring"): set when they are hired and by a raise, so a
   * Team that never raises falls behind the Era's going rate. Null reads the Era's index, which is
   * what a save from before pay kept, so an old save plays unchanged.
   */
  salary: Schema.NullOr(Schema.Finite).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /**
   * Morale, 0 to 1 (18 "Burnout and quitting"). A long freeze, a page and a pay gap wear it down;
   * time off and a raise restore it. 1 in a save from before mood.
   */
  mood: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(MOOD_START))),
  /** Times an incident paged them, for the Burnout Mail. */
  pages: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Sim time a spell of time off ends: they produce nothing until then. */
  offUntil: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /**
   * The sim second their slump was last put to the player, or 0 when they are content. One Mail per
   * slump: it clears when they are content again, so a later one writes again (18).
   */
  unhappyAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type Engineer = typeof Engineer.Type

/**
 * What a new engineer starts with (08 "Hiring", 18 "Burnout and quitting"): the Era's rate rather
 * than a set index, content, never paged, and no time off.
 */
export const NEW_ENGINEER = {
  salary: null,
  mood: MOOD_START,
  pages: 0,
  offUntil: 0,
  unhappyAt: 0,
} as const

/** An offer accepted: the engineer joins at `readyAt`. */
export const Hire = Schema.Struct({
  id: Schema.String,
  team: Schema.String,
  language: LanguageId,
  readyAt: Schema.Finite,
})
export type Hire = typeof Hire.Type

/** A product team builds the backlog; a platform team runs the Clusters and the pipeline; a data team runs the warehouse and the pipelines' copies. */
export const TeamKind = Schema.Literals(['product', 'platform', 'sre', 'data', 'security'])
export type TeamKind = typeof TeamKind.Type

export const Team = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  kind: TeamKind.pipe(Schema.withDecodingDefaultKey(Effect.succeed('product' as const))),
  policy: PolicyId,
  /** The policy in force until a calendar day after `since`. */
  previous: PolicyId,
  since: Schema.Finite,
})
export type Team = typeof Team.Type

/** A Stack change in progress (08 "Migrations"): the strangler moves App Servers over in steps. */
/**
 * A Stack migration, one state at a time. `Building` is there while the next
 * tranche's Dev Hours are built; `Ready` means traffic can shift; `Finishing`
 * means every App Server moved and only Fix bugs remains. The save from before
 * the machine carried `step`, `ready` and `bugs`; decoding derives the state.
 */
const MIGRATION_FIELDS = {
  runtime: RuntimeId,
  framework: FrameworkId,
  fromRuntime: RuntimeId,
  fromFramework: FrameworkId,
  /** Dev Hours for the whole migration. */
  total: Schema.Finite,
  /** The new Stack fails some requests until Fix bugs ships. */
  bugs: Schema.Boolean,
} as const

export const Migration = Schema.Union([
  Schema.TaggedStruct('Building', {
    ...MIGRATION_FIELDS,
    /** Steps shifted so far, 0 to 3. */
    step: Schema.Finite,
  }),
  Schema.TaggedStruct('Ready', {
    ...MIGRATION_FIELDS,
    /** Steps shifted so far, 0 to 3. */
    step: Schema.Finite,
  }),
  /** Every App Server moved; only Fix bugs remains. */
  Schema.TaggedStruct('Finishing', { ...MIGRATION_FIELDS }),
]).pipe(Schema.toType)
export type Migration = typeof Migration.Type

/** A save from before the machine stored these three fields instead of a tag. */
const MigrationStored = Schema.Struct({
  ...MIGRATION_FIELDS,
  step: Schema.optionalKey(Schema.Finite),
  ready: Schema.optionalKey(Schema.Boolean),
  bugs: Schema.optionalKey(Schema.Boolean),
  _tag: Schema.optionalKey(Schema.Literals(['Building', 'Ready', 'Finishing'])),
})

/** Rebuilds the state from the old fields, so a save from before the machine opens. */
const migrationOf = (stored: typeof MigrationStored.Type): Migration => {
  const { runtime, framework, fromRuntime, fromFramework, total, step, ready, bugs } = stored
  const base = { runtime, framework, fromRuntime, fromFramework, total, bugs: bugs ?? false }
  if (stored._tag === 'Finishing') return { _tag: 'Finishing', ...base }
  if (stored._tag === 'Ready') return { _tag: 'Ready', ...base, step: step ?? 0 }
  if (stored._tag === 'Building') return { _tag: 'Building', ...base, step: step ?? 0 }
  if ((step ?? 0) >= MIGRATION_STEPS.length) return { _tag: 'Finishing', ...base }
  return ready
    ? { _tag: 'Ready', ...base, step: step ?? 0 }
    : { _tag: 'Building', ...base, step: step ?? 0 }
}

export const MigrationState = MigrationStored.pipe(
  Schema.decodeTo(Migration, {
    decode: SchemaGetter.transform((stored) => migrationOf(stored)),
    encode: SchemaGetter.transform((live) => live),
  }),
)
export type MigrationState = typeof MigrationState.Type

/** The data copy of a Database engine change: the Node, the engine it moves to, and when the copy ends. */
export const EngineChange = Schema.Struct({
  node: Schema.String,
  to: DbEngine,
  until: Schema.Finite,
})
export type EngineChange = typeof EngineChange.Type

/**
 * A Database's resharding in progress (07 "Partitioning"): the Node, the shard count and key it
 * moves to, and when the data copy ends. `until` is 0 while the Dev Hours are still being built.
 */
export const Resharding = Schema.Struct({
  node: Schema.String,
  shards: Schema.Finite,
  key: ShardKey,
  until: Schema.Finite,
})
export type Resharding = typeof Resharding.Type

/** A codebase with its own deploys, owned by one team (08 "Services"). */
export const Service = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  /** Tech debt, 0 to 1. */
  debt: Schema.Finite,
  /** Thousands of lines: what a migration has to move. */
  codebase: Schema.Finite,
  /** Engineering tasks that changed the code for good. */
  fixes: Schema.Array(FixId),
  /** Query shapes with no index. */
  shapes: Schema.Finite,
  /** Indexes the Service has added: each one makes every write cost more (07 "Indexes"). */
  indexes: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  migration: Schema.NullOr(MigrationState),
  nextDeployAt: Schema.Finite,
  /** What the last deploy shipped, so a rollback can take it back. */
  lastDeploy: Schema.Array(FeatureId),
  /**
   * Each Feature's rollout share, from its flag (05 "Feature Flags", 08 "Rollout"). A Feature not
   * named here is live for every user; the rollouts only count while a Feature Flags Node is live.
   */
  rollouts: Schema.Record(Schema.String, Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed({})),
  ),
  /** The team that owns it: the team that builds its work and is paged when it breaks. */
  owner: Schema.String.pipe(Schema.withDecodingDefaultKey(Effect.succeed('core'))),
  /**
   * The Features moved onto it (08 "Services"). Empty on the starting Service means every Feature
   * that no other Service carries, so an old save opens on one Service as it did.
   */
  features: Schema.Array(FeatureId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /**
   * The Database Node it reads and writes, or null for the Design's first Database. Two Services
   * on one datastore keep half the coordination penalty (08 "Shared database penalty").
   */
  datastore: Schema.NullOr(Schema.String).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
})
export type Service = typeof Service.Type

export const WorkKind = Schema.Literals([
  'feature',
  'task',
  'migration',
  'spike',
  'patch',
  'split',
  'move',
])
export type WorkKind = typeof WorkKind.Type

/** What a backlog item waits on when it cannot move (18 "Teammates"): the four the design names. */
export const BlockKind = Schema.Literals(['decision', 'index', 'copy', 'hire'])
export type BlockKind = typeof BlockKind.Type

/** Why an item stopped, who owns it, and when to say so again. */
export const Block = Schema.Struct({
  kind: BlockKind,
  /** The engineer whose item it is: they write the Mail. */
  owner: Schema.String,
  /** Sim second it stopped. */
  at: Schema.Finite,
  /** Sim second the Mail lands again after Later. */
  remindAt: Schema.Finite,
  /** The player approved it: the work moves again. A cleared block never stops it twice. */
  cleared: Schema.Boolean,
})
export type Block = typeof Block.Type

/**
 * One backlog item. `ref` is a Feature or task id; a migration item names its
 * step; a Spike names the research of the Study it speeds; a patch names its CVE.
 */
export const WorkItem = Schema.Struct({
  id: Schema.Finite,
  kind: WorkKind,
  ref: Schema.String,
  cost: Schema.Finite,
  spent: Schema.Finite,
  /** A patch's deadline, in Company seconds. It turns overdue after it and is exploited a grace later. */
  due: Schema.optionalKey(Schema.Finite),
  /** The Component id a patch is for. */
  target: Schema.optionalKey(Schema.String),
  /** The Service the work belongs to, so its owner team takes it first (08 "Ownership"). */
  service: Schema.optionalKey(Schema.String),
  /**
   * The engineer whose item it is (18 "Teammates"): the one a patch's CVE proposal names, and the
   * one who writes when the item is blocked.
   */
  owner: Schema.optionalKey(Schema.String),
  /** What stopped it, or null while it moves (18 "Blocked"). */
  blockedBy: Schema.NullOr(Block).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** How the player answered a patch proposal: to the top now, or queued where it is. */
  answered: Schema.NullOr(Schema.Literals(['now', 'queued'])).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
})
export type WorkItem = typeof WorkItem.Type

/** One Feature's A/B samples (08 "Measured lift"): the exposed and holdout requests since its step. */
export const LiftSample = Schema.Struct({
  exposed: Schema.Finite,
  holdout: Schema.Finite,
  /** The rollout step the counts belong to: a new step starts the count again. */
  step: Schema.Finite,
})
export type LiftSample = typeof LiftSample.Type

export const CORE_TEAM: Team = {
  id: 'core',
  name: 'Core',
  kind: 'product',
  policy: 'balanced',
  previous: 'balanced',
  since: 0,
}

export const monolith = (fixes: ReadonlyArray<typeof FixId.Type>): Service => ({
  id: 'monolith',
  name: 'Monolith',
  debt: 0,
  codebase: START_KLOC,
  fixes,
  shapes: 0,
  indexes: 0,
  migration: null,
  nextDeployAt: 0,
  lastDeploy: [],
  rollouts: {},
  owner: 'core',
  features: [],
  datastore: null,
})

/**
 * A save from before the Team plays as it did: its code already loads eagerly
 * once researched, and its poolers already ran in transaction mode.
 */
const OLD_MONOLITH = monolith([
  'eager-loading',
  'session-state',
  'idempotency-keys',
  'off-loop',
  'graceful-shutdown',
  'health-check',
])

/** The DR drill (10 "Era 6"): when it began, how long recovery took, and the data it would lose. */
export const Drill = Schema.Struct({
  startedAt: Schema.Finite,
  /** Calendar minutes until the error share fell under 1%, or null until then. */
  rto: Schema.NullOr(Schema.Finite),
  /** Calendar minutes of writes the failed region would lose. */
  rpo: Schema.Finite,
  done: Schema.Boolean,
  passed: Schema.Boolean,
})
export type Drill = typeof Drill.Type

export const QuarterResult = Schema.Struct({
  beat: Schema.Boolean,
  growth: Schema.Finite,
  margin: Schema.Finite,
})
export type QuarterResult = typeof QuarterResult.Type

/** A Public quarter (10 "Era 7"): the guidance set at its start, and where it started from. */
export const Quarter = Schema.Struct({
  index: Schema.Finite,
  startedAt: Schema.Finite,
  /** Guidance levels, 0 to 2: revenue growth 5/10/20%, margin 10/20/30%. */
  growth: Schema.Finite,
  margin: Schema.Finite,
  revenue: Schema.Finite,
  streak: Schema.Finite,
  /** What beats and misses added to the valuation multiple. */
  bonus: Schema.Finite,
  last: Schema.NullOr(QuarterResult),
})
export type Quarter = typeof Quarter.Type

/**
 * What the Company was founded with (13): its Venture, its Mutators, and the
 * Founder's perk levels at founding. The Simulation reads this, never the
 * Founder record, so a save is self-contained.
 */
export const Founding = Schema.Struct({
  venture: VentureId,
  mutators: Schema.Array(MutatorId),
  perks: Schema.Record(Schema.String, Schema.Finite),
})
export type Founding = typeof Founding.Type

export const DEFAULT_FOUNDING: Founding = { venture: 'b2b-saas', mutators: [], perks: {} }

/** Insight held in each pool (12 "Earning Insight"). */
export const InsightPools = Schema.Struct(
  Object.fromEntries(
    INSIGHT_POOLS.map((pool) => [
      pool,
      Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
    ]),
  ) as Record<(typeof INSIGHT_POOLS)[number], Schema.withDecodingDefaultKey<typeof Schema.Finite>>,
)
export type InsightPools = typeof InsightPools.Type

export const NO_INSIGHT: InsightPools = Object.fromEntries(
  INSIGHT_POOLS.map((pool) => [pool, 0]),
) as InsightPools

/** A queued Study: the research, and the share of its base duration done. */
export const Study = Schema.Struct({ id: ResearchId, progress: Schema.Finite })
export type Study = typeof Study.Type

/**
 * What a Challenge changes about its Board (14 "Challenges"), beyond the Era's rules. Absent
 * from every Company and guided Sandbox, so their saves and hashes do not carry it.
 */
export const Scenario = Schema.Struct({
  /** The request mix, instead of the Era's. */
  mix: Schema.optionalKey(Schema.Record(Schema.String, Schema.Finite)),
  /** Each region's users follow their own daily cycle, as in a Company. */
  daily: Schema.optionalKey(Schema.Boolean),
  /** Fixes are Design choices the Design pays Dev Hours for, not given. */
  tasks: Schema.optionalKey(Schema.Boolean),
  /** What a request of each kind earns, as a multiple of its catalog value: a paid plan's price. */
  value: Schema.optionalKey(Schema.Record(Schema.String, Schema.Finite)),
})
export type Scenario = typeof Scenario.Type

/* ---------- Mirrors (05 "Mirror a region") ---------- */

export const IacTool = Schema.Literals(IAC_TOOLS)
export type IacTool = typeof IacTool.Type

export const SyncMode = Schema.Literals(SYNC_MODES)
export type SyncMode = typeof SyncMode.Type

export const DataPattern = Schema.Literals(DATA_PATTERNS)
export type DataPattern = typeof DataPattern.Type

/** The IaC tool the Company writes Mirrors in, and how GitOps syncs them. */
export const Infra = Schema.Struct({
  tool: IacTool,
  /** Sim time a move to this tool ends; Mirrors do not sync before it. */
  until: Schema.Finite,
  /** GitOps sync mode, or null to apply plans by hand. */
  sync: Schema.NullOr(SyncMode),
})
export type Infra = typeof Infra.Type

/** One Node's managed settings, as the code says them. */
export const NodeSpec = Schema.Record(
  Schema.String,
  Schema.Union([Schema.String, Schema.Finite, Schema.Boolean]),
)
export type NodeSpec = typeof NodeSpec.Type

/** A Mirror's live state as a refresh read it. */
export const Observed = Schema.Struct({
  nodes: Schema.Record(Schema.String, NodeSpec),
  links: Schema.Array(Schema.String),
})
export type Observed = typeof Observed.Type

/**
 * A region built from another region's Nodes and Links. `code` is what the last
 * Apply wrote: the source as it was then. The source ahead of the code is behind;
 * the Mirror away from the code is a hand change.
 */
export const Mirror = Schema.Struct({
  region: Region,
  source: Region,
  /** Each source Node id, and the Mirror Node that copies it. */
  nodes: Schema.Record(Schema.String, Schema.String),
  /** Each source data Node id, and how the Mirror copies it. */
  data: Schema.Record(Schema.String, DataPattern),
  /** Each managed source Node id, and its settings at the last Apply. */
  code: Schema.Record(Schema.String, NodeSpec),
  /** The Mirror's managed Links at the last Apply, as `from>to` with Mirror ids. */
  links: Schema.Array(Schema.String),
  /**
   * The Mirror's live state when the player last read it (`pulumi refresh`, `alchemy drift`):
   * each Node's settings and the managed Links. Null until read, and after each Apply.
   */
  seen: Schema.NullOr(Observed),
  /** Hand changes the last Apply did not see, so its landing leaves them alone. */
  hold: Schema.Array(Schema.String),
  /** Each Mirror Node id, and the settings it keeps as overrides. */
  overrides: Schema.Record(Schema.String, Schema.Array(Schema.String)),
  /** Pulumi: sizes and Autoscaler bounds follow the region's share of users. */
  computed: Schema.Boolean,
  /** Sim time the last Apply lands, or null when none waits. */
  readyAt: Schema.NullOr(Schema.Finite),
  /** Sim time the Mirror first drifted since its last Apply, for GitOps; null when in sync. */
  driftAt: Schema.NullOr(Schema.Finite),
})
export type Mirror = typeof Mirror.Type

/**
 * A bridge investors offer while Cash is short (09 "Runway and running out of
 * Cash"): a grant that covers a few calendar days of Burn, for a slice of
 * Equity. The terms are fixed when the offer arrives, like a term sheet.
 */
export const Bridge = Schema.Struct({
  /** Cash the grant adds. */
  grant: Schema.Finite,
  /** Share of Equity the grant costs, 0 to 1. */
  dilution: Schema.Finite,
})
export type Bridge = typeof Bridge.Type

/** The Autopilot perk's policies (13 "The Legacy shop"): which rules the Company follows. */
export const Policies = Schema.Struct({
  research: Schema.Boolean,
  hire: Schema.Boolean,
  upgrade: Schema.Boolean,
})
export type Policies = typeof Policies.Type

export const DEFAULT_ALERT_RULES: AlertRules = {
  errors: 0.01,
  latency: 4,
  saturation: 0.9,
  queue: 30,
  budget: 10,
}
export const NO_FALSE_ALARMS: FalseAlarms = {
  day: 0,
  errors: 0,
  latency: 0,
  saturation: 0,
  queue: 0,
  budget: 0,
}

/** A box the player drew around some Nodes: a name on the board, and the Nodes it holds. */
export const Box = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  nodes: Schema.Array(Schema.String),
})
export type Box = typeof Box.Type

export const Game = Schema.Struct({
  nodes: Schema.Array(GameNode),
  /** Boxes around Nodes (15 \"The board\"): a Node is in at most one. */
  boxes: Schema.Array(Box).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  links: Schema.Array(GameLink),
  nextId: Schema.Finite,
  cash: Schema.Finite,
  /** The bridge offer waiting for an answer, or null when none waits. */
  bridge: Schema.NullOr(Bridge).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The investors already offered this Company one bridge; they offer no second. */
  bridgeUsed: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Old saves' single Insight balance. Unused: the first Step moves it into `pools`. */
  insight: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  pools: InsightPools.pipe(Schema.withDecodingDefaultKey(Effect.succeed(NO_INSIGHT))),
  /** Studies in order; the first one runs (10 "Studies"). */
  studies: Schema.Array(Study).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  users: Schema.Finite,
  /** Revenue waiting in the Payments drawer. */
  pending: Schema.Finite,
  /** Revenue lost to a full drawer. */
  spilled: Schema.Finite,
  researched: Schema.Array(ResearchId),
  stage: Schema.Finite,
  /** The sim second the current Era began (12 "Annotations"). */
  stageAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  equity: Schema.Finite,
  /** The current Era began with a declined round. */
  declined: Schema.Boolean,
  /** Seconds of simulated time since the company started. */
  time: Schema.Finite,
  seed: Schema.Finite,
  /** Apdex averaged over the last calendar hour. */
  apdex: Schema.Finite,
  /**
   * Each region's share of `users` (04 "Users and growth"). Null keeps the split
   * from before per-region Users: everyone at home, and the catalog's shares from Series C.
   */
  userShares: Schema.NullOr(PerRegion).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** Each region's share of its users who are steady; null reads `1 − FICKLE_SHARE`. */
  steady: Schema.NullOr(PerRegion).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** Apdex of each region's users over the last calendar hour; null reads `apdex` for every region. */
  regionApdex: Schema.NullOr(PerRegion).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  incident: Schema.NullOr(Incident),
  /** The last incident type, so the director does not repeat itself. */
  lastIncident: Schema.NullOr(IncidentId),
  nextIncidentAt: Schema.Finite,
  postmortems: Schema.Array(Postmortem),
  postmortemSeq: Schema.Finite,
  /** Action items from postmortems. Each stays open until its research is owned. */
  openActions: Schema.Array(ResearchId),
  /**
   * The incident kinds the team has handled by hand at least once: what a runbook may be written
   * for (11 "Runbooks"). The postmortem record only holds the last four, so this is permanent.
   */
  handled: Schema.Array(IncidentId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /** The incident kinds a written runbook now resolves with no player action. */
  runbooks: Schema.Array(IncidentId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  alarms: Alarms,
  /** Request kinds users have been served, so the first of each pays Insight once. */
  servedKinds: Schema.Array(RequestKindId).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(['page', 'read'] as const)),
  ),
  alertRules: AlertRules.pipe(Schema.withDecodingDefaultKey(Effect.succeed(DEFAULT_ALERT_RULES))),
  falseAlarms: FalseAlarms.pipe(Schema.withDecodingDefaultKey(Effect.succeed(NO_FALSE_ALARMS))),
  earned: Schema.Finite,
  history: Schema.Array(Sample),
  /**
   * A Board outside any Company: demand is flat, users do not grow or leave,
   * placing costs nothing, and incidents come only from the Sandbox's script.
   */
  sandbox: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  scenario: Schema.optionalKey(Scenario),
  /** Dev Hours no backlog item took, ready to rush any item. */
  devHours: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  engineers: Schema.Array(Engineer).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  hires: Schema.Array(Hire).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  teams: Schema.Array(Team).pipe(Schema.withDecodingDefaultKey(Effect.succeed([CORE_TEAM]))),
  /** Sim time a layoff's hit to morale ends. */
  moraleUntil: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Sim time a Load test's readout ends (08 "Engineering tasks"): every Node at twice the demand. */
  loadTestUntil: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** A Database's resharding in progress (07 "Partitioning"), or null. */
  reshard: Schema.NullOr(Resharding).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** A Database engine change's data copy in progress (08 "Migrations"), or null. */
  engineChange: Schema.NullOr(EngineChange).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
  services: Schema.Array(Service).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed([OLD_MONOLITH])),
  ),
  /** Work in priority order: each team takes the first item no team ahead of it has. */
  backlog: Schema.Array(WorkItem).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  workSeq: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** The CVEs already disclosed, so each one comes once. */
  cves: Schema.Array(Schema.String).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  shipped: Schema.Array(FeatureId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /**
   * A Feature's realized outcome (08 "Outcomes"): the share of its win effect on market, growth,
   * churn, and value that actually lands, rolled when the Feature is queued. A Feature not named
   * here rolled before the mechanic existed, or has not been queued yet, and plays at its full win
   * effect (1), which is what a save from before Outcomes kept.
   */
  outcomes: Schema.Record(Schema.String, Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed({})),
  ),
  /**
   * Each live Feature's adoption share (08 "Adoption"), from 0 at the deploy that ships it to 1. A
   * Feature not named here is fully adopted, which is what a save from before adoption kept.
   */
  adoption: Schema.Record(Schema.String, Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed({})),
  ),
  /** The samples a Feature's A/B test has taken since its current rollout step (08 "Measured lift"). */
  lifts: Schema.Record(Schema.String, LiftSample).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed({})),
  ),
  /** Features built and waiting for the next deploy. */
  awaiting: Schema.Array(FeatureId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /** Idle teams pick the next Feature, shift migrations, and pay down debt on their own. */
  /** Sim time a fake advisory's backdoor went in, or null (18 "Spam and phishing"). */
  backdoorAt: Schema.NullOr(Schema.Finite).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
  /** Research a vendor's demo discounted: each costs less Insight to study. */
  discounts: Schema.Array(ResearchId).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  /** The Autopilot perk's policies, and the sim time the upgrade policy may act again. */
  policies: Policies.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed({ research: false, hire: false, upgrade: false })),
  ),
  policyAt: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  autopilot: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
  deploys: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  badDeploys: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** GB held in Object Storage. */
  stored: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** GB of rows the Databases hold: every write and realtime message adds some (07 "Data volume"). */
  data: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** GB per sim second Object Storage takes in, so Lifecycle rules know an object's age. */
  uploads: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** The last calendar week of requests and failures, by hour: the SLO window. */
  budget: Schema.Array(BudgetHour).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  drill: Schema.NullOr(Drill).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The Company runs scheduled chaos experiments (Chaos engineering). */
  chaos: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** The Node the last experiment hit: the Design's weakest, named for the player (10). */
  weakest: Schema.NullOr(Schema.String).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The current Public quarter; null before the IPO. */
  quarter: Schema.NullOr(Quarter).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  founding: Founding.pipe(Schema.withDecodingDefaultKey(Effect.succeed(DEFAULT_FOUNDING))),
  /** Legacy this Company already paid: the IPO pays at listing, and Step down pays the rest. */
  banked: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** The most users the Company ever had. */
  peak: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** The IaC tool and GitOps mode. Absent until the Company picks a tool. */
  iac: Schema.optionalKey(Infra),
  /** Regions built from another region (05 "Mirror a region"). Absent until the first Mirror. */
  mirrors: Schema.optionalKey(Schema.Array(Mirror)),
  /** Wall-clock milliseconds of the last save, written by the browser for offline progress. */
  wall: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
})
export type Game = typeof Game.Type
