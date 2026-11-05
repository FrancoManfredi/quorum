import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { place, setLinkPolicy, setRuntime, type Action } from './actions.ts'
import {
  CALENDAR_DAY,
  DEADLINE_SURGE,
  HOME_REGION,
  VENTURES,
  VENTURE_IDS,
  type IncidentId,
  type RequestKind,
  type ResearchId,
  type VentureId,
} from './catalog.ts'
import { forceIncident, weaknessOf } from './director.ts'
import {
  SIGNATURE_WEAKNESS,
  earnsInTime,
  foundCompany,
  isSignature,
  signatureOf,
  signatureWeight,
} from './founding.ts'
import { demandOf, solve, solveFlow } from './solve.ts'
import type { Founding, Game } from './state.ts'
import { step } from './step.ts'

/*
 * The four Ventures the design promises (13 "Ventures"): their start, the rule
 * that makes each hard, and the signature incident only it suffers.
 */

const founding = (over: Partial<Founding> = {}): Founding => ({
  venture: 'b2b-saas',
  mutators: [],
  perks: {},
  ...over,
})

const start = (venture: VentureId, seed = 5): Game => foundCompany(seed, founding({ venture }))

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const serverOf = (game: Game) => game.nodes.find((node) => node.type === 'server')

/** The same Company with a second region open, so a Component can be placed abroad. */
const abroad = (game: Game): Game => {
  const home = game.nodes.find((node) => node.type === 'users')
  return home
    ? { ...game, nodes: [...game.nodes, { ...home, id: 'eu-users', region: 'eu' }] }
    : game
}

describe('the four Ventures', () => {
  test('each starts with the Cash, Equity, Era and Stack it is founded with', () => {
    const garage = start('b2b-saas')
    expect(start('developer-platform').cash).toBe(garage.cash)
    expect(start('healthcare').cash).toBe(garage.cash)
    expect(start('ad-tech').cash).toBe(400)
    expect(start('government').cash).toBe(900)
    for (const id of ['developer-platform', 'healthcare', 'ad-tech', 'government'] as const) {
      const game = start(id)
      expect([id, game.stage]).toEqual([id, 0])
      expect([id, game.equity]).toEqual([id, 1])
      expect([id, game.founding.venture]).toEqual([id, id])
      expect([id, game.nodes.length]).toEqual([id, garage.nodes.length])
    }
    // The Government contract's core service is already Java, and the Company knows it.
    expect(serverOf(start('government'))?.runtime).toBe('tomcat')
    expect(start('government').researched).toContain('lang-java')
    expect(serverOf(start('healthcare'))?.runtime).toBe(serverOf(garage)?.runtime)
  })

  test('the title screen offers every Venture, each with its name and blurb', () => {
    for (const id of ['developer-platform', 'healthcare', 'ad-tech', 'government'] as const) {
      expect(VENTURE_IDS).toContain(id)
      expect(VENTURES[id].name.length).toBeGreaterThan(0)
      expect(VENTURES[id].summary.length).toBeGreaterThan(0)
    }
    expect(VENTURE_IDS).toHaveLength(12)
  })

  test('the Head start perk still opens Pre-seed for any Venture', () => {
    const seeded = foundCompany(5, founding({ venture: 'healthcare', perks: { 'head-start': 1 } }))
    expect(seeded.stage).toBe(1)
  })

  test('Government procurement opens a bought Component a calendar day later', () => {
    const government = { ...start('government'), cash: 10_000 }
    const placed = place(government, 'database', 0, 0)
    const node = ok(placed).nodes.find((entry) => entry.type === 'database')
    expect(node?.life).toMatchObject({ _tag: 'Restarting', left: CALENDAR_DAY })
    const plain = ok(place({ ...start('b2b-saas'), cash: 10_000 }, 'database', 0, 0))
    // Without procurement a Database opens cold; with it, the Company waits for the purchase.
    expect(plain.nodes.find((entry) => entry.type === 'database')?.life._tag).toBe('Warming')
    // A calendar day on, it is serving.
    const later = step(ok(placed), CALENDAR_DAY).game
    expect(later.nodes.find((entry) => entry.id === node?.id)?.life._tag).not.toBe('Restarting')
  })

  test('Healthcare keeps data in the home region from Series A', () => {
    const seriesA = abroad({ ...start('healthcare'), stage: 3, cash: 10_000 })
    expect(Result.isFailure(place(seriesA, 'database', 0, 0, 'eu'))).toBe(true)
    expect(Result.isSuccess(place(seriesA, 'database', 0, 0, HOME_REGION))).toBe(true)
    const seed = abroad({ ...start('healthcare'), stage: 2, cash: 10_000 })
    expect(Result.isSuccess(place(seed, 'database', 0, 0, 'eu'))).toBe(true)
    const other = abroad({ ...start('b2b-saas'), stage: 3, cash: 10_000 })
    expect(Result.isSuccess(place(other, 'database', 0, 0, 'eu'))).toBe(true)
  })

  test('Developer platform refuses naive retries; every other Venture allows them', () => {
    const researched = (game: Game): Game => ({
      ...game,
      researched: [...game.researched, 'timeouts'] as Game['researched'],
    })
    const link = { from: 'users', to: 'server' }
    expect(
      Result.isFailure(
        setLinkPolicy(researched(start('developer-platform')), link.from, link.to, {
          retries: 'naive',
        }),
      ),
    ).toBe(true)
    expect(
      Result.isSuccess(
        setLinkPolicy(researched(start('fintech')), link.from, link.to, { retries: 'naive' }),
      ),
    ).toBe(true)
    expect(
      Result.isSuccess(
        setLinkPolicy(researched(start('developer-platform')), link.from, link.to, {
          retries: 'none',
        }),
      ),
    ).toBe(true)
  })

  test('Ad tech earns nothing from a request that misses its 100 ms deadline', () => {
    const ads = start('ad-tech')
    expect(earnsInTime(ads, 100)).toBe(true)
    expect(earnsInTime(ads, 101)).toBe(false)
    expect(earnsInTime(start('b2b-saas'), 5_000)).toBe(true)
    // A latency regression puts every bid past the deadline: the Company earns nothing.
    expect(solveFlow(ads).revenue).toBeGreaterThan(0)
    const slow = forceIncident(ads, solve(ads), 'latency-regression')
    expect(slow).not.toBeNull()
    expect(solveFlow(slow as Game).revenue).toBe(0)
  })

  test("a deadline day multiplies the Government contract's demand", () => {
    const government = { ...start('government'), stage: 2, users: 2_000 }
    const plain = demandOf(government)
    const day = forceIncident(government, solve(government), 'deadline-day')
    expect(day).not.toBeNull()
    const busy = demandOf(day as Game)
    for (const kind of Object.keys(plain) as Array<RequestKind>)
      expect(busy[kind]).toBeCloseTo((plain[kind] ?? 0) * DEADLINE_SURGE)
  })

  test('Government runs Java or C#, and every new App Server joins that Stack', () => {
    const government = start('government')
    const server = serverOf(government)
    expect(server).toBeDefined()
    const researched = (ids: ReadonlyArray<ResearchId>): Game => ({
      ...government,
      researched: [...government.researched, ...ids] as Game['researched'],
    })
    expect(
      Result.isSuccess(setRuntime(researched(['lang-csharp']), server?.id ?? '', 'kestrel')),
    ).toBe(true)
    expect(Result.isFailure(setRuntime(researched(['php-fpm']), server?.id ?? '', 'php_fpm'))).toBe(
      true,
    )
    expect(Result.isFailure(setRuntime(researched(['lang-node']), server?.id ?? '', 'node'))).toBe(
      true,
    )
    // A second App Server copies the one the contract came with.
    const second = ok(place({ ...government, cash: 10_000 }, 'server', 0, 0))
    expect(second.nodes.filter((node) => node.type === 'server').at(-1)?.runtime).toBe('tomcat')
  })

  test('each Venture has its own signature incident, and no other Company suffers it', () => {
    const signatures: ReadonlyArray<readonly [VentureId, IncidentId]> = [
      ['developer-platform', 'retry-storm'],
      ['healthcare', 'audit'],
      ['ad-tech', 'latency-regression'],
      ['government', 'deadline-day'],
    ]
    for (const [venture, kind] of signatures) {
      const game = start(venture)
      expect([venture, signatureOf(game)]).toEqual([venture, kind])
      expect([venture, isSignature(game, kind)]).toEqual([venture, true])
      expect(signatureWeight(game, kind)).toBeGreaterThan(1)
      expect(signatureWeight(start('fintech'), kind)).toBe(1)
    }
    // The signature-only incidents never weigh for a Venture that is not theirs.
    const plain = { ...start('b2b-saas'), stage: 3, users: 5_000 }
    expect(weaknessOf(plain, solve(plain), 'latency-regression')).toBe(0)
    expect(weaknessOf(plain, solve(plain), 'deadline-day')).toBe(0)
    const ads = { ...start('ad-tech'), stage: 3, users: 5_000 }
    expect(weaknessOf(ads, solve(ads), 'latency-regression')).toBeGreaterThanOrEqual(
      SIGNATURE_WEAKNESS,
    )
    expect(weaknessOf(ads, solve(ads), 'deadline-day')).toBe(0)
    const government = { ...start('government'), stage: 3, users: 5_000 }
    expect(weaknessOf(government, solve(government), 'deadline-day')).toBeGreaterThanOrEqual(
      SIGNATURE_WEAKNESS,
    )
    expect(weaknessOf(government, solve(government), 'latency-regression')).toBe(0)
    // A Sandbox founds no Venture: it has no signature.
    expect(isSignature({ ...start('ad-tech'), sandbox: true }, 'latency-regression')).toBe(false)
  })
})
