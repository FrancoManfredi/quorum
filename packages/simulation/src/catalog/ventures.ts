/* Ventures and Mutators (13 "Ventures", "Mutators"). */

import type { ComponentId } from './components.ts'
import type { IncidentId } from './incidents.ts'
import type { RequestKind } from './kinds.ts'
import type { ResearchId } from './research.ts'
import type { LanguageId, RuntimeId } from './runtimes.ts'

export const VENTURE_IDS = [
  'b2b-saas',
  'consumer-social',
  'fintech',
  'streaming',
  'game-backend',
  'ai-startup',
  'e-commerce',
  'developer-platform',
  'healthcare',
  'ad-tech',
  'bootstrapped',
  'government',
] as const
export type VentureId = (typeof VENTURE_IDS)[number]

/** Cash the Garage starts with, in dollars (13 "Ventures"). */
export const START_CASH = 300

/** What a Venture starts with, on top of the Garage or Pre-seed board. */
export type VentureStart = Readonly<{
  /** Cash on the first day, in dollars. */
  cash: number
  /** Equity the founders keep before any round. */
  equity: number
  /** The Era it starts in: 0 is the Garage, 1 is Pre-seed. */
  stage: number
  /** The Stack its first App Server already runs, or null for the board's own. */
  runtime: RuntimeId | null
  /** Research the Company starts with, on top of the board's. */
  researched: ReadonlyArray<ResearchId>
}>

/** The Garage start: the default Venture's, unchanged. */
export const GARAGE_START: VentureStart = {
  cash: START_CASH,
  equity: 1,
  stage: 0,
  runtime: null,
  researched: [],
}

/**
 * The rule that makes a Venture hard (13 "Ventures"). The four Ventures that arrived last each
 * carry one of the first five fields; three of the eight older ones carry one of the last three.
 * The rest name a rule this build has no place to enforce.
 */
export type VentureConstraint = Readonly<{
  /** Customers write their own retry loops: no naive retries on any Link. */
  noNaiveRetries: boolean
  /** From this Era (stage) on, data Components stay in the home region; null for none. */
  residency: number | null
  /** A request slower than this many milliseconds earns nothing; null for none. */
  deadline: number | null
  /** A bought Component runs one calendar day after it is paid for. */
  procurement: boolean
  /** Every service runs one of these languages; null for any. */
  languages: ReadonlyArray<LanguageId> | null
  /**
   * From this Era (stage) on the Company runs under the SLA it signed: its availability target
   * is one level above the Era's, so a missed week is a breach; null for none.
   */
  sla: number | null
  /** Most GPU Nodes the Company may hold, whatever their size: GPUs are scarce. 0 for no limit. */
  gpus: number
  /** From this Era (stage) on one Realtime Hub per region: realtime runs where its players are. */
  hubsPerRegion: number | null
  /** Streaming media: every byte leaving the Design bills this multiple of the price, so egress dominates. */
  egress: number
  /** Consumer social: viral spikes come this many times as often. */
  spikeWeight: number
  /** Fintech: a stale answer to a money kind costs this multiple of what the request earns. 0 for none. */
  staleFine: number
  /** E-commerce: a sale on a calendar schedule that lifts one kind; null for none. */
  sale: SaleSchedule | null
}>

/**
 * A scheduled sale (13 "Ventures"): every `everyDays` calendar days, from the second such day, at
 * `startMinute` of the day, one request kind rises by `lift` for `minutes` calendar minutes.
 */
export type SaleSchedule = Readonly<{
  everyDays: number
  startMinute: number
  minutes: number
  kind: RequestKind
  lift: number
}>

/** The request kinds that carry money, for Fintech's fine on a stale answer. */
export const MONEY_KINDS: ReadonlyArray<RequestKind> = ['read', 'write', 'buy']

export const NO_CONSTRAINT: VentureConstraint = {
  noNaiveRetries: false,
  residency: null,
  deadline: null,
  procurement: false,
  languages: null,
  sla: null,
  gpus: 0,
  hubsPerRegion: null,
  egress: 1,
  spikeWeight: 1,
  staleFine: 0,
  sale: null,
}

export type VentureDef = Readonly<{
  id: VentureId
  name: string
  /** Legacy to unlock it; 0 for the default. Bootstrapped indie opens with the first Exit. */
  cost: number
  /** The daily peak, in calendar hours, and how far demand swings around the mean. */
  peak: number
  amplitude: number
  /** Saturday and Sunday demand. */
  weekend: number
  /** Multiplies a kind's share of the mix, where the Era has it. */
  mix: Partial<Record<RequestKind, number>>
  /** Multiplies what every request earns, and the market. */
  value: number
  market: number
  /** No funding rounds: Equity stays 100%, and declining costs no growth. */
  bootstrapped: boolean
  /** The Cash, Equity, Era and Stack it starts with. */
  start: VentureStart
  /** The rule that makes it hard, enforced in founding.ts. */
  constraint: VentureConstraint
  /** The incident that recurs for it, or null when the design gives the Venture none. */
  signature: IncidentId | null
  legacy: number
  /** The shape and rule, in one line. */
  summary: string
}>

const venture = (
  entry: Pick<VentureDef, 'id' | 'name' | 'cost' | 'legacy' | 'summary'> & Partial<VentureDef>,
): VentureDef => ({
  peak: 20,
  amplitude: 0.45,
  weekend: 1,
  mix: {},
  value: 1,
  market: 1,
  bootstrapped: false,
  start: GARAGE_START,
  constraint: NO_CONSTRAINT,
  signature: null,
  ...entry,
})

export const VENTURES: Record<VentureId, VentureDef> = {
  // The slice's balance was tuned on this curve; the GDD's office hours wait for a re-tune.
  // The SLA from Series B is the design's; the target one level up is the build's reading of it.
  'b2b-saas': venture({
    id: 'b2b-saas',
    name: 'B2B SaaS',
    cost: 0,
    legacy: 1,
    constraint: { ...NO_CONSTRAINT, sla: 4 },
    signature: 'hot-shard',
    summary: 'Evening peak',
  }),
  'consumer-social': venture({
    id: 'consumer-social',
    name: 'Consumer social',
    cost: 5,
    weekend: 1.15,
    mix: { media: 1.5 },
    value: 0.5,
    market: 2,
    legacy: 1.1,
    signature: 'hot-key',
    constraint: { ...NO_CONSTRAINT, spikeWeight: 2 },
    summary: 'Twice the users, half the value each; media +50%; viral spikes twice as often',
  }),
  fintech: venture({
    id: 'fintech',
    name: 'Fintech',
    cost: 10,
    peak: 14,
    amplitude: 0.6,
    weekend: 0.4,
    mix: { buy: 4, write: 1.5 },
    legacy: 1.3,
    signature: 'double-charge',
    constraint: { ...NO_CONSTRAINT, staleFine: 20 },
    summary: 'Business hours; buy ×4, write +50%; a stale money read is fined',
  }),
  streaming: venture({
    id: 'streaming',
    name: 'Streaming media',
    cost: 10,
    peak: 21,
    amplitude: 0.55,
    mix: { media: 4 },
    legacy: 1.2,
    signature: 'premiere-spike',
    constraint: { ...NO_CONSTRAINT, egress: 3 },
    summary: 'Late evening peak; media ×4; egress costs three times as much',
  }),
  // Realtime is served where the players are: one Hub per region from Series A (the design's
  // "regions matter from Series A"). Its `rt` Apdex T 50 ms is not built: the Apdex target is
  // per Request kind in solve.ts, which this slice does not own.
  'game-backend': venture({
    id: 'game-backend',
    name: 'Game backend',
    cost: 15,
    peak: 21,
    mix: { rt: 4 },
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, hubsPerRegion: 3 },
    signature: 'launch-day',
    summary: 'Evening peak; realtime ×4',
  }),
  // GPUs are scarce: the Company holds two GPU Nodes, whatever their size, and resizes them.
  // The two is proposed; the scarcity is the design's. The inference cost that decides margin
  // is the GPU Node's own Burn (09), not a rule of this Venture.
  'ai-startup': venture({
    id: 'ai-startup',
    name: 'AI startup',
    cost: 15,
    amplitude: 0.1,
    mix: { ai: 3 },
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, gpus: 2 },
    signature: 'gpu-shortage',
    summary: 'Flat demand; AI ×3',
  }),
  'e-commerce': venture({
    id: 'e-commerce',
    name: 'E-commerce',
    cost: 20,
    mix: { buy: 2, search: 2 },
    legacy: 1.2,
    signature: 'flash-sale',
    constraint: {
      ...NO_CONSTRAINT,
      sale: { everyDays: 30, startMinute: 720, minutes: 120, kind: 'buy', lift: 20 },
    },
    summary: 'Buy ×2, search ×2; a scheduled monthly sale',
  }),
  // Flat, bursty API clients. The no-naive-retries rule and the Series C
  // webhooks are the design's; the curve, the mix boosts, the market, the start
  // and the Legacy multiplier are proposed.
  'developer-platform': venture({
    id: 'developer-platform',
    name: 'Developer platform',
    cost: 20,
    amplitude: 0.1,
    mix: { read: 2, hook: 3 },
    market: 1.5,
    legacy: 1.35,
    constraint: { ...NO_CONSTRAINT, noNaiveRetries: true },
    signature: 'retry-storm',
    summary: 'Flat, bursty; reads ×2; webhooks ×3 from Series C; no naive retries',
  }),
  // Business hours, writes and records. The residency rule, from Series A, is
  // the design's; the curve, the ×1.5 writes and the Legacy multiplier are
  // proposed.
  healthcare: venture({
    id: 'healthcare',
    name: 'Healthcare',
    cost: 30,
    peak: 14,
    weekend: 0.4,
    mix: { write: 1.5 },
    legacy: 1.4,
    constraint: { ...NO_CONSTRAINT, residency: 3 },
    signature: 'audit',
    summary: 'Business hours; writes +50%; data stays in the home region from Series A',
  }),
  // Flat, enormous, and cheap per request. The 100 ms deadline, the bid kind's value, its 100 ms
  // Apdex target and its ×10 volume are the design's; the market and the value are proposed.
  'ad-tech': venture({
    id: 'ad-tech',
    name: 'Ad tech',
    cost: 30,
    amplitude: 0.05,
    mix: { bid: 10 },
    value: 0.4,
    market: 3,
    start: { ...GARAGE_START, cash: 400 },
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, deadline: 100 },
    signature: 'latency-regression',
    summary: 'Flat and enormous; bids ×10; a request over 100 ms earns nothing',
  }),
  // Business hours and deadline spikes, on a Java or C# service bought through a
  // procurement cycle. The rule is the design's; the curve, the contract cash
  // and the Java starter are proposed.
  government: venture({
    id: 'government',
    name: 'Government contract',
    cost: 40,
    peak: 14,
    weekend: 0.2,
    value: 2,
    market: 0.8,
    start: {
      ...GARAGE_START,
      cash: 900,
      runtime: 'tomcat',
      researched: ['lang-java'],
    },
    legacy: 1.5,
    constraint: { ...NO_CONSTRAINT, procurement: true, languages: ['java', 'csharp'] },
    signature: 'deadline-day',
    summary: 'Business hours, deadline spikes; Java or C# only; a placement takes a day',
  }),
  bootstrapped: venture({
    id: 'bootstrapped',
    name: 'Bootstrapped indie',
    cost: 0,
    bootstrapped: true,
    legacy: 1.4,
    // The design's row names Runway, which is a figure rather than an incident: no Cash-versus-Burn
    // rule and no incident is built for it (16 "Open gaps").
    summary: 'No funding rounds; Equity stays 100%',
  }),
}

export const MUTATOR_IDS = [
  'chaos-monkey',
  'hn-front-page',
  'legacy-monolith',
  'one-region',
  'no-caches',
  'tight-budget',
  'single-language',
  'postgres',
  'strict-slo',
  'shared-tenancy',
] as const
export type MutatorId = (typeof MUTATOR_IDS)[number]

export type MutatorDef = Readonly<{
  id: MutatorId
  name: string
  rule: string
  /** Added to the Legacy multiplier. */
  legacy: number
}>

export const MUTATORS: Record<MutatorId, MutatorDef> = {
  'chaos-monkey': {
    id: 'chaos-monkey',
    name: 'Chaos Monkey',
    rule: 'Instance failures dominate from Seed',
    legacy: 0.25,
  },
  'hn-front-page': {
    id: 'hn-front-page',
    name: 'Hacker News front page',
    rule: 'Traffic spikes three times as often',
    legacy: 0.15,
  },
  'legacy-monolith': {
    id: 'legacy-monolith',
    name: 'Legacy monolith',
    rule: 'Large PHP codebase: migrations ×3, debt starts at 40%',
    legacy: 0.2,
  },
  'one-region': {
    id: 'one-region',
    name: 'One region forever',
    rule: 'No Nodes outside the home region',
    legacy: 0.2,
  },
  'no-caches': { id: 'no-caches', name: 'No caches', rule: 'No Cache, no CDN', legacy: 0.4 },
  'tight-budget': {
    id: 'tight-budget',
    name: 'Tight budget',
    rule: 'Funding grants halved',
    legacy: 0.2,
  },
  'single-language': {
    id: 'single-language',
    name: 'Single language',
    rule: 'Every App Server runs PHP',
    legacy: 0.15,
  },
  postgres: {
    id: 'postgres',
    name: 'Postgres for everything',
    rule: 'No Cache, wide-column, consensus or warehouse stores',
    legacy: 0.3,
  },
  'strict-slo': {
    id: 'strict-slo',
    name: 'Strict SLO',
    rule: 'The SLO is one level higher',
    legacy: 0.2,
  },
  'shared-tenancy': {
    id: 'shared-tenancy',
    name: 'Shared tenancy',
    rule: 'Noisy neighbours steal CPU from every instance',
    legacy: 0.1,
  },
}

/** What each Mutator refuses to place. */
export const MUTATOR_BANS: Partial<Record<MutatorId, ReadonlyArray<ComponentId>>> = {
  'no-caches': ['cache', 'cdn'],
  postgres: ['cache', 'wide', 'dsql', 'warehouse'],
}

/** Legacy monolith: thousands of lines at founding, migration cost, and starting debt. */
export const MONOLITH_KLOC = 40
export const MONOLITH_MIGRATION = 3
export const MONOLITH_DEBT = 0.4
/** Chaos Monkey's weight on instance failures, from Seed. */
export const CHAOS_WEIGHT = 4
export const CHAOS_FROM_STAGE = 2
/** Shared tenancy: the most CPU a noisy neighbour takes, and the sim seconds each draw lasts. */
export const STEAL_MAX = 0.3
export const STEAL_SECONDS = 30
/** Hacker News front page: spike weight. */
export const HN_WEIGHT = 3
/** SLO levels: Strict SLO moves each Era's target to the next one up. */
export const SLO_LEVELS: ReadonlyArray<number> = [0.99, 0.995, 0.999, 0.9995, 0.9999, 0.99999]
