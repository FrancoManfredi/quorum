import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import type { ResearchId } from '../catalog/research.ts'

/** A rolling deploy stops after its first batch of pods: they take this share of a bad deploy.  */
export const ROLLOUT_SHARE = 0.25

/**
 * How a CI/CD Pipeline ships (05 "CI/CD Pipeline"): each strategy trades deploy time and Burn for
 * the share of traffic a bad deploy breaks. A bad deploy fails `BAD_DEPLOY_ERRORS` of App Server
 * requests for each Feature in its batch, up to the strategy's `blast`.
 *
 * Recreate swaps every server at once, so nothing shields the batch. Rolling (the default) stops
 * after its first batch. Blue-green keeps the old fleet serving while the new one comes up and
 * verifies it, so only that first fleet's slice sees the bug. Canary sends 5% of traffic first.
 *
 * The design's ceilings are Recreate's 100% and Canary's 5%; Rolling keeps 16's 40%. Blue-green is
 * the build's change from 05's 100%: a deploy never interrupts traffic here and rollback is instant
 * for every Company, so the design's "instant rollback" pays nothing, and its "the old fleet keeps
 * serving until the new one is up" is read as the shield instead.
 *
 * Deploy minutes and the Burn multiplier are  Burn multiplies the Pipeline's
 * own, since a second fleet and the canary's metrics would bill beside it.
 */
export const DEPLOY_STRATEGY_IDS = ['recreate', 'rolling', 'blue-green', 'canary'] as const
export type DeployStrategyId = (typeof DEPLOY_STRATEGY_IDS)[number]

export type DeployStrategyDef = Readonly<{
  id: DeployStrategyId
  name: string
  /** Minutes a deploy takes through a Pipeline on this strategy. */
  deployMinutes: number
  /** Most of App Server requests a bad deploy fails, as a share. */
  blast: number
  /** What the strategy costs, as a multiple of the Pipeline's Burn. */
  burn: number
}>

export const DEPLOY_STRATEGIES: Record<DeployStrategyId, DeployStrategyDef> = {
  // Every server stops and starts on the new code: the whole batch is live at once.
  recreate: { id: 'recreate', name: 'Recreate', deployMinutes: 2, blast: 1, burn: 1 },
  // Today's deploy: a slice of the fleet at a time, up to the cap 16 gives a bad deploy.
  rolling: { id: 'rolling', name: 'Rolling', deployMinutes: 5, blast: 0.4, burn: 1 },
  // The old fleet serves until the new one is up and checked, so the bug shows on its slice.
  'blue-green': { id: 'blue-green', name: 'Blue-green', deployMinutes: 7, blast: 0.1, burn: 2 },
  // A canary sends the design's 5% of traffic first and waits before the rest.
  canary: { id: 'canary', name: 'Canary', deployMinutes: 10, blast: 0.05, burn: 1.5 },
}

/**
 * The research a deploy strategy needs (10 "Track: Reliability"): Recreate and Rolling come with
 * the Pipeline, Blue-green and Canary each need their own.
 */
export const STRATEGY_RESEARCH: Partial<Record<DeployStrategyId, ResearchId>> = {
  'blue-green': 'blue-green',
  canary: 'canary',
}

/** How a CI/CD Pipeline ships a deploy (05 "CI/CD Pipeline"). */
// The catalog's DEPLOY_STRATEGY_IDS, listed here because the catalog imports this file.
export const DeployStrategy = Schema.Literals([
  'recreate',
  'rolling',
  'blue-green',
  'canary',
] as const satisfies ReadonlyArray<DeployStrategyId>)
export type DeployStrategy = typeof DeployStrategy.Type

/** The saved properties of a ci Node, with the defaults an old save decodes to. */
export const ciFields = {
  /** How a CI/CD Pipeline ships: Recreate, Rolling, Blue-green or Canary (05 "CI/CD Pipeline"). */
  strategy: DeployStrategy.pipe(Schema.withDecodingDefaultKey(Effect.succeed('rolling' as const))),
} as const

// It carries no traffic: it decides how code reaches production, and how far a bad deploy reaches.
export const ciDef = def({
  id: 'ci',
  code: 'ci',
  name: 'CI/CD Pipeline',
  product: 'GitHub Actions',
  group: 'ops',
  blurb:
    'Ships what waits. Its deploy strategy sets how long a deploy takes, what it burns, and how bad a bad deploy is.',
  cost: 100,
  burn: 0.02,
  latency: 1,
  accepts: [],
  maxOut: 0,
  unlock: 'ci',
})
