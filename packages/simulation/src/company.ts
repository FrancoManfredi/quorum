import { RUNNING } from './life.ts'
import {
  CREDIT_CAP,
  ERAS,
  FIRST_INCIDENT_AFTER,
  LINK_TIMEOUT,
  START_CASH,
  type ComponentId,
  type ResearchId,
} from './catalog.ts'
import {
  CORE_TEAM,
  DEFAULT_ALERT_RULES,
  DEFAULT_FOUNDING,
  NO_FALSE_ALARMS,
  NO_INSIGHT,
  monolith,
  type Game,
  type GameLink,
  type GameNode,
} from './state.ts'
import { normalizeOrdinals } from './labels.ts'

export const node = (
  id: string,
  type: ComponentId,
  x: number,
  y: number,
  extra: Partial<GameNode> = {},
): GameNode => ({
  id,
  type,
  ordinal: 0,
  x,
  y,
  size: 1,
  family: 'general',
  runtime: 'mod_php',
  framework: 'none',
  workers: 5,
  localDb: false,
  sample: 1,
  sampleRate: 0.1,
  retention: 900,
  life: RUNNING,
  credits: 0,
  leak: 0,
  service: { _tag: 'InService' },
  compress: false,
  certUntil: null,
  recycle: false,
  authEdge: false,
  merge: false,
  downAt: 0,
  policy: 'weighted',
  variant: 'l7',
  sticky: false,
  slowStart: false,
  provider: 'first',
  purge: false,
  cacheKey: 'full',
  staleUntil: 0,
  earlyExpiry: false,
  swr: false,
  shardKey: 'hash',
  sync: false,
  searchVariant: 'elasticsearch',
  searchShards: 1,
  searchReplicas: 0,
  heap: 'half',
  storeVariant: 's3',
  burst: 0,
  checkEvery: 10,
  deepCheck: false,
  ttl: type === 'cache' ? 60 : 300,
  engine: 'redis',
  dbEngine: 'postgres',
  iops: 'general',
  shards: 1,
  storageClass: 'standard',
  crashes: 0,
  keep: 'keep',
  lifecycle: 0,
  cacheStrategy: 'aside',
  refresh: 1,
  restore: 'ok',
  pm: 'static',
  mode: 'transaction',
  depth: 0,
  dlq: false,
  attempts: 25,
  maxLength: 0,
  prefetch: 10,
  upgradedAt: 0,
  coalesce: false,
  warming: false,
  paranoia: 2,
  underAttack: false,
  rateLimit: 0,
  strategy: 'rolling',
  presence: false,
  backoff: false,
  clustering: false,
  zone: 'a',
  standby: false,
  pricing: 'on-demand',
  pricingUntil: null,
  replicas: 1,
  scaler: { _tag: 'Steady' },
  scaledAt: 0,
  signal: 'cpu',
  target: 0.6,
  minCopies: 1,
  maxCopies: 8,
  gpu: 't4',
  collector: 'g1',
  gogc: 100,
  shed: false,
  ryw: false,
  region: 'na',
  n: 3,
  r: 1,
  w: 1,
  lost: 0,
  spread: false,
  backup: 'none',
  fanout: 'pull',
  split: false,
  transactions: false,
  indexType: 'exact',
  precision: 'fp16',
  gpuModel: 'medium',
  batch: 1,
  degrade: false,
  schedule: false,
  materialized: false,
  partitions: 3,
  acks: 'all',
  retain: 3_600,
  keyed: true,
  topology: 'single',
  ...extra,
})

/** A Link with the default policy: 30 s timeout, no retries, every kind. */
export const link = (from: string, to: string): GameLink => ({
  from,
  to,
  timeout: LINK_TIMEOUT,
  retries: 'none',
  kinds: null,
  breaker: false,
  bulkhead: false,
  hedge: false,
  fuse: { _tag: 'Closed' },
  failure: 0,
})

export const company = (seed: number): Omit<Game, 'nodes' | 'links'> => ({
  boxes: [],
  nextId: 1,
  cash: START_CASH,
  bridge: { _tag: 'None' },
  insight: 0,
  pools: NO_INSIGHT,
  studies: [],
  users: 150,
  pending: 0,
  spilled: 0,
  researched: [],
  stage: 0,
  stageAt: 0,
  equity: 1,
  round: { _tag: 'Waiting' },
  time: 0,
  seed,
  apdex: 1,
  userShares: null,
  steady: null,
  regionApdex: null,
  incident: null,
  lastIncident: null,
  nextIncidentAt: Number.MAX_SAFE_INTEGER,
  postmortems: [],
  postmortemSeq: 0,
  openActions: [],
  handled: [],
  runbooks: [],
  alarms: { errors: 0, latency: 0, saturation: 0, queue: 0, budget: 0 },
  servedKinds: ['page', 'read'],
  alertRules: DEFAULT_ALERT_RULES,
  falseAlarms: NO_FALSE_ALARMS,
  earned: 0,
  history: [],
  sandbox: false,
  devHours: 0,
  engineers: [],
  hires: [],
  teams: [CORE_TEAM],
  moraleUntil: 0,
  loadTestUntil: 0,
  engineChange: null,
  reshard: null,
  services: [monolith([])],
  backlog: [],
  workSeq: 0,
  cves: [],
  features: {},
  rushedFeatures: {},
  outcomes: {},
  backdoorAt: null,
  discounts: [],
  policies: { research: false, hire: false, upgrade: false },
  policyAt: 0,
  autopilot: true,
  deploys: 0,
  badDeploys: 0,
  stored: 0,
  data: 0,
  uploads: 0,
  budget: [],
  drill: null,
  chaos: false,
  weakest: null,
  quarter: null,
  founding: DEFAULT_FOUNDING,
  banked: 0,
  peak: 0,
  wall: 0,
})

/**
 * The Garage: one Burstable box runs PHP under Apache and Postgres on the same
 * machine, linked to Users. Analytics samples the box.
 */
export const newGame = (seed = 20_261_031): Game =>
  normalizeOrdinals({
    ...company(seed),
    nodes: [
      node('users', 'users', 120, 280),
      node('server', 'server', 440, 280, {
        family: 'burstable',
        localDb: true,
        credits: CREDIT_CAP,
      }),
      node('analytics', 'analytics', 760, 520),
      node('payments', 'payments', 440, 540),
    ],
    links: [link('users', 'server'), link('server', 'analytics')],
  })

/** Pre-seed with the Garage lessons already learned: Postgres split out, PHP-FPM, Stripe. */
export const preseedGame = (seed = 20_261_031): Game => {
  const garage = ERAS[0]
  return normalizeOrdinals({
    ...company(seed),
    nodes: [
      node('users', 'users', 120, 280),
      node('server', 'server', 440, 280, { size: 2, runtime: 'php_fpm', workers: 16 }),
      node('database', 'database', 760, 280, { size: 1 }),
      node('analytics', 'analytics', 760, 560),
      node('payments', 'payments', 440, 540),
    ],
    links: [link('users', 'server'), link('server', 'database'), link('server', 'analytics')],
    cash: START_CASH + (garage?.grant ?? 0),
    pools: { ...NO_INSIGHT, write: 20, login: 20 },
    users: 1_050,
    stage: 1,
    stageAt: 12 * 60,
    equity: 1 - (garage?.dilution ?? 0),
    researched: ['stripe', 'php-fpm', 'logs', 'metrics', 'load-balancing'],
    time: 12 * 60,
    nextIncidentAt: 12 * 60 + FIRST_INCIDENT_AFTER,
  })
}

/**
 * The Head start perk's later levels (13 "The Legacy shop"): the Company starts in Seed or Series
 * A. The Design is the Pre-seed one with what the lessons of the missed Eras add (a Cache, then a
 * second App Server behind a Load Balancer), the research those Eras give, the Cash and Equity of
 * the rounds raised, and the Users that ended the last Era.
 */
const HEAD_START: ReadonlyArray<
  Readonly<{ users: number; research: ReadonlyArray<ResearchId>; hours: number }>
> = [
  { users: 1_050, research: [], hours: 12 },
  {
    users: 5_000,
    research: [
      'caching',
      'pooling',
      'replication',
      'health-checks',
      'percentiles',
      'timeouts',
      'ci',
    ],
    hours: 36,
  },
  {
    users: 25_000,
    research: [
      'caching',
      'pooling',
      'replication',
      'health-checks',
      'percentiles',
      'timeouts',
      'ci',
      'full-text-search',
      'object-storage',
      'cdn',
      'waf',
      'background-jobs',
      'queues',
      'stampede-protection',
      'tracing',
      'pitr',
    ],
    hours: 72,
  },
]

export const headStartGame = (seed: number, level: number): Game => {
  const preseed = preseedGame(seed)
  const era = Math.max(1, Math.min(level, HEAD_START.length)) as 1 | 2 | 3
  if (era === 1) return preseed
  const start = HEAD_START[era - 1]
  if (!start) return preseed
  const nodes = [
    ...preseed.nodes.map((entry) =>
      entry.type === 'server'
        ? { ...entry, size: 3, workers: 24 }
        : entry.type === 'database'
          ? { ...entry, size: 2 }
          : entry,
    ),
    node('cache', 'cache', 760, 120),
    ...(era === 3
      ? [
          node('lb', 'lb', 280, 280),
          node('server2', 'server', 440, 40, { size: 3, runtime: 'php_fpm', workers: 24 }),
        ]
      : []),
  ]
  const links = [
    ...preseed.links.filter((entry) => era === 2 || entry.from !== 'users'),
    link('server', 'cache'),
    ...(era === 3
      ? [
          link('users', 'lb'),
          link('lb', 'server'),
          link('lb', 'server2'),
          link('server2', 'database'),
          link('server2', 'cache'),
          link('server2', 'analytics'),
        ]
      : []),
  ]
  const raised = ERAS.slice(0, era).reduce(
    (total, entry) => ({
      grant: total.grant + entry.grant,
      keep: total.keep * (1 - entry.dilution),
    }),
    { grant: START_CASH, keep: 1 },
  )
  const time = start.hours * 60
  return normalizeOrdinals({
    ...preseed,
    nodes,
    links,
    cash: raised.grant,
    equity: raised.keep,
    users: start.users,
    stage: era,
    stageAt: time,
    researched: [...preseed.researched, ...start.research],
    time,
    nextIncidentAt: time + FIRST_INCIDENT_AFTER,
  })
}
