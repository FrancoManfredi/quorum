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

/**
 * A Venture's traffic profile (13 "Ventures"): the share of each request kind its users send, over
 * every kind, summing to 1. The Era masks it to the kinds it serves and scales the rest back to 1,
 * so a profile set here is the mix the Company runs at Series C+.
 */
export type VentureShares = Readonly<Partial<Record<RequestKind, number>>>

export type VentureDef = Readonly<{
  id: VentureId
  name: string
  /** The daily peak, in calendar hours, and how far demand swings around the mean. */
  peak: number
  amplitude: number
  weekend: number
  /**
   * Its traffic profile, or null for the Era's own mix. B2B SaaS is the default Venture, so the
   * Era's mix is its profile; Bootstrapped indie is the same company without funding rounds.
   */
  shares: VentureShares | null
  /**
   * Multiplies what every request earns. Each Venture's value keeps its profile earning what the
   * slice tuned for it: a request of an ad-tech Company earns a third of a B2B SaaS one, and a
   * government contract's earns one and a half times as much.
   */
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
  entry: Pick<VentureDef, 'id' | 'name' | 'legacy' | 'summary'> & Partial<VentureDef>,
): VentureDef => ({
  peak: 20,
  amplitude: 0.45,
  weekend: 1,
  shares: null,
  value: 1,
  market: 1,
  bootstrapped: false,
  start: GARAGE_START,
  constraint: NO_CONSTRAINT,
  signature: null,
  ...entry,
})

/*
 * The traffic profiles. A retail, social, or advertising product leans on the reads a cache can
 * answer; a payments product writes; a media product moves bytes. The shares below follow the
 * shape each kind of company runs in production: an OLTP system is usually half reads and under a
 * third writes, a social feed reads tens of times for every post, a checkout is a fraction of the
 * requests that lead to it, and a bid is answered inside 100 ms or not at all. The slice's own
 * Eras set how much traffic there is; the Venture sets what it is made of.
 *
 * Every profile sums to 1 and gives every kind a share, because a kind with none would dry up its
 * Insight pool and stall a default recipe. The Eras mask a profile to the kinds they serve, so the
 * Garage still opens on pages and reads for every Venture.
 */
export const VENTURES: Record<VentureId, VentureDef> = {
  // The slice's balance was tuned on this curve and the Era's own mix; the GDD's office hours wait
  // for a re-tune. The SLA from Series B is the design's; the target one level up is the build's
  // reading of it.
  'b2b-saas': venture({
    id: 'b2b-saas',
    name: 'B2B SaaS',
    legacy: 1,
    constraint: { ...NO_CONSTRAINT, sla: 4 },
    signature: 'hot-shard',
    summary: 'Evening peak; the default mix',
  }),
  // A feed reads far more than it writes, and a timeline is one read per follower's feed. Video and
  // images carry the bytes; push tells the users to come back.
  'consumer-social': venture({
    id: 'consumer-social',
    name: 'Consumer social',
    weekend: 1.15,
    shares: {
      page: 0.08,
      read: 0.13,
      write: 0.05,
      login: 0.05,
      search: 0.03,
      upload: 0.06,
      bot: 0.05,
      media: 0.14,
      rt: 0.06,
      buy: 0.025,
      job: 0.025,
      report: 0.025,
      ai: 0.025,
      feed: 0.18,
      hook: 0.025,
      push: 0.035,
      bid: 0.01,
    },
    value: 0.55,
    market: 2,
    legacy: 1.1,
    signature: 'hot-key',
    constraint: { ...NO_CONSTRAINT, spikeWeight: 2 },
    summary: 'Feeds and video dominate; twice the users at half the value',
  }),
  // A payments product is checkouts and writes, with a webhook per settled charge. Everything else
  // is the console around it.
  fintech: venture({
    id: 'fintech',
    name: 'Fintech',
    peak: 14,
    amplitude: 0.6,
    weekend: 0.4,
    shares: {
      page: 0.14,
      read: 0.155,
      write: 0.12,
      login: 0.06,
      search: 0.04,
      upload: 0.03,
      bot: 0.03,
      media: 0.025,
      rt: 0.025,
      buy: 0.17,
      job: 0.025,
      report: 0.025,
      ai: 0.025,
      feed: 0.025,
      hook: 0.07,
      push: 0.025,
      bid: 0.01,
    },
    value: 0.72,
    legacy: 1.3,
    signature: 'double-charge',
    constraint: { ...NO_CONSTRAINT, staleFine: 20 },
    summary: 'Business hours; checkouts and writes dominate; a stale money read is fined',
  }),
  // The product is the stream: most requests are segments, and every byte bills. Pages and logins
  // are the small remainder, which is why egress decides the margin.
  streaming: venture({
    id: 'streaming',
    name: 'Streaming media',
    peak: 21,
    amplitude: 0.55,
    shares: {
      page: 0.08,
      read: 0.1,
      write: 0.04,
      login: 0.05,
      search: 0.04,
      upload: 0.03,
      bot: 0.03,
      media: 0.36,
      rt: 0.03,
      buy: 0.04,
      job: 0.025,
      report: 0.025,
      ai: 0.025,
      feed: 0.04,
      hook: 0.025,
      push: 0.05,
      bid: 0.01,
    },
    value: 0.77,
    legacy: 1.2,
    signature: 'premiere-spike',
    constraint: { ...NO_CONSTRAINT, egress: 3 },
    summary: 'Late evening peak; video dominates; egress costs three times',
  }),
  // A game backend is mostly realtime messages on connections that stay open, plus the state writes
  // a session makes and the login that starts it. Realtime is served where the players are: one Hub
  // per region from Series A (the design's "regions matter from Series A"). Its `rt` Apdex T 50 ms
  // is not built: the Apdex target is per Request kind in solve.ts, which this slice does not own.
  'game-backend': venture({
    id: 'game-backend',
    name: 'Game backend',
    peak: 21,
    shares: {
      page: 0.08,
      read: 0.1,
      write: 0.08,
      login: 0.08,
      search: 0.03,
      upload: 0.03,
      bot: 0.03,
      media: 0.04,
      rt: 0.305,
      buy: 0.04,
      job: 0.025,
      report: 0.025,
      ai: 0.025,
      feed: 0.025,
      hook: 0.025,
      push: 0.04,
      bid: 0.02,
    },
    value: 0.83,
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, hubsPerRegion: 3 },
    signature: 'launch-day',
    summary: 'Evening peak; realtime is most of the traffic',
  }),
  // Prompts are the product, so a quarter of the requests reach a GPU, and the documents users send
  // with them arrive as uploads. Batch jobs and reports are the rest of the bill. GPUs are scarce:
  // the Company holds two GPU Nodes, whatever their size, and resizes them. The two and the
  // scarcity are the Venture's own, and the inference cost that decides margin is the GPU Node's
  // own Burn (09), not a rule of this Venture.
  'ai-startup': venture({
    id: 'ai-startup',
    name: 'AI startup',
    amplitude: 0.1,
    shares: {
      page: 0.1,
      read: 0.11,
      write: 0.05,
      login: 0.04,
      search: 0.06,
      upload: 0.1,
      bot: 0.03,
      media: 0.03,
      rt: 0.025,
      buy: 0.03,
      job: 0.06,
      report: 0.04,
      ai: 0.23,
      feed: 0.025,
      hook: 0.03,
      push: 0.03,
      bid: 0.01,
    },
    value: 0.74,
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, gpus: 2 },
    signature: 'gpu-shortage',
    summary: 'Flat demand; prompts and uploads dominate; GPUs are scarce',
  }),
  // Catalogue pages and site search carry a store; a checkout is a small share of the requests that
  // lead to it, and a confirmation webhook follows it.
  'e-commerce': venture({
    id: 'e-commerce',
    name: 'E-commerce',
    shares: {
      page: 0.18,
      read: 0.12,
      write: 0.05,
      login: 0.05,
      search: 0.2,
      upload: 0.025,
      bot: 0.06,
      media: 0.04,
      rt: 0.025,
      buy: 0.07,
      job: 0.025,
      report: 0.025,
      ai: 0.025,
      feed: 0.025,
      hook: 0.04,
      push: 0.03,
      bid: 0.01,
    },
    value: 0.88,
    legacy: 1.2,
    signature: 'flash-sale',
    constraint: {
      ...NO_CONSTRAINT,
      sale: { everyDays: 30, startMinute: 720, minutes: 120, kind: 'buy', lift: 20 },
    },
    summary: 'Pages and searches dominate; a scheduled monthly sale',
  }),
  // API clients read far more than they write, and every event fans out as a webhook to a customer's
  // server. The dashboard in front of it is a small share of the traffic. The no-naive-retries rule
  // and the Series C webhooks are the design's; the curve, the profile, the market, the start and
  // the Legacy multiplier are proposed.
  'developer-platform': venture({
    id: 'developer-platform',
    name: 'Developer platform',
    amplitude: 0.1,
    shares: {
      page: 0.13,
      read: 0.22,
      write: 0.06,
      login: 0.06,
      search: 0.03,
      upload: 0.04,
      bot: 0.04,
      media: 0.025,
      rt: 0.025,
      buy: 0.03,
      job: 0.03,
      report: 0.025,
      ai: 0.04,
      feed: 0.025,
      hook: 0.16,
      push: 0.04,
      bid: 0.02,
    },
    value: 0.83,
    market: 1.5,
    legacy: 1.35,
    constraint: { ...NO_CONSTRAINT, noNaiveRetries: true },
    signature: 'retry-storm',
    summary: 'Flat, bursty; API reads and webhooks dominate; no naive retries',
  }),
  // Clinicians read and write records all day, look patients up by name, and open charts. Every read
  // is audited, so the writes outnumber what a consumer product would send. Business hours and the
  // Series A residency rule are the design's; the curve, the profile and the Legacy multiplier are
  // proposed.
  healthcare: venture({
    id: 'healthcare',
    name: 'Healthcare',
    peak: 14,
    weekend: 0.4,
    shares: {
      page: 0.11,
      read: 0.19,
      write: 0.165,
      login: 0.08,
      search: 0.1,
      upload: 0.04,
      bot: 0.02,
      media: 0.025,
      rt: 0.025,
      buy: 0.04,
      job: 0.03,
      report: 0.06,
      ai: 0.03,
      feed: 0.025,
      hook: 0.025,
      push: 0.025,
      bid: 0.01,
    },
    value: 0.87,
    legacy: 1.4,
    constraint: { ...NO_CONSTRAINT, residency: 3 },
    signature: 'audit',
    summary: 'Business hours; writes and searches dominate; data stays in region',
  }),
  // An exchange answers a bid for every impression, so bids are most of the traffic and almost none
  // of its value; crawlers and verification traffic follow. The 100 ms deadline, the bid kind's
  // value and its 100 ms Apdex target are the design's; the profile, the market and the value are
  // proposed.
  'ad-tech': venture({
    id: 'ad-tech',
    name: 'Ad tech',
    amplitude: 0.05,
    shares: {
      page: 0.12,
      read: 0.11,
      write: 0.05,
      login: 0.03,
      search: 0.03,
      upload: 0.025,
      bot: 0.06,
      media: 0.06,
      rt: 0.025,
      buy: 0.025,
      job: 0.025,
      report: 0.025,
      ai: 0.04,
      feed: 0.025,
      hook: 0.025,
      push: 0.025,
      bid: 0.3,
    },
    value: 0.44,
    market: 3,
    start: { ...GARAGE_START, cash: 400 },
    legacy: 1.3,
    constraint: { ...NO_CONSTRAINT, deadline: 100 },
    signature: 'latency-regression',
    summary: 'Flat and enormous; bids dominate; a request over 100 ms earns nothing',
  }),
  // A public service is pages and records, with forms that arrive as uploads and casework that runs
  // as reports. It is the busiest Venture with the smallest market. Business hours, deadline spikes,
  // the Java-or-C# rule and day-long procurement are the design's; the curve, the profile, the
  // contract cash and the Java starter are proposed.
  government: venture({
    id: 'government',
    name: 'Government contract',
    peak: 14,
    weekend: 0.2,
    shares: {
      page: 0.195,
      read: 0.15,
      write: 0.12,
      login: 0.08,
      search: 0.06,
      upload: 0.07,
      bot: 0.02,
      media: 0.025,
      rt: 0.025,
      buy: 0.05,
      job: 0.03,
      report: 0.05,
      ai: 0.04,
      feed: 0.025,
      hook: 0.025,
      push: 0.025,
      bid: 0.01,
    },
    value: 1.51,
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
    summary: 'Business hours; pages and records; Java or C#; a day to buy',
  }),
  // The same default mix as B2B SaaS, run without funding rounds.
  bootstrapped: venture({
    id: 'bootstrapped',
    name: 'Bootstrapped indie',
    bootstrapped: true,
    legacy: 1.4,
    // The design's row names Runway, which is a figure rather than an incident: no Cash-versus-Burn
    // rule and no incident is built for it (16 "Open gaps").
    summary: 'No funding rounds; the default mix; Equity stays 100%',
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
export const HN_WEIGHT = 3
/** SLO levels: Strict SLO moves each Era's target to the next one up. */
export const SLO_LEVELS: ReadonlyArray<number> = [0.99, 0.995, 0.999, 0.9995, 0.9999, 0.99999]
