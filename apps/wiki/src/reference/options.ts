import {
  CACHE_ENGINES,
  CACHE_TTLS,
  CDN_TTLS,
  CHECK_INTERVALS,
  DB_ENGINES,
  DEPLOY_STRATEGY_IDS,
  DNS_TTLS,
  FRAMEWORK_IDS,
  GATEWAY_BURST,
  GATEWAY_LIMITS,
  GOGC,
  GPU_BATCHES,
  GPU_PRECISIONS,
  GPU_TYPES,
  LIFECYCLE_DAYS,
  LB_VARIANTS,
  LOG_PARTITIONS,
  LOG_REPLICAS,
  LOG_RETENTION,
  MAX_ATTEMPTS,
  PARANOIA,
  PREFETCH,
  QUORUM_N,
  QUEUE_LENGTHS,
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
  STORE_VARIANTS,
  type ComponentId,
  type ResearchId,
} from '@quorum/simulation/catalog'
import type { Lang } from '../i18n/lang.ts'

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

/** The controls of every Component that has any, in the language of the page. */
export const optionControls = (
  l: Lang,
): Partial<Record<ComponentId, ReadonlyArray<OptionControl>>> => {
  const o = l.t.options
  const after = (id: ResearchId): string => o.after(l.cat.RESEARCH[id].name)
  const {
    BACKUPS: backups,
    CACHE_KEYS: cacheKeys,
    CACHE_STRATEGIES: cacheStrategies,
    COLLECTORS: collectors,
    DB_RETENTIONS: dbRetentions,
    DEPLOY_STRATEGIES: deployStrategies,
    GPU_MODELS: gpuModels,
    LB_POLICIES: lbPolicies,
    LOG_ACKS: logAcks,
    PM_MODES: pmModes,
    SHARD_KEYS: shardKeys,
    STORAGE_CLASSES: storageClasses,
    STORAGE_IOPS: storageIops,
    VEC_INDEXES: vecIndexes,
  } = l.cat
  /** The Stack section App Servers and Workers share. */
  const stack: ReadonlyArray<OptionControl> = [
    { name: o.runtime, settings: o.runtimeCount(RUNTIME_IDS.length), shown: o.always },
    { name: o.framework, settings: o.frameworkCount(FRAMEWORK_IDS.length - 1), shown: o.always },
    { name: o.poolSize, settings: o.workerAndUp, shown: o.pooledRuntimes },
    {
      name: o.processManager,
      settings: list(Object.values(pmModes).map((mode) => mode.label)),
      shown: o.phpFpm,
    },
    { name: o.recycleWorkers, settings: o.offEveryFewHours, shown: o.persistentRuntimes },
    { name: o.compression, settings: o.offGzip, shown: after('gzip') },
    { name: o.service, settings: o.anyService, shown: o.twoServices },
  ]

  return {
    server: [
      ...stack,
      {
        name: o.collector,
        settings: list(Object.values(collectors).map((collector) => collector.label)),
        shown: o.java,
      },
      {
        name: o.gogc,
        settings: list(GOGC.map((entry) => entry.gogc)),
        shown: after('gogc-tuning'),
      },
      { name: o.shedding, settings: o.dropEvenly, shown: after('load-shedding') },
      { name: o.degradation, settings: o.keepKinds, shown: after('graceful-degradation') },
      { name: o.readYourWrites, settings: o.readsAnywhere, shown: after('ryw-routing') },
      { name: o.feeds, settings: o.pullPush, shown: o.twoOpenRegions },
    ],
    worker: [...stack, { name: o.prefetch, settings: list(PREFETCH), shown: o.always }],
    lb: [
      {
        name: o.variant,
        settings: list(Object.values(LB_VARIANTS).map((variant) => variant.name)),
        shown: o.always,
      },
      {
        name: o.policy,
        settings: list(Object.values(lbPolicies).map((policy) => policy.label)),
        shown: o.always,
      },
      { name: o.sessions, settings: o.balancedSticky, shown: o.always },
      { name: o.slowStart, settings: o.offOn, shown: o.always },
      {
        name: o.healthChecks,
        settings: list(CHECK_INTERVALS.map((seconds) => `${seconds} s`)),
        shown: o.always,
      },
      { name: o.deepCheck, settings: o.shallowDeep, shown: o.always },
    ],
    autoscaler: [
      { name: o.signal, settings: o.signals, shown: o.always },
      { name: o.target, settings: list(SCALE_TARGETS.map(percent)), shown: o.always },
      { name: o.minCopies, settings: list(SCALE_MINIMA), shown: o.always },
      {
        name: o.maxCopies,
        settings: list(SCALE_MAXIMA.map((copies) => (copies === 0 ? o.noMax : copies))),
        shown: o.always,
      },
      { name: o.schedule, settings: o.onLoadAhead, shown: o.always },
    ],
    dns: [{ name: o.ttl, settings: list(DNS_TTLS.map(clock)), shown: after('health-checks') }],
    cdn: [
      { name: o.ttl, settings: list(CDN_TTLS.map((entry) => clock(entry.ttl))), shown: o.always },
      { name: o.purgeOnDeploy, settings: o.keepOrPurge, shown: o.always },
      {
        name: o.cacheKey,
        settings: list(Object.values(cacheKeys).map((key) => key.name)),
        shown: o.always,
      },
    ],
    waf: [
      { name: o.paranoia, settings: list(PARANOIA.map((entry) => entry.level)), shown: o.always },
      { name: o.underAttack, settings: o.normalUnderAttack, shown: o.always },
    ],
    gw: [
      {
        name: o.rateLimit,
        settings: list(GATEWAY_LIMITS.map((limit) => (limit === 0 ? o.off : thousands(limit)))),
        shown: o.always,
      },
      {
        name: o.burst,
        settings: o.flatOrBucket(thousands(GATEWAY_BURST)),
        shown: o.always,
      },
      { name: o.auth, settings: o.servicesCheck, shown: o.always },
      { name: o.coalescing, settings: o.everyReadGoesOn, shown: o.always },
      { name: o.routes, settings: o.everyKindOrSubset, shown: o.always },
    ],
    cache: [
      {
        name: o.strategy,
        settings: list(Object.values(cacheStrategies).map((strategy) => strategy.name)),
        shown: o.always,
      },
      { name: o.coalesce, settings: o.everyMiss, shown: after('stampede-protection') },
      { name: o.earlyExpiry, settings: o.expireOnTtl, shown: after('stampede-protection') },
      {
        name: o.staleWhileRevalidating,
        settings: o.missOrServeStale,
        shown: after('stampede-protection'),
      },
      { name: o.warming, settings: o.coldWarm, shown: after('cache-warming') },
      {
        name: o.engine,
        settings: list(Object.values(CACHE_ENGINES).map((engine) => engine.name)),
        shown: o.always,
      },
      { name: o.ttl, settings: list(CACHE_TTLS.map((entry) => clock(entry.ttl))), shown: o.always },
      { name: o.hotKeys, settings: o.oneShardSplit, shown: after('hybrid-fanout') },
    ],
    analytics: [{ name: o.sampleRate, settings: list(SAMPLE_RATES.map(percent)), shown: o.always }],
    ci: [
      {
        name: o.deployStrategy,
        settings: list(DEPLOY_STRATEGY_IDS.map((id) => deployStrategies[id].name)),
        shown: o.always,
      },
    ],
    ff: [
      {
        name: o.rollout,
        settings: list(ROLLOUT_STEPS.map((share) => (share <= 0 ? o.off : percent(share)))),
        shown: o.always,
      },
    ],
    database: [
      {
        name: o.engine,
        settings: list(Object.values(DB_ENGINES).map((engine) => engine.name)),
        shown: o.always,
      },
      {
        name: o.volume,
        settings: list(Object.values(storageIops).map((volume) => volume.name)),
        shown: o.always,
      },
      { name: o.shards, settings: list(SHARD_COUNTS), shown: o.always },
      {
        name: o.shardKey,
        settings: list(Object.values(shardKeys).map((key) => key.name)),
        shown: o.twoShardsShown,
      },
      { name: o.reports, settings: o.scanOrView, shown: o.always },
      {
        name: o.retention,
        settings: list(Object.values(dbRetentions).map((entry) => entry.name)),
        shown: o.always,
      },
      {
        name: o.backups,
        settings: list(Object.values(backups).map((backup) => backup.name)),
        shown: after('pitr'),
      },
    ],
    replica: [
      {
        name: o.engine,
        settings: list(Object.values(DB_ENGINES).map((engine) => engine.name)),
        shown: o.always,
      },
      { name: o.replication, settings: o.asyncSync, shown: o.always },
    ],
    doc: [{ name: o.transactions, settings: o.oneDocMulti, shown: o.always }],
    dsql: [{ name: o.regions, settings: o.oneSpread, shown: o.twoOpenRegions }],
    wide: [
      { name: o.replicasN, settings: list(QUORUM_N.map((n) => `N${n}`)), shown: o.always },
      { name: o.writesW, settings: list(QUORUM_N.map((n) => `W${n}`)), shown: o.always },
      { name: o.readsR, settings: list(QUORUM_N.map((n) => `R${n}`)), shown: o.always },
      { name: o.hotKeys, settings: o.oneShardSplit, shown: after('hybrid-fanout') },
      { name: o.regions, settings: o.oneSpread, shown: o.twoOpenRegions },
    ],
    gpu: [
      {
        name: o.gpu,
        settings: list(Object.values(GPU_TYPES).map((gpu) => gpu.name)),
        shown: o.always,
      },
      {
        name: o.model,
        settings: list(Object.values(gpuModels).map((model) => model.name)),
        shown: o.always,
      },
      {
        name: o.precision,
        settings: list(Object.values(GPU_PRECISIONS).map((precision) => precision.name)),
        shown: o.always,
      },
      { name: o.batch, settings: list(GPU_BATCHES.map((entry) => entry.batch)), shown: o.always },
    ],
    log: [
      { name: o.partitions, settings: list(LOG_PARTITIONS), shown: o.always },
      { name: o.partitionKey, settings: o.keyedRoundRobin, shown: o.always },
      {
        name: o.acknowledgements,
        settings: list(Object.values(logAcks).map((acks) => acks.name)),
        shown: o.always,
      },
      { name: o.replicas, settings: list(LOG_REPLICAS), shown: o.always },
      { name: o.retention, settings: list(LOG_RETENTION.map(calendar)), shown: o.always },
    ],
    queue: [
      { name: o.deadLetterQueue, settings: o.retryOrDlq, shown: o.always },
      { name: o.maxAttempts, settings: list(MAX_ATTEMPTS), shown: o.withDlq },
      {
        name: o.maxLength,
        settings: list(QUEUE_LENGTHS.map((length) => (length === 0 ? o.none : thousands(length)))),
        shown: o.always,
      },
    ],
    search: [
      {
        name: o.product,
        settings: list(Object.values(SEARCH_VARIANTS).map((variant) => variant.name)),
        shown: o.always,
      },
      {
        name: o.refresh,
        settings: list(SEARCH_REFRESH.map((entry) => clock(entry.seconds))),
        shown: o.always,
      },
      { name: o.shards, settings: list(SEARCH_SHARDS), shown: o.searchEngines },
      { name: o.replicas, settings: list(SEARCH_REPLICAS), shown: o.searchEngines },
      {
        name: o.heap,
        settings: list(Object.values(SEARCH_HEAPS).map((heap) => heap.name)),
        shown: o.searchEngines,
      },
    ],
    storage: [
      {
        name: o.product,
        settings: list(Object.values(STORE_VARIANTS).map((product) => product.name)),
        shown: o.always,
      },
      {
        name: o.class,
        settings: list(Object.values(storageClasses).map((entry) => entry.name)),
        shown: o.always,
      },
      {
        name: o.lifecycle,
        settings: list(LIFECYCLE_DAYS.map((days) => (days === 0 ? o.off : `${days} d`))),
        shown: o.always,
      },
    ],
    vec: [
      {
        name: o.index,
        settings: list(Object.values(vecIndexes).map((index) => index.name)),
        shown: o.always,
      },
    ],
    psp: [{ name: o.provider, settings: o.firstSecondProvider, shown: o.always }],
    pooler: [{ name: o.mode, settings: o.sessionTransactionStatement, shown: o.always }],
    ws: [
      { name: o.runtime, settings: o.runtimeCount(RUNTIME_IDS.length), shown: o.always },
      { name: o.presence, settings: o.noPresence, shown: o.always },
      { name: o.reconnectBackoff, settings: o.reconnectAtOnce, shown: o.always },
      { name: o.clustering, settings: o.oneBoxClustered, shown: o.always },
    ],
  }
}
