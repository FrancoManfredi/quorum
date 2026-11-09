import { Result } from 'effect'
import {
  canRaise,
  cancelReport,
  cancelStudy,
  collect,
  disableRule,
  expandVolume,
  connect,
  decline,
  deleteMessage,
  disconnect,
  filePostmortem,
  place,
  raise,
  replace,
  resize,
  sell,
  restart,
  setCacheGuard,
  renewCertificate,
  setDlq,
  setFamily,
  setRuntime,
  setAutoscaler,
  setBackup,
  setLbVariant,
  setLinkPolicy,
  setSpread,
  runDrill,
  setStandby,
  setStorageIops,
  setUnderAttack,
  setZone,
  setWorkers,
  study,
  type Action,
} from './actions.ts'
import {
  COMPONENTS,
  CREDIT_CAP,
  HOME_REGION,
  CHALLENGE_TUNING,
  DIURNAL_AMPLITUDE,
  FEATURES,
  FRAMEWORKS,
  OS_RAM,
  POOL_LIMITS,
  RECIPE,
  RESEARCH,
  RESEARCH_IDS,
  SCALE_MAXIMA,
  SHARD_COUNTS,
  RUNTIMES,
  STANDBY_TYPES,
  type ComponentId,
  type FeatureDef,
  type InsightPool,
  type ResearchId,
  type RuntimeId,
  type Tuning,
} from './catalog.ts'
import { newGame } from './company.ts'
import { foundCompany } from './founding.ts'
import type { Ledger } from './ledger.ts'
import { has, isDown, maxSize, ramOf, researchReady, securityStaffed } from './lookups.ts'
import { isBuilt } from './features.ts'
import { recipeOf, shapeHolds } from './studies.ts'
import {
  Change,
  driftOf,
  mirrorOf,
  pickIacTool,
  setMirrorData,
  startMirror,
  applyMirror,
} from './mirror.ts'
import { bottleneckOf, diurnal, solveFlow } from './solve.ts'
import type { Founding, Game, GameNode } from './state.ts'
import { step } from './step.ts'
import { drillDone, drillPassed } from './drill-machine.ts'
import { languageOfService, salaryOf, serviceOf, signingOf, stackOf } from './team.ts'
import {
  addIndex,
  approveBlock,
  assign,
  createTeam,
  setTeamKind,
  changeStack,
  hire,
  moveItem,
  queueReshard,
  prioritizeItem,
  queueFeature,
  queueTask,
  rushItem,
} from './work.ts'
import { isApplying } from './mirror-machine.ts'
import { Life } from './life.ts'
import { StepEvent } from './events.ts'
import { WorkBlock } from './work-item-machine.ts'

export type Strategy = 'balanced' | 'greedy' | 'stubborn' | 'decliner' | 'polyglot' | 'idle'

export type Milestone =
  | 'first-upgrade'
  | 'first-research'
  | 'db-split'
  | 'second-server'
  | 'preseed'
  | 'first-incident'
  | 'first-hire'
  | 'first-feature'
  | 'seed'
  | 'search-engine'
  | 'waf'
  | 'queue'
  | 'series-a'
  | 'second-zone'
  | 'standby'
  | 'autoscaler'
  | 'cdn'
  | 'payment-provider'
  | 'series-b'
  | 'warehouse'
  | 'ai-serving'

/** Margin when an Era ends, at the build's prices. */
export type MarginRecord = Readonly<{
  stage: number
  time: number
  live: number
}>

export type BotRun = Readonly<{
  game: Game
  /** Sim seconds since the Company started when each milestone first happened. */
  milestones: Readonly<Partial<Record<Milestone, number>>>
  margins: ReadonlyArray<MarginRecord>
}>

/** The order the Balanced player researches in. It skips what is not open yet. */
const PRIORITY: ReadonlyArray<ResearchId> = [
  'stripe',
  'logs',
  'php-fpm',
  'opcache',
  'metrics',
  'load-balancing',
  'query-analysis',
  'caching',
  'pooling',
  'percentiles',
  'eager-loading',
  'alerting',
  'health-checks',
  'funnels',
  'full-text-search',
  'waf',
  'object-storage',
  'background-jobs',
  'queues',
  'cdn',
  // PHP spends about six times Go's CPU per request, so the fleet it needs outgrows any budget.
  'lang-go',
  'stampede-protection',
  // Series A: zones first, then checkout, the Autoscaler, and the SLO. Not Error budgets:
  // incidents spend the bot's budget, and a spent budget halves velocity.
  'multi-az',
  // The Load Balancer's last size is 64,000 requests a second: L4 carries ten times that.
  'lb-algorithms',
  'l4-lb',
  // The Database's safety net: backups, call policy, and drills that prove the backup.
  'pitr',
  'timeouts',
  'backoff-jitter',
  'restore-drills',
  'cert-automation',
  'checkout',
  'tracing',
  'slo-dashboards',
  'autoscaling',
  'tiered-caching',
  'containers',
  'replication',
  // Series B: the cheap way to serve AI first, then the Warehouse for reports.
  'sharding',
  // Series C: regions, then the code that mirrors them.
  'multi-region',
  'geo-dns',
  'infra-as-code',
  'sync-replication',
  'consensus',
  // Pre-IPO: the checklist's research.
  'tls-everywhere',
  'encryption-at-rest',
  'dependency-scanning',
  'security-team',
  'soc2',
  'dr-drills',
  'gdpr-residency',
  'investor-relations',
  'hosted-models',
  'data-warehouse',
  'error-budgets',
]

/** Polyglot researches the languages right after the basics. */
const POLYGLOT_PRIORITY: ReadonlyArray<ResearchId> = [
  ...PRIORITY.slice(0, 3),
  'lang-python',
  'lang-ruby',
  'lang-node',
  ...PRIORITY.slice(3),
]

/** What the Balanced player researches once Chat is on the way and the Stack refuses realtime. */
const REALTIME_RESEARCH: ReadonlyArray<ResearchId> = ['lang-node', 'node-cluster']

/** The language research Polyglot moves to, and the runtime it moves to. */
const LANGUAGE_RESEARCH: ReadonlyArray<readonly [ResearchId, RuntimeId]> = [
  ['lang-python', 'gunicorn'],
  ['lang-ruby', 'puma'],
  ['lang-node', 'node'],
]

/** The Balanced player hires while payroll stays under this share of revenue, up to a headcount. */
/** Far regions the Balanced player mirrors from home. */
const FAR_REGIONS = ['eu', 'apac', 'sa'] as const
/** Sim seconds between plans that sync a Mirror's sizes and options with home. */
const MIRROR_EVERY = 300
/** The size the Distributed SQL Node starts at. */
const DSQL_SIZE = 4

/** Sim seconds between the idle player's visits: two hours. */
const IDLE_EVERY = 7_200

const PAYROLL_SHARE = 0.25
/** Engineers the bot hires up to, by Era: 4 until Seed, then 4 more each Era. */
const maxHires = (stage: number): number => 4 + 4 * Math.max(0, stage - 2)

/** Seconds of Burn the player keeps in Cash before spending. */
const RESERVE_SECONDS = 30
/** The player looks at the board this often, in sim seconds. */
const LOOK_EVERY = 5
/** A Node this busy gets attention even when the Bottleneck search names none. */
const BUSY = 0.8

const tried = (game: Game, action: Action): Game =>
  Result.isSuccess(action) ? action.success : game

const marginOf = (revenue: number, burn: number): number =>
  revenue > 0 ? (revenue - burn) / revenue : -1

const servers = (game: Game): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'server')

const byId = (game: Game, id: string): GameNode | undefined =>
  game.nodes.find((node) => node.id === id)

const last = (game: Game): string => game.nodes.at(-1)?.id ?? ''

/** Workers that fit in RAM with a margin, for runtimes with a pool. */
const fittingWorkers = (node: GameNode): number => {
  const each = RUNTIMES[node.runtime].memoryMb + FRAMEWORKS[node.framework].memoryMb
  return Math.max(
    POOL_LIMITS.min,
    Math.min(POOL_LIMITS.max, Math.floor(((ramOf(node) - OS_RAM) * 0.9 * 1024) / each)),
  )
}

const affordable = (game: Game, ledger: Ledger, apply: (game: Game) => Action): Game => {
  const reserve = ledger.burn * RESERVE_SECONDS
  const next = tried(game, apply(game))
  return next !== game && next.cash >= reserve ? next : game
}

/** Places a Component and returns the Game and its id, or null when it cannot. */
const placed = (
  game: Game,
  ledger: Ledger,
  type: ComponentId,
  x: number,
  y: number,
): readonly [Game, string] | null => {
  const next = affordable(game, ledger, (current) => place(current, type, x, y))
  return next === game ? null : [next, last(next)]
}

/** Moves Postgres off the first box onto its own Database. */
const splitDatabase = (game: Game, ledger: Ledger, server: GameNode): Game => {
  const db = placed(game, ledger, 'database', server.x + 320, server.y)
  return db ? tried(db[0], connect(db[0], server.id, db[1])) : game
}

/** Puts a Load Balancer in front, then adds an App Server with the same Stack and links. */
const addServer = (game: Game, ledger: Ledger, model: GameNode): Game => {
  if (!has(game, 'load-balancing')) return game
  let next = game
  let lb = next.nodes.find((node) => node.type === 'lb')
  if (!lb) {
    const front = placed(next, ledger, 'lb', model.x - 160, model.y)
    if (!front) return game
    next = front[0]
    // Whatever fed the App Servers (Users, a WAF, a CDN) now feeds the Load Balancer.
    const feeders = next.links.filter((entry) =>
      servers(next).some((server) => server.id === entry.to),
    )
    for (const link of feeders) next = disconnect(next, link.from, link.to)
    for (const from of new Set(feeders.map((link) => link.from)))
      next = tried(next, connect(next, from, front[1]))
    for (const server of servers(next)) next = tried(next, connect(next, front[1], server.id))
    lb = byId(next, front[1])
  }
  const copy = placed(next, ledger, 'server', model.x, model.y - 140 * servers(next).length)
  if (!copy || !lb) return next
  next = copy[0]
  // The copy comes at the model's size when Cash allows: copies cost 25% more each, so fewer, bigger boxes.
  for (let size = 0; size < model.size; size += 1) {
    const grown = affordable(next, ledger, (current) => resize(current, copy[1], 1))
    if (grown === next) break
    next = grown
  }
  next = tried(next, setRuntime(next, copy[1], model.runtime))
  if (RUNTIMES[model.runtime].pool)
    next = tried(next, setWorkers(next, copy[1], fittingWorkers(byId(next, copy[1]) ?? model)))
  next = tried(next, connect(next, lb.id, copy[1]))
  for (const link of next.links.filter((entry) => entry.from === model.id))
    next = tried(next, connect(next, copy[1], link.to))
  return next
}

/** Puts a Connection Pooler or a Cache between every App Server and the Database. */
const inFront = (
  game: Game,
  ledger: Ledger,
  database: GameNode,
  type: 'pooler' | 'cache',
): Game => {
  const pooler = placed(
    game,
    ledger,
    type,
    database.x - 160,
    database.y + (type === 'cache' ? -120 : 120),
  )
  if (!pooler) return game
  let next = pooler[0]
  for (const link of next.links.filter((entry) => entry.to === database.id)) {
    next = disconnect(next, link.from, link.to)
    next = tried(next, connect(next, link.from, pooler[1]))
  }
  return tried(next, connect(next, pooler[1], database.id))
}

/** Puts an edge Node between Users and whatever Users reached. */
const inFrontOfUsers = (game: Game, ledger: Ledger, type: 'waf' | 'cdn'): Game => {
  const entry = game.links.find((link) => link.from === 'users')
  const users = byId(game, 'users')
  if (!entry || !users) return game
  const edge = placed(game, ledger, type, users.x + 60, users.y + (type === 'cdn' ? -140 : 140))
  if (!edge) return game
  const rewired = tried(edge[0], connect(disconnect(edge[0], 'users', entry.to), 'users', edge[1]))
  return tried(rewired, connect(rewired, edge[1], entry.to))
}

/** Links every App Server to a data Node. */
const linkServers = (game: Game, to: string): Game =>
  servers(game).reduce((current, server) => tried(current, connect(current, server.id, to)), game)

/**
 * The Seed playbook: a Search Engine once search loads the Database, Object
 * Storage once uploads arrive, a WAF for the bots, a Queue and a Worker for
 * the uploads, and stampede protection on every Cache.
 */
const seedBuild = (game: Game, ledger: Ledger): Game => {
  let next = game
  const missing = (type: ComponentId) => !next.nodes.some((node) => node.type === type)
  const anchor = servers(next)[0]
  if (!anchor) return next
  if (has(next, 'waf') && missing('waf') && (ledger.kinds.bot?.rate ?? 0) > 0)
    next = inFrontOfUsers(next, ledger, 'waf')
  if (has(next, 'full-text-search') && missing('search') && (ledger.kinds.search?.rate ?? 0) > 0) {
    const search = placed(next, ledger, 'search', anchor.x + 320, anchor.y + 200)
    if (search) next = linkServers(search[0], search[1])
  }
  if (has(next, 'object-storage') && missing('storage') && (ledger.kinds.upload?.rate ?? 0) > 0) {
    const storage = placed(next, ledger, 'storage', anchor.x + 320, anchor.y + 340)
    if (storage) next = linkServers(storage[0], storage[1])
  }
  if (has(next, 'queues') && missing('queue') && (ledger.kinds.upload?.rate ?? 0) > 0) {
    const queue = placed(next, ledger, 'queue', anchor.x + 320, anchor.y - 240)
    const worker = queue && placed(queue[0], ledger, 'worker', anchor.x + 600, anchor.y - 240)
    if (queue && worker) {
      next = tried(worker[0], setDlq(worker[0], queue[1], true))
      next = tried(next, connect(next, queue[1], worker[1]))
      next = linkServers(next, queue[1])
    }
  }
  if (has(next, 'stampede-protection'))
    for (const cache of next.nodes.filter((node) => node.type === 'cache' && !node.coalesce))
      next = tried(next, setCacheGuard(next, cache.id, { coalesce: true }))
  return next
}

/** Whether `node` is an Autoscaler that a Node of `type` links into. */
const scalesWith = (game: Game, node: GameNode, type: ComponentId): boolean =>
  node.type === 'autoscaler' &&
  game.links.some(
    (link) =>
      link.to === node.id && game.nodes.some((from) => from.id === link.from && from.type === type),
  )

/**
 * The Series A playbook: Object Storage, a CDN and the Payment Provider once
 * media and checkout arrive; every other App Server and Worker in a second
 * zone, a standby for every data Node; and an Autoscaler on the first App Server.
 */
const seriesABuild = (game: Game, ledger: Ledger): Game => {
  let next = game
  const missing = (type: ComponentId) => !next.nodes.some((node) => node.type === type)
  const anchor = servers(next)[0]
  if (!anchor) return next
  const media = (ledger.kinds.media?.rate ?? 0) > 0
  if (has(next, 'object-storage') && missing('storage') && media) {
    const storage = placed(next, ledger, 'storage', anchor.x + 320, anchor.y + 340)
    if (storage) next = linkServers(storage[0], storage[1])
  }
  if (has(next, 'cdn') && missing('cdn') && media && next.stage < 5)
    next = inFrontOfUsers(next, ledger, 'cdn')
  if (has(next, 'checkout') && missing('psp') && (ledger.kinds.buy?.rate ?? 0) > 0) {
    const psp = placed(next, ledger, 'psp', anchor.x + 320, anchor.y + 480)
    if (psp) next = linkServers(psp[0], psp[1])
  }
  if (has(next, 'multi-az')) {
    for (const type of ['server', 'worker'] as const)
      for (const [index, copy] of next.nodes.filter((node) => node.type === type).entries())
        if (index % 2 === 1 && copy.zone === 'a') next = tried(next, setZone(next, copy.id, 'b'))
    for (const data of next.nodes.filter(
      (node) => STANDBY_TYPES.includes(node.type) && !node.standby,
    ))
      next = affordable(next, ledger, (current) => setStandby(current, data.id, true))
  }
  // App Servers and Workers scale as copies of one Node each: an Autoscaler follows each load. The
  // Workers' tasks are CPU-heavy, so their Autoscaler has no ceiling; the servers' stops at 16.
  if (has(next, 'autoscaling'))
    for (const type of ['server', 'worker'] as const) {
      const nodes = next.nodes.filter((node) => node.type === type && node.region === HOME_REGION)
      const first = nodes[0]
      if (!first) continue
      let scaler = next.nodes.find((node) => scalesWith(next, node, type))
      if (!scaler) {
        const placedScaler = placed(
          next,
          ledger,
          'autoscaler',
          anchor.x + (type === 'worker' ? 280 : 0),
          anchor.y - 200,
        )
        if (!placedScaler) continue
        next = placedScaler[0]
        scaler = byId(next, placedScaler[1])
      }
      if (scaler)
        for (const node of nodes)
          if (!next.links.some((link) => link.from === node.id && link.to === scaler.id))
            next = tried(next, connect(next, node.id, scaler.id))
    }
  return next
}

/**
 * The safety net a player builds from Series A: a backup on the Database, backoff on every call
 * into it, and an Autoscaler that keeps headroom ahead of the evening peak (it reacts in minutes,
 * and compute is a small part of the bill).
 */
const harden = (game: Game): Game => {
  let next = game
  for (const data of next.nodes.filter((node) => node.type === 'database')) {
    if (has(next, 'pitr') && data.backup !== 'pitr')
      next = tried(next, setBackup(next, data.id, 'pitr'))
    // A backup the roll found broken restores nothing: set it again.
    if (data.restore === 'failed') {
      next = tried(next, setBackup(next, data.id, 'none'))
      next = tried(next, setBackup(next, data.id, 'pitr'))
    }
  }
  for (const link of next.links)
    if (
      link.retries !== 'backoff' &&
      next.nodes.some((node) => node.id === link.to && node.type === 'database')
    )
      next = tried(next, setLinkPolicy(next, link.from, link.to, { retries: 'backoff' }))
  for (const scaler of next.nodes.filter((node) => node.type === 'autoscaler'))
    if (
      scaler.target !== 0.4 ||
      scaler.minCopies < 4 ||
      (scalesWith(next, scaler, 'worker') && scaler.maxCopies !== 0)
    )
      next = tried(
        next,
        setAutoscaler(next, scaler.id, {
          target: 0.4,
          minCopies: 4,
          maxCopies: scalesWith(next, scaler, 'worker') ? 0 : Math.max(16, scaler.maxCopies),
        }),
      )
  return next
}

/**
 * The Series B playbook: every Worker reads where the App Servers read, so
 * exports have their data; the LLM API once AI prompts arrive; a Data Warehouse
 * once reports do.
 */
const seriesBBuild = (game: Game, ledger: Ledger): Game => {
  let next = game
  const missing = (type: ComponentId) => !next.nodes.some((node) => node.type === type)
  const anchor = servers(next)[0]
  if (!anchor) return next
  const reads = next.links.find((link) => {
    const to = byId(next, link.to)
    return link.from === anchor.id && to && COMPONENTS[to.type].accepts.includes('q-read')
  })
  if (reads)
    for (const worker of next.nodes.filter((node) => node.type === 'worker'))
      if (!next.links.some((link) => link.from === worker.id && link.to === reads.to))
        next = tried(next, connect(next, worker.id, reads.to))
  if (
    has(next, 'hosted-models') &&
    missing('llm') &&
    missing('gpu') &&
    (ledger.kinds.ai?.rate ?? 0) > 0
  ) {
    const llm = placed(next, ledger, 'llm', anchor.x + 320, anchor.y + 620)
    if (llm) next = linkServers(llm[0], llm[1])
  }
  if (has(next, 'data-warehouse') && missing('warehouse') && (ledger.kinds.report?.rate ?? 0) > 0) {
    const warehouse = placed(next, ledger, 'warehouse', anchor.x + 600, anchor.y + 340)
    if (warehouse) next = linkServers(warehouse[0], warehouse[1])
  }
  return next
}

/**
 * The Series C data tier: one Postgres box caps reads, and a cache that cannot hold a hot set of
 * millions of users stops shielding it. Distributed SQL scales with its size and spreads across
 * regions, so every call the Database took moves to it, and the Database, its replicas and the pooler go.
 */
const dsqlCutover = (game: Game, ledger: Ledger): Game => {
  if (!has(game, 'consensus')) return game
  const database = game.nodes.find(
    (node) => node.type === 'database' && node.region === HOME_REGION,
  )
  if (!database) return game
  const made = placed(game, ledger, 'dsql', database.x + 320, database.y + 160)
  if (!made) return game
  let next = made[0]
  for (let size = 1; size < DSQL_SIZE; size += 1) {
    const grown = affordable(next, ledger, (current) => resize(current, made[1], 1))
    if (grown === next) break
    next = grown
  }
  const stores = new Set(
    next.nodes
      .filter(
        (node) => node.type === 'database' || node.type === 'replica' || node.type === 'pooler',
      )
      .map((node) => node.id),
  )
  for (const link of next.links.filter((entry) => stores.has(entry.to))) {
    if (!stores.has(link.from)) next = tried(next, connect(next, link.from, made[1]))
  }
  for (const id of stores) next = tried(next, sell(next, id))
  return tried(next, setSpread(next, made[1], true))
}

/**
 * The Pre-IPO checklist: a Security team for SOC 2, and a DR drill that runs again after it fails
 * (10 "Era 6: Pre-IPO"). The rest is research, Mirrors, Distributed SQL and the Autoscaler.
 */
const ipoBuild = (game: Game): Game => {
  let next = game
  if (has(next, 'security-team') && !securityStaffed(next)) {
    let team = next.teams.find((entry) => entry.kind === 'security')
    if (!team) {
      const made = tried(next, createTeam(next))
      const created = made.teams.at(-1)
      if (created && made !== next) {
        next = tried(made, setTeamKind(made, created.id, 'security'))
        team = next.teams.find((entry) => entry.id === created.id)
      }
    }
    const founder = next.teams[0]?.id
    const engineer = next.engineers.findLast((entry) => entry.team === founder)
    if (team && engineer) next = tried(next, assign(next, engineer.id, team.id))
  }
  if (
    has(next, 'dr-drills') &&
    !next.incident &&
    (!next.drill || (drillDone(next.drill) && !drillPassed(next.drill)))
  )
    next = tried(next, runDrill(next))
  return next
}

/**
 * A CDN is global: a Mirror's Users would enter through it and reach the home WAF, so the regional
 * stacks would idle and EU users would be served from North America. The CDN goes, and the Users
 * link straight to the WAF that stood behind it (05 "Mirror a region").
 */
const dropCdn = (game: Game): Game => {
  const cdn = game.nodes.find((node) => node.type === 'cdn')
  if (!cdn) return game
  const behind = game.links
    .filter((link) => link.from === cdn.id && byId(game, link.to)?.type !== 'analytics')
    .map((link) => link.to)
  const feeders = game.links.filter((link) => link.to === cdn.id).map((link) => link.from)
  // A Users Node takes one outbound Link, so the CDN goes first.
  let next = tried(game, sell(game, cdn.id))
  for (const from of feeders) for (const to of behind) next = tried(next, connect(next, from, to))
  return next
}

/**
 * The Series C playbook: Terraform writes the home region as code, and each far region is a Mirror
 * of it, applied again whenever the home Design drifts ahead of it (05 "Mirror a region").
 */
const seriesCBuild = (game: Game, ledger: Ledger): Game => {
  let next = dropCdn(game)
  if (!next.nodes.some((node) => node.type === 'dsql')) next = dsqlCutover(next, ledger)
  if (!has(next, 'multi-region') || !has(next, 'geo-dns') || !has(next, 'infra-as-code'))
    return next
  if (!next.iac) next = tried(next, pickIacTool(next, 'terraform'))
  for (const region of FAR_REGIONS) {
    let mirror = mirrorOf(next, region)
    if (!mirror) {
      next = affordable(next, ledger, (current) => startMirror(current, region, HOME_REGION))
      mirror = mirrorOf(next, region)
    }
    if (!mirror || isApplying(mirror.sync)) continue
    // A new data Node in the home region: the Mirror reads it from a replica, and copies its objects.
    for (const change of driftOf(next, mirror).changes)
      if (Change.guards.choose(change))
        next = tried(
          next,
          setMirrorData(
            next,
            region,
            change.source,
            change.type === 'database' ? 'replica' : 'replicate',
          ),
        )
    const fresh = mirrorOf(next, region)
    if (!fresh) continue
    const drift = driftOf(next, fresh)
    const creates = drift.changes.some(Change.guards.create)
    // New Nodes apply at once; drift in sizes and options waits for a calendar quarter-day.
    if (drift.changes.length > 0 && (creates || Math.round(next.time) % MIRROR_EVERY === 0))
      next = affordable(next, ledger, (current) => applyMirror(current, region))
  }
  return next
}

/** Read Replicas the bot places for one Database. */
const MAX_REPLICAS = 4

/**
 * A Read Replica of the same size, linked from the App Servers: reads scale with copies of the
 * Database. A pooler takes one link, so the replica gets its own connections, not the pooler's.
 */
const addReplica = (game: Game, ledger: Ledger, database: GameNode): Game => {
  const count = game.nodes.filter((node) => node.type === 'replica').length
  const replica = placed(game, ledger, 'replica', database.x + 320, database.y - 160 - 140 * count)
  if (!replica) return game
  let next = replica[0]
  for (let size = 0; size < database.size; size += 1) {
    const grown = affordable(next, ledger, (current) => resize(current, replica[1], 1))
    if (grown === next) break
    next = grown
  }
  // The Database ships its log to the replica. Each replica gets its own Connection Pooler, as in
  // production: a pooler takes one link, so one pooler cannot front the Database and its replicas, and
  // App Servers linked straight to a replica would each hold their whole pools on it.
  next = tried(next, connect(next, database.id, replica[1]))
  const pooler = has(next, 'pooling')
    ? placed(next, ledger, 'pooler', database.x + 160, database.y - 160 - 140 * count)
    : null
  const front = pooler ? pooler[1] : null
  if (pooler && front) next = tried(pooler[0], connect(pooler[0], front, replica[1]))
  for (const from of servers(next)) next = tried(next, connect(next, from.id, front ?? replica[1]))
  return next
}

/** What the Balanced player does about the Node that limits the Design. */
const relieve = (game: Game, ledger: Ledger, node: GameNode, strategy: Strategy): Game => {
  const limit = ledger.nodes[node.id]?.limit ?? 'none'
  const grow = (current: Game) => resize(current, node.id, 1)
  // Greedy knows one move: a bigger box, or a box off Burstable once its credits run out.
  if (strategy === 'greedy') {
    if (limit === 'credits') return tried(game, setFamily(game, node.id, 'general'))
    return affordable(game, ledger, grow)
  }
  if (node.type === 'server') {
    if (limit === 'credits') return tried(game, setFamily(game, node.id, 'general'))
    if (node.localDb && (limit === 'memory' || limit === 'cpu'))
      return splitDatabase(game, ledger, node)
    if (limit === 'workers' && RUNTIMES[node.runtime].pool && node.workers < fittingWorkers(node))
      return tried(game, setWorkers(game, node.id, fittingWorkers(node)))
    // More workers open more connections: near the limit, a Pooler goes in front of the Database first.
    const database = game.nodes.find((entry) => entry.type === 'database')
    const connections = database ? ledger.nodes[database.id]?.connections : null
    if (
      database &&
      connections &&
      connections.used > POOLER_AT * connections.max &&
      has(game, 'pooling') &&
      !game.nodes.some((entry) => entry.type === 'pooler')
    )
      return inFront(game, ledger, database, 'pooler')
    // Grow a box up to MAX_SIZE, then scale out: each extra copy costs 25% more than the last.
    if (node.size < (game.stage >= 3 ? MAX_SIZE : 3)) {
      const bigger = affordable(game, ledger, grow)
      const resized = byId(bigger, node.id)
      return resized && RUNTIMES[resized.runtime].pool
        ? tried(bigger, setWorkers(bigger, node.id, fittingWorkers(resized)))
        : bigger
    }
    // With an Autoscaler, more copies of the same Node cost no placement; each extra card costs
    // 25% more than the last, so the bot raises the Autoscaler's ceiling before it places a card.
    const scaler = game.nodes.find((entry) => entry.type === 'autoscaler')
    if (scaler && game.links.some((link) => link.from === node.id && link.to === scaler.id)) {
      // Not "none": a ceiling of 16 copies of a Node at its largest size is already a fleet, and
      // an Autoscaler with no ceiling runs away with the bill.
      const ceiling = SCALE_MAXIMA.find((most) => most > scaler.maxCopies)
      return ceiling === undefined || scaler.maxCopies === 0
        ? game
        : tried(game, setAutoscaler(game, scaler.id, { maxCopies: ceiling }))
    }
    return addServer(game, ledger, node)
  }
  // A Load Balancer at its largest size moves to L4, which carries ten times the requests.
  if (
    node.type === 'lb' &&
    node.variant !== 'l4' &&
    node.size >= maxSize(node) &&
    has(game, 'l4-lb')
  )
    return tried(game, setLbVariant(game, node.id, 'l4'))
  if (node.type === 'database' && limit === 'connections' && has(game, 'pooling'))
    return game.nodes.some((entry) => entry.type === 'pooler')
      ? game
      : inFront(game, ledger, node, 'pooler')
  // A Database that reads from disk wants provisioned IOPS, then the Memory family.
  if (node.type === 'database' && limit === 'disk' && game.stage >= 3) {
    if (node.iops !== 'provisioned')
      return tried(game, setStorageIops(game, node.id, 'provisioned'))
    if (node.family !== 'memory') return tried(game, setFamily(game, node.id, 'memory'))
  }
  // A Database at its largest size reads from disk or runs out of CPU: Read Replicas take reads.
  if (
    node.type === 'database' &&
    node.size >= 8 &&
    (limit === 'cpu' || limit === 'disk') &&
    has(game, 'replication') &&
    game.nodes.filter((entry) => entry.type === 'replica').length < MAX_REPLICAS
  )
    return addReplica(game, ledger, node)
  // A Database at its largest size that still runs out of CPU splits into more shards.
  if (
    node.type === 'database' &&
    node.size >= 8 &&
    (limit === 'cpu' || limit === 'disk') &&
    has(game, 'sharding') &&
    node.shards < 8 &&
    !game.reshard
  ) {
    const more = SHARD_COUNTS.find((count) => count > node.shards) ?? node.shards
    return tried(game, queueReshard(game, node.id, { shards: more }))
  }
  // A busy Database gets a Cache in front before it gets a bigger box.
  if (
    node.type === 'database' &&
    has(game, 'caching') &&
    (ledger.nodes[node.id]?.resources.cpuCores?.used ?? 0) >
      0.7 * (ledger.nodes[node.id]?.resources.cpuCores?.total ?? 1) &&
    !game.nodes.some((entry) => entry.type === 'cache')
  )
    return inFront(game, ledger, node, 'cache')
  return affordable(game, ledger, grow)
}

/** Utilization above which the Balanced bot adds capacity from Series A, to survive the peak. */
const HEADROOM = 0.7
/** The biggest size the bot grows an App Server to from Series A before it places another (medium before). */
const MAX_SIZE = 8
/** Hit ratio under which a Cache that evicts keys grows. */
const CACHE_HIT = 0.7
/** Nodes the bot relieves in one look. */
const PASSES = 6

/** Share of the credit cap at which the Balanced bot moves a Burstable box to General. */
const LOW_CREDITS = 0.25

/** Share of the Database's connections at which a bigger App Server waits for a Pooler. */
const POOLER_AT = 0.6

/** The tap grows only while Cash stays above this many reserves. */
const TAP_RESERVE = 4

/** Studies the bot keeps queued, the running one included. */
const QUEUED = 2

/** The Database's connections as a share of its limit, or 0 when the Design has none. */
const connectionUse = (game: Game, ledger: Ledger): number => {
  const database = game.nodes.find((entry) => entry.type === 'database')
  const connections = database ? ledger.nodes[database.id]?.connections : null
  return connections ? connections.used / Math.max(1, connections.max) : 0
}

/**
 * Keeps the Study queue full from the priority list (10 "Studies"). A Study
 * whose recipe has a pool the Design does not earn yet would stall the queue,
 * so the bot leaves it for later.
 */
const studies = (
  game: Game,
  ledger: Ledger,
  strategy: Strategy,
  realtime: boolean,
  ready: (id: ResearchId) => boolean,
): Game => {
  const payable = (id: ResearchId) =>
    (Object.keys(RECIPE[id]) as Array<InsightPool>).every(
      (pool) => ledger.insight[pool] > 0 || game.pools[pool] >= (recipeOf(game, id)[pool] ?? 0),
    )
  // The gate lets a Pooler through at 20 connections; the bot buys it only when the Database is
  // near its limit, the same point where it puts one in front of the Database.
  const wants = (id: ResearchId) => id !== 'pooling' || connectionUse(game, ledger) > POOLER_AT
  let next = game
  const head = next.studies[0]
  // A running Study keeps its shape; only a Study that has not started waits for it.
  if (
    head &&
    (!payable(head.id) ||
      (head.phase._tag === 'Queued' && (!shapeHolds(next, ledger, head.id) || !wants(head.id))))
  )
    next = tried(next, cancelStudy(next, head.id))
  const urgent = (realtime ? REALTIME_RESEARCH : []).find(
    (id) => ready(id) && payable(id) && shapeHolds(next, ledger, id) && wants(id),
  )
  if (urgent) next = tried(next, study(next, urgent, true))
  const order =
    strategy === 'greedy'
      ? RESEARCH_IDS.filter(ready).toSorted((a, b) => RESEARCH[a].cost - RESEARCH[b].cost)
      : (strategy === 'polyglot' ? POLYGLOT_PRIORITY : PRIORITY)
          .filter(ready)
          // The Database's scale-out waits for the Eras that need it, so early Insight goes elsewhere.
          .filter((id) => id !== 'replication' || game.stage >= 3)
          .filter((id) => id !== 'sharding' || game.stage >= 4)
  // A priority Study that needs a kind no one sends yet waits for the Feature that brings it.
  for (const blocked of order
    .filter((id) => !payable(id))
    .slice(0, 2)
    .toReversed())
    next = planFeatureFor(next, ledger, blocked)
  for (const id of order) {
    if (next.studies.length >= QUEUED) break
    if (
      payable(id) &&
      shapeHolds(next, ledger, id) &&
      wants(id) &&
      !next.studies.some((entry) => entry.id === id)
    )
      next = tried(next, study(next, id))
  }
  return next
}

/** Puts the Feature that brings a missing kind, or the Feature it needs first, at the top of the backlog. */
const planFeatureFor = (game: Game, ledger: Ledger, id: ResearchId): Game => {
  const missing = (Object.keys(RECIPE[id]) as Array<InsightPool>).filter(
    (pool) => pool !== 'failure' && ledger.insight[pool] <= 0,
  )
  const bringing = (Object.values(FEATURES) as Array<FeatureDef>).find(
    (feature) => feature.unlocks && missing.includes(feature.unlocks.kind),
  )
  if (!bringing) return game
  const first = (feature: FeatureDef): FeatureDef => {
    const needed = feature.requires.find(
      (other) => !isBuilt(game, other) && !game.backlog.some((item) => item.ref === other),
    )
    return needed ? first(FEATURES[needed]) : feature
  }
  const feature = first(bringing)
  let next = game.backlog.some((item) => item.ref === feature.id)
    ? game
    : tried(game, queueFeature(game, feature.id))
  // It goes above other Features, not above a migration step or a task.
  const item = next.backlog.find((entry) => entry.ref === feature.id)
  if (!item) return next
  for (let index = next.backlog.indexOf(item); index > 0; index -= 1) {
    if (next.backlog[index - 1]?.kind !== 'feature') break
    next = tried(next, moveItem(next, item.id, -1))
  }
  return next
}

/** Links every Node that carries traffic to Analytics, and grows the tap when it drops samples. */
const sampleAll = (game: Game, ledger: Ledger): Game => {
  const tap = game.nodes.find((node) => node.type === 'analytics')
  if (!tap) return game
  let next = game
  for (const node of game.nodes) {
    const def = COMPONENTS[node.type]
    if (node.id === tap.id || def.tap || def.control || def.fixed || node.type === 'users') continue
    if (game.links.some((link) => link.from === node.id && link.to === tap.id)) continue
    next = tried(next, connect(next, node.id, tap.id))
  }
  if ((ledger.nodes[tap.id]?.utilization ?? 0) <= 1) return next
  const grown = tried(next, resize(next, tap.id, 1))
  return grown.cash >= ledger.burn * RESERVE_SECONDS * TAP_RESERVE ? grown : next
}

/** Incidents, postmortems, the drawer, research, the Stack, and the Bottleneck. */
const look = (game: Game, tuning: Tuning, strategy: Strategy): Game => {
  let next = game.pending > 0 ? collect(game) : game

  // Each action item's Study goes first: an unfixed root cause comes back.
  for (const postmortem of next.postmortems)
    next = tried(next, filePostmortem(next, postmortem.id, true))
  for (const node of next.nodes.filter((entry) => Life.guards.Stopped(entry.life)))
    next = tried(next, replace(next, node.id))
  const incident = next.incident
  if (incident?.kind === 'leak' && incident.nodeId)
    next = tried(next, restart(next, incident.nodeId))
  if (incident?.kind === 'slow-query' && incident.nodeId)
    next = tried(next, addIndex(next, incident.nodeId))
  // A Feature's query shape has no index yet, and the Team waits on it: the task goes first.
  const database = next.nodes.find((node) => node.type === 'database')
  if (database && serviceOf(next).shapes > 0) next = tried(next, addIndex(next, database.id))
  if (incident?.kind === 'poison') next = tried(next, deleteMessage(next))
  if (incident?.kind === 'certificate') next = tried(next, renewCertificate(next))
  if (incident?.kind === 'regex') next = tried(next, disableRule(next))
  if (incident?.kind === 'report-db') next = tried(next, cancelReport(next))
  if (incident?.kind === 'disk-full') next = tried(next, expandVolume(next))
  if (incident?.kind === 'gc-storm' && incident.nodeId)
    next = tried(next, restart(next, incident.nodeId))
  // Under attack mode only while the DDoS lasts: it blocks real users too.
  for (const waf of next.nodes.filter((node) => node.type === 'waf'))
    if (waf.underAttack !== (incident?.kind === 'ddos'))
      next = tried(next, setUnderAttack(next, waf.id, incident?.kind === 'ddos'))

  const ready = (id: ResearchId) => !has(next, id) && researchReady(next, id)
  // Chat's realtime connections need a runtime that holds them, and PHP refuses them all.
  const chat = isBuilt(next, 'chat') || next.backlog.some((item) => item.ref === 'chat')
  const realtime =
    strategy !== 'stubborn' && chat && RUNTIMES[stackOf(next).runtime].connectionKB === null
  next = studies(next, solveFlow(next), strategy, realtime, ready)

  // PHP-FPM replaces Apache as soon as it is researched. Polyglot moves to the language it
  // researched last. Once Chat is on the way, a Stack that refuses realtime connections moves
  // to Node.js cluster mode. Each is a migration, which the autopilot shifts step by step.
  const first = servers(next)[0]
  if (strategy !== 'stubborn' && strategy !== 'greedy' && first && !serviceOf(next).migration) {
    const latest = next.researched.findLast((id) => LANGUAGE_RESEARCH.some(([lang]) => lang === id))
    const polyglot = LANGUAGE_RESEARCH.find(([id]) => id === latest)?.[1]
    const target =
      strategy === 'polyglot' && polyglot
        ? polyglot
        : has(next, 'lang-go')
          ? 'go'
          : realtime && has(next, 'node-cluster')
            ? 'node_cluster'
            : stackOf(next).runtime === 'mod_php' && has(next, 'php-fpm')
              ? 'php_fpm'
              : null
    if (target && stackOf(next).runtime !== target)
      next = tried(next, changeStack(next, first.id, { runtime: target }))
  }
  // The strangler moves the App Servers; a Worker runs the same code, so it follows the Service.
  if (strategy !== 'stubborn' && strategy !== 'greedy' && !serviceOf(next).migration) {
    const runtime = stackOf(next).runtime
    for (const worker of next.nodes.filter((node) => node.type === 'worker'))
      if (worker.runtime !== runtime) next = tried(next, setRuntime(next, worker.id, runtime))
  }
  // A server the strangler just moved restarts with the default pool: size it to its RAM.
  for (const server of servers(next))
    if (
      RUNTIMES[server.runtime].pool &&
      Life.guards.Restarting(server.life) &&
      server.workers < fittingWorkers(server)
    )
      next = tried(next, setWorkers(next, server.id, fittingWorkers(server)))

  // A blocked item waits on the player's answer: the bot approves a team-size block (a team past 8 engineers stops shipping
  // Features otherwise). A decision block stays: it holds Features while Apdex misses its target,
  // and an index block clears when the bot adds the index.
  for (const item of next.backlog)
    if (WorkBlock.guards.Blocked(item.block) && item.block.reason === 'size')
      next = tried(next, approveBlock(next, item.id))

  // A resharding is the Database's way out, and a migration's bugs fail requests until fixed: each
  // goes first, rushed from the pool.
  for (const item of next.backlog.filter(
    (entry) => entry.ref === 'reshard' || entry.ref === 'fix-bugs',
  )) {
    next = tried(next, prioritizeItem(next, item.id))
    next = tried(next, rushItem(next, item.id))
  }

  // A CVE's patch ticket goes first: an expired one starts a Data breach.
  for (const item of next.backlog.filter((entry) => entry.kind === 'patch'))
    next = tried(next, prioritizeItem(next, item.id))

  // Transaction pooling breaks session state: drop it, first in line, rushed from the pool.
  if (next.nodes.some((node) => node.type === 'pooler')) {
    const queued = tried(next, queueTask(next, 'session-state'))
    const task = queued.backlog.find((item) => item.ref === 'session-state')
    if (task) {
      let top = queued
      for (let index = queued.backlog.indexOf(task); index > 0; index -= 1)
        top = tried(top, moveItem(top, task.id, -1))
      next = tried(top, rushItem(top, task.id))
    }
  }

  // Hire while payroll, the new hire included, stays a modest share of revenue.
  if (strategy !== 'greedy' && next.stage >= 1) {
    const flow = solveFlow(next)
    const language = languageOfService(next)
    const headcount = next.engineers.length + next.hires.length
    if (
      headcount < maxHires(next.stage) &&
      salaryOf(next, language) * (headcount + 1) <= flow.revenue * PAYROLL_SHARE &&
      next.cash - signingOf(next, language) >= flow.burn * RESERVE_SECONDS
    )
      next = tried(next, hire(next, tuning))
  }

  if (strategy !== 'greedy' && next.stage >= 2) next = seedBuild(next, solveFlow(next))
  if (strategy !== 'greedy' && next.stage >= 3) next = seriesABuild(next, solveFlow(next))
  if (strategy !== 'greedy' && next.stage >= 3) next = harden(next)
  if (strategy !== 'greedy' && next.stage >= 4) next = seriesBBuild(next, solveFlow(next))
  if (strategy !== 'greedy' && next.stage >= 5) next = seriesCBuild(next, solveFlow(next))
  if (strategy !== 'greedy' && next.stage >= 6) next = ipoBuild(next)

  // A Burstable box low on credits moves to General before it throttles, as a player watching it would.
  if (strategy !== 'greedy')
    for (const server of servers(next))
      if (server.family === 'burstable' && server.credits < LOW_CREDITS * CREDIT_CAP)
        next = tried(next, setFamily(next, server.id, 'general'))

  const flow = solveFlow(next)
  const target =
    bottleneckOf(next, flow) ??
    next.nodes
      .filter(
        (node) =>
          !isDown(node) && node.region === HOME_REGION && COMPONENTS[node.type].accepts.length > 0,
      )
      .map((node) => [node.id, flow.nodes[node.id]?.utilization ?? 0] as const)
      .filter(([, utilization]) => utilization > BUSY)
      .toSorted((a, b) => b[1] - a[1])[0]?.[0]
  const found = target ? byId(next, target) : undefined
  const node = found?.region === HOME_REGION ? found : undefined
  if (node) next = relieve(next, flow, node, strategy)
  // From Series A a player keeps headroom for the evening peak (demand runs 1.45× the mean):
  // every Node whose load, scaled to the peak hour, passes HEADROOM gets relieved, the busiest first.
  if (strategy !== 'greedy' && next.stage >= 3)
    for (let pass = 0; pass < PASSES; pass += 1) {
      const view = solveFlow(next)
      const atPeak = (id: string): number =>
        (view.nodes[id]?.utilization ?? 0) * ((1 + DIURNAL_AMPLITUDE) / diurnal(next.time))
      const busy = next.nodes
        .filter(
          (entry) =>
            !isDown(entry) &&
            entry.region === HOME_REGION &&
            COMPONENTS[entry.type].limiting &&
            atPeak(entry.id) > HEADROOM,
        )
        .toSorted((a, b) => atPeak(b.id) - atPeak(a.id))
      // The first Node that accepts a change: a maxed box that cannot grow does not block its siblings.
      let moved = next
      for (const entry of busy) {
        moved = relieve(next, view, entry, strategy)
        if (moved !== next) break
      }
      if (moved === next) break
      next = moved
    }
  // A Cache that evicts more than it keeps hits too little to shield the Database: it grows.
  if (strategy !== 'greedy' && next.stage >= 3) {
    const view = solveFlow(next)
    for (const cache of next.nodes.filter((entry) => entry.type === 'cache')) {
      const own = view.nodes[cache.id]
      if (own && (own.evictions ?? 0) > 0 && (own.hitRatio ?? 1) < CACHE_HIT)
        next = affordable(next, view, (current) => resize(current, cache.id, 1))
    }
  }
  // Insight comes after capacity: the tap grows with Cash the bottleneck does not need.
  if (strategy !== 'greedy') next = sampleAll(next, solveFlow(next))

  if (!canRaise(next)) return next
  return tried(
    next,
    strategy === 'decliner'
      ? decline(next, tuning.firstIncidentAfter)
      : raise(next, tuning.firstIncidentAfter),
  )
}

/** Which milestones a look reached, by comparing the Game before and after. */
const reached = (before: Game, after: Game): ReadonlyArray<Milestone> => {
  const found: Array<Milestone> = []
  const sized = (game: Game) =>
    game.nodes.reduce((total, node) => total + (node.type === 'analytics' ? 0 : node.size), 0) +
    game.nodes.filter((node) => node.family !== 'burstable').length
  if (sized(after) > sized(before)) found.push('first-upgrade')
  if (after.nodes.some((node) => node.type === 'database')) found.push('db-split')
  if (servers(after).length > 1) found.push('second-server')
  if (after.stage >= 1) found.push('preseed')
  if (after.hires.length + after.engineers.length > 0) found.push('first-hire')
  if (after.stage >= 2) found.push('seed')
  if (after.nodes.some((node) => node.type === 'search')) found.push('search-engine')
  if (after.nodes.some((node) => node.type === 'waf')) found.push('waf')
  if (after.nodes.some((node) => node.type === 'queue')) found.push('queue')
  if (after.stage >= 3) found.push('series-a')
  if (after.nodes.some((node) => node.zone !== 'a')) found.push('second-zone')
  if (after.nodes.some((node) => node.standby)) found.push('standby')
  if (after.nodes.some((node) => node.type === 'autoscaler')) found.push('autoscaler')
  if (after.nodes.some((node) => node.type === 'cdn')) found.push('cdn')
  if (after.nodes.some((node) => node.type === 'psp')) found.push('payment-provider')
  if (after.stage >= 4) found.push('series-b')
  if (after.nodes.some((node) => node.type === 'warehouse')) found.push('warehouse')
  if (after.nodes.some((node) => node.type === 'llm' || node.type === 'gpu'))
    found.push('ai-serving')
  return found
}

/**
 * Plays a Company with a strategy in 1 s Steps until `until` sim seconds or
 * the Era `untilStage` begins (Seed by default). `tuning` defaults to the
 * design's pacing.
 */
export const runBot = (
  seed: number,
  until: number,
  tuning: Tuning = CHALLENGE_TUNING,
  strategy: Strategy = 'balanced',
  untilStage = 2,
  /** A later Company: founded with the Founder's perks, Venture and Mutators. */
  founding: Founding | null = null,
): BotRun => {
  let game = founding ? foundCompany(seed, founding) : newGame(seed)
  const milestones: Partial<Record<Milestone, number>> = {}
  const margins: Array<MarginRecord> = []
  const mark = (milestone: Milestone) => {
    if (milestones[milestone] === undefined) milestones[milestone] = game.time
  }
  while (game.time < until && game.stage < untilStage) {
    // The idle player logs in every two hours of game time, spends everything, and leaves.
    if (Math.round(game.time) % (strategy === 'idle' ? IDLE_EVERY : LOOK_EVERY) === 0) {
      const before = game
      const ledger = solveFlow(before)
      game = look(before, tuning, strategy)
      for (const milestone of reached(before, game)) mark(milestone)
      if (game.stage > before.stage)
        margins.push({
          stage: before.stage,
          time: game.time,
          live: marginOf(ledger.revenue, ledger.burn),
        })
    }
    const result = step(game, 1, tuning)
    game = result.game
    if (result.events.some(StepEvent.$is('IncidentStarted'))) mark('first-incident')
    if (result.events.some(StepEvent.$is('Deployed'))) mark('first-feature')
    if (result.events.some(StepEvent.$is('StudyCompleted'))) mark('first-research')
  }
  return { game, milestones, margins }
}
