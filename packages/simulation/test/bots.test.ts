import { describe, expect, test } from 'vitest'
import { SLOW } from './slow.ts'
import { runBot } from '../src/pacing.ts'

/*
 * The other pacing bots (16 "Pacing model"), against the Balanced bot on the same seed. Each
 * plays to Seed at the Challenge pace; Idle logs in every two hours for a day.
 */

const SEEDS = [1, 2, 3]
const NINETY_MINUTES = 90 * 60
const DAY = 24 * 3_600

describe.skipIf(!SLOW)('the other pacing bots', { timeout: 360_000 }, () => {
  for (const seed of SEEDS) {
    test(`seed ${seed}: Greedy, Stubborn, Polyglot and Decliner keep to their limits`, () => {
      const balanced = runBot(seed, NINETY_MINUTES).milestones.seed ?? Infinity
      const greedy = runBot(seed, NINETY_MINUTES, undefined, 'greedy')
      expect(greedy.milestones.seed ?? Infinity).toBeGreaterThanOrEqual(27 * 60)
      const stubborn = runBot(seed, NINETY_MINUTES, undefined, 'stubborn')
      expect(stubborn.milestones.seed ?? Infinity).toBeLessThanOrEqual(balanced * 1.6)
      const polyglot = runBot(seed, NINETY_MINUTES, undefined, 'polyglot')
      expect(polyglot.milestones.seed ?? Infinity).toBeGreaterThanOrEqual(balanced * 0.7)
      const decliner = runBot(seed, NINETY_MINUTES, undefined, 'decliner')
      expect(decliner.game.stage).toBe(2)
      expect(decliner.game.equity).toBe(1)
    })
  }

  test('Idle, visiting every two hours, reaches Pre-seed within a day', () => {
    const idle = runBot(1, DAY, undefined, 'idle', 3)
    expect(idle.game.stage).toBeGreaterThanOrEqual(1)
  })
})
