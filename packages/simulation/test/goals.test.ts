import { describe, expect, test } from 'vitest'
import { preseedGame } from '../src/company.ts'
import { nextAdvice } from '../src/goals.ts'
import { solveFlow } from '../src/solve.ts'
import type { Game } from '../src/state.ts'
import type { RuntimeId } from '../src/catalog.ts'

/* Cloud Mail names a limit, so it waits for the Node to reach it (18 "Mail", rule 10). */

/** The Pre-seed Design with one App Server on `runtime` and a Database big enough to stay out of
 *  the way, so the App Server is the Node the advice is about. */
const serverAt = (users: number, runtime: RuntimeId): Game => {
  const game = preseedGame()
  return {
    ...game,
    users,
    nodes: game.nodes.map((node) =>
      node.type === 'server'
        ? { ...node, runtime }
        : node.type === 'database'
          ? { ...node, size: 6 }
          : node,
    ),
  }
}

/** A big App Server and a nano Database: the working set leaves RAM while nothing else is near its
 *  limit, so the Database is the Node the advice is about. */
const spilledDatabase = (): Game => {
  const game = preseedGame()
  return {
    ...game,
    users: 2_000,
    nodes: game.nodes.map((node) =>
      node.type === 'server'
        ? { ...node, size: 4, workers: 64 }
        : node.type === 'database'
          ? { ...node, size: 1 }
          : node,
    ),
  }
}

describe('Capacity Mail', () => {
  test('stays quiet while the Node is short of its limit', () => {
    const game = serverAt(8_000, 'node')
    const ledger = solveFlow(game)
    // Two thirds of its core, which is not the 100% the letters name. The Era's mix sets the exact
    // figure, so the test asks for the band rather than a number a rebalance moves.
    expect(ledger.nodes.server?.limit).toBe('cpu')
    expect(ledger.nodes.server?.utilization).toBeGreaterThan(0.55)
    expect(ledger.nodes.server?.utilization).toBeLessThan(0.8)
    expect(nextAdvice(game, ledger).topic).not.toBe('cpu')
  })

  test('names the limit once the Node reaches it', () => {
    const game = serverAt(20_000, 'node')
    const ledger = solveFlow(game)
    expect(ledger.nodes.server?.utilization).toBeGreaterThanOrEqual(1)
    const advice = nextAdvice(game, ledger)
    expect(advice.key).toBe('cloud:cpu:server')
    expect(advice.topic).toBe('cpu')
  })

  test('warns about a Database whose working set left RAM before its CPU fills', () => {
    const game = spilledDatabase()
    const ledger = solveFlow(game)
    const database = ledger.nodes.database!
    // The letters say reads now wait on the volume, which is true the moment the working set
    // outgrows RAM, so this Mail does not wait for a utilization of 1.
    expect(database.disk).toBe(true)
    expect(database.utilization).toBeLessThan(1)
    expect(database.limit).toBe('disk')
    const advice = nextAdvice(game, ledger)
    expect(advice.key).toBe('cloud:disk:database')
    expect(advice.topic).toBe('disk')
  })
})
