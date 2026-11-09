import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { installBackdoor, setPolicyOn, setProvider, setSlowStart, study } from '../src/actions.ts'
import { saleOf } from '../src/calendar.ts'
import {
  CALENDAR_START,
  CVE_EVERY,
  FEATURE_IDS,
  FOREIGN_OUTPUT,
  LANGUAGES,
  LEARN_OUTPUT,
  RESEARCH_IDS,
  RUSH_BUG_CHANCE,
  RUSH_DEBT,
  VENTURES,
} from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { foundCompany } from '../src/founding.ts'
import { solveFlow } from '../src/solve.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { step } from '../src/step.ts'
import { newGame } from '../src/company.ts'
import { NEW_ENGINEER, type WorkItem } from '../src/state.ts'
import {
  assignments,
  blockReason,
  cancelItem,
  createTeam,
  featureRefusal,
  prioritizeItem,
  queueFeature,
  queueSpike,
  rushBugOf,
  rushItem,
  serviceOfItem,
  train,
} from '../src/work.ts'
import {
  badDeployChance,
  nextBadDeployChance,
  languageOfService,
  outputOf,
  payOf,
  trainCost,
  trainSeconds,
} from '../src/team.ts'
import { spiked } from '../src/studies.ts'

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

describe('The user hop', () => {
  /** Stage 6 users on four continents all enter the home Users Node, so EU users pay 2 x 75 ms. */
  const euHop = (research: Array<'http2' | 'http3' | 'anycast'>, kind: 'page' | 'read') => {
    const game = { ...freeSandbox(), stage: 6, seed: 3 }
    const bare = game.researched.filter((id) => !['http2', 'http3', 'anycast'].includes(id))
    const withResearch = { ...game, researched: [...bare, ...research] }
    return solveFlow(withResearch).regionKinds.eu?.[kind]?.hopMs
  }

  test('Anycast takes 20 ms off, HTTP/3 20%, and HTTP/2 15% on page views only', () => {
    expect(euHop([], 'page')).toBe(150)
    expect(euHop(['anycast'], 'page')).toBe(130)
    expect(euHop(['http3'], 'page')).toBe(120)
    expect(euHop(['http2'], 'page')).toBe(127.5)
    expect(euHop(['http2'], 'read')).toBe(150)
    expect(euHop(['http2', 'http3', 'anycast'], 'page')).toBeCloseTo(85, 9)
  })
})

describe('Team assignments', () => {
  test('an empty team takes no backlog item, so the next staffed team builds it', () => {
    let game = founded({ 'head-start': 1 })
    game = Result.getOrThrow(createTeam(game))
    game = Result.getOrThrow(createTeam(game))
    const [, empty, staffed] = game.teams
    if (!empty || !staffed) throw new Error('expected three teams')
    game = {
      ...game,
      engineers: [
        ...game.engineers,
        {
          ...NEW_ENGINEER,
          id: 'e-test',
          team: staffed.id,
          language: 'php',
          hiredAt: game.time - 3600,
        },
      ],
    }
    const open = FEATURE_IDS.filter((id) => featureRefusal(game, id) === null).slice(0, 3)
    for (const id of open) game = Result.getOrThrow(queueFeature(game, id))
    const [first, second] = game.backlog

    const assigned = assignments(game)
    expect(assigned.get(game.teams[0]?.id ?? '')?.id).toBe(first?.id)
    expect(assigned.has(empty.id)).toBe(false)
    expect(assigned.get(staffed.id)?.id).toBe(second?.id)

    const after = step(game, 5).game
    expect(after.backlog.find((item) => item.id === second?.id)?.spent ?? 1).toBeGreaterThan(0)
  })

  test('a patch ticket skips the waits, even on a team past eight engineers', () => {
    let game = founded({ 'head-start': 3 })
    game = {
      ...game,
      cash: 10_000_000,
      engineers: Array.from({ length: 12 }, (_, index) => ({
        ...NEW_ENGINEER,
        id: `e${index + 1}`,
        team: game.teams[0]?.id ?? 'core',
        language: 'php' as const,
        hiredAt: game.time - 3_600,
      })),
    }
    const open = FEATURE_IDS.find((id) => featureRefusal(game, id) === null)
    if (!open) throw new Error('expected an open Feature')
    game = Result.getOrThrow(queueFeature(game, open))

    // A CVE is disclosed every CVE_EVERY seconds, and each one files a patch ticket.
    const disclosed = step({ ...game, time: CVE_EVERY - 5 }, 5).game
    const patch = disclosed.backlog.find((item) => item.kind === 'patch')
    if (!patch) throw new Error('expected a patch ticket')
    expect(blockReason(disclosed, patch)).toBeNull()

    // Patch now moves it ahead of the product, and the team picks it up the next Step.
    const top = Result.getOrThrow(prioritizeItem(disclosed, patch.id))
    const after = step(top, 5).game
    expect(after.backlog.find((item) => item.id === patch.id)?.spent ?? 0).toBeGreaterThan(0)
  })

  test('a Spike speeds its Study only while a Team builds it', () => {
    let game = Result.getOrThrow(createTeam(founded({ 'head-start': 1 })))
    const research = RESEARCH_IDS.find((id) => Result.isSuccess(study(game, id)))
    if (!research) throw new Error('expected a Study to start')
    game = Result.getOrThrow(study(game, research))
    const feature = FEATURE_IDS.find((id) => featureRefusal(game, id) === null)
    if (!feature) throw new Error('expected an open Feature')
    game = Result.getOrThrow(queueSpike(Result.getOrThrow(queueFeature(game, feature))))
    expect(spiked(game)).toBe(true)

    // Behind the Feature, the Spike would go to the second team, which has no engineers.
    expect(spiked({ ...game, backlog: [...game.backlog].reverse() })).toBe(false)
  })
})

describe('Learning a Stack', () => {
  const staffed = () => {
    const game = founded({ 'head-start': 1 })
    return {
      ...game,
      cash: 1_000_000,
      engineers: [
        {
          ...NEW_ENGINEER,
          id: 'e-test',
          team: game.teams[0]?.id ?? 'core',
          language: 'ruby' as const,
          hiredAt: game.time - 3_600,
        },
      ],
    }
  }

  test('an engineer in a language the Service does not run keeps FOREIGN_OUTPUT of their Dev Hours', () => {
    const game = staffed()
    const engineer = game.engineers[0]!
    expect(languageOfService(game)).toBe('php')
    expect(outputOf(game, engineer)).toBe(FOREIGN_OUTPUT)
    expect(outputOf(game, { ...engineer, language: 'php' })).toBe(1)
  })

  test('training costs Cash and half their output, then moves their language and pay', () => {
    const game = staffed()
    const engineer = game.engineers[0]!
    const started = Result.getOrThrow(train(game, engineer.id, 'php'))
    expect(started.cash).toBe(game.cash - trainCost(game, 'php'))
    expect(outputOf(started, engineer)).toBe(LEARN_OUTPUT)

    const readyAt = started.training[0]!.readyAt
    expect(readyAt - started.time).toBe(trainSeconds('php'))
    const before = step({ ...started, time: readyAt - 10 }, 5).game
    expect(before.training).toHaveLength(1)
    expect(before.engineers[0]?.language).toBe('ruby')

    const after = step({ ...started, time: readyAt - 5 }, 5).game
    expect(after.training).toEqual([])
    const learned = after.engineers[0]!
    expect(learned.language).toBe('php')
    expect(outputOf(after, learned)).toBe(1)
    expect(payOf(after, learned) / payOf(after, engineer)).toBeCloseTo(
      LANGUAGES.php.salary / LANGUAGES.ruby.salary,
      9,
    )
  })

  test('a rare language takes longer to learn, and training is refused when it makes no sense', () => {
    const game = staffed()
    const engineer = game.engineers[0]!
    expect(trainSeconds('haskell')).toBeGreaterThan(trainSeconds('php'))
    expect(Result.isFailure(train(game, engineer.id, 'ruby'))).toBe(true)
    expect(Result.isFailure(train(game, 'nobody', 'php'))).toBe(true)
    expect(Result.isFailure(train({ ...game, cash: 0 }, engineer.id, 'php'))).toBe(true)
    const started = Result.getOrThrow(train(game, engineer.id, 'php'))
    expect(Result.isFailure(train(started, engineer.id, 'python'))).toBe(true)
  })

  test('laying off an engineer in training ends the training', () => {
    const started = Result.getOrThrow(train(staffed(), 'e-test', 'php'))
    const gone = step({ ...started, engineers: [] }, 5).game
    expect(gone.training).toEqual([])
  })
})

describe('Rush quality', () => {
  test('a rush adds tech debt and a bad-deploy risk when the item finishes, in proportion to the pool', () => {
    const open = () => {
      const queued = Result.getOrThrow(queueFeature(preseedGame(1), FEATURE_IDS[0]!))
      return {
        // Keep the deploy slot away so the finished Feature stays in the batch for the chance test.
        queued: {
          ...queued,
          services: queued.services.map((service) => ({
            ...service,
            nextDeployAt: queued.time + 10_000,
          })),
        },
        item: queued.backlog[0]!,
      }
    }
    const normal = open()
    const base = serviceOfItem(
      step({ ...normal.queued, backlog: [{ ...normal.item, spent: normal.item.cost }] }, 0.1).game,
      normal.item,
    ).debt

    const full = open()
    const rushedFull = step(
      Result.getOrThrow(rushItem({ ...full.queued, devHours: full.item.cost }, full.item.id)),
      0.1,
    ).game
    expect(serviceOfItem(rushedFull, full.item).debt).toBeCloseTo(base + RUSH_DEBT, 10)
    expect(rushedFull.rushedFeatures[full.item.ref]).toBeCloseTo(1, 10)
    expect(rushBugOf(full.queued, full.item, full.item.cost)).toBeCloseTo(RUSH_BUG_CHANCE, 10)
    const fullService = serviceOfItem(rushedFull, full.item)
    expect(nextBadDeployChance(rushedFull, undefined, fullService)).toBeCloseTo(
      badDeployChance(rushedFull, undefined, fullService) + RUSH_BUG_CHANCE,
      10,
    )

    const half = open()
    const rushedHalf = Result.getOrThrow(
      rushItem({ ...half.queued, devHours: half.item.cost / 2 }, half.item.id),
    )
    const finishedHalf = step(
      { ...rushedHalf, backlog: [{ ...rushedHalf.backlog[0]!, spent: half.item.cost }] },
      0.1,
    ).game
    expect(serviceOfItem(finishedHalf, half.item).debt).toBeCloseTo(base + RUSH_DEBT / 2, 10)
    expect(finishedHalf.rushedFeatures[half.item.ref]).toBeCloseTo(0.5, 10)
    expect(rushBugOf(half.queued, half.item, half.item.cost / 2)).toBeCloseTo(
      RUSH_BUG_CHANCE / 2,
      10,
    )
  })

  test('a task carries no bad-deploy risk, because it ships no Feature', () => {
    const task: WorkItem = {
      id: 999,
      kind: 'task',
      ref: 'load-test',
      cost: 15,
      spent: 0,
      block: { _tag: 'Free' },
      answered: null,
    }
    expect(rushBugOf(preseedGame(1), task, task.cost)).toBe(0)
  })

  test('the Garage has no bad deploy, so a rushed Feature carries no risk there', () => {
    const feature: WorkItem = {
      id: 999,
      kind: 'feature',
      ref: FEATURE_IDS[0]!,
      cost: 8,
      spent: 0,
      block: { _tag: 'Free' },
      answered: null,
    }
    expect(rushBugOf(newGame(1), feature, feature.cost)).toBe(0)
    expect(rushBugOf(preseedGame(1), feature, feature.cost)).toBeCloseTo(RUSH_BUG_CHANCE, 10)
  })

  test('a cancelled rushed item adds no debt, because its code never lands', () => {
    const queued = Result.getOrThrow(queueFeature(preseedGame(1), FEATURE_IDS[0]!))
    const item = queued.backlog[0]!
    const before = serviceOfItem(queued, item).debt
    const rushed = Result.getOrThrow(rushItem({ ...queued, devHours: item.cost }, item.id))
    const cancelled = Result.getOrThrow(cancelItem(rushed, item.id))
    const advanced = step(cancelled, 0.1).game
    expect(serviceOfItem(advanced, item).debt).toBe(before)
  })
})
