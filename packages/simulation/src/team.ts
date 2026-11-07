import {
  BAD_DEPLOY_BASE,
  BAD_DEPLOY_ERRORS,
  BAD_DEPLOY_MAX,
  CALENDAR_DAY,
  CI_DEPLOY_MINUTES,
  CODE_REVIEW_FACTOR,
  COORDINATION,
  DEPLOY_STRATEGIES,
  DEV_HOURS_PER_DAY,
  ERAS,
  FEATURES,
  FOUNDER_OUTPUT,
  FRAMEWORKS,
  HIRE_DAYS,
  HIRING_PIPELINE,
  LANGUAGES,
  LAYOFF_MORALE,
  LIVE_TUNING,
  MANUAL_DEPLOY_MINUTES,
  MESH_TAX,
  MORALE_DAYS,
  POLICIES,
  PLATFORM_TAX,
  POLICY_SWITCH_DAYS,
  QUARTER_DAYS,
  RAMP_DAYS,
  RAMP_OUTPUT,
  ROLLOUT_ALL,
  RETROGRADE,
  RUNTIMES,
  RUSH_BUG_CHANCE,
  SALARY_BASE,
  SHARED_DB_COORDINATION,
  SIGNING_BASE,
  SUPPORTED_QUARTERS,
  TESTS_FACTOR,
  TRUNK_FREQUENCY,
  UPKEEP_CEILING,
  UPKEEP_HALF,
  UPKEEP_SHARE,
  UNHAPPY_MOOD,
  VERIFY_MINUTES,
  WORK_MINUTES,
  type DeployStrategyDef,
  type FeatureId,
  type FixId,
  type FrameworkId,
  type LanguageId,
  type PolicyDef,
  type RequestKind,
  type RuntimeId,
  type Tuning,
} from './catalog.ts'
import type { Ledger } from './ledger.ts'
import { eraOf, has, isDown, languageOf } from './lookups.ts'
import { awaitingFeatures, liveFeatures } from './features.ts'
import { rolloutOf as rolloutShareOf } from './feature-machine.ts'
import { budgetVelocity } from './slo.ts'
import {
  CORE_TEAM,
  monolith,
  type Engineer,
  type Game,
  type GameNode,
  type Service,
  type Team,
  type WorkItem,
} from './state.ts'

/* ==========================================================================
   The Team (08): who works, how fast, and what it costs. Pure numbers; the
   actions and the Step that use them are in work.ts.
   ========================================================================== */

/**
 * Headcount after the coordination penalty (08 "Coordination"). A team whose Service shares a
 * Database with another keeps half of the penalty again: a schema change still needs agreement.
 */
export const effectiveEngineers = (n: number, structure = 1, shared = false): number => {
  if (n <= 0) return 0
  const k = COORDINATION * structure * (shared ? 1 + SHARED_DB_COORDINATION : 1)
  return n / (1 + k * (n - 1) + RETROGRADE * n * (n - 1))
}

/** The starting Service: the one every Feature no other Service names stays with. */
export const serviceOf = (game: Game): Service => game.services[0] ?? monolith([])

/** The Service with this id, or the starting one: a save from before Services keeps working. */
export const serviceOfId = (game: Game, id: string | undefined): Service =>
  (id === undefined ? undefined : game.services.find((service) => service.id === id)) ??
  serviceOf(game)

export const withService = (game: Game, change: Partial<Service>): Game => ({
  ...game,
  services: [{ ...serviceOf(game), ...change }, ...game.services.slice(1)],
})

/** Changes one Service by id, leaving the others alone. */
export const withServiceId = (game: Game, id: string, change: Partial<Service>): Game => ({
  ...game,
  services: game.services.map((service) =>
    service.id === id ? { ...service, ...change } : service,
  ),
})

/* ---------- Ownership (08 "Services") ---------- */

/** The team that owns a Service: the one whose Dev Hours fix it, and the one an incident pages. */
export const ownerOf = (game: Game, service: Service): Team =>
  game.teams.find((team) => team.id === service.owner) ?? game.teams[0] ?? CORE_TEAM

/** The Service a team owns, or the starting one for a team that owns none. */
export const serviceOwnedBy = (game: Game, team: Team): Service =>
  game.services.find((service) => service.owner === team.id) ?? serviceOf(game)

/** The team an incident pages: the owner of the Service whose code failed, else the first team. */
export const pagedTeam = (game: Game): Team =>
  ownerOf(game, serviceOfId(game, game.incident?.service ?? undefined))

/** Whether a Feature puts a request kind on the wire: the load it adds or the kind it unlocks. */
const featureTouches = (id: FeatureId, kind: RequestKind): boolean => {
  const def = FEATURES[id]
  return def !== undefined && (kind in def.load || def.unlocks?.kind === kind)
}

/**
 * The Service that carries a Feature: the first one that was split for it. The starting Service
 * carries every Feature no other Service names, so an old save needs no features on its Service.
 */
export const serviceOfFeature = (game: Game, id: FeatureId): Service =>
  game.services.slice(1).find((service) => service.features.includes(id)) ?? serviceOf(game)

/** The Service whose code answers a request kind: the first one that carries a Feature touching it. */
export const serviceOfKind = (game: Game, kind: RequestKind): Service => {
  const carrier = game.services
    .slice(1)
    .find((service) => service.features.some((id) => featureTouches(id, kind)))
  return carrier ?? serviceOf(game)
}

/**
 * The Service whose deploy broke: the bad deploy names it, so only its traffic fails
 * (08 "Services", 11 "Bad deploy").
 */
export const blastService = (game: Game): Service =>
  serviceOfId(game, game.incident?.service ?? undefined)

/** Whether a request kind is the blast: a bad deploy fails only the Service that shipped it. */
export const failsKind = (game: Game, kind: RequestKind): boolean =>
  game.incident?.kind === 'bad-deploy' && serviceOfKind(game, kind).id === blastService(game).id

/** The Database a Service reads and writes: its own Node, or the Design's first one. */
const datastoreOf = (game: Game, service: Service): string =>
  service.datastore ?? game.nodes.find((node) => node.type === 'database')?.id ?? ''

/**
 * Whether a Service shares its Database with another Service (08 "Shared database penalty").
 * Services that name different Databases, or run with no Database, share nothing.
 */
export const sharesDatabase = (game: Game, service: Service): boolean => {
  const key = datastoreOf(game, service)
  return key !== '' && game.services.filter((entry) => datastoreOf(game, entry) === key).length > 1
}

/** A Sandbox has no Team: every fix is in its code, unless its Challenge makes fixes cost Dev Hours. */
export const fixed = (game: Game, fix: FixId): boolean =>
  (game.sandbox && !game.scenario?.tasks) || serviceOf(game).fixes.includes(fix)

const servers = (game: Game) => game.nodes.filter((node) => node.type === 'server')

/** The Stack most App Servers run: what the Service is written in. */
export const stackOf = (game: Game): Readonly<{ runtime: RuntimeId; framework: FrameworkId }> => {
  const counts = new Map<string, number>()
  for (const node of servers(game)) {
    const key = `${node.runtime}/${node.framework}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  let best: string | null = null
  for (const [key, count] of counts)
    if (best === null || count > (counts.get(best) ?? 0)) best = key
  const first = servers(game)[0]
  if (best === null || !first) return { runtime: 'mod_php', framework: 'none' }
  const [runtime, framework] = best.split('/') as [RuntimeId, FrameworkId]
  return { runtime, framework }
}

/** The language the Service hires for. */
export const languageOfService = (game: Game): LanguageId => {
  const node = servers(game).find((entry) => entry.runtime === stackOf(game).runtime)
  return node ? languageOf(node) : 'php'
}

/** The multiplier a framework puts on the coordination constant: Spring Boot, NestJS and Symfony 0.7. */
export const coordinationOf = (game: Game): number =>
  FRAMEWORKS[stackOf(game).framework].coordination ?? 1

/** The multiplier a framework puts on the tech debt each Feature adds: Symfony 0.7, Express 1.1. */
export const debtGrowthOf = (game: Game): number => FRAMEWORKS[stackOf(game).framework].debt ?? 1

/* ---------- ownership and upkeep (08 "Upkeep") ---------- */

/** The Dev Hours of the Features a Service carries and has not removed. */
export const featureHoursOn = (game: Game, service: Service): number =>
  liveFeatures(game).reduce(
    (sum, id) => (serviceOfFeature(game, id).id === service.id ? sum + FEATURES[id].dh : sum),
    0,
  )

/**
 * The share of a Service's Dev Hours that keeps its live Features running (08 "Upkeep"):
 * `0.4 × S / (S + 2,000) × (1 + debt)`, capped at 0.6, where S is the Dev Hours of the Features
 * shipped on the Service. 500 DH costs 8%, 4,000 DH 27%, and it approaches 40% with no debt.
 */
export const upkeepShare = (game: Game, service: Service): number => {
  const hours = featureHoursOn(game, service)
  if (hours <= 0) return 0
  return Math.min(
    UPKEEP_CEILING,
    (UPKEEP_SHARE * hours * (1 + service.debt)) / (hours + UPKEEP_HALF),
  )
}

/**
 * A Service's share of the Company's Burn (08 "Services": "every Service still shares the one...
 * Burn"). The design gives no split, because Nodes belong to the board, not to a Service: this
 * build attributes Burn by each Service's share of the Company's total codebase (KLOC), the one
 * size every Service already tracks.  The starting Service, which carries every Feature
 * no other Service names, reads the whole Burn on a Company that never splits.
 */
export const serviceBurnOf = (game: Game, ledger: Ledger, service: Service): number => {
  const total = game.services.reduce((sum, entry) => sum + entry.codebase, 0)
  return total > 0 ? (ledger.burn * service.codebase) / total : ledger.burn
}

/* ---------- pay and mood (08 "Hiring", 18 "Burnout and quitting") ---------- */

/** The salary index an engineer is paid at: the one set at hire or by a raise, else the Era's. */
export const paidIndex = (game: Game, engineer: Engineer): number =>
  engineer.salary ?? eraOf(game).salaryIndex

/** Dollars per second one engineer costs: the salary index they are paid at, times their language. */
export const payOf = (game: Game, engineer: Engineer): number =>
  SALARY_BASE * paidIndex(game, engineer) * LANGUAGES[engineer.language].salary

/**
 * How far an engineer's pay sits below the Era's going rate for their language, as a share: 0 when
 * they are paid the Era's rate, and 0.5 when they earn half of it (18 "a lower salary than the
 * Era's"). An engineer hired in an earlier Era falls behind unless the player raises them.
 */
export const payGapOf = (game: Game, engineer: Engineer): number => {
  const rate = eraOf(game).salaryIndex
  if (rate <= 0) return 0
  return Math.max(0, Math.min(1, 1 - paidIndex(game, engineer) / rate))
}

/** Whether an engineer is unhappy enough to write to the player (18 "Burnout and quitting"). */
export const unhappy = (engineer: Engineer): boolean => engineer.mood <= UNHAPPY_MOOD

/** A Data team with at least one engineer runs the warehouse and the copies (08 "Teams"). */
export const dataStaffed = (game: Game): boolean =>
  game.teams.some(
    (team) => team.kind === 'data' && game.engineers.some((engineer) => engineer.team === team.id),
  )

/**
 * The engineer from a Team who owns a piece of work: the same one for the same salt, so a Thread
 * keeps one sender and a replay keeps one name. Undefined when the Team has nobody on it.
 */
export const memberOf = (game: Game, teamId: string, salt: number): Engineer | undefined => {
  const members = game.engineers.filter((engineer) => engineer.team === teamId)
  return members[Math.abs(Math.trunc(salt)) % Math.max(1, members.length)]
}

/* ---------- calendar time ---------- */

export const days = (count: number, tuning: Tuning): number =>
  (count * CALENDAR_DAY) / tuning.calendarPace

/** The policy a team works under now: the old one for a calendar day after a change. */
export const policyNow = (game: Game, team: Team, tuning: Tuning = LIVE_TUNING): PolicyDef =>
  game.time - team.since < days(POLICY_SWITCH_DAYS, tuning)
    ? POLICIES[team.previous]
    : POLICIES[team.policy]

/** Sim seconds a new hire runs at 30%. Rails halves it; no framework stretches it with debt. */
export const rampSeconds = (game: Game, tuning: Tuning = LIVE_TUNING): number => {
  const framework = stackOf(game).framework
  const factor = framework === 'rails' ? 0.5 : framework === 'none' ? 1 + serviceOf(game).debt : 1
  return days(RAMP_DAYS, tuning) * factor
}

export const outputOf = (game: Game, engineer: Engineer, tuning: Tuning = LIVE_TUNING): number =>
  // On time off an engineer produces nothing at all (18 "Burnout and quitting").
  game.time < engineer.offUntil
    ? 0
    : game.time - engineer.hiredAt < rampSeconds(game, tuning)
      ? RAMP_OUTPUT
      : 1

/** Sim seconds to hire: the Era's days, less 30% with the Hiring pipeline. */
export const hireSeconds = (
  game: Game,
  language: LanguageId,
  tuning: Tuning = LIVE_TUNING,
): number => {
  const factor = has(game, 'hiring-pipeline') ? HIRING_PIPELINE : 1
  return days(HIRE_DAYS * LANGUAGES[language].hireTime * factor, tuning)
}

export const moraleSeconds = (tuning: Tuning = LIVE_TUNING): number => days(MORALE_DAYS, tuning)

/* ---------- the platform (08 "Teams") ---------- */

/** A Platform team with at least one engineer runs the Clusters and the deploy pipeline. */
export const platformStaffed = (game: Game): boolean =>
  game.teams.some(
    (team) =>
      team.kind === 'platform' && game.engineers.some((engineer) => engineer.team === team.id),
  )

const liveClusters = (game: Game): number =>
  game.nodes.filter((node) => node.type === 'cluster' && !isDown(node)).length

/** Live Service Mesh Nodes: each one takes Platform Dev Hours while it runs (05). */
const liveMeshes = (game: Game): number =>
  game.nodes.filter((node) => node.type === 'mesh' && !isDown(node) && node.service._tag !== 'Shut')
    .length

/** Sim seconds in a calendar quarter, on the Team's calendar. */
export const quarterSeconds = (tuning: Tuning = LIVE_TUNING): number => days(QUARTER_DAYS, tuning)

/** Calendar quarters a Cluster has run past its version's support; 0 while supported. */
export const quartersBehind = (
  game: Game,
  cluster: GameNode,
  tuning: Tuning = LIVE_TUNING,
): number =>
  Math.max(0, (game.time - cluster.upgradedAt) / quarterSeconds(tuning) - SUPPORTED_QUARTERS)

/**
 * Engineers of Dev Hours the Clusters take from the product teams: 0.5 per
 * Cluster, and none with a Platform team, which does that work instead. A
 * Service Mesh is the same kind of work and takes the same share (05).
 */
export const platformTax = (game: Game): number =>
  platformStaffed(game) ? 0 : PLATFORM_TAX * liveClusters(game) + MESH_TAX * liveMeshes(game)

/* ---------- output ---------- */

export type TeamOutput = Readonly<{
  team: Team
  /** People on the team, the founder included. */
  headcount: number
  effective: number
  velocity: number
  /** Dev Hours per sim second. */
  rate: number
}>

export const membersOf = (game: Game, team: Team): ReadonlyArray<Engineer> =>
  game.engineers.filter((engineer) => engineer.team === team.id)

/**
 * Dev Hours each team makes (08): effective engineers × velocity × 8 per
 * calendar day, where velocity is the Stack's, slowed by debt, set by the
 * policy, and hit by morale. Dev Hours follow the Team's calendar, so
 * `calendarPace` speeds them as it speeds hiring and deploys.
 */
export const teamOutputs = (
  game: Game,
  ledger: Ledger,
  tuning: Tuning = LIVE_TUNING,
): ReadonlyArray<TeamOutput> => {
  if (game.sandbox) return []
  const morale = game.time < game.moraleUntil ? LAYOFF_MORALE : 1
  const outputs = game.teams.map((team, index) => {
    const owned = serviceOwnedBy(game, team)
    const members = membersOf(game, team)
    const founder = index === 0 ? FOUNDER_OUTPUT : 0
    const headcount = members.length + (index === 0 ? 1 : 0)
    const output = members.reduce(
      (sum, engineer) => sum + outputOf(game, engineer, tuning),
      founder,
    )
    const effective =
      headcount > 0
        ? (effectiveEngineers(headcount, coordinationOf(game), sharesDatabase(game, owned)) *
            output) /
          headcount
        : 0
    const velocity =
      ledger.velocity *
      (1 - 0.5 * owned.debt) *
      policyNow(game, team, tuning).velocity *
      morale *
      budgetVelocity(game)
    // A live Feature costs Dev Hours before the backlog gets any (08 "Upkeep"), on the Service the
    // team owns. A team that runs the system, not the product, builds no backlog to tax.
    const upkeep = team.kind === 'product' ? 1 - upkeepShare(game, owned) : 1
    const rate =
      (effective * velocity * upkeep * DEV_HOURS_PER_DAY * tuning.calendarPace) / CALENDAR_DAY
    return { team, headcount, effective, velocity, rate }
  })
  // Each Cluster takes engineers' worth of Dev Hours from the product teams, in proportion.
  const tax = platformTax(game)
  if (tax <= 0) return outputs
  const product = outputs.filter((entry) => entry.team.kind === 'product')
  const engineers = product.reduce((sum, entry) => sum + entry.effective, 0)
  const kept = engineers > 0 ? Math.max(0, 1 - tax / engineers) : 0
  return outputs.map((entry) =>
    entry.team.kind === 'product' ? { ...entry, rate: entry.rate * kept } : entry,
  )
}

export const devHoursRate = (game: Game, ledger: Ledger, tuning: Tuning = LIVE_TUNING): number =>
  teamOutputs(game, ledger, tuning).reduce((sum, entry) => sum + entry.rate, 0)

/* ---------- money ---------- */

export const salaryOf = (game: Game, language: LanguageId): number =>
  SALARY_BASE * eraOf(game).salaryIndex * LANGUAGES[language].salary

/** Dollars per second of payroll, at the salary index each engineer is paid. The founder draws none. */
export const payrollOf = (game: Game): number =>
  game.engineers.reduce((sum, engineer) => sum + payOf(game, engineer), 0)

/** One-time Cash to sign an engineer: $2,000 × the language's salary in Pre-seed, scaled by the Era. */
export const signingOf = (game: Game, language: LanguageId): number =>
  Math.round(
    (SIGNING_BASE * LANGUAGES[language].salary * eraOf(game).salaryIndex) /
      (ERAS[1]?.salaryIndex ?? 1),
  )

/* ---------- deploys ---------- */

/** The CI/CD Pipeline a Company has placed, or null. Its strategy needs the Node, not just the research. */
export const pipelineOf = (game: Game): GameNode | null =>
  game.nodes.find((node) => node.type === 'ci') ?? null

/** How a Company ships, or null without a Pipeline, which keeps the manual (or research) deploy. */
export const deployStrategyOf = (game: Game): DeployStrategyDef | null => {
  const pipeline = pipelineOf(game)
  return pipeline ? DEPLOY_STRATEGIES[pipeline.strategy] : null
}

/**
 * Minutes one build takes: the language's, times what the runtime adds. A GraalVM native image
 * compiles the whole program ahead of time and takes three times as long, and Quarkus halves that
 * (06 "Frameworks").
 */
export const buildMinutesOf = (game: Game): number => {
  const { runtime, framework } = stackOf(game)
  const extra = RUNTIMES[runtime].build ?? 1
  const native = extra > 1 ? extra * (FRAMEWORKS[framework].nativeBuild ?? 1) : extra
  return LANGUAGES[languageOfService(game)].buildMinutes * native
}

export const deploysPerDay = (game: Game, tuning: Tuning = LIVE_TUNING): number => {
  const team = game.teams[0]
  const policy = team ? policyNow(game, team, tuning) : POLICIES.balanced
  const strategy = deployStrategyOf(game)
  const minutes = strategy
    ? strategy.deployMinutes
    : has(game, 'ci')
      ? CI_DEPLOY_MINUTES
      : MANUAL_DEPLOY_MINUTES
  // A Platform team halves deploy time (08 "Teams").
  const deploy = minutes * (platformStaffed(game) ? 0.5 : 1)
  const build = buildMinutesOf(game)
  const base = Math.min(policy.deploysPerDay, WORK_MINUTES / (build + deploy + VERIFY_MINUTES))
  // Trunk-based development ships 50% more often (10 "Track: Product and business").
  return base * (has(game, 'trunk-based') ? TRUNK_FREQUENCY : 1)
}

/** Sim seconds between deploy slots. */
export const deployEvery = (game: Game, tuning: Tuning = LIVE_TUNING): number =>
  CALENDAR_DAY / deploysPerDay(game, tuning) / tuning.calendarPace

/**
 * The chance one deploy ships a bug (11 "Bad deploy"), for a Service: its own owner's policy and
 * its own tech debt, not the whole Design's (08 "Ownership"). Each Service still ships through the
 * one deploy pipeline, so every other factor is the Company's. `nextBadDeployChance` adds the risk
 * of the rushed Features in the batch.
 */
export const badDeployChance = (
  game: Game,
  tuning: Tuning = LIVE_TUNING,
  service: Service = serviceOf(game),
): number => {
  const team = ownerOf(game, service)
  const policy = policyNow(game, team, tuning)
  return (
    (BAD_DEPLOY_BASE[game.stage] ?? BAD_DEPLOY_BASE.at(-1) ?? 0) *
    policy.badDeploy *
    (1 + 2 * service.debt) *
    (has(game, 'testing-culture') ? 1 - TESTS_FACTOR : 1) *
    (has(game, 'code-review') ? 1 - CODE_REVIEW_FACTOR : 1)
  )
}

/**
 * The chance the next deploy of a Service ships a bug (08 "Rush"): its usual chance, plus the risk
 * each rushed Feature in the batch carries. A rollback keeps a Feature's share for the next deploy.
 */
export const nextBadDeployChance = (
  game: Game,
  tuning: Tuning = LIVE_TUNING,
  service: Service = serviceOf(game),
): number => {
  const base = badDeployChance(game, tuning, service)
  // The Garage has no bad deploy, so a rush there carries no risk.
  if (base <= 0) return 0
  const batch = awaitingFeatures(game).filter((id) => serviceOfFeature(game, id).id === service.id)
  const rush = batch.reduce((sum, id) => sum + RUSH_BUG_CHANCE * (game.rushedFeatures[id] ?? 0), 0)
  return Math.min(1, base + rush)
}

/* ---------- DORA metrics (08 "Deploy frequency") ---------- */

export type DoraMetrics = Readonly<{
  /** Deploys per calendar day. */
  deploysPerDay: number
  /** Sim seconds from a backlog item's start to the deploy that ships it: one deploy slot. */
  leadTime: number
  /** Share of deploys that shipped a bug, over every deploy the Company has made. */
  changeFailureRate: number
  /** Mean seconds to recover from a Bad deploy, over every Bad deploy postmortem; null with none yet. */
  mttr: number | null
}>

/**
 * The five DORA metrics 08 "Deploy frequency" names, minus rework rate, which the build does not
 * track: deploy frequency, lead time for changes, change failure rate, and failed deployment
 * recovery time (MTTR). They read the Company's own counters, so they need no history the save
 * does not already keep, and they are shown once a CI/CD Pipeline is placed (08 "Deploy frequency").
 */
export const doraMetrics = (game: Game, tuning: Tuning = LIVE_TUNING): DoraMetrics => {
  const recovered = game.postmortems.filter((entry) => entry.kind === 'bad-deploy')
  const mttr =
    recovered.length > 0
      ? recovered.reduce((sum, entry) => sum + entry.mttr, 0) / recovered.length
      : null
  return {
    deploysPerDay: deploysPerDay(game, tuning),
    leadTime: deployEvery(game, tuning),
    changeFailureRate: game.deploys > 0 ? game.badDeploys / game.deploys : 0,
    mttr,
  }
}

/**
 * The share of users a Feature reaches: its flag's rollout, or every user when no Feature Flags
 * Node is live or it has no flag (05 "Feature Flags", 08 "Rollout").
 */
export const rolloutOf = (game: Game, feature: string): number => {
  const flags = game.nodes.some((node) => node.type === 'ff' && !isDown(node))
  const phase = game.features[feature]
  if (!flags || phase === undefined) return ROLLOUT_ALL
  return Math.max(0, Math.min(ROLLOUT_ALL, rolloutShareOf(phase)))
}

/**
 * Share of App Server requests a bad deploy fails: bigger deploys break more, up to the ceiling,
 * and a Feature only breaks the share of users its flag has reached. A Feature behind a flag at
 * 5% cannot cost more than 5% of what it would have, whatever the deploy strategy. A deploy that
 * ships no Feature at all still breaks one Feature's worth, because it ships the code around them.
 */
export const badDeployShareOf = (game: Game, service: Service): number => {
  const batch = service.lastDeploy
  const reached = batch.reduce((sum, feature) => sum + rolloutOf(game, feature), 0)
  return Math.min(
    // Without a Pipeline the cap is 16's 40%; with one, its deploy strategy sets the cap.
    deployStrategyOf(game)?.blast ?? BAD_DEPLOY_MAX,
    BAD_DEPLOY_ERRORS * Math.max(batch.length === 0 ? 1 : 0, reached),
  )
}

/** The share of the Design a bad deploy breaks: the deploy that broke, or the starting Service. */
export const badDeployShare = (game: Game): number => badDeployShareOf(game, serviceOf(game))

/* ---------- the backlog ---------- */

/** Adds an item to the backlog: at the end, or at the top. */
export const enqueue = (
  game: Game,
  kind: WorkItem['kind'],
  ref: string,
  cost: number,
  top = false,
  extra: Pick<WorkItem, 'due' | 'target' | 'service'> = {},
): Game => {
  const item: WorkItem = {
    id: game.workSeq + 1,
    kind,
    ref,
    cost,
    spent: 0,
    block: { _tag: 'Free' },
    answered: null,
    ...extra,
  }
  return {
    ...game,
    workSeq: game.workSeq + 1,
    backlog: top ? [item, ...game.backlog] : [...game.backlog, item],
  }
}

/** Whether an App Server runs the new Stack of a migration whose bugs are not fixed. */
export const buggy = (game: Game, node: GameNode): boolean => {
  const migration = serviceOf(game).migration
  return (
    !!migration &&
    migration.bugs &&
    node.type === 'server' &&
    node.runtime === migration.runtime &&
    node.framework === migration.framework
  )
}
