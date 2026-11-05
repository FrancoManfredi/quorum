import {
  COMPONENTS,
  DIURNAL_AMPLITUDE,
  ERAS,
  FALLACY_IDS,
  LET_IT_CRASH,
  MIGRATION_STEPS,
  REGIONS,
  RUNTIMES,
  SPREAD_REGIONS,
  VENTURES,
  VENTURE_IDS,
  fallacyOf,
  type AchievementId,
  type ComponentId,
  type FallacyId,
  type LanguageId,
} from './catalog.ts'
import type { StepEvent } from './events.ts'
import { PRE_IPO_STAGE } from './ipo.ts'
import type { Ledger } from './ledger.ts'
import { isDown, pricingOf } from './lookups.ts'
import { openRegions, regionDiurnal, regionUsers, spreadRegions } from './regions.ts'
import { budgetOf, budgeted } from './slo.ts'
import type { Game, GameNode } from './state.ts'
import { valuationOf } from './valuation.ts'

/* ==========================================================================
   Achievements (14 "Achievements"): what a Company's Steps did that is worth
   a badge. Pure: the browser calls it on each tick of a Company, never in a
   Sandbox or a Challenge, and keeps the badges in the Founder record.
   ========================================================================== */

/** Counts the Founder keeps across Companies for the counting achievements. */
export type AchievementStats = Readonly<{
  postmortems: number
  terminations: number
  /** The fallacies the Founder has met in an incident, one entry each. */
  fallacies: ReadonlyArray<FallacyId>
}>

export type Moment = Readonly<{
  before: Game
  after: Game
  ledger: Ledger
  events: ReadonlyArray<StepEvent>
  /** The Founder's counts, with this moment's events already added. */
  stats: AchievementStats
  /** The Node the Bottleneck search named before this moment, so a check can see it move. */
  previousBottleneck: string | null
}>

const SERIES_A = ERAS.findIndex((era) => era.name === 'Series A')
const SERIES_B = ERAS.findIndex((era) => era.name === 'Series B')
const SEED = ERAS.findIndex((era) => era.name === 'Seed')
const PUBLIC = PRE_IPO_STAGE + 1
const WEEK_HOURS = 7 * 24
const POSTGRES: ReadonlySet<ComponentId> = new Set(['database', 'pooler', 'replica'])
/** The database tier a Company fixes to take load off its App Servers. */
const DATA_TIER: ReadonlySet<ComponentId> = new Set([
  'database',
  'pooler',
  'cache',
  'replica',
  'wide',
  'dsql',
])
/** A user hop longer than this crosses regions (05 "Zones and regions"). */
const FAR_MS = 150
/** A Node is busy above this share of its capacity. */
const BUSY = 0.7
/** Within this share of its 20:00 peak, a region counts as at its local peak: about 45 minutes. */
const PEAK = 1 + DIURNAL_AMPLITUDE * 0.98
const BILLION = 1e9
const SIX_BILLION = 6e9

const reached = (moment: Moment, stage: number): boolean =>
  moment.before.stage < stage && moment.after.stage >= stage

const languages = (game: Game): ReadonlySet<LanguageId> =>
  new Set(
    game.nodes
      .filter((node) => COMPONENTS[node.type].group === 'compute')
      .map((node) => RUNTIMES[node.runtime].language),
  )

const servers = (game: Game): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'server')

/** Equity before any round: the Pre-seed grant's dilution, or none when bootstrapped. */
const foundedEquity = (game: Game): number =>
  VENTURES[game.founding.venture].bootstrapped ? 1 : 1 - (ERAS[0]?.dilution ?? 0)

/** The terminations the chaos count takes: an instance failing on its own. */
export const isTermination = (event: StepEvent): boolean =>
  event._tag === 'IncidentResolved' && event.postmortem.kind === 'instance'

/** The Founder's counts after these events. */
export const countStats = (
  stats: AchievementStats,
  events: ReadonlyArray<StepEvent>,
): AchievementStats => {
  const met = events.flatMap((event) =>
    event._tag === 'IncidentResolved' ? (fallacyOf(event.postmortem.kind) ?? []) : [],
  )
  return {
    postmortems:
      stats.postmortems + events.filter((event) => event._tag === 'IncidentResolved').length,
    terminations: stats.terminations + events.filter(isTermination).length,
    fallacies: [...new Set([...stats.fallacies, ...met])],
  }
}

/** A Node that took more capacity this moment: it is new, or its size or copies grew. */
const grew = (before: Game, node: GameNode): boolean => {
  const was = before.nodes.find((entry) => entry.id === node.id)
  return was === undefined || node.size > was.size || node.replicas > was.replicas
}

const anyGrew = (before: Game, after: Game, where: (node: GameNode) => boolean): boolean =>
  after.nodes.some((node) => where(node) && grew(before, node))

/** A memory incident is running, killed a Node, or is still in the last postmortems. */
const memoryIncident = (game: Game, events: ReadonlyArray<StepEvent>): boolean =>
  game.incident?.kind === 'leak' ||
  game.nodes.some((node) => node.leak > 0) ||
  game.postmortems.some((postmortem) => postmortem.kind === 'leak') ||
  events.some(
    (event) =>
      event._tag === 'OutOfMemory' ||
      (event._tag === 'IncidentResolved' && event.postmortem.kind === 'leak'),
  )

/** A region is inside its own 20:00 peak. */
const atLocalPeak = (game: Game): boolean =>
  REGIONS.some((region) => regionDiurnal(game.time, region) >= PEAK)

/** The wide-column stores the Design runs. */
const wideStores = (game: Game): ReadonlyArray<GameNode> =>
  game.nodes.filter((node) => node.type === 'wide' && !isDown(node))

const CHECKS: Partial<Record<AchievementId, (moment: Moment) => boolean>> = {
  'hello-world': ({ ledger }) => ledger.served > 0,
  'works-on-my-machine': ({ events }) =>
    events.some((event) => event._tag === 'Deployed' && event.bad),
  'split-brain': ({ before, after }) =>
    !before.nodes.some((node) => node.type === 'database') &&
    after.nodes.some((node) => node.type === 'database'),
  'averages-lie': ({ before, after, ledger }) =>
    !before.researched.includes('percentiles') &&
    after.researched.includes('percentiles') &&
    ledger.p99 > 5 * ledger.latency,
  'shared-nothing': (moment) => {
    const apps = servers(moment.after)
    return (
      reached(moment, SEED) &&
      apps.length > 0 &&
      apps.every((node) => node.runtime === 'php_fpm') &&
      !memoryIncident(moment.after, moment.events)
    )
  },
  // The event-loop block is a Node.js App Server stalling one kind (the login hash) for everyone.
  blocked: ({ before, events }) =>
    before.incident?.kind === 'loop' &&
    before.nodes.some(
      (node) =>
        node.type === 'server' &&
        RUNTIMES[node.runtime].language === 'node' &&
        RUNTIMES[node.runtime].blocking === 'loop',
    ) &&
    events.some((event) => event._tag === 'IncidentResolved' && event.postmortem.kind === 'loop'),
  // The users' hop to the Design: two round trips, so a region two hops away is over 150 ms.
  'off-by-one-region': ({ ledger }) =>
    Object.values(ledger.regionKinds).some((kinds) =>
      Object.values(kinds ?? {}).some(
        (entry) =>
          entry !== undefined && entry.rate > 0 && entry.success > 0 && entry.hopMs > FAR_MS,
      ),
    ),
  // An App Server was the bottleneck, the database tier took more capacity and nothing grew the
  // App Servers, and the App Server is no longer what limits the Design.
  'littles-law': ({ before, after, ledger, previousBottleneck }) => {
    const was = before.nodes.find((node) => node.id === previousBottleneck)
    if (was === undefined || was.type !== 'server') return false
    if (!anyGrew(before, after, (node) => DATA_TIER.has(node.type))) return false
    if (anyGrew(before, after, (node) => node.type === 'server')) return false
    const now = after.nodes.find((node) => node.id === ledger.bottleneck)
    return (
      ledger.bottleneck !== was.id &&
      (now === undefined || COMPONENTS[now.type].group !== 'compute')
    )
  },
  metastable: ({ events }) =>
    events.some(
      (event) => event._tag === 'IncidentResolved' && event.postmortem.kind === 'retry-storm',
    ),
  // Every App Server moved off the old Stack, the migration is over, and the language changed.
  'big-rewrite': ({ before, after }) => {
    const moved = before.services.find(
      (service) =>
        service.migration !== null &&
        RUNTIMES[service.migration.runtime].language !==
          RUNTIMES[service.migration.fromRuntime].language,
    )
    if (moved === undefined || moved.migration === null) return false
    if (after.services.some((service) => service.migration !== null)) return false
    const target = RUNTIMES[moved.migration.runtime].language
    const apps = servers(after)
    return apps.length > 0 && apps.every((node) => RUNTIMES[node.runtime].language === target)
  },
  strangler: ({ events, ledger }) =>
    events.some(
      (event) => event._tag === 'MigrationShifted' && event.step === MIGRATION_STEPS.length - 1,
    ) && ledger.errorShare < 0.01,
  polyglot: ({ after }) => languages(after).size >= 5,
  'zero-gc': ({ after, ledger }) =>
    after.nodes.some(
      (node) =>
        RUNTIMES[node.runtime].language === 'rust' &&
        COMPONENTS[node.type].group === 'compute' &&
        (ledger.nodes[node.id]?.inbound ?? 0) >= 100_000,
    ),
  'no-cache': (moment) =>
    reached(moment, SERIES_A) &&
    !moment.after.nodes.some((node) => node.type === 'cache' || node.type === 'cdn'),
  'postgres-for-everything': (moment) =>
    reached(moment, SERIES_B) &&
    moment.after.nodes.every(
      (node) => COMPONENTS[node.type].group !== 'data' || POSTGRES.has(node.type),
    ),
  'hug-of-death': ({ before, events }) =>
    before.incident !== null &&
    before.incident.kind === 'spike' &&
    before.incident.magnitude >= 10 &&
    events.some(
      (event) =>
        event._tag === 'IncidentResolved' &&
        event.postmortem.kind === 'spike' &&
        event.postmortem.lostUsers <= 0,
    ),
  'egress-shock': ({ ledger }) => {
    const lines = ledger.burnLines
    return (
      lines.egress > 0 &&
      Object.entries(lines).every(([line, value]) => line === 'egress' || value < lines.egress)
    )
  },
  'chaos-monkey': ({ stats }) => stats.terminations >= 100,
  blameless: ({ stats }) => stats.postmortems >= 50,
  nines: ({ after }) => {
    if (!budgeted(after) || after.budget.length < WEEK_HOURS) return false
    const budget = budgetOf(after)
    return budget.requests > 0 && budget.availability >= 0.9999
  },
  monoglot: (moment) => reached(moment, PUBLIC) && languages(moment.after).size === 1,
  'default-alive': (moment) =>
    reached(moment, PUBLIC) && moment.before.equity >= foundedEquity(moment.before) - 1e-9,
  unicorn: ({ after, ledger }) =>
    after.stage >= SERIES_A && valuationOf(after, ledger).valuation >= 1e9,
  decacorn: ({ after, ledger }) =>
    after.stage >= SERIES_A && valuationOf(after, ledger).valuation >= 1e10,
  'everyone-online': ({ after }) => after.users >= SIX_BILLION,
  'rule-of-40': ({ after, ledger }) =>
    after.quarter !== null && valuationOf(after, ledger).ruleOf40 >= 80,
  'beat-and-raise': ({ after }) => after.quarter !== null && after.quarter.streak >= 8,
  // Every key replicated to three regions, and a read and a write overlap at least one replica.
  quorum: ({ after, ledger }) =>
    openRegions(after).length >= SPREAD_REGIONS &&
    wideStores(after).some(
      (node) =>
        node.spread &&
        node.r + node.w > node.n &&
        spreadRegions(after, node, SPREAD_REGIONS).length >= SPREAD_REGIONS &&
        (ledger.nodes[node.id]?.inbound ?? 0) > 0,
    ),
  eventually: ({ after }) =>
    after.users >= BILLION && wideStores(after).some((node) => node.r === 1 && node.w === 1),
  // A spike is running, an Autoscaler asked its JVM service for copies or they joined, and the
  // p99 a second earlier holds.
  'warm-start': ({ before, after, ledger }) => {
    const prior = before.history.at(-1)?.p99
    if (before.incident?.kind !== 'spike' || prior === undefined || prior <= 0) return false
    const scaled = after.nodes.some((node) => {
      if (node.type !== 'server' || RUNTIMES[node.runtime].language !== 'java') return false
      const was = before.nodes.find((entry) => entry.id === node.id)
      return was !== undefined && (node.replicas > was.replicas || node.pending > was.pending)
    })
    return scaled && ledger.p99 <= prior
  },
  // A celebrity's post: a hot key resolved with no request failed on it.
  celebrity: ({ before, events }) =>
    before.incident?.kind === 'hot-key' &&
    events.some(
      (event) =>
        event._tag === 'IncidentResolved' &&
        event.postmortem.kind === 'hot-key' &&
        event.postmortem.failed <= 0,
    ),
  // Four regions, each with its own users, all of them at home in the evening, and no Node busy.
  'follow-the-sun': ({ after, ledger }) => {
    if (openRegions(after).length < REGIONS.length) return false
    const users = regionUsers(after)
    if (!REGIONS.every((region) => users[region] > 0)) return false
    return (
      atLocalPeak(after) && Object.values(ledger.nodes).every((node) => node.utilization <= BUSY)
    )
  },
  // The Cache's TTL serves stale reads, and an incident makes enough of them to fail requests.
  'two-hard-things': ({ events }) =>
    events.some(
      (event) => event._tag === 'IncidentResolved' && event.postmortem.kind === 'stale-read',
    ),
  // The slice has one Service: more teams than Services is the mismatch, and one team is the fix.
  'conways-law': ({ before, after }) =>
    before.teams.length > before.services.length &&
    after.services.length > 0 &&
    after.teams.length <= after.services.length,
  fallacies: ({ stats }) => new Set(stats.fallacies).size >= FALLACY_IDS.length,
  // The Hub came back, every client reconnected, and nothing was refused.
  'thundering-herd': ({ events }) =>
    events.some(
      (event) =>
        event._tag === 'IncidentResolved' &&
        event.postmortem.kind === 'reconnect' &&
        event.postmortem.failed <= 0,
    ),
  // The Design ended the incident by itself: a Cluster rescheduled a pod, a standby failed over,
  // a Spot Node came back, or a retry storm drained behind backoff.
  runbook: ({ events }) =>
    events.some((event) => event._tag === 'IncidentResolved' && event.postmortem.auto === true),
  finops: ({ after }) => {
    const models = new Set(
      after.nodes
        .filter((node) => COMPONENTS[node.type].group === 'compute')
        .map((node) => pricingOf(after, node)),
    )
    return models.has('reserved') && models.has('on-demand') && models.has('spot')
  },
  'spot-the-difference': ({ events }) =>
    events.some(
      (event) =>
        event._tag === 'IncidentResolved' &&
        event.postmortem.kind === 'spot-reclaim' &&
        event.postmortem.failed <= 0,
    ),
  // The supervisor restarts the process and the request is retried inside the VM: no request fails.
  'let-it-crash': ({ after, ledger }) =>
    ledger.errorShare === 0 &&
    after.nodes.some(
      (node) =>
        node.type === 'server' &&
        RUNTIMES[node.runtime].language === 'elixir' &&
        node.crashes >= LET_IT_CRASH &&
        (ledger.nodes[node.id]?.inbound ?? 0) > 0,
    ),
}

/** Achievements this moment earns that `owned` does not hold yet. */
export const detectAchievements = (
  moment: Moment,
  owned: ReadonlyArray<AchievementId>,
): ReadonlyArray<AchievementId> => {
  if (moment.after.sandbox) return []
  return Object.entries(CHECKS)
    .filter(([id, check]) => !owned.includes(id as AchievementId) && check(moment))
    .map(([id]) => id as AchievementId)
}

/** Serial founder: an Exit with every Venture. */
export const everyVenture = (ventures: ReadonlyArray<string>): boolean =>
  VENTURE_IDS.every((id) => ventures.includes(id))

/** Challenge achievements from one verified result's percentiles (0 to 1) per axis. */
export const challengeAchievements = (
  percentiles: ReadonlyArray<number>,
): ReadonlyArray<AchievementId> => [
  ...(percentiles.some((value) => value >= 0.9) ? (['histogram'] as const) : []),
  ...(percentiles.length >= 3 && percentiles.every((value) => value >= 0.7)
    ? (['pareto'] as const)
    : []),
]
