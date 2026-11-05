import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { place, resize, sell, setLinkPolicy, setRuntime, type Action } from './actions.ts'
import {
  CALENDAR_DAY,
  DEADLINE_SURGE,
  ERAS,
  FLASH_SALE_SURGE,
  HOME_REGION,
  KINDS,
  LAUNCH_SURGE,
  PREMIERE_SURGE,
  PROFILES,
  SLO_LEVELS,
  VENTURES,
  VENTURE_IDS,
  type IncidentId,
  type RequestKind,
  type ResearchId,
  type VentureId,
} from './catalog.ts'
import { link, preseedGame } from './company.ts'
import { forceIncident, directIncidents, weaknessOf } from './director.ts'
import { mixOf } from './features.ts'
import {
  SIGNATURE_WEIGHT,
  SIGNATURE_WEAKNESS,
  earnsInTime,
  foundCompany,
  isSignature,
  signatureOf,
  signatureWeight,
} from './founding.ts'
import { budgetOf } from './slo.ts'
import { demandOf, solve, solveFlow } from './solve.ts'
import type { Founding, Game } from './state.ts'
import { step } from './step.ts'

/*
 * The Ventures the design names (13 "Ventures"): their start, the rule that
 * makes each hard, and the signature incident only it suffers.
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
      ['b2b-saas', 'hot-shard'],
      ['consumer-social', 'hot-key'],
      ['fintech', 'double-charge'],
      ['streaming', 'premiere-spike'],
      ['game-backend', 'launch-day'],
      ['ai-startup', 'gpu-shortage'],
      ['e-commerce', 'flash-sale'],
      ['developer-platform', 'retry-storm'],
      ['healthcare', 'audit'],
      ['ad-tech', 'latency-regression'],
      ['government', 'deadline-day'],
    ]
    for (const [venture, kind] of signatures) {
      const game = start(venture)
      expect([venture, signatureOf(game)]).toEqual([venture, kind])
      expect([venture, isSignature(game, kind)]).toEqual([venture, true])
      expect([venture, signatureWeight(game, kind)]).toEqual([venture, SIGNATURE_WEIGHT])
      // Only its Venture weighs it four times: everyone else meets it as the incident it is.
      for (const other of VENTURE_IDS.filter((id) => id !== venture)) {
        const theirs = start(other)
        expect([other, kind, signatureWeight(theirs, kind)]).toEqual([other, kind, 1])
        expect([other, signatureOf(theirs)]).not.toEqual([other, kind])
      }
    }
    // The Bootstrapped indie row names Runway, a figure rather than an incident: it has none.
    expect(VENTURES.bootstrapped.signature).toBeNull()
    // A Sandbox founds no Venture: it has no signature.
    expect(isSignature({ ...start('ad-tech'), sandbox: true }, 'latency-regression')).toBe(false)
  })

  test('a signature-only incident weighs nothing for every other Venture', () => {
    const others: ReadonlyArray<readonly [VentureId, IncidentId]> = [
      ['b2b-saas', 'hot-shard'],
      ['streaming', 'premiere-spike'],
      ['game-backend', 'launch-day'],
      ['e-commerce', 'flash-sale'],
      ['ad-tech', 'latency-regression'],
      ['government', 'deadline-day'],
    ]
    for (const [venture, kind] of others) {
      const game = { ...start(venture), stage: 5, users: 5_000 }
      expect([venture, kind, weaknessOf(game, solve(game), kind) >= SIGNATURE_WEAKNESS]).toEqual([
        venture,
        kind,
        true,
      ])
      // Every other Venture's design never starts it, however weak that design is.
      for (const [other] of others.filter(([id]) => id !== venture)) {
        const stranger = { ...start(other), stage: 5, users: 5_000 }
        expect([other, kind, weaknessOf(stranger, solve(stranger), kind)]).toEqual([other, kind, 0])
      }
    }
  })

  test("a Venture's signature surge lifts one kind and leaves the rest of the mix alone", () => {
    const surges: ReadonlyArray<readonly [VentureId, IncidentId, RequestKind, number]> = [
      ['streaming', 'premiere-spike', 'media', PREMIERE_SURGE],
      ['game-backend', 'launch-day', 'rt', LAUNCH_SURGE],
      ['e-commerce', 'flash-sale', 'buy', FLASH_SALE_SURGE],
    ]
    for (const [venture, kind, lifted, factor] of surges) {
      const game = { ...start(venture), stage: 3, users: 2_000 }
      const plain = demandOf(game)
      const surged = forceIncident(game, solve(game), kind)
      expect([venture, surged !== null]).toEqual([venture, true])
      const busy = demandOf(surged as Game)
      for (const request of Object.keys(plain) as Array<RequestKind>)
        expect([venture, request, busy[request] ?? 0]).toEqual([
          venture,
          request,
          (plain[request] ?? 0) * (request === lifted ? factor : 1),
        ])
    }
  })

  test('a big tenant hot shard costs its Database more CPU per query', () => {
    const garage = start('b2b-saas')
    const game: Game = {
      ...garage,
      stage: 4,
      users: 1_500,
      cash: 100_000,
      nodes: garage.nodes.map((node) =>
        node.type === 'server' ? { ...node, localDb: false } : node,
      ),
    }
    const placed = ok(place(game, 'database', 0, 0))
    const database = placed.nodes.find((node) => node.type === 'database')?.id ?? ''
    const linked: Game = { ...placed, links: [...placed.links, link('server', database)] }
    const plain = solve(linked)
    expect(plain.nodes[database]?.inbound ?? 0).toBeGreaterThan(0)
    const shard = forceIncident(linked, plain, 'hot-shard')
    expect(shard).not.toBeNull()
    expect(solve(shard as Game).nodes[database]?.utilization).toBeGreaterThan(
      plain.nodes[database]?.utilization ?? 0,
    )
  })

  test("Ad tech serves the bid kind at the design's value, target and volume", () => {
    // 13 "Ventures": value $0.001, Apdex T 100 ms, 10× volume.
    expect(KINDS.bid.value).toBe(0.001)
    expect(PROFILES.bid.apdex).toBe(100)
    const base: Game = {
      ...preseedGame(5),
      stage: 3,
      users: 150,
      founding: founding({ venture: 'ad-tech' }),
    }
    const plain: Game = { ...base, founding: founding({ venture: 'b2b-saas' }) }
    const share = (game: Game): number => mixOf(game).bid ?? 0
    expect(share(base)).toBeGreaterThan(0)
    // Ten times the volume of the same kind for the default Venture at the same Era.
    expect(share(base) / share(plain)).toBeGreaterThan(8)
    // The bid kind is in every Era mix from Series A: Ad tech simply serves it ten times as often.
    const ledger = solveFlow(base)
    expect(ledger.kinds.bid?.rate ?? 0).toBeGreaterThan(0)
    expect(ledger.revenue).toBeGreaterThan(0)
    // The design's deadline is the bid kind's own target: a bid at 101 ms earns nothing.
    expect(earnsInTime(base, PROFILES.bid.apdex)).toBe(true)
    expect(earnsInTime(base, 101)).toBe(false)
  })

  test('the director starts a signature only for its own Venture', () => {
    /** The incidents the director picks over `rolls` tries, each on the same intact board. */
    const started = (game: Game, rolls: number): ReadonlyArray<IncidentId> => {
      const ledger = solve(game)
      let seed = game.seed
      const kinds: Array<IncidentId> = []
      for (let index = 0; index < rolls; index += 1) {
        const result = directIncidents(
          { ...game, seed, incident: null, nextIncidentAt: 0, lastIncident: null },
          ledger,
        )
        for (const event of result.events)
          if (event._tag === 'IncidentStarted') kinds.push(event.incident.kind)
        seed = result.game.seed
      }
      return kinds
    }
    const owners: ReadonlyArray<readonly [VentureId, IncidentId]> = [
      ['b2b-saas', 'hot-shard'],
      ['streaming', 'premiere-spike'],
      ['game-backend', 'launch-day'],
      ['e-commerce', 'flash-sale'],
    ]
    for (const [venture, kind] of owners) {
      const board: Game = {
        ...preseedGame(9),
        stage: 4,
        users: 4_000,
        founding: founding({ venture }),
      }
      expect([venture, started(board, 300).includes(kind)]).toEqual([venture, true])
      for (const [other] of owners.filter(([id]) => id !== venture)) {
        const stranger: Game = { ...board, founding: founding({ venture: other }) }
        expect([other, kind, started(stranger, 300).includes(kind)]).toEqual([other, kind, false])
      }
    }
  })
})

/*
 * The older Ventures' rules (13 "Ventures"). Three of the eight rows name a rule the build can
 * enforce where the player meets it: B2B SaaS's SLA, Game backend's Hubs per region, and AI
 * startup's scarce GPUs. Each is a refusal or a target in founding.ts, and only its own Venture
 * meets it.
 */

/** The same Company at an Era, with the Cash and the research a Component needs. */
const ready = (game: Game, stage: number, ...research: ReadonlyArray<ResearchId>): Game => ({
  ...game,
  stage,
  cash: 100_000,
  researched: [...game.researched, ...research] as Game['researched'],
})

describe("the older Ventures' rules", () => {
  test('B2B SaaS signs its SLA from Series B, and no other Venture does', () => {
    const era = (stage: number): number => ERAS[stage]?.slo ?? 1
    const next = (slo: number): number => SLO_LEVELS.find((level) => level > slo) ?? slo
    const budget = (venture: VentureId, stage: number, sandbox = false) =>
      budgetOf({ ...start(venture), stage, sandbox })
    // Before Series B the Era's own target applies, as it did.
    expect(budget('b2b-saas', 3).slo).toBe(era(3))
    // From Series B the contract's target is one level up: a missed week is a breach.
    expect(budget('b2b-saas', 4).slo).toBe(next(era(4)))
    expect(budget('b2b-saas', 4).slo).toBeGreaterThan(era(4))
    // A Sandbox founds no Venture, so it signs no SLA.
    expect(budget('b2b-saas', 4, true).slo).toBe(era(4))
    // Only its own Venture: every other one keeps the Era's target at Series B.
    for (const other of VENTURE_IDS.filter((id) => id !== 'b2b-saas'))
      expect([other, budget(other, 4).slo]).toEqual([other, era(4)])
  })

  test('Game backend keeps one Realtime Hub per region from Series A', () => {
    const hub = (venture: VentureId, stage: number): Game =>
      abroad(ready(start(venture), stage, 'websockets'))
    const seriesA = hub('game-backend', 3)
    const first = ok(place(seriesA, 'ws', 0, 0))
    // A second Hub in the same region is refused, and another region still gets its own.
    expect(Result.isFailure(place(first, 'ws', 0, 0))).toBe(true)
    expect(Result.isSuccess(place(first, 'ws', 0, 0, 'eu'))).toBe(true)
    // Before Series A one Hub serves everyone: placing a second is allowed.
    expect(Result.isSuccess(place(ok(place(hub('game-backend', 2), 'ws', 0, 0)), 'ws', 0, 0))).toBe(
      true,
    )
    // Only its own Venture.
    const other = hub('e-commerce', 3)
    expect(Result.isSuccess(place(ok(place(other, 'ws', 0, 0)), 'ws', 0, 0))).toBe(true)
  })

  test('AI startup buys two GPU Nodes at most, and resizes them instead', () => {
    const gpus = (game: Game) => game.nodes.filter((node) => node.type === 'gpu')
    const ai = ready(start('ai-startup'), 4, 'model-serving')
    const two = ok(place(ok(place(ai, 'gpu', 0, 0)), 'gpu', 0, 0))
    expect(gpus(two)).toHaveLength(2)
    // A third GPU Node is refused: the GPUs are not there to buy.
    expect(Result.isFailure(place(two, 'gpu', 0, 0))).toBe(true)
    // A bigger Node is a resize, not another GPU Node.
    expect(Result.isSuccess(resize(two, gpus(two)[0]?.id ?? '', 1))).toBe(true)
    // Selling one frees the slot.
    const sold = ok(sell(two, gpus(two).at(-1)?.id ?? ''))
    expect(Result.isSuccess(place(sold, 'gpu', 0, 0))).toBe(true)
    // Only its own Venture: another one may hold three.
    const other = ready(start('b2b-saas'), 4, 'model-serving')
    const theirs = ok(place(ok(place(other, 'gpu', 0, 0)), 'gpu', 0, 0))
    expect(gpus(theirs)).toHaveLength(2)
    expect(Result.isSuccess(place(theirs, 'gpu', 0, 0))).toBe(true)
  })
})
