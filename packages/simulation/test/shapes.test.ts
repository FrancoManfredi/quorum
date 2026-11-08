import { Result } from 'effect'
import { expect, test } from 'vitest'
import { connect, openRegion, place } from '../src/actions.ts'
import { INSIGHT_POOLS } from '../src/catalog.ts'
import { link, newGame, node, preseedGame } from '../src/company.ts'
import { freeSandbox, GUIDED } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import { unsampledOf } from '../src/solve-insight.ts'
import {
  advanceStudies,
  broadEnough,
  progressOf,
  shapeCurrent,
  shapeHolds,
  studyStall,
} from '../src/studies.ts'
import type { Game } from '../src/state.ts'

/* A Study asks the Design to do the thing it teaches (10 "Research shapes"), and traffic no tap
 * samples earns nothing (12 "The cost of seeing"). */

const ok = (result: Result.Result<Game, unknown>): Game => {
  if (Result.isFailure(result)) throw new Error('refused ' + JSON.stringify(result.failure))
  return result.success
}

/** Adds one Analytics Node that taps each source. */
const tap = (game: Game, sources: ReadonlyArray<string>, id: string): Game => ({
  ...game,
  nodes: [...game.nodes, node(id, 'analytics', 1200, 900)],
  links: [...game.links, ...sources.map((source) => link(source, id))],
})

const withPools = (game: Game): Game => ({
  ...game,
  pools: Object.fromEntries(INSIGHT_POOLS.map((pool) => [pool, 1e6])) as Game['pools'],
})

test('a Study waits for the behaviour it teaches', () => {
  const game = newGame(1)
  const ledger = solveFlow(game)
  expect(shapeHolds(game, ledger, 'autoscaling')).toBe(false)
  expect(studyStall(game, ledger, 'autoscaling')).toMatchObject({
    _tag: 'Shape',
    shape: 'saturation',
  })
})

test('a stalled shape reports how far the Design has got', () => {
  const game = newGame(1)
  const ledger = solveFlow(game)
  const stall = studyStall(game, ledger, 'autoscaling')
  if (stall?._tag !== 'Shape') throw new Error('expected a shape stall')
  expect(stall.current).toBe(shapeCurrent(game, ledger, 'autoscaling'))
  expect(stall.current).toBeLessThan(stall.value)
})

test('a Study that needs two regions reports regions, not Component types', () => {
  const base = preseedGame()
  const game = {
    ...base,
    stage: 5,
    researched: [...base.researched, 'percentiles', 'tracing'] as const,
  }
  const stall = studyStall(game, solveFlow(game), 'rum')
  expect(stall).toMatchObject({ _tag: 'Breadth', unit: 'regions', target: 2 })
  if (stall?._tag !== 'Breadth') throw new Error('expected a breadth stall')
  expect(stall.current).toBeLessThan(stall.target)
})

test('a Read Replica satisfies the shape that leads to consensus', () => {
  const placed = place(freeSandbox(), 'replica', 800, 620)
  if (Result.isFailure(placed)) throw new Error('the replica could not be built')
  expect(shapeHolds(placed.success, solveFlow(placed.success), 'consensus')).toBe(true)
})

test('a second App Server meets the Pooler gate before the Database is under pressure', () => {
  const one = preseedGame()
  expect(shapeHolds(one, solveFlow(one), 'pooling')).toBe(false)

  const template = one.nodes.find((node) => node.id === 'server')!
  const two = {
    ...one,
    nodes: [...one.nodes, { ...template, id: 'server2' }],
    links: [...one.links, link('users', 'server2'), link('server2', 'database')],
  }
  const ledger = solveFlow(two)
  expect(ledger.nodes.database?.connections).toEqual({ used: 32, max: 100 })
  expect(ledger.nodes.database?.utilization ?? 1).toBeLessThan(0.6)
  expect(shapeHolds(two, ledger, 'pooling')).toBe(true)
})

test('a working Cache meets the strategy gate', () => {
  const game = GUIDED.stampede.start()
  const tuned = {
    ...game,
    nodes: game.nodes.map((node) => (node.type === 'cache' ? { ...node, ttl: 3_600 } : node)),
  }
  const ledger = solveFlow(tuned)
  const cache = tuned.nodes.find((node) => node.type === 'cache')!
  expect(ledger.nodes[cache.id]?.hitRatio ?? 0).toBeGreaterThanOrEqual(0.6)
  expect(shapeHolds(tuned, ledger, 'cache-strategies')).toBe(true)
})

test('a Study keeps running when its shape lapses, and waits for it before it starts', () => {
  const base = withPools({ ...preseedGame(), stage: 3 })
  const running: Game = {
    ...base,
    studies: [{ id: 'autoscaling', phase: { _tag: 'Running', progress: 0.5 } }],
  }
  const ledger = solveFlow(running)
  expect(shapeHolds(running, ledger, 'autoscaling')).toBe(false)
  expect(studyStall(running, ledger, 'autoscaling')).toBeNull()

  const after = advanceStudies(running, ledger, 10, [])
  expect(progressOf(after.studies[0])).toBeGreaterThan(0.5)

  const queued: Game = {
    ...base,
    studies: [{ id: 'autoscaling', phase: { _tag: 'Queued', progress: 0 } }],
  }
  const waiting = advanceStudies(queued, solveFlow(queued), 10, [])
  expect(waiting.studies[0]?.phase).toMatchObject({ _tag: 'Queued', progress: 0 })
})

test('a trace needs three Component types, and profiling needs four', () => {
  const base = GUIDED['slow-uploads'].start()
  const two = tap(base, ['lb', 'server1'], 'analytics-2')
  const three = tap(base, ['lb', 'server1', 'database'], 'analytics-3')
  const four = tap(base, ['lb', 'server1', 'database', 'storage'], 'analytics-4')

  expect(broadEnough('tracing', solveFlow(two))).toBe(false)
  expect(broadEnough('tracing', solveFlow(three))).toBe(true)
  expect(broadEnough('profiling', solveFlow(three))).toBe(false)
  expect(broadEnough('profiling', solveFlow(four))).toBe(true)
})

test('RUM waits for a tap in a second region', () => {
  let game = GUIDED['far-away'].start()
  game = ok(openRegion(game, 'eu'))
  game = ok(place(game, 'server', 400, 300, 'eu'))
  const eu = game.nodes.at(-1)!.id
  game = ok(connect(game, 'users-eu', eu))
  game = ok(connect(game, eu, 'wide'))

  const one = tap(game, ['server1'], 'analytics-na')
  expect(broadEnough('rum', solveFlow(one))).toBe(false)

  const two = tap(one, [eu], 'analytics-eu')
  expect(broadEnough('rum', solveFlow(two))).toBe(true)
})

test('traffic that no Analytics tap samples is unclassified', () => {
  expect(unsampledOf(solveFlow(newGame(1))).share).toBeLessThan(0.01)
  expect(unsampledOf(solveFlow(freeSandbox())).share).toBeGreaterThan(0.99)
})
