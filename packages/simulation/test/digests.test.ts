import { describe, expect, test } from 'vitest'
import { preseedGame } from '../src/company.ts'
import { demandOf } from '../src/solve.ts'
import type { Game } from '../src/state.ts'

/* Email digests (08 "Features"): the weekly send is a burst of `job` demand once the Feature is live. */

const base = (stage: number): Game => ({ ...preseedGame(), stage, users: 100_000 })
const live = (game: Game): Game => ({
  ...game,
  shipped: ['signup-flow', 'data-export', 'email-digests'],
})
const plain = (game: Game): Game => ({ ...game, shipped: ['signup-flow', 'data-export'] })

describe('Email digests', () => {
  test('the burst adds job demand where the Era had none', () => {
    const before = demandOf({ ...base(1), shipped: ['signup-flow'] }).job ?? 0
    const after = demandOf({ ...base(1), shipped: ['signup-flow', 'email-digests'] }).job ?? 0
    expect(before).toBe(0)
    expect(after).toBeGreaterThan(0)
  })

  test('the burst doubles the job demand an Era already sends', () => {
    const before = demandOf(plain(base(4))).job ?? 0
    const after = demandOf(live(base(4))).job ?? 0
    expect(before).toBeGreaterThan(0)
    expect(after / before).toBeGreaterThan(1.9)
  })
})
