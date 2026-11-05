import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { place, setRollout, type Action } from './actions.ts'
import { ADOPTION_DAYS, CALENDAR_DAY, CHALLENGE_TUNING } from './catalog.ts'
import { preseedGame } from './company.ts'
import {
  advanceAdoption,
  advanceLifts,
  exposureOf,
  liftOf,
  liftReading,
  marketOf,
  measurable,
  mixOf,
} from './features.ts'
import { solveFlow } from './solve.ts'
import type { Game } from './state.ts'
import { advanceTeam, queueFeature } from './work.ts'

/* 08 "Adoption" and "Measured lift": a Feature reaches its users over a week, and A/B testing is
 * the only way to read its lift. */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

/** Sim seconds in one adoption time constant, on the Team's calendar. */
const TAU = (ADOPTION_DAYS * CALENDAR_DAY) / CHALLENGE_TUNING.calendarPace

/** A Seed Company with Landing page live, fully adopted unless a test says otherwise. */
const board = (change: Partial<Game> = {}): Game => ({
  ...preseedGame(),
  cash: 1e9,
  stage: 2,
  shipped: ['landing-page'],
  adoption: { 'landing-page': 1 },
  ...change,
})

describe('adoption', () => {
  test('a Feature reaches about 63% of its users in a calendar week, and 95% in three', () => {
    // The Step's arithmetic is exact, so adoption is stepped too, a second at a time.
    const advance = (game: Game, seconds: number): Game => {
      let now = game
      for (let elapsed = 0; elapsed < seconds; elapsed += 1)
        now = advanceAdoption(now, 1, CHALLENGE_TUNING)
      return now
    }
    const game = board({ adoption: { 'landing-page': 0 } })
    const week = advance(game, TAU)
    expect(week.adoption['landing-page']).toBeCloseTo(1 - Math.exp(-1), 3)
    const three = advance(week, 2 * TAU)
    expect(three.adoption['landing-page']).toBeCloseTo(1 - Math.exp(-3), 2)
    // Exposure is the rollout times adoption.
    expect(exposureOf(three, 'landing-page')).toBeCloseTo(1 - Math.exp(-3), 2)
  })

  test('a new Feature has no effect until its users adopt it', () => {
    const quiet = board({ adoption: { 'landing-page': 0 } })
    const grown = board()
    // Landing page raises the market and page views by 20% and 10%.
    expect(marketOf(quiet)).toBeCloseTo(marketOf({ ...quiet, shipped: [] }), 9)
    expect(marketOf(grown)).toBeCloseTo(marketOf({ ...quiet, shipped: [] }) * 1.2, 9)
    expect(mixOf(quiet).page ?? 0).toBeCloseTo(mixOf({ ...quiet, shipped: [] }).page ?? 0, 9)
    expect(mixOf(grown).page ?? 0).toBeGreaterThan(mixOf(quiet).page ?? 0)
    // Its load arrives with its users too, not at the deploy.
    const half = board({ adoption: { 'landing-page': 0.5 } })
    expect(marketOf(half)).toBeCloseTo((marketOf(grown) + marketOf(quiet)) / 2, 9)
  })

  test('a Feature ships with no adoption and its users arrive after', () => {
    const start: Game = board({ shipped: [], adoption: {}, autopilot: false, nextIncidentAt: 1e9 })
    let game: Game = ok(queueFeature(start, 'landing-page'))
    let shipped: Game | null = null
    for (let second = 0; second < 400 && !shipped; second += 1) {
      const ready: Game = { ...game, time: game.time + second }
      const next = advanceTeam(
        ready,
        { ...solveFlow(ready), velocity: 1 },
        1,
        CHALLENGE_TUNING,
      ).game
      game = next
      if (next.shipped.includes('landing-page')) shipped = next
    }
    expect(shipped).not.toBe(null)
    expect(shipped?.adoption['landing-page']).toBe(0)
    expect(exposureOf(shipped as Game, 'landing-page')).toBe(0)
    const later = advanceAdoption(shipped as Game, TAU / 4, CHALLENGE_TUNING)
    expect(later.adoption['landing-page']).toBeGreaterThan(0)
    expect(exposureOf(later, 'landing-page')).toBeCloseTo(0.25, 9)
  })

  test('a Feature not named in an old save is fully adopted', () => {
    const old = board({ adoption: {} })
    expect(exposureOf(old, 'landing-page')).toBe(1)
    expect(advanceAdoption(old, TAU, CHALLENGE_TUNING)).toBe(old)
  })
})

describe('measured lift', () => {
  /** A Feature Flags Node with Landing page at `share` of users, and A/B testing when asked. */
  const tested = (share: number, research = true): Game => {
    const base = board({
      researched: research
        ? [...board().researched, 'ci', 'feature-flags', 'funnels', 'ab-testing']
        : [...board().researched, 'ci', 'feature-flags', 'funnels'],
    })
    const placed = ok(place(base, 'ff', 1_000, 600))
    return ok(setRollout(placed, placed.nodes.at(-1)?.id ?? '', 'landing-page', share))
  }

  test('the player measures nothing without A/B testing, or without a holdout', () => {
    expect(liftReading(tested(0.25, false), 'landing-page')).toBe(null)
    expect(measurable(tested(1), 'landing-page')).toBe(false)
    expect(measurable(tested(0.25), 'landing-page')).toBe(true)
  })

  test('the interval narrows with samples, and the verdict waits for it to clear zero', () => {
    const game = tested(0.25)
    expect(liftReading(game, 'landing-page')).toMatchObject({ verdict: 'early' })
    // A second of demand at 1,000 rps and the 1% floor: 10 samples, 2.5 exposed against 7.5.
    const some = advanceLifts(game, 1_000, 1)
    expect(liftReading(some, 'landing-page')?.verdict).toBe('early')
    const many = advanceLifts(game, 1_000, 1_000)
    const read = liftReading(many, 'landing-page')
    expect(read?.lift).toBeCloseTo(liftOf(many, 'landing-page'), 12)
    expect(read?.verdict).toBe('wins')
    expect(read?.halfWidth).toBeLessThan(0.05)
    // The half width follows the formula, and a full sample rate is far tighter than the floor.
    const exposed = many.lifts['landing-page']?.exposed ?? 0
    const holdout = many.lifts['landing-page']?.holdout ?? 0
    expect(read?.halfWidth).toBeCloseTo(1.96 * Math.sqrt(1 / exposed + 1 / holdout), 12)
    expect(liftReading(advanceLifts(game, 1_000, 1_000), 'landing-page')?.halfWidth).toBeCloseTo(
      read?.halfWidth ?? 0,
      9,
    )
  })

  test('a new rollout step starts its count again', () => {
    const game = tested(0.25)
    const sampled = advanceLifts(game, 1_000, 1_000)
    expect(sampled.lifts['landing-page']?.exposed ?? 0).toBeGreaterThan(0)
    const moved = ok(setRollout(sampled, sampled.nodes.at(-1)?.id ?? '', 'landing-page', 0.5))
    const after = advanceLifts(moved, 1_000, 1)
    expect(after.lifts['landing-page']?.step).toBe(0.5)
    expect(after.lifts['landing-page']?.exposed ?? 0).toBeLessThan(100)
  })
})
