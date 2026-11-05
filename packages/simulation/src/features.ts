import {
  ADOPTION_DAYS,
  CALENDAR_DAY,
  FEATURES,
  FEATURE_IDS,
  LIFT_CONFIDENCE,
  LIFT_MAX_ROLLOUT,
  LIFT_MIN_ROLLOUT,
  LIFT_SPREAD,
  LIVE_TUNING,
  MARKET_GAIN_CAP,
  OUTCOME_BANDS,
  PAYING_SHARE,
  PLAN_PER_DAY,
  ROLLOUT_ALL,
  type BackendKind,
  type FeatureDef,
  type FeatureId,
  type RequestKind,
  type Tuning,
} from './catalog.ts'
import { ventureOf } from './founding.ts'
import { eraOf, has, isDown } from './lookups.ts'
import { nextRandom } from './random.ts'
import type { Game, LiftSample } from './state.ts'

/* ==========================================================================
   What shipped Features do to users, money, and load (08 "Features"). A
   Sandbox runs its Era's mix with no Feature effects, as it always has.
   ========================================================================== */

/** The rate the experiment samples at when the Design runs no Analytics. Proposed. */
const LIFT_SAMPLE_FLOOR = 0.01

/**
 * The share of users a Feature reaches: its flag's rollout, or every user without a live Feature
 * Flags Node (05 "Feature Flags"). The same rule `team.ts` reads for a bad deploy's blast radius.
 */
const rolloutOf = (game: Game, feature: string): number => {
  const flags = game.nodes.some((node) => node.type === 'ff' && !isDown(node))
  if (!flags) return ROLLOUT_ALL
  return Math.max(0, Math.min(ROLLOUT_ALL, game.services[0]?.rollouts[feature] ?? ROLLOUT_ALL))
}

const shipped = (game: Game): ReadonlyArray<FeatureDef> =>
  game.sandbox ? [] : game.shipped.map((id) => FEATURES[id])

/**
 * The share of a Feature's effect users have now (08 "Adoption"): its rollout times its adoption.
 * An old save names no adoption, so its Features are fully adopted and play as they did.
 */
export const exposureOf = (game: Game, id: FeatureId): number =>
  rolloutOf(game, id) * (game.adoption[id] ?? 1)

/**
 * The share of a Feature's win effect that lands on market, growth, churn, and value (08
 * "Outcomes"): 1 for a Feature not yet rolled, which is a save from before Outcomes or one still
 * on the backlog, so it plays at its full win effect until it is queued.
 */
export const outcomeOf = (game: Game, id: FeatureId): number => game.outcomes[id] ?? 1

/**
 * Rolls a Feature's outcome from the Company's seed when it is queued (08 "Outcomes"): a third of
 * the roll each for Win, Flat, and Loss, and the realized share uniform across the band. A Feature
 * whose win effect is 1 on market, growth, churn, and value already (it only unlocks a kind or
 * meets a requirement) rolls nothing to roll, so its outcome is not stored and it always "does
 * that" (08 "Outcomes").
 */
export const rollOutcome = (game: Game, id: FeatureId): Game => {
  const def = FEATURES[id]
  if (
    def.market === 1 &&
    def.growth === 1 &&
    def.churn === 1 &&
    Object.keys(def.value).length === 0
  )
    return game
  const [roll, seed] = nextRandom(game.seed)
  const band =
    OUTCOME_BANDS[Math.min(OUTCOME_BANDS.length - 1, Math.floor(roll * OUTCOME_BANDS.length))]
  const [spread, afterSpread] = nextRandom(seed)
  const share = band ? band.lo + spread * (band.hi - band.lo) : 1
  return { ...game, seed: afterSpread, outcomes: { ...game.outcomes, [id]: share } }
}

/** One Feature's effect, from none at exposure 0 to all of it at exposure 1, at its realized outcome. */
const atExposure = (effect: number, exposure: number, outcome = 1): number =>
  1 + (effect - 1) * exposure * outcome

const product = (game: Game, of: (feature: FeatureDef, exposure: number) => number): number =>
  shipped(game).reduce((total, feature) => total * of(feature, exposureOf(game, feature.id)), 1)

/** Like `product`, but `of` also sees the Feature's realized outcome (08 "Outcomes"). */
const rolledProduct = (
  game: Game,
  of: (feature: FeatureDef, exposure: number, outcome: number) => number,
): number =>
  shipped(game).reduce(
    (total, feature) =>
      total * of(feature, exposureOf(game, feature.id), outcomeOf(game, feature.id)),
    1,
  )

/**
 * The share of demand each kind gets. A gated kind sends nothing until its
 * Feature ships, and the other shares grow to fill its place. An early kind
 * takes its share from the others. Load effects then add demand on top.
 */
export const mixOf = (game: Game): Partial<Record<RequestKind, number>> => {
  const era = eraOf(game).mix
  if (game.sandbox) return (game.scenario?.mix as Partial<Record<RequestKind, number>>) ?? era
  const shares: Partial<Record<RequestKind, number>> = { ...era }
  for (const id of FEATURE_IDS) {
    const unlocks = FEATURES[id].unlocks
    if (unlocks?.gated && !game.shipped.includes(id)) delete shares[unlocks.kind]
  }
  const total = Object.values(shares).reduce((sum, share) => sum + (share ?? 0), 0)
  for (const kind of Object.keys(shares) as Array<RequestKind>)
    shares[kind] = total > 0 ? (shares[kind] ?? 0) / total : 0
  for (const feature of shipped(game)) {
    const unlocks = feature.unlocks
    if (!unlocks) continue
    const exposure = exposureOf(game, feature.id)
    // A kind the Era's mix already sends grows in with its Feature's adoption; a kind that arrives
    // early (a non-gated unlock) takes its share from the others as users adopt it.
    if (!unlocks.gated) {
      const share = unlocks.share * exposure
      if ((shares[unlocks.kind] ?? 0) > 0) continue
      for (const kind of Object.keys(shares) as Array<RequestKind>)
        shares[kind] = (shares[kind] ?? 0) * (1 - share)
      shares[unlocks.kind] = share
    } else {
      shares[unlocks.kind] =
        shares[unlocks.kind] === undefined
          ? unlocks.share * exposure
          : (shares[unlocks.kind] ?? 0) * exposure
    }
  }
  for (const feature of shipped(game)) {
    const exposure = exposureOf(game, feature.id)
    for (const [kind, factor] of Object.entries(feature.load) as Array<[RequestKind, number]>)
      if (shares[kind] !== undefined)
        shares[kind] = (shares[kind] ?? 0) * atExposure(factor, exposure)
  }
  return ventureMix(game, shares)
}

/** The Venture's mix changes, on the kinds the Era has, with the total kept. */
const ventureMix = (
  game: Game,
  shares: Partial<Record<RequestKind, number>>,
): Partial<Record<RequestKind, number>> => {
  const changes = Object.entries(ventureOf(game).mix) as Array<[RequestKind, number]>
  if (!changes.some(([kind]) => (shares[kind] ?? 0) > 0)) return shares
  const before = Object.values(shares).reduce((sum, share) => sum + (share ?? 0), 0)
  const next = { ...shares }
  for (const [kind, factor] of changes)
    if (next[kind] !== undefined) next[kind] = (next[kind] ?? 0) * factor
  const after = Object.values(next).reduce((sum, share) => sum + (share ?? 0), 0)
  for (const kind of Object.keys(next) as Array<RequestKind>)
    next[kind] = after > 0 ? ((next[kind] ?? 0) * before) / after : 0
  return next
}

/**
 * Most users the market holds: the Era's, grown by the share of each Feature users have adopted,
 * at the Feature's realized outcome (08 "Outcomes"): a Loss can shrink the market as readily as a
 * Win grows it. The Features' gains compound up to a ceiling of +100% of the Era's market (08
 * "Sizes"): they reach more of the people who could use the product, not new people.
 */
export const marketOf = (game: Game): number =>
  eraOf(game).market *
  Math.min(
    MARKET_GAIN_CAP,
    rolledProduct(game, (feature, exposure, outcome) =>
      atExposure(feature.market, exposure, outcome),
    ),
  ) *
  ventureOf(game).market

export const growthFactor = (game: Game): number =>
  rolledProduct(game, (feature, exposure, outcome) => atExposure(feature.growth, exposure, outcome))

export const churnFactor = (game: Game): number =>
  rolledProduct(game, (feature, exposure, outcome) => atExposure(feature.churn, exposure, outcome))

/** What a request of `kind` earns relative to its catalog value. */
export const valueFactor = (game: Game, kind: RequestKind): number =>
  rolledProduct(game, (feature, exposure, outcome) =>
    atExposure(feature.value[kind] ?? 1, exposure, outcome),
  ) *
  ventureOf(game).value *
  (game.scenario?.value?.[kind] ?? 1)

/** How big a response of `kind` is relative to its profile. */
export const payloadFactor = (game: Game, kind: RequestKind): number =>
  product(game, (feature, exposure) => atExposure(feature.payload[kind] ?? 1, exposure))

/** Dollars per second from paid plans: paying users times the plan, per calendar day. */
export const subscriptionsOf = (game: Game): number => {
  const adopted = shipped(game).reduce(
    (sum, feature) => sum + (feature.subscription ? exposureOf(game, feature.id) : 0),
    0,
  )
  return adopted > 0 ? (game.users * PAYING_SHARE * PLAN_PER_DAY * adopted) / CALENDAR_DAY : 0
}

/** What one query of a backend kind costs relative to its catalog cost. */
export const queryFactor = (game: Game, kind: BackendKind): number =>
  product(game, (feature, exposure) => atExposure(feature.queries[kind] ?? 1, exposure))

/* ---------- adoption (08 "Adoption") ---------- */

/** Sim seconds a Feature takes to reach about 63% of its effect, on the Team's calendar. */
export const adoptionSeconds = (tuning: Tuning = LIVE_TUNING): number =>
  (ADOPTION_DAYS * CALENDAR_DAY) / tuning.calendarPace

/**
 * Each live Feature's adoption approaches 1 as calendar time passes:
 * `adoption += (1 − adoption) × Δt / τ`, with τ 7 calendar days (08 "Adoption"). A Feature not
 * named in the save is fully adopted, so an old save plays as it did.
 */
export const advanceAdoption = (
  game: Game,
  seconds: number,
  tuning: Tuning = LIVE_TUNING,
): Game => {
  if (game.sandbox || game.shipped.length === 0) return game
  if (Object.keys(game.adoption).length === 0) return game
  const share = Math.min(1, seconds / adoptionSeconds(tuning))
  const adoption = { ...game.adoption }
  for (const [id, value] of Object.entries(game.adoption))
    adoption[id] = value + (1 - value) * share
  return { ...game, adoption }
}

/* ---------- measured lift (08 "Measured lift") ---------- */

/**
 * The share of requests the experiment observes: the best Analytics tap's sample rate, or a
 * proposed 1% without one. A higher rate gives a verdict sooner, which is what sampling buys.
 */
export const liftSampleRate = (game: Game): number => {
  const rates = game.nodes
    .filter((node) => node.type === 'analytics' && !isDown(node))
    .map((node) => node.sampleRate)
  return Math.max(LIFT_SAMPLE_FLOOR, ...rates)
}

/** Whether A/B testing can measure a Feature now: the research, a live Feature, and a holdout. */
export const measurable = (game: Game, id: FeatureId): boolean => {
  if (!has(game, 'ab-testing') || !game.shipped.includes(id)) return false
  const rollout = rolloutOf(game, id)
  return rollout >= LIFT_MIN_ROLLOUT && rollout <= LIFT_MAX_ROLLOUT
}

/**
 * A Feature's realized effect on users: its market and growth, less its churn, at its realized
 * outcome (08 "Outcomes") and held at full strength. An A/B test compares the users who have it
 * with the holdout who do not, so the measured lift is the per-user effect, not the part of the
 * Company that has adopted it. Because the outcome can roll a Loss, the lift it measures can go
 * negative, and the verdict can become Loses, not only Wins.
 */
export const liftOf = (game: Game, id: FeatureId): number => {
  const def = FEATURES[id]
  const outcome = outcomeOf(game, id)
  const market = atExposure(def.market, 1, outcome)
  const growth = atExposure(def.growth, 1, outcome)
  const churn = atExposure(def.churn, 1, outcome)
  return (market * growth) / churn - 1
}

export type LiftVerdict = 'wins' | 'loses' | 'early'

export type LiftReading = Readonly<{
  /** The measured lift, as a share. */
  lift: number
  /** Half the 95% confidence interval. */
  halfWidth: number
  verdict: LiftVerdict
}>

/**
 * What Analytics reads from a Feature's experiment (08 "Measured lift"):
 * `half_width = 1.96 × σ × sqrt(1/n_exposed + 1/n_holdout)`, σ = 1. Both counts are sampled
 * requests since the Feature reached its current rollout step.
 */
export const liftReading = (game: Game, id: FeatureId): LiftReading | null => {
  if (!measurable(game, id)) return null
  const lift = liftOf(game, id)
  if (lift === 0) return null
  const sample: LiftSample | undefined = game.lifts[id]
  const exposed = Math.max(0, sample?.exposed ?? 0)
  const holdout = Math.max(0, sample?.holdout ?? 0)
  if (exposed <= 0 || holdout <= 0)
    return { lift, halfWidth: Number.POSITIVE_INFINITY, verdict: 'early' }
  const halfWidth = LIFT_CONFIDENCE * LIFT_SPREAD * Math.sqrt(1 / exposed + 1 / holdout)
  const verdict: LiftVerdict =
    lift - halfWidth > 0 ? 'wins' : lift + halfWidth < 0 ? 'loses' : 'early'
  return { lift, halfWidth, verdict }
}

/** Counts sampled requests from the exposed users and the holdout of each measurable Feature. */
export const advanceLifts = (game: Game, demand: number, seconds: number): Game => {
  if (game.sandbox || demand <= 0) return game
  const observable = game.shipped.filter((id) => measurable(game, id) && liftOf(game, id) !== 0)
  if (observable.length === 0) return game
  const sampled = demand * liftSampleRate(game) * seconds
  const lifts = { ...game.lifts }
  for (const id of observable) {
    const rollout = rolloutOf(game, id)
    const prior = game.lifts[id]
    // A new rollout step starts its count again: the two groups changed.
    const base = prior && prior.step === rollout ? prior : { exposed: 0, holdout: 0, step: rollout }
    lifts[id] = {
      step: rollout,
      exposed: base.exposed + sampled * rollout,
      holdout: base.holdout + sampled * (1 - rollout),
    }
  }
  return { ...game, lifts }
}

/** Adoption and the A/B counts, both driven by the calendar and the traffic a Step moves. */
export const advanceFeatures = (
  game: Game,
  demand: number,
  seconds: number,
  tuning: Tuning = LIVE_TUNING,
): Game => advanceLifts(advanceAdoption(game, seconds, tuning), demand, seconds)
