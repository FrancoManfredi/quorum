import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import type { Action } from './actions.ts'
import {
  CALENDAR_DAY,
  FEATURES,
  CHALLENGE_TUNING,
  ERAS,
  FEATURE_IDS,
  LANGUAGES,
  LIVE_TUNING,
  SALARY_BASE,
  SIGNING_BASE,
} from './catalog.ts'
import { newGame, preseedGame } from './company.ts'
import type { Ledger } from './ledger.ts'
import { solveFlow } from './solve.ts'
import { NEW_ENGINEER, type Engineer, type Game } from './state.ts'
import {
  deploysPerDay,
  devHoursRate,
  effectiveEngineers,
  featureHoursOn,
  hireSeconds,
  serviceOf,
  signingOf,
  teamOutputs,
  upkeepShare,
} from './team.ts'
import { advanceTeam, createTeam, featureHoursOf, hire, layoff, setTeamKind } from './work.ts'

/* 08 "Dev Hours", "Hiring", and "Coordination", at the design's calendar unless a test says otherwise. */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

/** The Ledger with the Stack's velocity pinned, so Dev Hours read in round numbers. */
const at = (game: Game, velocity = 1): Ledger => ({ ...solveFlow(game), velocity })

const preseed = (): Game => ({ ...preseedGame(), cash: 1e6, autopilot: false })

const engineer = (id: string, hiredAt = -1e6, team = 'core'): Engineer => ({
  id,
  team,
  language: 'php',
  hiredAt,
  ...NEW_ENGINEER,
})

describe('coordination', () => {
  test('effective engineers match the table in 08 "Coordination"', () => {
    const table: ReadonlyArray<readonly [number, number]> = [
      [1, 1],
      [5, 3.8],
      [10, 5.7],
      [20, 7.5],
      [40, 8.4],
      [80, 8.1],
    ]
    for (const [n, expected] of table)
      expect([n, Math.abs(effectiveEngineers(n) - expected) <= 0.05]).toEqual([n, true])
  })

  test('a structured framework coordinates better, and nobody is no one', () => {
    expect(effectiveEngineers(10, true)).toBeGreaterThan(effectiveEngineers(10))
    expect(effectiveEngineers(0)).toBe(0)
  })
})

/** Sim seconds in a calendar day at the design pace. */
const DAY = CALENDAR_DAY / CHALLENGE_TUNING.calendarPace

describe('Dev Hours', () => {
  test('the founder makes 6.4 Dev Hours per calendar day at velocity 1', () => {
    const game: Game = { ...newGame(), autopilot: false }
    expect(devHoursRate(game, at(game), CHALLENGE_TUNING) * DAY).toBeCloseTo(6.4)
    let current = game
    for (let second = 0; second < DAY; second += 1)
      current = advanceTeam(
        { ...current, time: current.time + 1 },
        at(current),
        1,
        CHALLENGE_TUNING,
      ).game
    // With nothing on the backlog, they go to the pool.
    expect(current.devHours).toBeCloseTo(6.4)
  })

  test('the live game makes Dev Hours on the same calendar as the design', () => {
    const game = newGame()
    expect(devHoursRate(game, at(game), LIVE_TUNING)).toBeCloseTo(
      devHoursRate(game, at(game), CHALLENGE_TUNING),
    )
  })

  test('a Sandbox has no Team', () => {
    const game: Game = { ...newGame(), sandbox: true }
    expect(devHoursRate(game, at(game))).toBe(0)
    expect(Result.isFailure(hire({ ...game, stage: 1, cash: 1e6 }))).toBe(true)
  })
})

describe('upkeep (08 "Upkeep")', () => {
  test('a Company with no live Feature pays nothing to keep one', () => {
    const game = preseed()
    expect(featureHoursOn(game, serviceOf(game))).toBe(0)
    expect(upkeepShare(game, serviceOf(game))).toBe(0)
    const dry = teamOutputs(game, at(game), CHALLENGE_TUNING)[0]?.rate ?? 0
    const live: Game = { ...game, shipped: [] }
    expect(teamOutputs(live, at(live), CHALLENGE_TUNING)[0]?.rate).toBeCloseTo(dry, 12)
  })

  test('a live Feature costs 0.4 × S / (S + 2,000) of the Team’s Dev Hours, and debt adds to it', () => {
    const game = preseed()
    const before = teamOutputs(game, at(game), CHALLENGE_TUNING)[0]?.rate ?? 0
    // 500 DH of live Features is the design's first example: 8% of Dev Hours.
    const fiveHundred: Game = { ...game, shipped: ['video', 'pagination', 'status-page'] }
    const after = teamOutputs(fiveHundred, at(fiveHundred), CHALLENGE_TUNING)[0]?.rate ?? 0
    expect(featureHoursOn(fiveHundred, serviceOf(fiveHundred))).toBe(500)
    expect(upkeepShare(fiveHundred, serviceOf(fiveHundred))).toBeCloseTo((0.4 * 500) / 2_500, 12)
    expect(after / before).toBeCloseTo(1 - 0.08, 12)
    // 4,000 DH is the second: 27% of Dev Hours, and more where the code carries debt.
    const fourThousand: Game = {
      ...game,
      shipped: [
        'video',
        'chat',
        'dashboards',
        'ai-assistant',
        'recommendations',
        'activity-feed',
        'localization',
        'offline-mode',
        'public-api',
      ],
    }
    expect(featureHoursOn(fourThousand, serviceOf(fourThousand))).toBe(4_000)
    expect(upkeepShare(fourThousand, serviceOf(fourThousand))).toBeCloseTo(
      (0.4 * 4_000) / 6_000,
      12,
    )
    const indebted: Game = {
      ...fourThousand,
      services: [{ ...serviceOf(fourThousand), debt: 0.5 }],
    }
    expect(upkeepShare(indebted, serviceOf(indebted))).toBeCloseTo((0.4 * 4_000 * 1.5) / 6_000, 12)
    // A team that runs the system instead of the product builds no backlog, so it pays none.
    const platform: Game = { ...fiveHundred, teams: [{ ...game.teams[0]!, kind: 'platform' }] }
    expect(teamOutputs(platform, at(platform), CHALLENGE_TUNING)[0]?.rate).toBeCloseTo(
      (teamOutputs(fiveHundred, at(fiveHundred), CHALLENGE_TUNING)[0]?.rate ?? 0) / 0.92,
      9,
    )
  })

  test('upkeep approaches 40% and stops at the 60% ceiling', () => {
    const game = preseed()
    const huge: Game = { ...game, shipped: [...FEATURE_IDS] }
    expect(upkeepShare(huge, serviceOf(huge))).toBeLessThanOrEqual(0.6)
    const ceiling: Game = {
      ...huge,
      services: [{ ...serviceOf(huge), debt: 1 }],
    }
    expect(upkeepShare(ceiling, serviceOf(ceiling))).toBeLessThanOrEqual(0.6)
  })
})

describe('hiring', () => {
  test('opens in the Pre-seed Era', () => {
    expect(Result.isFailure(hire({ ...newGame(), cash: 1e6 }))).toBe(true)
    expect(Result.isSuccess(hire(preseed()))).toBe(true)
  })

  test('a hire joins after the time to hire, then works at 30% for a calendar week', () => {
    const start = preseed()
    const signed = ok(hire(start, CHALLENGE_TUNING))
    expect(start.cash - signed.cash).toBe(signingOf(start, 'php'))
    const offer = signed.hires[0]
    expect(offer && offer.readyAt - signed.time).toBe(DAY * LANGUAGES.php.hireTime)
    const joined = advanceTeam(
      { ...signed, time: offer?.readyAt ?? 0 },
      at(signed),
      0,
      CHALLENGE_TUNING,
    ).game
    expect(joined.engineers).toHaveLength(1)
    const ramping = teamOutputs(joined, at(joined), CHALLENGE_TUNING)[0]
    expect(ramping?.effective).toBeCloseTo((effectiveEngineers(2) * (0.8 + 0.3)) / 2)
    const week: Game = { ...joined, time: joined.time + 7 * DAY }
    const full = teamOutputs(week, at(week), CHALLENGE_TUNING)[0]
    expect(full?.effective).toBeCloseTo((effectiveEngineers(2) * (0.8 + 1)) / 2)
  })

  test('Rails halves the ramp-up', () => {
    const rails: Game = {
      ...preseed(),
      nodes: preseed().nodes.map((node) =>
        node.type === 'server' ? { ...node, runtime: 'puma', framework: 'rails' } : node,
      ),
      engineers: [engineer('e1', 0)],
      time: 3.6 * CALENDAR_DAY,
    }
    const output = teamOutputs(rails, at(rails), CHALLENGE_TUNING)[0]
    expect(output?.effective).toBeCloseTo((effectiveEngineers(2) * (0.8 + 1)) / 2)
  })

  test('each engineer adds 0.40 × the salary index × their language to Burn', () => {
    const base = preseed()
    const staffed: Game = { ...base, engineers: [engineer('e1')] }
    const salary = SALARY_BASE * (ERAS[1]?.salaryIndex ?? 0) * LANGUAGES.php.salary
    expect(solveFlow(staffed).burn - solveFlow(base).burn).toBeCloseTo(salary)
    expect(solveFlow(staffed).salaries).toBeCloseTo(salary)
  })

  test('the signing cost is $2,000 × the salary factor in Pre-seed, and scales with the Era', () => {
    expect(signingOf(preseed(), 'node')).toBe(SIGNING_BASE)
    expect(signingOf(preseed(), 'php')).toBe(SIGNING_BASE * LANGUAGES.php.salary)
    const seed: Game = { ...preseed(), stage: 2 }
    expect(signingOf(seed, 'node')).toBe(
      Math.round(SIGNING_BASE * ((ERAS[2]?.salaryIndex ?? 0) / (ERAS[1]?.salaryIndex ?? 1))),
    )
  })

  test('a layoff ends the salary and costs the rest of the team 10% velocity for a week', () => {
    const staffed: Game = { ...preseed(), engineers: [engineer('e1'), engineer('e2')] }
    const after = ok(layoff(staffed, 'e2', CHALLENGE_TUNING))
    expect(after.engineers).toHaveLength(1)
    expect(solveFlow(staffed).salaries - solveFlow(after).salaries).toBeGreaterThan(0)
    const hurt = teamOutputs(after, at(after), CHALLENGE_TUNING)[0]?.velocity ?? 0
    const healed: Game = { ...after, time: after.time + 7 * CALENDAR_DAY }
    expect(
      hurt / (teamOutputs(healed, at(healed), CHALLENGE_TUNING)[0]?.velocity ?? 1),
    ).toBeCloseTo(0.9)
  })
})

/* 10 "Track: Product and business": the four research items this pass builds, and the two teams. */
describe('the Team research', () => {
  test('Hiring pipeline makes a hire join 30% sooner', () => {
    const base = preseed()
    const quick: Game = { ...base, researched: [...base.researched, 'hiring-pipeline'] }
    expect(hireSeconds(quick, 'php', CHALLENGE_TUNING)).toBeCloseTo(
      hireSeconds(base, 'php', CHALLENGE_TUNING) * 0.7,
      9,
    )
  })

  test('Trunk-based development deploys 50% more often', () => {
    const base = preseed()
    const trunk: Game = { ...base, researched: [...base.researched, 'trunk-based'] }
    expect(deploysPerDay(trunk, CHALLENGE_TUNING)).toBeCloseTo(
      deploysPerDay(base, CHALLENGE_TUNING) * 1.5,
      9,
    )
  })

  test('a Platform team needs its research, and a Data team makes report and AI work cheaper', () => {
    const base = preseed()
    const made = ok(createTeam(base))
    const id = made.teams[1]?.id ?? ''
    const seriesA: Game = { ...made, stage: 3 }
    // Containers alone is not enough: the Platform team is a research item of its own.
    expect(Result.isFailure(setTeamKind(seriesA, id, 'platform'))).toBe(true)
    const researched: Game = {
      ...seriesA,
      researched: [...seriesA.researched, 'containers', 'platform-team'],
    }
    expect(Result.isSuccess(setTeamKind(researched, id, 'platform'))).toBe(true)
    // A Data team, from Series B and its research, saves 30% of the Dev Hours of a report or AI Feature.
    const data: Game = {
      ...made,
      stage: 4,
      researched: [...made.researched, 'data-team'],
      teams: made.teams.map((team, index) => (index === 1 ? { ...team, kind: 'data' } : team)),
      engineers: [{ id: 'e1', team: id, language: 'php', hiredAt: -1e6, ...NEW_ENGINEER }],
    }
    expect(featureHoursOf(data, 'dashboards')).toBeCloseTo(FEATURES.dashboards.dh * 0.7, 9)
    expect(featureHoursOf(data, 'ai-assistant')).toBeCloseTo(FEATURES['ai-assistant'].dh * 0.7, 9)
    // Only the report and AI Features: a chat Feature costs what it always did.
    expect(featureHoursOf(data, 'chat')).toBe(FEATURES.chat.dh)
    // Its Dev Hours build no backlog, like a Platform or an SRE team's.
    expect(teamOutputs(data, at(data), CHALLENGE_TUNING)[1]?.team.kind).toBe('data')
  })
})
