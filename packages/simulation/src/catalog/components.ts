/* The Components a player can place, and how Analytics samples. */

import { COMPONENT_DEFS } from '../components/defs.ts'
import type { Kind, RequestKind } from './kinds.ts'
import type { ResearchId } from './research.ts'

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

/** The Components that terminate TLS, so each one holds a certificate of its own (05). */
export const TLS_TERMINATORS: ReadonlyArray<ComponentId> = ['lb', 'cdn', 'waf', 'gw', 'ws', 'edge']

export const COMPONENTS: Record<ComponentId, ComponentDef> = COMPONENT_DEFS

/** Milliseconds a request crosses the internet to reach the origin. A CDN edge sits closer. */
export const INTERNET_MS = 30

/** MB in one uploaded file (04 "Request kinds"). */
export const UPLOAD_MB = 2

export const EGRESS_ORIGIN = 0.09
export const EGRESS_CDN = 0.02

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

/** Tokens in one AI prompt and its answer.  */
export const TOKENS_PER_PROMPT = 400

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
 * Share of search answers that are stale because a dual write lost its publish (07 "Keeping
 * copies in sync"). A Transactional outbox shrinks it to a relay's lag window; a CDC Connector
 * shrinks it to its own lag, and drops push it back up when the connector is overloaded.
 */
export const DUAL_WRITE_STALE = 0.005
/** Stale share a Transactional outbox leaves: the change lands, after a relay's lag. */
export const OUTBOX_STALE = 0.0005
/** Base stale share a healthy CDC Connector leaves: its processing lag. */
export const CDC_LAG_STALE = 0.0002
/** Extra stale share when a CDC Connector drops every change it cannot keep up with. */
export const CDC_DROP_STALE = 0.005
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

/** Insight the first successful request of a new kind teaches, once, to that kind's pool (16 D14). */
export const FIRST_KIND_INSIGHT = 20
/** Insight per second from one Component type and kind: this × √(sampled requests per second). */
export const INSIGHT_YIELD = 1
/** Failed and frustrated samples teach this many times more: a healthy Design fails rarely. */
export const FAILURE_YIELD = 3
/** A pool's cap never falls below this, so a new pool can hold its first grant. */
export const POOL_FLOOR = 100

/** A spread store replicates to at most this many regions. */
export const SPREAD_REGIONS = 3
/** KB one replica write moves across regions to keep a spread store in sync. */
export const SPREAD_REPLICATION_KB = 1
/** Stale share from cross-region replication lag on a spread Wide-column Store (LOCAL_QUORUM). */
export const WIDE_SPREAD_LAG_STALE = 0.015
/** Calendar minutes a Wide-column Store spends rebalancing one GB when its size or replication changes. */
export const WIDE_REBALANCE_MINUTES_PER_GB = 0.4
/** Calendar minutes a Document Store spends rebalancing one GB when its size changes. */
export const DOC_REBALANCE_MINUTES_PER_GB = 0.4
/** Calendar minutes an Event Stream spends copying one GB when its replication factor changes. */
export const LOG_REPLICATE_MINUTES_PER_GB = 0.25

/** During a hot key, this share of reads asks for one key, which lives on one shard (07 "Fan-out"). */
export const HOT_KEY_SHARE = 0.3

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

/** Share of its `q-read` calls an App Server behind a sticky Load Balancer answers from its own memory. */
export const STICKY_LOCAL_READ = 0.15
/** Share of the realtime reconnect wave a Hub behind a sticky Load Balancer takes back on its own box. */
export const STICKY_HERD = 0.5

export {
  SERVERLESS_MS,
  SERVERLESS_REQUEST_PRICE,
  SERVERLESS_GB_SECOND,
  SERVERLESS_MEMORY_GB,
  SERVERLESS_CONCURRENCY,
  SERVERLESS_IDLE_SECONDS,
  COLD_START_MS,
  NATIVE_COLD_MS,
  FUNCTION_LIMIT_MS,
  EXPORT_MS_PER_GB,
} from '../components/fn.ts'
export {
  EDGE_MS,
  EDGE_REQUEST_PRICE,
  EDGE_CPU_MS,
  EDGE_MEMORY_MB,
  EDGE_LANGUAGES,
  EDGE_READ_HIT,
} from '../components/edge.ts'
export {
  DOC_OPS,
  DOC_JOIN_COST,
  DOC_OP_MS,
  DOC_TXN_LATENCY,
  DOC_PARTIAL,
  DOC_PATTERN_FACTOR,
  DOC_SHAPE_DH,
} from '../components/doc.ts'
export { VEC_QUERIES, VEC_INDEXES, VEC_AI_LIFT } from '../components/vec.ts'
export {
  LOG_RATE,
  LOG_READ_RATE,
  LOG_PARTITIONS,
  LOG_ACKS,
  LOG_RETENTION,
  LOG_REPLICA_BURN,
  LOG_REPLICAS,
  LOG_LOSS,
} from '../components/log.ts'
export { CDC_MS, CDC_RATE, CDC_CHANGES } from '../components/cdc.ts'
export { MESH_HOP_MS, MESH_OVERHEAD, MESH_INSIGHT, MESH_TAX } from '../components/mesh.ts'
export { ROLLOUT_STEPS, ROLLOUT_ALL } from '../components/ff.ts'
export {
  CERT_DAYS,
  CERT_DAYS_SHORT,
  CERT_FROM_STAGE,
  CERT_SHORT_FROM,
  CERT_RENEW,
} from '../components/pki.ts'
export {
  LB_POLICIES,
  P2C_CAPACITY,
  P2C_IMBALANCE,
  CHECK_INTERVALS,
  L4_CAPACITY,
  L4_MS,
  L4_BURN,
  LB_VARIANTS,
  type LbVariant,
  STICKY_SHARE,
  STICKY_DECAY,
} from '../components/lb.ts'
export { DNS_TTLS } from '../components/dns.ts'
export {
  CACHE_ENGINES,
  CACHE_TTLS,
  HOT_KB_PER_USER,
  CACHE_OPS,
  WRITE_BEHIND_SECONDS,
  CACHE_STRATEGIES,
  COALESCED,
  WARMED,
  EARLY_LIFT,
  EARLY_REFRESH,
} from '../components/cache.ts'
export {
  CDN_HIT,
  TIERED_MEDIA_HIT,
  CDN_TTLS,
  ESI_PAGE_HIT,
  STALE_AFTER_DEPLOY,
  CACHE_KEYS,
} from '../components/cdn.ts'
export { PARANOIA, UNDER_ATTACK, BOT_MANAGEMENT_FALSE } from '../components/waf.ts'
export {
  QUEUE_RATE,
  BACKLOG_MS,
  DRAIN_SECONDS,
  MAX_ATTEMPTS,
  FOREVER_ATTEMPTS,
  QUEUE_LENGTHS,
  QUEUE_MESSAGE_PRICE,
} from '../components/queue.ts'
export { POISON_SHARE, TASK_RETRY_SECONDS, PREFETCH, FETCH_MS } from '../components/worker.ts'
export { HUB_RAM_KB, PRESENCE_CPU, PRESENCE_VALUE, HERD_REFUSED } from '../components/ws.ts'
export {
  SEARCH_QPS,
  SEARCH_REFRESH,
  SEARCH_SHARDS,
  SEARCH_REPLICAS,
  SEARCH_FANOUT,
  SEARCH_HEAPS,
  SEARCH_VARIANTS,
  SEARCH_INDEX_SHARE,
} from '../components/search.ts'
export {
  STORAGE_PRICE,
  STORAGE_CLASSES,
  LIFECYCLE_DAYS,
  R2_FIRST_BYTE_MS,
  STORE_VARIANTS,
} from '../components/storage.ts'
export {
  DB_ENGINES,
  STORAGE_IOPS,
  SHARD_COUNTS,
  DB_RETENTIONS,
  ROW_KB,
  DB_STORAGE_MULT,
  RESTORE_FAILURE,
  RESTORE_DRILL_DH,
  diskMs,
  MATERIALIZED_SCAN,
  MATERIALIZED_STALE,
  DENORMALIZED_READ,
  DENORMALIZED_WRITE,
  BACKUPS,
  SHARD_KEYS,
  SCATTER_CPU,
  SCATTER_MS,
  DISTRIBUTED_TX_FAILURE,
  RESHARD_DH,
  RESHARD_IOPS,
  RESHARD_MINUTES_PER_GB,
  ONLINE_MIGRATION_DH,
  EXPAND_CONTRACT_DH,
  INDEX_WRITE_COST,
  RESTORE_MINUTES_PER_GB,
  RESTORE_MIN_MINUTES,
  MIGRATION_LOCK_PER_GB,
  MULTI_WRITE_CPU,
  MULTI_CONFLICT,
} from '../components/database.ts'
export { PSP_RATE, PSP_FIXED, SECOND_PROVIDER_FEE, PSP_CAPACITY } from '../components/psp.ts'
export {
  GATEWAY_PRICE,
  GATEWAY_LIMITS,
  GATEWAY_BURST,
  GATEWAY_AUTH_MS,
  COALESCE_KINDS,
  COALESCE_HOT,
  COALESCE_WINDOW,
} from '../components/gw.ts'
export {
  VM_REACTION,
  POD_REACTION,
  SCALE_COOLDOWN,
  SCALE_TARGETS,
  SCALE_MINIMA,
  SCALE_MAXIMA,
  SCALE_IN,
  SCHEDULE_LEAD_MINUTES,
  SCALE_RPS_PER_VCPU,
  SCALE_QUEUE_DEPTH,
} from '../components/autoscaler.ts'
export {
  POD_BURN,
  NOISY_SHARE,
  NOISY_MS,
  POD_RESCHEDULE,
  UPGRADE_CRASHES,
  SUPPORTED_QUARTERS,
  PLATFORM_TAX,
} from '../components/cluster.ts'
export {
  ROLLOUT_SHARE,
  DEPLOY_STRATEGY_IDS,
  type DeployStrategyId,
  type DeployStrategyDef,
  DEPLOY_STRATEGIES,
  STRATEGY_RESEARCH,
} from '../components/ci.ts'
export { SCAN_PRICE } from '../components/warehouse.ts'
export {
  GPU_TYPES,
  GPU_MODELS,
  type GpuModel,
  GPU_CACHE_GB,
  GPU_FIRST_TOKEN_MS,
  GPU_PRECISIONS,
  type GpuPrecision,
  GPU_BATCHES,
} from '../components/gpu.ts'
export { LLM_FIRST_TOKEN_MS, LLM_PRICE, LLM_RATE } from '../components/llm.ts'
export { AUTH_PRICE_PER_USER } from '../components/auth.ts'
export {
  SAMPLE_RATES,
  SAMPLE_OVERHEAD,
  SAMPLE_LATENCY,
  SAMPLE_STORAGE,
  RETENTION_WINDOWS,
  RETENTION_STORAGE,
  ANALYTICS_CAPACITY,
} from '../components/analytics.ts'
export { MSGP_RATE, MSGP_PRICE } from '../components/msgp.ts'
export {
  WIDE_OPS,
  QUORUM_N,
  WIDE_STALE,
  WIDE_TX_STALE,
  WIDE_TX_DUPLICATE,
} from '../components/wide.ts'
export { DSQL_TX, DSQL_READ_COST } from '../components/dsql.ts'
export { SYNC_MS, REPLICA_SYNC_MINUTES_PER_GB } from '../components/replica.ts'
export { SEARCH_COPY_MINUTES_PER_GB } from '../components/search.ts'

/** Sim seconds a Feature Flag change takes to propagate to every server (05 "Feature Flags"). */
export const FLAG_PROPAGATION_SECONDS = 2
