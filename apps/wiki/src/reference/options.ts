import {
  BACKUPS,
  CACHE_ENGINES,
  CACHE_KEYS,
  CACHE_STRATEGIES,
  CACHE_TTLS,
  CDN_TTLS,
  CHECK_INTERVALS,
  COLLECTORS,
  DB_ENGINES,
  DB_RETENTIONS,
  DEPLOY_STRATEGIES,
  DEPLOY_STRATEGY_IDS,
  DNS_TTLS,
  FRAMEWORK_IDS,
  GATEWAY_BURST,
  GATEWAY_LIMITS,
  GOGC,
  GPU_BATCHES,
  GPU_MODELS,
  GPU_PRECISIONS,
  GPU_TYPES,
  LIFECYCLE_DAYS,
  LB_POLICIES,
  LB_VARIANTS,
  LOG_ACKS,
  LOG_PARTITIONS,
  LOG_REPLICAS,
  LOG_RETENTION,
  MAX_ATTEMPTS,
  PARANOIA,
  PM_MODES,
  PREFETCH,
  QUORUM_N,
  QUEUE_LENGTHS,
  RESEARCH,
  ROLLOUT_STEPS,
  RUNTIME_IDS,
  SAMPLE_RATES,
  SCALE_MAXIMA,
  SCALE_MINIMA,
  SCALE_TARGETS,
  SEARCH_HEAPS,
  SEARCH_REFRESH,
  SEARCH_REPLICAS,
  SEARCH_SHARDS,
  SEARCH_VARIANTS,
  SHARD_COUNTS,
  SHARD_KEYS,
  STORAGE_CLASSES,
  STORAGE_IOPS,
  STORE_VARIANTS,
  VEC_INDEXES,
  type ComponentId,
  type ResearchId,
} from '@quorum/simulation/catalog'

/* The controls each Component adds to its Inspector, and the values they offer, read from the
   catalog. An authored `## Options` section on the Component page explains what each one does. */

export type OptionControl = Readonly<{
  /** The control's name, as the page names it. */
  name: string
  /** The values it offers, as the catalog defines them. */
  settings: string
  /** When the Inspector shows it, or which Nodes and Stacks it applies to. */
  shown: string
}>

const list = (values: ReadonlyArray<string | number>): string => values.join(' / ')
const percent = (share: number): string => `${Math.round(share * 100)}%`
const clock = (value: number): string =>
  value >= 3_600 ? `${value / 3_600} h` : value >= 60 ? `${value / 60} min` : `${value} s`
const thousands = (value: number): string => (value >= 1_000 ? `${value / 1_000}k` : String(value))
/** Sim seconds as a calendar reads them: one sim second is one calendar minute. */
const calendar = (seconds: number): string =>
  seconds >= 1_440
    ? `${Math.round((seconds / 1_440) * 10) / 10} d`
    : `${Math.round(seconds / 60)} h`
const after = (id: ResearchId): string => `After ${RESEARCH[id].name}`

/** The Stack section App Servers and Workers share. */
const stack: ReadonlyArray<OptionControl> = [
  { name: 'Runtime', settings: `${RUNTIME_IDS.length} runtimes`, shown: 'Always' },
  { name: 'Framework', settings: `${FRAMEWORK_IDS.length - 1} frameworks`, shown: 'Always' },
  { name: 'Pool size', settings: '1 worker and up', shown: 'Pooled runtimes' },
  {
    name: 'Process manager',
    settings: list(Object.values(PM_MODES).map((mode) => mode.label)),
    shown: 'PHP-FPM',
  },
  { name: 'Recycle workers', settings: 'Off / Every few hours', shown: 'Persistent runtimes' },
  { name: 'Compression', settings: 'Off / Gzip', shown: after('gzip') },
  { name: 'Service', settings: 'Any Service', shown: 'Two or more Services' },
]

export const OPTION_CONTROLS: Partial<Record<ComponentId, ReadonlyArray<OptionControl>>> = {
  server: [
    ...stack,
    {
      name: 'Collector',
      settings: list(Object.values(COLLECTORS).map((collector) => collector.label)),
      shown: 'Java',
    },
    { name: 'GOGC', settings: list(GOGC.map((entry) => entry.gogc)), shown: after('gogc-tuning') },
    { name: 'Shedding', settings: 'Drop evenly / Shed low value', shown: after('load-shedding') },
    {
      name: 'Degradation',
      settings: 'Keep kinds / Drop dearest',
      shown: after('graceful-degradation'),
    },
    {
      name: 'Read your writes',
      settings: 'Reads anywhere / Read your writes',
      shown: after('ryw-routing'),
    },
    { name: 'Feeds', settings: 'Pull / Push', shown: 'Two open regions' },
  ],
  worker: [
    ...stack,
    {
      name: 'Prefetch',
      settings: list(PREFETCH),
      shown: 'Always',
    },
  ],
  lb: [
    {
      name: 'Variant',
      settings: list(Object.values(LB_VARIANTS).map((variant) => variant.name)),
      shown: 'Always',
    },
    {
      name: 'Policy',
      settings: list(Object.values(LB_POLICIES).map((policy) => policy.label)),
      shown: 'Always',
    },
    { name: 'Sessions', settings: 'Balanced / Sticky', shown: 'Always' },
    { name: 'Slow start', settings: 'Off / On', shown: 'Always' },
    {
      name: 'Health checks',
      settings: list(CHECK_INTERVALS.map((seconds) => `${seconds} s`)),
      shown: 'Always',
    },
    { name: 'Deep check', settings: 'Shallow / Deep', shown: 'Always' },
  ],
  autoscaler: [
    { name: 'Signal', settings: 'CPU / Load / Requests / Queue depth', shown: 'Always' },
    { name: 'Target', settings: list(SCALE_TARGETS.map(percent)), shown: 'Always' },
    { name: 'Min copies', settings: list(SCALE_MINIMA), shown: 'Always' },
    {
      name: 'Max copies',
      settings: list(SCALE_MAXIMA.map((copies) => (copies === 0 ? 'No max' : copies))),
      shown: 'Always',
    },
    { name: 'Schedule', settings: 'On load / Ahead of the peak', shown: 'Always' },
  ],
  dns: [{ name: 'TTL', settings: list(DNS_TTLS.map(clock)), shown: after('health-checks') }],
  cdn: [
    { name: 'TTL', settings: list(CDN_TTLS.map((entry) => clock(entry.ttl))), shown: 'Always' },
    { name: 'Purge on deploy', settings: 'Keep until the TTL / Purge', shown: 'Always' },
    {
      name: 'Cache key',
      settings: list(Object.values(CACHE_KEYS).map((key) => key.name)),
      shown: 'Always',
    },
  ],
  waf: [
    { name: 'Paranoia', settings: list(PARANOIA.map((entry) => entry.level)), shown: 'Always' },
    { name: 'Under attack', settings: 'Normal / Under attack', shown: 'Always' },
  ],
  gw: [
    {
      name: 'Rate limit',
      settings: list(GATEWAY_LIMITS.map((limit) => (limit === 0 ? 'Off' : thousands(limit)))),
      shown: 'Always',
    },
    {
      name: 'Burst',
      settings: `Flat cap / Token bucket of ${thousands(GATEWAY_BURST)}`,
      shown: 'Always',
    },
    { name: 'Auth', settings: 'Services check / Auth at the edge', shown: 'Always' },
    { name: 'Coalescing', settings: 'Every read goes on / Request coalescing', shown: 'Always' },
    { name: 'Routes', settings: 'Every kind, or a subset for each Link', shown: 'Always' },
  ],
  cache: [
    {
      name: 'Strategy',
      settings: list(Object.values(CACHE_STRATEGIES).map((strategy) => strategy.name)),
      shown: 'Always',
    },
    { name: 'Coalesce', settings: 'Every miss / Coalesce', shown: after('stampede-protection') },
    {
      name: 'Early expiry',
      settings: 'Expire on the TTL / Refresh early',
      shown: after('stampede-protection'),
    },
    {
      name: 'Stale while revalidating',
      settings: 'Miss on expiry / Serve stale',
      shown: after('stampede-protection'),
    },
    { name: 'Warming', settings: 'Cold start / Warm start', shown: after('cache-warming') },
    {
      name: 'Engine',
      settings: list(Object.values(CACHE_ENGINES).map((engine) => engine.name)),
      shown: 'Always',
    },
    { name: 'TTL', settings: list(CACHE_TTLS.map((entry) => clock(entry.ttl))), shown: 'Always' },
    { name: 'Hot keys', settings: 'One shard / Split', shown: after('hybrid-fanout') },
  ],
  analytics: [{ name: 'Sample rate', settings: list(SAMPLE_RATES.map(percent)), shown: 'Always' }],
  ci: [
    {
      name: 'Deploy strategy',
      settings: list(DEPLOY_STRATEGY_IDS.map((id) => DEPLOY_STRATEGIES[id].name)),
      shown: 'Always',
    },
  ],
  ff: [
    {
      name: 'Rollout',
      settings: list(ROLLOUT_STEPS.map((share) => (share <= 0 ? 'Off' : percent(share)))),
      shown: 'Always',
    },
  ],
  database: [
    {
      name: 'Engine',
      settings: list(Object.values(DB_ENGINES).map((engine) => engine.name)),
      shown: 'Always',
    },
    {
      name: 'Volume',
      settings: list(Object.values(STORAGE_IOPS).map((volume) => volume.name)),
      shown: 'Always',
    },
    { name: 'Shards', settings: list(SHARD_COUNTS), shown: 'Always' },
    {
      name: 'Shard key',
      settings: list(Object.values(SHARD_KEYS).map((key) => key.name)),
      shown: 'Two or more shards',
    },
    { name: 'Reports', settings: 'Scan the table / Materialized view', shown: 'Always' },
    {
      name: 'Retention',
      settings: list(Object.values(DB_RETENTIONS).map((entry) => entry.name)),
      shown: 'Always',
    },
    {
      name: 'Backups',
      settings: list(Object.values(BACKUPS).map((backup) => backup.name)),
      shown: after('pitr'),
    },
  ],
  replica: [
    {
      name: 'Engine',
      settings: list(Object.values(DB_ENGINES).map((engine) => engine.name)),
      shown: 'Always',
    },
    { name: 'Replication', settings: 'Asynchronous / Synchronous', shown: 'Always' },
  ],
  doc: [{ name: 'Transactions', settings: 'One document / Multi-document', shown: 'Always' }],
  dsql: [{ name: 'Regions', settings: 'One / Spread', shown: 'Two open regions' }],
  wide: [
    { name: 'Replicas (N)', settings: list(QUORUM_N.map((n) => `N${n}`)), shown: 'Always' },
    { name: 'Writes (W)', settings: list(QUORUM_N.map((n) => `W${n}`)), shown: 'Always' },
    { name: 'Reads (R)', settings: list(QUORUM_N.map((n) => `R${n}`)), shown: 'Always' },
    { name: 'Hot keys', settings: 'One shard / Split', shown: after('hybrid-fanout') },
    { name: 'Regions', settings: 'One / Spread', shown: 'Two open regions' },
  ],
  gpu: [
    {
      name: 'GPU',
      settings: list(Object.values(GPU_TYPES).map((gpu) => gpu.name)),
      shown: 'Always',
    },
    {
      name: 'Model',
      settings: list(Object.values(GPU_MODELS).map((model) => model.name)),
      shown: 'Always',
    },
    {
      name: 'Precision',
      settings: list(Object.values(GPU_PRECISIONS).map((precision) => precision.name)),
      shown: 'Always',
    },
    { name: 'Batch', settings: list(GPU_BATCHES.map((entry) => entry.batch)), shown: 'Always' },
  ],
  log: [
    { name: 'Partitions', settings: list(LOG_PARTITIONS), shown: 'Always' },
    { name: 'Partition key', settings: 'Keyed / Round robin', shown: 'Always' },
    {
      name: 'Acknowledgements',
      settings: list(Object.values(LOG_ACKS).map((acks) => acks.name)),
      shown: 'Always',
    },
    { name: 'Replicas', settings: list(LOG_REPLICAS), shown: 'Always' },
    { name: 'Retention', settings: list(LOG_RETENTION.map(calendar)), shown: 'Always' },
  ],
  queue: [
    { name: 'Dead-letter queue', settings: 'Retry forever / Dead-letter queue', shown: 'Always' },
    { name: 'Max attempts', settings: list(MAX_ATTEMPTS), shown: 'With a dead-letter queue' },
    {
      name: 'Max length',
      settings: list(QUEUE_LENGTHS.map((length) => (length === 0 ? 'None' : thousands(length)))),
      shown: 'Always',
    },
  ],
  search: [
    {
      name: 'Product',
      settings: list(Object.values(SEARCH_VARIANTS).map((variant) => variant.name)),
      shown: 'Always',
    },
    {
      name: 'Refresh',
      settings: list(SEARCH_REFRESH.map((entry) => clock(entry.seconds))),
      shown: 'Always',
    },
    { name: 'Shards', settings: list(SEARCH_SHARDS), shown: 'Elasticsearch and OpenSearch' },
    { name: 'Replicas', settings: list(SEARCH_REPLICAS), shown: 'Elasticsearch and OpenSearch' },
    {
      name: 'Heap',
      settings: list(Object.values(SEARCH_HEAPS).map((heap) => heap.name)),
      shown: 'Elasticsearch and OpenSearch',
    },
  ],
  storage: [
    {
      name: 'Product',
      settings: list(Object.values(STORE_VARIANTS).map((product) => product.name)),
      shown: 'Always',
    },
    {
      name: 'Class',
      settings: list(Object.values(STORAGE_CLASSES).map((entry) => entry.name)),
      shown: 'Always',
    },
    {
      name: 'Lifecycle',
      settings: list(LIFECYCLE_DAYS.map((days) => (days === 0 ? 'Off' : `${days} d`))),
      shown: 'Always',
    },
  ],
  vec: [
    {
      name: 'Index',
      settings: list(Object.values(VEC_INDEXES).map((index) => index.name)),
      shown: 'Always',
    },
  ],
  psp: [{ name: 'Provider', settings: 'First provider / Second provider', shown: 'Always' }],
  pooler: [{ name: 'Mode', settings: 'Session / Transaction / Statement', shown: 'Always' }],
  ws: [
    { name: 'Runtime', settings: `${RUNTIME_IDS.length} runtimes`, shown: 'Always' },
    { name: 'Presence', settings: 'No presence / Presence', shown: 'Always' },
    {
      name: 'Reconnect backoff',
      settings: 'Reconnect at once / Backoff with jitter',
      shown: 'Always',
    },
    { name: 'Clustering', settings: 'One box / Clustered', shown: 'Always' },
  ],
}
