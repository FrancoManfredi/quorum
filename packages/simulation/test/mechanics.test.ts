import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { installBackdoor, setPolicyOn, setProvider, setSlowStart } from '../src/actions.ts'
import { saleOf } from '../src/calendar.ts'
import { CALENDAR_START, VENTURES } from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { foundCompany } from '../src/founding.ts'
import { solveFlow } from '../src/solve.ts'
import { step } from '../src/step.ts'
import { newGame } from '../src/company.ts'

/* The Exit, Mail and Observability mechanics that change the Game: each runs in a Step or an Action. */

const founded = (perks: Record<string, number>, venture = 'b2b-saas' as const) =>
  foundCompany(1, { venture, mutators: [], perks })

describe('Head start', () => {
  test('levels 2 and 3 start in Seed and Series A with a solvable Design', () => {
    for (const [level, stage] of [
      [1, 1],
      [2, 2],
      [3, 3],
    ] as const) {
      const game = founded({ 'head-start': level })
      expect(game.stage).toBe(stage)
      expect(game.stageAt).toBe(game.time)
      expect(solveFlow(game).demand).toBeGreaterThan(0)
      expect(Number.isFinite(step(game, 5).game.cash)).toBe(true)
    }
  })
})

describe('Autopilot policies', () => {
  test('a policy needs its level, and the research policy queues a Study', () => {
    expect(Result.isFailure(setPolicyOn(founded({}), 'research', true))).toBe(true)
    const game = Result.getOrThrow(
      setPolicyOn(founded({ autopilot: 1, 'head-start': 1 }), 'research', true),
    )
    let next = {
      ...game,
      pools: { ...game.pools, write: 1_000, login: 1_000, read: 1_000, page: 1_000 },
    }
    next = step(next, 1).game
    expect(next.studies.length + next.researched.length).toBeGreaterThan(game.researched.length)
  })
})

describe('Slow start and Payment Provider', () => {
  test('both are settings on their own Component only', () => {
    const game = preseedGame(1)
    expect(Result.isFailure(setSlowStart(game, 'server', true))).toBe(true)
    expect(Result.isFailure(setProvider(game, 'second'))).toBe(true)
  })
})

describe('Venture rules', () => {
  test('the E-commerce sale runs on the calendar and Fintech fines stale answers', () => {
    const sale = VENTURES['e-commerce'].constraint.sale
    expect(sale).not.toBeNull()
    if (sale) {
      const at = (minute: number) => saleOf(minute - CALENDAR_START, sale).on
      const first = sale.everyDays * 1_440 + sale.startMinute
      expect(at(first - 1)).toBe(false)
      expect(at(first + 10)).toBe(true)
      expect(at(first + sale.minutes)).toBe(false)
    }
    expect(VENTURES.fintech.constraint.staleFine).toBeGreaterThan(0)
  })
})

describe('the fake advisory backdoor', () => {
  test('it records when it went in, and a second one is refused', () => {
    const game = { ...newGame(1), stage: 1 }
    const open = Result.getOrThrow(installBackdoor(game))
    expect(open.backdoorAt).toBe(game.time)
    expect(Result.isFailure(installBackdoor(open))).toBe(true)
  })
})
