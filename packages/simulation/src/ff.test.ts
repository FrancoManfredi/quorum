import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, setRollout, study, type Action } from './actions.ts'
import { FEATURE_IDS, RESEARCH, ROLLOUT_STEPS } from './catalog.ts'
type Feature = (typeof FEATURE_IDS)[number]
import { preseedGame } from './company.ts'
import { forceIncident } from './director.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { researchReady } from './lookups.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board } from './state.ts'
import { step } from './step.ts'
import { badDeployShare, deployStrategyOf, withService } from './team.ts'
import type { GameNode } from './state.ts'

/*
 * Feature Flags (05 "Feature Flags", 08 "Rollout", 11 "Mitigation toolbox"): a Feature reaches the
 * share of users its flag has, so a bad deploy of it breaks only that share, and the player can
 * turn it off in one click.
 */

const rich = (game: Board): Board => ({ ...game, cash: 1e9, insight: 1e9 })

const ok = (action: Action): Board => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const last = (game: Board): string => game.nodes.at(-1)?.id ?? ''

const batch = (count: number): ReadonlyArray<Feature> => FEATURE_IDS.slice(0, count)

const tune = (game: Board, id: string, change: Partial<GameNode>): Board => ({
  ...game,
  nodes: game.nodes.map((node) => (node.id === id ? { ...node, ...change } : node)),
})

/**
 * A Seed Company with flags placed and its Team shipping `count` Features on every deploy, on a
 * Pipeline in `strategy` when one is named.
 */
const flagBoard = (count = 8, strategy: 'recreate' | 'rolling' | null = null): Board => {
  const base: Board = {
    ...rich(preseedGame()),
    stage: 2,
    shipped: [...batch(count)],
    researched: [...preseedGame().researched, 'ci', 'feature-flags'],
  }
  const placed = ok(place(base, 'ff', 1_040, 640))
  const shipped = withService(placed, { lastDeploy: [...batch(count)] })
  if (strategy === null) return shipped
  const piped = ok(place(shipped, 'ci', 1_040, 820))
  return tune(withService(piped, { lastDeploy: [...batch(count)] }), last(piped), { strategy })
}

const flagsOf = (game: Board): string => {
  const node = game.nodes.find((entry) => entry.type === 'ff')
  if (!node) throw new Error('Missing Feature Flags')
  return node.id
}

describe('Feature Flags', () => {
  test('roll a Feature out in the design’s steps, and no finer', () => {
    expect([...ROLLOUT_STEPS]).toEqual([0, 0.05, 0.25, 0.5, 1])
    const game = flagBoard()
    const flags = flagsOf(game)
    const feature = batch(1)[0] as string
    expect(Result.isFailure(setRollout(game, flags, feature as Feature, 0.3))).toBe(true)
    const half = ok(setRollout(game, flags, feature as Feature, 0.5))
    expect(half.services[0]?.rollouts[feature]).toBe(0.5)
    // Every user is the default, so the flag comes off the list.
    const all = ok(setRollout(half, flags, feature as Feature, 1))
    expect(all.services[0]?.rollouts[feature]).toBe(undefined)
    const off = ok(setRollout(half, flags, feature as Feature, 0))
    expect(off.services[0]?.rollouts[feature]).toBe(0)
  })

  test('a bad deploy breaks only the share of users a Feature reached', () => {
    const game = flagBoard(8)
    const flags = flagsOf(game)
    // Eight Features at 8% each would reach the 40% ceiling without flags.
    expect(badDeployShare(game)).toBeCloseTo(0.4, 9)
    let flagged = game
    for (const feature of batch(8))
      flagged = ok(setRollout(flagged, flags, feature as Feature, 0.05))
    // At 5%, each Feature breaks 5% of what it would have: 8 × 8% × 5%.
    expect(badDeployShare(flagged)).toBeCloseTo(8 * 0.08 * 0.05, 9)
    // And the incident itself fails that share of the App Server's requests.
    const ledger = solve(game)
    const broken = forceIncident(game, ledger, 'bad-deploy')
    const shielded = forceIncident(flagged, solve(flagged), 'bad-deploy')
    if (!broken || !shielded) throw new Error('The bad deploy did not start')
    expect(solve(broken).errorShare).toBeGreaterThan(solve(shielded).errorShare + 0.1)
  })

  test('becomes the shield 11 promises: Recreate’s 100% cannot outrun a 5% rollout', () => {
    const piped = flagBoard(13, 'recreate')
    const strategy = deployStrategyOf(piped)
    if (!strategy) throw new Error('Missing the Pipeline')
    expect(strategy.blast).toBe(1)
    // Thirteen Features at 8% each is 104%: the ceiling is the strategy's 100%.
    const unshielded: Board = { ...piped, nodes: piped.nodes.filter((node) => node.type !== 'ff') }
    expect(badDeployShare(unshielded)).toBeCloseTo(1, 9)
    let flagged = piped
    for (const feature of batch(13))
      flagged = ok(setRollout(flagged, flagsOf(piped), feature as Feature, 0.05))
    expect(badDeployShare(flagged)).toBeCloseTo(13 * 0.08 * 0.05, 9)
  })

  test('turns Features off in one click, down to nothing', () => {
    // Three Features keep the arithmetic under the deploy strategy's 40% ceiling.
    const game = flagBoard(3)
    expect(badDeployShare(game)).toBeCloseTo(0.24, 9)
    const some = ok(setRollout(game, flagsOf(game), batch(1)[0] as Feature, 0))
    expect(badDeployShare(some)).toBeCloseTo(2 * 0.08, 9)
    let off = some
    for (const feature of batch(3)) off = ok(setRollout(off, flagsOf(game), feature as Feature, 0))
    // No user has the code: a bad deploy of it breaks nobody.
    expect(badDeployShare(off)).toBeCloseTo(0, 9)
    // A deploy that ships no Feature at all still ships code: one Feature's worth breaks.
    const empty = withService(off, { lastDeploy: [] })
    expect(badDeployShare(empty)).toBeCloseTo(0.08, 9)
  })

  test('counts for nothing while no Feature Flags Node is live', () => {
    const game = flagBoard(3)
    const flagged = ok(setRollout(game, flagsOf(game), batch(1)[0] as Feature, 0.05))
    expect(badDeployShare(flagged)).toBeLessThan(badDeployShare(game))
    const sold: Board = {
      ...flagged,
      nodes: flagged.nodes.filter((node) => node.type !== 'ff'),
    }
    expect(badDeployShare(sold)).toBeCloseTo(badDeployShare(game), 9)
    // Nor while the Node is restarting: the flag cannot be read.
    const down: Board = {
      ...flagged,
      nodes: flagged.nodes.map((node) =>
        node.type === 'ff'
          ? { ...node, life: { _tag: 'Restarting', left: 10, cause: 'restart', warm: 0 } }
          : node,
      ),
    }
    expect(badDeployShare(down)).toBeCloseTo(badDeployShare(game), 9)
  })

  test('is placeable only with its research, and only from Seed', () => {
    expect(RESEARCH['feature-flags'].era).toBe(2)
    expect(RESEARCH['feature-flags'].requires).toEqual(['ci'])
    expect(Result.isFailure(place(rich(preseedGame()), 'ff', 240, 280))).toBe(true)
    const preseed: Board = {
      ...rich(preseedGame()),
      researched: [...preseedGame().researched, 'ci'],
    }
    expect(researchReady(preseed, 'feature-flags')).toBe(false)
    expect(Result.isFailure(study(preseed, 'feature-flags'))).toBe(true)
    const seed: Board = { ...preseed, stage: 2 }
    expect(Result.isSuccess(study(seed, 'feature-flags'))).toBe(true)
    const owned: Board = { ...seed, researched: [...seed.researched, 'feature-flags'] }
    expect(ok(place(owned, 'ff', 240, 280)).nodes.some((node) => node.type === 'ff')).toBe(true)
  })

  test('carries no traffic, and rolls nothing but a shipped Feature', () => {
    const game = flagBoard()
    const flags = flagsOf(game)
    expect(result(connect(game, 'server', flags))).toContain('has no input')
    const unshipped = FEATURE_IDS.find((id) => !game.shipped.includes(id)) as string
    expect(Result.isFailure(setRollout(game, flags, unshipped as Feature, 0.5))).toBe(true)
    const database = game.nodes.find((node) => node.type === 'database')?.id ?? 'database'
    expect(Result.isFailure(setRollout(game, database, batch(1)[0] as Feature, 0.5))).toBe(true)
    // It carries no traffic: its card is idle and its Burn is flat.
    expect(solve(game).nodes[flags]?.inbound ?? 0).toBe(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})

/** The refusal message of an action, for the tests that read why it said no. */
const result = (action: Action): string =>
  Result.isFailure(action) ? JSON.stringify(action.failure) : 'accepted'

describe('an old save', () => {
  test('opens with no flags, and every Feature live for every user', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'ff')).toBe(false)
    expect(game.services[0]?.rollouts).toEqual({})
    expect(solve(game).revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
