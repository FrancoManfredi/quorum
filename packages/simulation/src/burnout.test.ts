import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  CALENDAR_DAY,
  CHALLENGE_TUNING,
  PAGE_MOOD,
  TIME_OFF_DAYS,
  UNHAPPY_MOOD,
  type Tuning,
} from './catalog.ts'
import { preseedGame } from './company.ts'
import { forceIncident } from './director.ts'
import type { StepEvent } from './events.ts'
import { solveFlow } from './solve.ts'
import { NEW_ENGINEER, type Engineer, type Game } from './state.ts'
import { outputOf, payrollOf, payGapOf } from './team.ts'
import { acceptResignation, advanceMorale, giveTimeOff, raiseSalary } from './work.ts'
import { advanceTeam } from './work.ts'

/* 18 "Burnout and quitting": mood, the pages that wake an engineer, the pay gap, and the three
 * answers the player may give. The Team's calendar at the Challenge pace is a minute a day. */

const DAY: number = CALENDAR_DAY / CHALLENGE_TUNING.calendarPace

const ok = (action: ReturnType<typeof giveTimeOff>): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const engineer = (change: Partial<Engineer> = {}): Engineer => ({
  id: 'e1',
  team: 'core',
  language: 'php',
  hiredAt: -1e6,
  ...NEW_ENGINEER,
  ...change,
})

/** A quiet Pre-seed Company with one engineer, whose pay was set when the Era was Pre-seed. */
const company = (change: Partial<Game> = {}, mate: Partial<Engineer> = {}): Game => ({
  ...preseedGame(),
  autopilot: false,
  nextIncidentAt: Number.MAX_SAFE_INTEGER,
  engineers: [engineer(mate)],
  ...change,
})

/** Runs mood forward `seconds` in 1 s Steps, collecting what the Team reported. */
const wear = (
  game: Game,
  seconds: number,
  tuning: Tuning = CHALLENGE_TUNING,
): Readonly<{ game: Game; events: ReadonlyArray<StepEvent> }> => {
  let now = game
  const events: Array<StepEvent> = []
  for (let elapsed = 0; elapsed < seconds; elapsed += 1) {
    const before = now
    now = { ...now, time: now.time + 1 }
    now = advanceMorale(now, before, 1, tuning, events)
  }
  return { game: now, events }
}

describe('the pay gap (18 "a lower salary than the Era’s")', () => {
  test('an engineer hired in an earlier Era falls behind the going rate', () => {
    const preseed = company({ stage: 1 }, { salary: 4 })
    expect(payGapOf(preseed, preseed.engineers[0]!)).toBe(0)
    // Seed's salary index is 8, and they are still paid at Pre-seed's 4.
    const seed = company({ stage: 2 }, { salary: 4 })
    expect(payGapOf(seed, seed.engineers[0]!)).toBeCloseTo(0.5, 12)
    // Their Burn is their own pay, not the Era's rate.
    const current = company({ stage: 2 })
    expect(payrollOf(seed)).toBeLessThan(payrollOf(current))
    // A raise to the Era's rate closes it and costs more every second.
    const raised = ok(raiseSalary(seed, 'e1'))
    expect(raised.engineers[0]?.salary).toBe(8)
    expect(payGapOf(raised, raised.engineers[0]!)).toBe(0)
    expect(payrollOf(raised)).toBeCloseTo(payrollOf(current), 12)
    expect(Result.isFailure(raiseSalary(raised, 'e1'))).toBe(true)
  })

  test('a pay gap makes an engineer unhappy, once, and the owner of a raise is content again', () => {
    const game = company({ stage: 2 }, { salary: 4 })
    const { game: sad, events } = wear(game, 5 * DAY)
    expect(sad.engineers[0]?.mood).toBeLessThanOrEqual(UNHAPPY_MOOD)
    expect(events.filter((event) => event._tag === 'EngineerUnhappy')).toHaveLength(1)
    expect(sad.engineers[0]?.unhappyAt).toBeGreaterThan(0)
    // The Mail is one per slump, not one per second.
    expect(wear(sad, 30).events.some((event) => event._tag === 'EngineerUnhappy')).toBe(false)
    // A raise pays the Era's rate, and they are content.
    const raised = ok(raiseSalary(sad, 'e1'))
    expect(raised.engineers[0]?.mood).toBe(1)
    expect(raised.engineers[0]?.unhappyAt).toBe(0)
    expect(wear(raised, 5 * DAY).events.some((event) => event._tag === 'EngineerUnhappy')).toBe(
      false,
    )
  })
})

describe('pages and freezes', () => {
  test('an incident pages the Team that owns the Service, and each page costs mood', () => {
    const game = company()
    const paged = forceIncident(game, solveFlow(game), 'instance')
    expect(paged?.incident).not.toBeNull()
    const first = advanceMorale(paged as Game, game, 1, CHALLENGE_TUNING, [])
    expect(first.engineers[0]?.pages).toBe(1)
    expect(first.engineers[0]?.mood).toBeCloseTo(1 - PAGE_MOOD, 12)
    // A second Step does not page again: the incident is the same one.
    const again = advanceMorale(first, paged as Game, 1, CHALLENGE_TUNING, [])
    expect(again.engineers[0]?.pages).toBe(1)
  })

  test('a long freeze wears the Team down to unhappiness', () => {
    // A Series A Company whose error budget is spent: half velocity, and a week of it.
    const frozen = company({
      stage: 3,
      researched: [...preseedGame().researched, 'error-budgets'],
      budget: [{ hour: 0, requests: 1_000, failed: 1_000, users: 0 }],
    })
    const { game: after, events } = wear(frozen, 6 * DAY)
    expect(after.engineers[0]?.mood).toBeCloseTo(1 / 7, 6)
    expect(events.some((event) => event._tag === 'EngineerUnhappy')).toBe(true)
  })
})

describe('the three answers', () => {
  test('time off: no Dev Hours for three calendar days, then content and back at work', () => {
    const sad = company({ stage: 2 }, { salary: 4, mood: 0.2, unhappyAt: 1 })
    const off = ok(giveTimeOff(sad, 'e1'))
    expect(off.engineers[0]?.mood).toBe(1)
    expect(off.engineers[0]?.offUntil).toBe(sad.time + TIME_OFF_DAYS * DAY)
    // They produce nothing while they are away.
    expect(outputOf(off, off.engineers[0]!)).toBe(0)
    const back: Game = { ...off, time: off.engineers[0]!.offUntil }
    expect(outputOf(back, back.engineers[0]!)).toBe(1)
    // And the Team's rate follows: an absent engineer adds no Dev Hours.
    const away = advanceTeam(
      { ...off, time: off.time + 1 },
      { ...solveFlow(off), velocity: 1 },
      1,
      CHALLENGE_TUNING,
    )
    const present = advanceTeam(
      { ...back, time: back.time + 1 },
      { ...solveFlow(back), velocity: 1 },
      1,
      CHALLENGE_TUNING,
    )
    expect(away.game.devHours).toBeLessThan(present.game.devHours)
  })

  test('accepting a resignation ends the salary with no layoff’s morale hit', () => {
    const sad = company({ stage: 2 }, { salary: 4, mood: 0.1, unhappyAt: 1 })
    const left = ok(acceptResignation(sad, 'e1'))
    expect(left.engineers).toEqual([])
    expect(payrollOf(left)).toBe(0)
    expect(left.moraleUntil).toBe(sad.moraleUntil)
    expect(Result.isFailure(acceptResignation(left, 'e1'))).toBe(true)
  })
})
