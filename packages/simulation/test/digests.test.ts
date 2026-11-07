import { describe, expect, test } from 'vitest'
import { preseedGame } from '../src/company.ts'
import { demandOf } from '../src/solve.ts'
import type { FeatureId } from '../src/catalog.ts'
import type { Game } from '../src/state.ts'

/* Email digests (08 "Features"): the weekly send is a burst of `job` demand once the Feature is live. */

/** Every user has the Feature, at its full effect. */
const live = (game: Game, ...ids: ReadonlyArray<FeatureId>): Game => ({
  ...game,
  features: Object.fromEntries(
    ids.map((id) => [id, { _tag: 'Live', rollout: 1, adoption: 1, lift: null }]),
  ),
})

const base = (stage: number): Game => ({ ...preseedGame(), stage, users: 100_000 })
const liveGame = (game: Game): Game => live(game, 'signup-flow', 'data-export', 'email-digests')
const plain = (game: Game): Game => live(game, 'signup-flow', 'data-export')

describe('Email digests', () => {
  test('the burst adds job demand where the Era had none', () => {
    const before = demandOf(live(base(1), 'signup-flow')).job ?? 0
    const after = demandOf(live(base(1), 'signup-flow', 'email-digests')).job ?? 0
    expect(before).toBe(0)
    expect(after).toBeGreaterThan(0)
  })

  test('the burst doubles the job demand an Era already sends', () => {
    const before = demandOf(plain(base(4))).job ?? 0
    const after = demandOf(liveGame(base(4))).job ?? 0
    expect(before).toBeGreaterThan(0)
    expect(after / before).toBeGreaterThan(1.9)
  })
})
