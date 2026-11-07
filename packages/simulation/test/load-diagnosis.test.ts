import { describe, expect, test } from 'vitest'
import { BLOAT_CPU, QUERY_CPU } from '../src/catalog.ts'
import type { Receipt } from '../src/capacity.ts'
import { startIncident } from '../src/director.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import type { Game } from '../src/state.ts'

/* Load diagnosis (12): the Ledger explains why a Node is busy, with the numbers the model used. */

/** Applies a receipt's lines to its base, in order, as a reader of the receipt would. */
const replay = (receipt: Receipt): number =>
  receipt.lines.reduce(
    (cost, line) => (line.op === 'times' ? cost * line.value : cost + line.value),
    receipt.base,
  )

const bloated = (game: Game): Game => {
  const started = startIncident(game, solveFlow(game), 'table-bloat', 0)
  if (!started) throw new Error('no Table bloat target')
  return started.game
}

describe('Cost receipt', () => {
  test('every receipt reaches its own total, on App Servers and Databases', () => {
    const game = bloated(freeSandbox())
    const ledger = solveFlow(game)
    const receipts = Object.values(ledger.nodes).flatMap((node) => Object.values(node.receipts))
    expect(receipts.length).toBeGreaterThan(4)
    for (const receipt of receipts) expect(replay(receipt!) / receipt!.total).toBeCloseTo(1, 9)
  })

  test('Table bloat shows as a line and raises the cost by its factor', () => {
    const calm = solveFlow(freeSandbox())
    const game = bloated(freeSandbox())
    const ledger = solveFlow(game)
    const read = ledger.nodes.database!.receipts['q-read']!
    expect(read.lines).toContainEqual({ cause: 'bloat', op: 'times', value: BLOAT_CPU })
    expect(calm.nodes.database!.receipts['q-read']!.lines.map((line) => line.cause)).not.toContain(
      'bloat',
    )
    expect(read.total / calm.nodes.database!.receipts['q-read']!.total).toBeCloseTo(BLOAT_CPU, 6)
    // The same requests cost twice as much, so the mean cost per request doubles too.
    expect(ledger.nodes.database!.cost / calm.nodes.database!.cost).toBeCloseTo(BLOAT_CPU, 6)
  })
})

describe('Work share', () => {
  test('a write takes more of the CPU than its share of the queries', () => {
    const database = solveFlow(freeSandbox()).nodes.database!
    const reads = database.traffic['q-read']!
    const writes = database.traffic['q-write']!
    // The sandbox researched Denormalization: reads cost 0.7 of their base, writes 1.2.
    const readWork = reads * QUERY_CPU['q-read'] * 0.7
    const writeWork = writes * QUERY_CPU['q-write'] * 1.2
    expect(database.workShare['q-write']).toBeCloseTo(writeWork / (readWork + writeWork), 6)
    expect(database.workShare['q-write']!).toBeGreaterThan(writes / database.inbound)
  })
})

describe('Amplification', () => {
  test("a Node's inbound traces back to the Users' Request kinds", () => {
    const ledger = solveFlow(freeSandbox())
    const database = ledger.nodes.database!
    const traced = Object.values(database.origins).reduce((sum, rate) => sum + (rate ?? 0), 0)
    expect(traced).toBeCloseTo(database.inbound, 6)
    // A `write` request reaches the Database: some of its queries count as `write`.
    expect(database.origins.write).toBeGreaterThan(0)
  })

  test('retries on a failing Link count as repeated calls at the callee', () => {
    // A fast App Server and enough users to overload the Database, so most of its calls fail.
    const sandbox = freeSandbox()
    const base: Game = {
      ...sandbox,
      users: sandbox.users * 40,
      nodes: sandbox.nodes.map((node) =>
        node.id === 'server' ? { ...node, size: 5, runtime: 'go' } : node,
      ),
    }
    const game: Game = {
      ...base,
      links: base.links.map((link) =>
        link.to === 'database' ? { ...link, retries: 'naive' } : link,
      ),
    }
    expect(solveFlow(base).nodes.database!.repeated).toBe(0)
    const ledger = solveFlow(game)
    const database = ledger.nodes.database!
    const failure = ledger.links.find((link) => link.to === 'database')!.failure
    expect(failure).toBeGreaterThan(0.5)
    // Up to three retries: 1 + f + f² + f³ attempts per call, all but the first repeated.
    const attempts = 1 + failure + failure ** 2 + failure ** 3
    expect(database.repeated / database.inbound).toBeCloseTo(1 - 1 / attempts, 1)
  })
})
