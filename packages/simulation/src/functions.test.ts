import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, disconnect, place, study, type Action } from './actions.ts'
import { coldShareOf, serverlessModel } from './capacity.ts'
import { preseedGame } from './company.ts'
import {
  COLD_START_MS,
  EDGE_CPU_MS,
  EDGE_READ_HIT,
  EDGE_REQUEST_PRICE,
  RESEARCH,
  SERVERLESS_CONCURRENCY,
  SERVERLESS_GB_SECOND,
  SERVERLESS_REQUEST_PRICE,
  type RuntimeId,
} from './catalog.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { RUNNING } from './life.ts'
import { burnOf, eraOf, researchReady } from './lookups.ts'
import { cdnHitOf } from './rules.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'

/*
 * The Serverless Function and the Edge Function (05): a function that serves requests rather than
 * passing them, bills each use on the Requests line, and is gated by its research and its Era.
 */

const rich = (game: Board): Board => ({ ...game, cash: 1e9, insight: 1e9 })

const ok = (action: Action): Board => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const tune = (game: Board, id: string, change: Partial<GameNode>): Board => ({
  ...game,
  nodes: game.nodes.map((node) => (node.id === id ? { ...node, ...change } : node)),
})

const last = (game: Board): string => game.nodes.at(-1)?.id ?? ''

/** Pre-seed with a Password login shipped, at the given users and research. */
const preseed = (users: number, researched: Board['researched'] = []): Board => ({
  ...rich(preseedGame()),
  shipped: ['password-login'],
  users,
  researched: [...preseedGame().researched, ...researched],
})

/** Users, a function and its Database, with the function in place of the App Server. */
const functionBoard = (users: number, type: 'fn' | 'edge', runtime: RuntimeId): Board => {
  const unlock = type === 'fn' ? 'serverless' : 'edge-compute'
  const base: Board = {
    ...preseed(users, [unlock, 'cdn', 'lang-node']),
    stage: type === 'fn' ? 3 : 5,
  }
  const placed = ok(place(base, type, 240, 280))
  const id = last(placed)
  const server = placed.nodes.find((node) => node.type === 'server')?.id ?? 'server'
  const rewired = ok(connect(disconnect(placed, 'users', server), 'users', id))
  return tune(ok(connect(rewired, id, 'database')), id, { runtime })
}

const nodeOf = (game: Board, type: 'fn' | 'edge'): GameNode => {
  const node = game.nodes.find((entry) => entry.type === type)
  if (!node) throw new Error(`Missing ${type}`)
  return node
}

describe('the Serverless Function', () => {
  test('runs the Service’s code and sends its backend calls on, like an App Server', () => {
    const game = functionBoard(2_000, 'fn', 'node')
    const ledger = solve(game)
    const own = ledger.nodes[nodeOf(game, 'fn').id]
    if (!own) throw new Error('Missing the function')
    // It serves the request itself: page views arrive and the read queries leave for the Database.
    expect(own.inbound).toBeGreaterThan(0)
    expect(own.traffic.page ?? 0).toBeGreaterThan(0)
    expect(own.out['q-read'] ?? 0).toBeGreaterThan(0)
    expect(ledger.kinds.page?.success ?? 0).toBe(1)
    // It is not a Gateway: nothing is passed through under its own kind.
    expect(own.out.page).toBeUndefined()
  })

  test('runs 1,000 executions at once, and throttles past the cap', () => {
    const game = functionBoard(2_000, 'fn', 'node')
    const node = { ...nodeOf(game, 'fn'), life: RUNNING }
    const model = (rate: number) =>
      serverlessModel({
        game,
        node,
        arriving: { read: rate },
        callLatency: {},
        delegated: false,
        sampling: 0,
        hashing: 1,
        boost: 1,
      })
    const mild = model(1_000)
    expect(mild.resources.slots?.total).toBe(SERVERLESS_CONCURRENCY)
    expect(mild.share).toBe(1)
    // Past the cap the function serves only what its executions have room for.
    const busy = model(900_000)
    expect(busy.utilization).toBeGreaterThan(1)
    expect(busy.share).toBeLessThan(1)
    expect(busy.share).toBeCloseTo(1 / busy.utilization, 8)
  })

  test('a cold start lands on the requests that find no warm environment', () => {
    // An idle function reaps its environments: every invocation starts cold.
    expect(coldShareOf(0)).toBe(1)
    expect(coldShareOf(0.01)).toBeGreaterThan(coldShareOf(10))
    const game = functionBoard(50, 'fn', 'tomcat')
    const node = { ...nodeOf(game, 'fn'), life: RUNNING }
    const model = (rate: number) =>
      serverlessModel({
        game,
        node,
        arriving: { read: rate },
        callLatency: {},
        delegated: false,
        sampling: 0,
        hashing: 1,
        boost: 1,
      })
    // A trickle hits a cold environment on a third of its requests; steady load finds one warm.
    expect(model(0.4).tailP).toBeCloseTo(coldShareOf(0.4), 8)
    expect(model(0.4).tailMs).toBe(COLD_START_MS.java)
    expect(model(20_000).tailP).toBeLessThan(0.02)
    // The tail lands on the p99, not the mean: it is a cold start, not a slower function.
    const warm = tune(game, node.id, { life: RUNNING })
    expect(solve(warm).nodes[node.id]?.p99 ?? 0).toBeGreaterThan(COLD_START_MS.java)
  })

  test('it stands at zero Burn and bills each use on the Requests line', () => {
    const game = functionBoard(2_000, 'fn', 'node')
    const ledger = solve(game)
    const node = nodeOf(game, 'fn')
    const own = ledger.nodes[node.id]
    if (!own) throw new Error('Missing the function')
    const done = own.inbound - own.dropped
    // No box: nothing stands while it idles.
    expect(burnOf(game, node)).toBe(0)
    expect(ledger.burnLines.requests).toBeGreaterThan(0)
    // Each request bills at least its request price, and its GB-seconds on top.
    const each = ledger.burnLines.requests / (done * eraOf(game).costIndex)
    expect(each).toBeGreaterThanOrEqual(SERVERLESS_REQUEST_PRICE)
    expect(each).toBeLessThan(SERVERLESS_REQUEST_PRICE + SERVERLESS_GB_SECOND + 1)
    // The line is in Burn exactly once, in its place in the bill.
    const lines = ledger.burnLines
    expect(
      lines.compute +
        lines.data +
        lines.storage +
        lines.egress +
        lines.thirdParty +
        lines.requests +
        lines.observability +
        lines.salaries,
    ).toBeCloseTo(ledger.burn, 6)
  })

  test('a slower Stack runs each execution longer and bills more GB-seconds', () => {
    const perUse = (runtime: RuntimeId): number => {
      const game = functionBoard(2_000, 'fn', runtime)
      const ledger = solve(game)
      const own = ledger.nodes[nodeOf(game, 'fn').id]
      if (!own) throw new Error('Missing the function')
      return ledger.burnLines.requests / (own.inbound - own.dropped) / eraOf(game).costIndex
    }
    // PHP is about a sixth of Go's speed, so the same request holds its environment longer.
    expect(perUse('php_fpm')).toBeGreaterThan(perUse('go'))
    expect(perUse('go')).toBeGreaterThan(SERVERLESS_REQUEST_PRICE)
  })

  test('an idle function bills nothing at all', () => {
    const game = functionBoard(2_000, 'fn', 'node')
    const idle = disconnect(game, 'users', nodeOf(game, 'fn').id)
    const ledger = solve(idle)
    expect(ledger.burnLines.requests).toBe(0)
    expect(burnOf(idle, nodeOf(idle, 'fn'))).toBe(0)
  })

  test('it is placeable only with its research, and only from Series A', () => {
    expect(RESEARCH.serverless.era).toBe(3)
    expect(Result.isFailure(place(preseed(1_000), 'fn', 240, 280))).toBe(true)
    const seed: Board = { ...preseed(1_000), stage: 2 }
    expect(researchReady(seed, 'serverless')).toBe(false)
    expect(Result.isFailure(study(seed, 'serverless'))).toBe(true)
    const seriesA: Board = { ...preseed(1_000), stage: 3 }
    expect(Result.isSuccess(study(seriesA, 'serverless'))).toBe(true)
    const owned: Board = { ...seriesA, researched: [...seriesA.researched, 'serverless'] }
    expect(owned.nodes.some((node) => node.type === 'fn')).toBe(false)
    expect(ok(place(owned, 'fn', 240, 280)).nodes.some((node) => node.type === 'fn')).toBe(true)
  })
})

describe('the Edge Function', () => {
  test('it answers at 5 ms with no capacity limit of its own', () => {
    const game = functionBoard(2_000, 'edge', 'node')
    const ledger = solve(game)
    const own = ledger.nodes[nodeOf(game, 'edge').id]
    if (!own) throw new Error('Missing the edge function')
    expect(own.inbound).toBeGreaterThan(0)
    expect(own.utilization).toBe(0)
    expect(own.limit).toBe('none')
    expect(own.dropped).toBe(0)
    expect(own.latency).toBeCloseTo(5, 6)
    expect(ledger.kinds.page?.success ?? 0).toBe(1)
  })

  test('a request past its CPU ceiling fails as a timeout', () => {
    const game = functionBoard(2_000, 'edge', 'node')
    const ledger = solve(game)
    const own = ledger.nodes[nodeOf(game, 'edge').id]
    if (!own) throw new Error('Missing the edge function')
    // A login hashes a password off its own CPU: more than the ceiling allows.
    expect(own.traffic.login ?? 0).toBeGreaterThan(0)
    expect(ledger.errors.timeout).toBeGreaterThan(0)
    expect(ledger.kinds.login?.success ?? 1).toBeLessThan(1)
    expect(ledger.kinds.page?.success ?? 0).toBe(1)
    expect(EDGE_CPU_MS).toBeLessThan(100)
  })

  test('a Stack that cannot compile to WebAssembly is refused at the edge', () => {
    const game = functionBoard(2_000, 'edge', 'php_fpm')
    const ledger = solve(game)
    expect(ledger.errors.refused).toBeGreaterThan(0)
    expect(ledger.kinds.page?.success ?? 1).toBe(0)
  })

  test('its key-value cache answers 30% of a CDN’s reads', () => {
    const game = functionBoard(2_000, 'edge', 'node')
    const cdn = { ...nodeOf(game, 'edge'), id: 'cdn', type: 'cdn' as const, ttl: 300 }
    const bare: Board = { ...game, nodes: game.nodes.filter((node) => node.type !== 'edge') }
    expect(cdnHitOf(cdn, 'read', bare)).toBe(0)
    expect(cdnHitOf(cdn, 'read', game)).toBeCloseTo(EDGE_READ_HIT, 6)
  })

  test('it bills each request on the Requests line, with no standing Burn', () => {
    const game = functionBoard(2_000, 'edge', 'node')
    const ledger = solve(game)
    const node = nodeOf(game, 'edge')
    const own = ledger.nodes[node.id]
    if (!own) throw new Error('Missing the edge function')
    const done = own.inbound - own.dropped
    expect(burnOf(game, node)).toBe(0)
    expect(ledger.burnLines.requests).toBeCloseTo(
      done * EDGE_REQUEST_PRICE * eraOf(game).costIndex,
      8,
    )
  })

  test('it is placeable only with its research, and only from Series C', () => {
    expect(RESEARCH['edge-compute'].era).toBe(5)
    expect(Result.isFailure(place(preseed(1_000), 'edge', 240, 280))).toBe(true)
    const seriesB: Board = { ...preseed(1_000, ['cdn']), stage: 4 }
    expect(researchReady(seriesB, 'edge-compute')).toBe(false)
    expect(Result.isFailure(study(seriesB, 'edge-compute'))).toBe(true)
    const seriesC: Board = { ...preseed(1_000, ['cdn']), stage: 5 }
    expect(Result.isSuccess(study(seriesC, 'edge-compute'))).toBe(true)
    const owned: Board = { ...seriesC, researched: [...seriesC.researched, 'edge-compute'] }
    expect(ok(place(owned, 'edge', 240, 280)).nodes.some((node) => node.type === 'edge')).toBe(true)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with neither function in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'fn' || node.type === 'edge')).toBe(false)
    // Neither Component adds a field to the Game, so the save reads and plays as it did.
    const ledger = solve(game)
    expect(ledger.burnLines.requests).toBe(0)
    expect(ledger.revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
