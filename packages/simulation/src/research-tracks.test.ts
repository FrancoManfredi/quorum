import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from './actions.ts'
import type { Action } from './actions.ts'
import {
  GATEWAY_BURST,
  GPU_BATCHES,
  PARANOIA,
  RESEARCH,
  RESEARCH_IDS,
  STEP_SECONDS,
  type ResearchId,
} from './catalog.ts'
import { databaseModel, requestCpuMs, serverModel, speedOf } from './capacity.ts'
import { company, link, node } from './company.ts'
import { weaknessOf } from './director.ts'
import { answered, hop } from './distribution.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf } from './lookups.ts'
import { RULES, cdnHitOf, gatewayShare, wafOf, type Solver } from './rules.ts'
import { chaosTarget, policyOf, solve, solveFlow } from './solve.ts'
import { Game, type GameNode } from './state.ts'
import { peakLoadOf, step } from './step.ts'

/*
 * The research the build was still missing (05, 07, 10, 16 "Open gaps"): each item's effect, its
 * gate, and an old save that opens without any of it.
 */

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const ALL: ReadonlyArray<ResearchId> = RESEARCH_IDS

/** Every item but these: the board that has not bought them yet. */
const without = (...ids: ReadonlyArray<ResearchId>): ReadonlyArray<ResearchId> =>
  ALL.filter((entry) => !ids.includes(entry))

/** A Sandbox Board that owns every research item: the mechanics, with no Era or Cash in the way. */
const board = (
  extra: ReadonlyArray<GameNode> = [],
  links: ReadonlyArray<readonly [string, string]> = [],
) => ({
  ...company(19),
  sandbox: true,
  stage: 4,
  users: 2_000,
  researched: ALL,
  nodes: [
    node('users', 'users', 120, 280),
    node('server', 'server', 440, 280, { size: 3, runtime: 'go' }),
    node('database', 'database', 760, 200, { size: 3 }),
    ...extra,
  ],
  links: [
    link('users', 'server'),
    link('server', 'database'),
    ...links.map(([from, to]) => link(from, to)),
  ],
})

/** A Board that owns none of the catalog's research, for the gates. */
const bare = (): Game => ({
  ...company(23),
  sandbox: true,
  stage: 6,
  users: 2_000,
  nodes: [
    node('users', 'users', 120, 280),
    node('server', 'server', 440, 280),
    node('database', 'database', 760, 200),
  ],
  links: [link('users', 'server'), link('server', 'database')],
})

const tuned = (game: Game, id: string, change: Partial<GameNode>): Game => ({
  ...game,
  nodes: game.nodes.map((entry) => (entry.id === id ? { ...entry, ...change } : entry)),
})

const solver = (game: Game): Solver => ({
  game,
  boost: () => 1,
  callLatency: () => ({}),
  inflight: () => 0,
  delegates: () => false,
  runsLocalDb: () => false,
  sampling: () => 0,
  offloads: () => false,
  poisoned: () => false,
  taskMix: () => ({}),
  attempts: () => 1,
  drainable: () => 0,
})

const at = (game: Game, id: string): GameNode => {
  const found = game.nodes.find((entry) => entry.id === id)
  if (!found) throw new Error(`Missing ${id}`)
  return found
}

/** Database CPU utilization for one kind at a rate, on a box that is not otherwise busy. */
const databaseUse = (game: Game, kind: 'q-read' | 'q-write' | 'q-scan', rate = 100): number =>
  databaseModel({ game, node: at(game, 'database'), arriving: { [kind]: rate }, boost: 1 })
    .utilization

describe('the research catalog', () => {
  const costs: ReadonlyArray<readonly [ResearchId, number, number]> = [
    ['l4-lb', 2, 400],
    ['rate-limiting', 3, 1_800],
    ['esi', 3, 3_000],
    ['bot-management', 3, 2_500],
    ['scheduled-scaling', 4, 9_000],
    ['arm-instances', 4, 12_000],
    ['quantization', 4, 18_000],
    ['continuous-batching', 4, 25_000],
    ['bulkheads', 3, 3_500],
    ['graceful-degradation', 3, 3_000],
    ['hedged-requests', 5, 100_000],
    ['chaos-engineering', 6, 300_000],
    ['denormalization', 3, 3_000],
    ['precompute', 4, 12_000],
    ['binary-rpc', 4, 15_000],
    ['outbox', 4, 14_000],
    ['expand-contract', 4, 10_000],
  ]

  test('each of the seventeen carries the Era and cost 10 gives it', () => {
    for (const [id, era, cost] of costs) {
      expect([id, RESEARCH[id].era, RESEARCH[id].cost]).toEqual([id, era, cost])
    }
  })

  test('every track is complete: Infrastructure, Data, Reliability and Performance hold no gap', () => {
    const track = (id: ResearchId) => RESEARCH[id].track
    expect(costs.filter(([id]) => track(id) === 'infrastructure')).toHaveLength(8)
    expect(costs.filter(([id]) => track(id) === 'data')).toHaveLength(2)
    expect(costs.filter(([id]) => track(id) === 'reliability')).toHaveLength(4)
    expect(costs.filter(([id]) => track(id) === 'performance')).toHaveLength(3)
  })
})

describe('the Infrastructure track', () => {
  test('L4 is a Load Balancer variant: ten times the capacity, a fifth of the hop, and cheaper', () => {
    const game = board(
      [node('lb', 'lb', 300, 280)],
      [
        ['users', 'lb'],
        ['lb', 'server'],
      ],
    )
    expect(Result.isFailure(Actions.setLbVariant(game, 'lb', 'l4'))).toBe(false)
    const l4 = tuned(game, 'lb', { variant: 'l4' })
    expect(RULES.lb.model(solver(l4), at(l4, 'lb'), { page: 100 }).capacity).toBe(20_000)
    expect(RULES.lb.model(solver(game), at(game, 'lb'), { page: 100 }).capacity).toBe(2_000)
    const service = RULES.lb.model(solver(l4), at(l4, 'lb'), { page: 1 }).service.page
    expect(service?.fixed).toBe(0.2)
    expect(burnOf(l4, at(l4, 'lb')) / burnOf(game, at(game, 'lb'))).toBeCloseTo(0.6, 9)
    // It reads no HTTP, so a per-kind route does not narrow it and no retry applies.
    const restricted: Game = {
      ...l4,
      links: l4.links.map((entry) =>
        entry.from === 'lb' ? { ...entry, kinds: ['read'], retries: 'naive' } : entry,
      ),
    }
    expect(
      policyOf(
        restricted,
        restricted.links.find((entry) => entry.from === 'lb'),
        at(restricted, 'lb'),
      ).retry,
    ).toBe('none')
  })

  test('L4 needs its research', () => {
    const plain = bare()
    const placed = ok(
      Actions.place(
        { ...plain, researched: ['load-balancing', 'lb-algorithms'], cash: 1e9 },
        'lb',
        300,
        280,
      ),
    )
    expect(Result.isFailure(Actions.setLbVariant(placed, 'lb', 'l4'))).toBe(true)
  })

  test('the Gateway token bucket passes a burst the flat cap refuses', () => {
    const game = board(
      [node('gw', 'gw', 300, 280, { rateLimit: 1_000 })],
      [
        ['users', 'gw'],
        ['gw', 'server'],
      ],
    )
    const flat = at(game, 'gw')
    expect(gatewayShare(flat, { page: 3_000 }, STEP_SECONDS)).toBeCloseTo(1 / 3, 9)
    expect(Result.isFailure(Actions.setGatewayBucket(game, 'gw', true))).toBe(false)
    const bucket = at(ok(Actions.setGatewayBucket(game, 'gw', true)), 'gw')
    expect(bucket.burst).toBe(GATEWAY_BURST)
    expect(gatewayShare(bucket, { page: 3_000 }, STEP_SECONDS)).toBe(1)
    expect(gatewayShare(bucket, { page: 30_000 }, STEP_SECONDS)).toBeLessThan(0.2)
  })

  test('a token bucket needs Rate limiting', () => {
    const plain = bare()
    const placed = ok(
      Actions.place({ ...plain, researched: ['api-gateway'], cash: 1e9 }, 'gw', 300, 280),
    )
    expect(Result.isFailure(Actions.setGatewayBucket(placed, 'gw', true))).toBe(true)
  })

  test('Edge-side includes adds 20 points to a CDN page hit ratio', () => {
    const game = { ...board([node('cdn', 'cdn', 300, 280)]), researched: without('esi') }
    const hit = (g: Game) => cdnHitOf(at(g, 'cdn'), 'page', g)
    expect(hit(game)).toBeCloseTo(0.7, 9)
    expect(hit({ ...game, researched: ALL })).toBeCloseTo(0.9, 9)
  })

  test('Bot management halves the WAF false positives and keeps the block rate', () => {
    const game = board([node('waf', 'waf', 300, 280)])
    const without = wafOf(at(game, 'waf'), { ...game, researched: [] })
    const withBot = wafOf(at(game, 'waf'), game)
    expect(withBot.block).toBe(without.block)
    expect(withBot.falsePositive).toBeCloseTo(without.falsePositive * 0.5, 9)
    expect(without.falsePositive).toBeCloseTo(PARANOIA[1]!.falsePositive, 9)
  })

  test('Scheduled scaling plans for the peak inside the lead window and not outside it', () => {
    const game = board([node('hpa', 'autoscaler', 300, 280)], [['server', 'hpa']])
    expect(Result.isFailure(Actions.setAutoscaler(game, 'hpa', { schedule: true }))).toBe(false)
    const near: Game = { ...game, time: (20 * 60 - 30) * 60 - 14 * 60 }
    const far: Game = { ...game, time: (20 * 60 - 600) * 60 - 14 * 60 }
    expect(peakLoadOf(near, 0.5)).toBeGreaterThan(0.5)
    expect(peakLoadOf(far, 0.5)).toBe(0.5)
  })

  test('Scheduled scaling needs its research', () => {
    const plain = bare()
    const placed = ok(
      Actions.place({ ...plain, researched: ['autoscaling'], cash: 1e9 }, 'autoscaler', 300, 280),
    )
    expect(Result.isFailure(Actions.setAutoscaler(placed, 'autoscaler', { schedule: true }))).toBe(
      true,
    )
  })

  test('ARM is a family: General’s box for 0.8× the price and 0.95× the CPU', () => {
    const game = board()
    expect(Result.isFailure(Actions.setFamily(game, 'server', 'arm'))).toBe(false)
    const arm = tuned(game, 'server', { family: 'arm' })
    expect(burnOf(arm, at(arm, 'server'))).toBeCloseTo(burnOf(game, at(game, 'server')) * 0.8, 9)
    expect(speedOf(arm, at(arm, 'server'))).toBeCloseTo(speedOf(game, at(game, 'server')) * 0.95, 9)
    // The same vCPU and RAM as General.
    expect(arm.nodes[1]?.family).toBe('arm')
  })

  test('ARM needs its research', () => {
    expect(Result.isFailure(Actions.setFamily(bare(), 'server', 'arm'))).toBe(true)
  })

  test('Quantization speeds a GPU and lowers what each answer is worth', () => {
    const game = board([node('gpu', 'gpu', 760, 400)], [['server', 'gpu']])
    const int8 = tuned(game, 'gpu', { precision: 'int8' })
    const int4 = tuned(game, 'gpu', { precision: 'int4' })
    const capacity = (g: Game) => RULES.gpu.model(solver(g), at(g, 'gpu'), { infer: 1 }).capacity
    expect(capacity(int8)).toBeCloseTo(capacity(game) * 2, 9)
    expect(capacity(int4)).toBeCloseTo(capacity(game) * 3, 9)
    const answer = (g: Game) =>
      RULES.gpu.outcome(
        {
          game: g,
          pass: { arriving: [] } as never,
          ownHop: (_, value) => hop({ value: value ?? 1 }),
          downstream: () => answered(0, 0),
          delegates: false,
          runsLocalDb: false,
          offloads: false,
        },
        at(g, 'gpu'),
        'infer',
      ).value
    expect(answer(game)).toBe(1)
    expect(answer(int8)).toBeCloseTo(0.95, 9)
    expect(answer(int4)).toBeCloseTo(0.85, 9)
    expect(Result.isFailure(Actions.setPrecision(game, 'gpu', 'int8'))).toBe(false)
  })

  test('Quantization needs its research', () => {
    const plain = bare()
    const placed = ok(
      Actions.place({ ...plain, researched: ['model-serving'], cash: 1e9 }, 'gpu', 760, 400),
    )
    expect(Result.isFailure(Actions.setPrecision(placed, 'gpu', 'int8'))).toBe(true)
  })

  test('Continuous batching keeps a larger batch’s throughput and drops its latency', () => {
    const game = {
      ...board([node('gpu', 'gpu', 760, 400)], [['server', 'gpu']]),
      researched: without('continuous-batching'),
    }
    const batched = tuned(game, 'gpu', { batch: 8 })
    const capacity = (g: Game) => RULES.gpu.model(solver(g), at(g, 'gpu'), { infer: 1 }).capacity
    const fixed = (g: Game) =>
      RULES.gpu.model(solver(g), at(g, 'gpu'), { infer: 1 }).service.infer?.fixed
    // Without the research a larger batch buys throughput and pays for it in first-token wait.
    expect(fixed(batched)).toBe(300 + (GPU_BATCHES[1]?.ttft ?? 0))
    expect(capacity(batched)).toBeCloseTo(capacity(game) * (GPU_BATCHES[1]?.gain ?? 1), 9)
    // With it the throughput stays and the wait does not.
    const continuous = { ...batched, researched: ALL }
    expect(fixed(continuous)).toBe(300)
    expect(capacity(continuous)).toBeCloseTo(capacity(batched), 9)
    expect(Result.isFailure(Actions.setBatch(continuous, 'gpu', 8))).toBe(false)
  })

  test('Continuous batching needs its research', () => {
    const plain = bare()
    const placed = ok(
      Actions.place({ ...plain, researched: ['model-serving'], cash: 1e9 }, 'gpu', 760, 400),
    )
    expect(Result.isFailure(Actions.setBatch(placed, 'gpu', 8))).toBe(true)
  })
})

describe('the Reliability track', () => {
  const slow = () => board([node('warehouse', 'warehouse', 760, 400)], [['server', 'warehouse']])

  test('a bulkhead frees the caller’s slot after a second, and the call fails as timeout', () => {
    const game: Game = {
      ...slow(),
      shipped: ['dashboards'],
      stage: 4,
      users: 4_000,
    }
    const plain = solve(game)
    const bulkheaded: Game = {
      ...game,
      links: game.links.map((entry) =>
        entry.from === 'server' && entry.to === 'warehouse' ? { ...entry, bulkhead: true } : entry,
      ),
    }
    const cut = solve(bulkheaded)
    // The warehouse answers in 1.5 s, so without a bulkhead nothing times out on a 30 s Link.
    expect(plain.errors.timeout).toBe(0)
    expect(cut.errors.timeout).toBeGreaterThan(0)
    expect(cut.latency).toBeLessThan(plain.latency + 1)
    expect(cut.p99).toBeLessThanOrEqual(1_000 + 200)
    expect(
      Result.isFailure(
        Actions.setLinkPolicy(bulkheaded, 'server', 'warehouse', { bulkhead: true }),
      ),
    ).toBe(false)
  })

  test('a bulkhead needs its research', () => {
    const plain: Game = { ...bare(), researched: ['timeouts'] }
    expect(
      Result.isFailure(Actions.setLinkPolicy(plain, 'server', 'database', { bulkhead: true })),
    ).toBe(true)
  })

  test('graceful degradation drops the dearest kinds first, not the cheapest', () => {
    const game = board()
    const tiny = tuned(game, 'server', { size: 0, degrade: true })
    const model = serverModel({
      game: tiny,
      node: at(tiny, 'server'),
      arriving: { page: 40, job: 2_000 },
      callLatency: {},
      delegated: false,
      local: false,
      inflight: 0,
      boost: 1,
      sampling: 0,
      hashing: 1,
    })
    // The dearest kind is the one that goes; the cheap one keeps nearly all its traffic.
    expect(model.shares?.job ?? 1).toBeLessThan(0.01)
    expect(model.shares?.page ?? 0).toBeGreaterThan(0.9)
    // Load shedding is the other order: with it the cheapest kind is the one that goes.
    const shed = tuned(game, 'server', { size: 0, degrade: false, shed: true })
    const byValue = serverModel({
      game: shed,
      node: at(shed, 'server'),
      arriving: { page: 40, job: 2_000 },
      callLatency: {},
      delegated: false,
      local: false,
      inflight: 0,
      boost: 1,
      sampling: 0,
      hashing: 1,
    })
    expect(byValue.shares?.page ?? 1).toBeLessThan(byValue.shares?.job ?? 0)
    // Without the research the switch gates nothing.
    const unresearched: Game = { ...tiny, researched: without('graceful-degradation') }
    const plain = serverModel({
      game: unresearched,
      node: at(unresearched, 'server'),
      arriving: { page: 40, job: 2_000 },
      callLatency: {},
      delegated: false,
      local: false,
      inflight: 0,
      boost: 1,
      sampling: 0,
      hashing: 1,
    })
    expect(plain.shares).toBeUndefined()
    expect(Result.isFailure(Actions.setDegrade(game, 'server', true))).toBe(false)
    expect(Result.isFailure(Actions.setDegrade(bare(), 'server', true))).toBe(true)
  })

  test('hedged requests cut the tail and add 10% of calls to the Link', () => {
    const game = slow()
    const hedged: Game = {
      ...game,
      shipped: ['dashboards'],
      links: game.links.map((entry) =>
        entry.from === 'server' && entry.to === 'warehouse' ? { ...entry, hedge: true } : entry,
      ),
    }
    const plain = solve({ ...game, shipped: ['dashboards'] })
    const racing = solve(hedged)
    expect(racing.kinds.report?.mean ?? 0).toBeLessThan(plain.kinds.report?.mean ?? 0)
    const rate = (g: Game) =>
      solve(g).links.find((entry) => entry.from === 'server' && entry.to === 'warehouse')?.rate ?? 0
    expect(rate(hedged)).toBeCloseTo(rate({ ...game, shipped: ['dashboards'] }) * 1.1, 6)
    expect(
      Result.isFailure(Actions.setLinkPolicy(hedged, 'server', 'warehouse', { hedge: true })),
    ).toBe(false)
  })

  test('hedging needs its research', () => {
    const plain: Game = { ...bare(), researched: ['timeouts'] }
    expect(
      Result.isFailure(Actions.setLinkPolicy(plain, 'server', 'database', { hedge: true })),
    ).toBe(true)
  })

  test('a chaos experiment fails the weakest Node and pays Failure Insight', () => {
    const game: Game = {
      ...board(),
      sandbox: false,
      time: 5,
      chaos: true,
      weakest: 'database',
      researched: ALL,
    }
    expect(chaosTarget(game)).toBe('database')
    const ledger = solve(game)
    expect(ledger.errors.refused).toBeGreaterThan(0)
    // Outside the experiment window nothing fails.
    expect(chaosTarget({ ...game, time: 60 })).toBeNull()
    const after = step(game, 1).game
    expect(after.pools.failure).toBeGreaterThan(game.pools.failure)
    expect(after.weakest).not.toBeNull()
    expect(Result.isFailure(Actions.setChaos(game, true))).toBe(false)
    // A Company without the research refuses it; a Sandbox refuses it for its own reason.
    expect(Result.isFailure(Actions.setChaos({ ...bare(), sandbox: false }, true))).toBe(true)
    expect(Result.isFailure(Actions.setChaos(bare(), true))).toBe(true)
  })
})

describe('the Performance track', () => {
  test('denormalization trades 30% of a read for 20% of a write', () => {
    const game = { ...board(), researched: without('denormalization') }
    const plain = databaseUse(game, 'q-read', 50)
    const denormalized = databaseUse({ ...game, researched: ALL }, 'q-read', 50)
    expect(denormalized).toBeCloseTo(plain * 0.7, 6)
    const writes = databaseUse(game, 'q-write', 50)
    const writing = databaseUse({ ...game, researched: ALL }, 'q-write', 50)
    expect(writing).toBeCloseTo(writes * 1.2, 6)
  })

  test('a materialized view answers a report for half the CPU, and stale', () => {
    const game = board()
    const plain = databaseUse(game, 'q-scan', 4)
    const tucked = tuned(game, 'database', { materialized: true })
    expect(databaseUse(tucked, 'q-scan', 4)).toBeCloseTo(plain * 0.5, 6)
    // Without the research the switch gates nothing.
    const unresearched: Game = { ...tucked, researched: without('precompute') }
    expect(databaseUse(unresearched, 'q-scan', 4)).toBeCloseTo(plain, 6)
    expect(Result.isFailure(Actions.setMaterialized(tucked, 'database', true))).toBe(false)
    expect(Result.isFailure(Actions.setMaterialized(bare(), 'database', true))).toBe(true)
  })

  test('binary RPC halves the CPU a Node spends serialising its calls', () => {
    const game = { ...board(), researched: without('binary-rpc') }
    const server = at(game, 'server')
    const plain = requestCpuMs(game, server, 'page')
    const binary = requestCpuMs({ ...game, researched: ALL }, server, 'page')
    expect(binary).toBeLessThan(plain)
    // A page view makes two backend calls at 0.02 ms each: 0.04 ms, and binary RPC saves half.
    expect(plain - binary).toBeCloseTo(0.02, 9)
  })
})

describe('the Data track', () => {
  test('outbox, or a CDC Connector, removes the dual-write divergence', () => {
    const game = board([node('search', 'search', 760, 520)], [['server', 'search']])
    const stale = (g: Game) => {
      const ledger = solveFlow(g)
      return ledger.kinds.search?.success ?? 1
    }
    // A Series B Board with a Search Engine: 0.5% of its answers are stale from a lost publish.
    const seeded: Game = { ...game, stage: 4, researched: without('outbox', 'cdc') }
    const withOutbox: Game = { ...seeded, researched: [...seeded.researched, 'outbox'] }
    expect(stale(withOutbox)).toBeGreaterThan(stale(seeded))
    const cdc: Game = {
      ...seeded,
      nodes: [...seeded.nodes, node('cdc', 'cdc', 1_040, 200)],
      links: [...seeded.links, link('database', 'cdc')],
    }
    expect(stale(cdc)).toBeGreaterThan(stale(seeded))
    expect(RESEARCH.outbox.cost).toBe(14_000)
  })

  test('expand and contract removes the schema migration lock', () => {
    const game = board()
    const ledger = solveFlow(game)
    const neither: Game = { ...game, researched: without('online-migrations', 'expand-contract') }
    const online: Game = { ...neither, researched: [...neither.researched, 'online-migrations'] }
    const both: Game = { ...online, researched: [...online.researched, 'expand-contract'] }
    expect(weaknessOf(neither, ledger, 'migration-lock')).toBe(2.5)
    expect(weaknessOf(online, ledger, 'migration-lock')).toBe(0.3)
    expect(weaknessOf(both, ledger, 'migration-lock')).toBe(0)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with none of the new fields in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.chaos).toBe(false)
    expect(game.weakest).toBeNull()
    expect(game.nodes.every((entry) => entry.variant === 'l7')).toBe(true)
    expect(
      game.nodes.every(
        (entry) => entry.burst === 0 && entry.precision === 'fp16' && entry.batch === 1,
      ),
    ).toBe(true)
    expect(
      game.nodes.every((entry) => !entry.degrade && !entry.schedule && !entry.materialized),
    ).toBe(true)
    expect(game.links.every((entry) => !entry.bulkhead && !entry.hedge)).toBe(true)
    expect(solve(game).revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
