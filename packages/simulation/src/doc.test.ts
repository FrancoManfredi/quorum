import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, disconnect, place, study, type Action } from './actions.ts'
import {
  DOC_JOIN_COST,
  DOC_OPS,
  DOC_PARTIAL,
  DOC_SHAPE_DH,
  FEATURES,
  RESEARCH,
  type FeatureId,
  type Kind,
} from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf, eraOf, researchReady } from './lookups.ts'
import { RULES, type Solver } from './rules.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'
import { featureHoursOf } from './work.ts'

/*
 * The Document Store (05, 07): no joins and no connections to pool, one flat rate of ops, a
 * checkout at three of them, and the Dev Hours its access patterns cost.
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

/** A Series A Company that owns Document databases and the checkout it needs to use them. */
const seriesA = (
  users: number,
  researched: ReadonlyArray<Board['researched'][number]> = [],
): Board => ({
  ...rich(preseedGame()),
  stage: 3,
  users,
  shipped: ['password-login', 'checkout'],
  researched: [...preseedGame().researched, 'document-db', 'checkout', 'lang-node', ...researched],
})

/** Users, an App Server and a Document Store where the Database used to be. */
const documentBoard = (users: number): Board => {
  const base = seriesA(users)
  const placed = ok(place(base, 'doc', 760, 200))
  return ok(connect(disconnect(placed, 'server', 'database'), 'server', last(placed)))
}

const docOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'doc')
  if (!node) throw new Error('Missing the Document Store')
  return node
}

/** A Solver that asks a rule about one Node and nothing else. */
const solver = (game: Board): Solver => ({
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

const capacityOf = (game: Board, kind: Kind, rate = 10): number =>
  RULES.doc.model(solver(game), docOf(game), { [kind]: rate }).capacity

describe('the Document Store', () => {
  test('answers 3,000 ops a second at size 1, and twice that at each size step', () => {
    const game = documentBoard(2_000)
    expect(capacityOf(game, 'q-read')).toBeCloseTo(DOC_OPS, 6)
    const bigger = tune(game, docOf(game).id, { size: 2 })
    expect(capacityOf(bigger, 'q-read')).toBeCloseTo(DOC_OPS * 2, 6)
    expect(DOC_OPS).toBe(3_000)
  })

  test('serves reads and writes itself, and sends nothing on', () => {
    const game = documentBoard(2_000)
    const ledger = solve(game)
    const own = ledger.nodes[docOf(game).id]
    if (!own) throw new Error('Missing the Document Store')
    expect(own.traffic['q-read'] ?? 0).toBeGreaterThan(0)
    expect(own.traffic['q-write'] ?? 0).toBeGreaterThan(0)
    expect(own.out['q-read'] ?? 0).toBe(0)
    expect(ledger.kinds.read?.success ?? 0).toBeGreaterThan(0.9)
  })

  test('pays for a join: a checkout costs three of its ops, so half checkouts halve its rate', () => {
    const game = documentBoard(2_000)
    expect(DOC_JOIN_COST).toBe(3)
    const reads = capacityOf(game, 'q-read')
    const joins = capacityOf(game, 'q-tx')
    expect(joins).toBeCloseTo(reads / DOC_JOIN_COST, 6)
    // A mix that is half checkouts answers a third of the reads-only rate over the same ops.
    const mixed = RULES.doc.model(solver(game), docOf(game), { 'q-read': 5, 'q-tx': 5 })
    expect(mixed.capacity).toBeCloseTo(reads / 2, 6)
  })

  test('a report reaches it only when no Data Warehouse is linked', () => {
    const reports = 'dashboards' as Board['shipped'][number]
    // Reports arrive in Series B, with the Dashboards Feature.
    const base: Board = {
      ...documentBoard(4_000),
      stage: 4,
      shipped: [...documentBoard(4_000).shipped, reports],
      researched: [...documentBoard(4_000).researched, 'data-warehouse'],
    }
    const own = solve(base)
    // With no warehouse, the report scans the collection: a join, at three ops.
    expect(own.nodes[docOf(base).id]?.traffic['q-scan'] ?? 0).toBeGreaterThan(0)
    const placed = ok(place(base, 'warehouse', 1_040, 200))
    const warehouse = ok(connect(placed, 'server', last(placed)))
    // A Node built for the kind takes the report from the one that only falls back to it.
    expect(solve(warehouse).nodes[docOf(warehouse).id]?.traffic['q-scan'] ?? 0).toBe(0)
  })

  test('holds no connections, so an App Server needs no pooler to reach it', () => {
    const game = documentBoard(2_000)
    const ledger = solve(game)
    const own = ledger.nodes[docOf(game).id]
    if (!own) throw new Error('Missing the Document Store')
    expect(own.connections).toBeNull()
    expect(ledger.nodes.server?.connections).toBeNull()
    expect(ledger.nodes.server?.out['q-read'] ?? 0).toBeGreaterThan(0)
  })

  test('loses atomicity on a checkout until multi-document transactions are on', () => {
    const game = documentBoard(4_000)
    const loose = solve(game)
    // A checkout that spans documents lands half-applied, and the retry charges again.
    expect(loose.errors.duplicate).toBeGreaterThan(0)
    const atomicBoard = tune(game, docOf(game).id, { transactions: true })
    // Every checkout lands whole, so nothing is charged twice.
    expect(solve(atomicBoard).errors.duplicate).toBe(0)
    // And the write it makes waits for every document it touches: +50% of its own latency.
    const wait = (board: Board): number =>
      RULES.doc.model(solver(board), docOf(board), { 'q-write': 1 }).service['q-write']?.variable ??
      0
    expect(wait(atomicBoard)).toBeGreaterThan(wait(game))
    expect(DOC_PARTIAL).toBeCloseTo(0.02, 8)
  })

  test('charges Dev Hours for each access pattern, and gives back the schema migration', () => {
    const shape = 'pagination' as FeatureId
    const plain = 'landing-page' as FeatureId
    expect(FEATURES[shape].shapes).toBeGreaterThan(0)
    expect(FEATURES[plain].shapes).toBe(0)
    const relational = rich(preseedGame())
    expect(featureHoursOf(relational, shape)).toBe(FEATURES[shape].dh)
    const documents = documentBoard(2_000)
    // A Feature that changes the data shape skips the migration: it costs a quarter less.
    expect(featureHoursOf(documents, shape)).toBeCloseTo(FEATURES[shape].dh * DOC_SHAPE_DH, 6)
    // Every other Feature is a little dearer: its access pattern is its own index to write.
    expect(featureHoursOf(documents, plain)).toBeGreaterThan(FEATURES[plain].dh)
    // A shut Document Store stops counting the moment it is not serving.
    const shut: Board = {
      ...documents,
      nodes: documents.nodes.map((node) => (node.type === 'doc' ? { ...node, shut: true } : node)),
    }
    expect(featureHoursOf(shut, shape)).toBe(FEATURES[shape].dh)
  })

  test('burns 0.20 a second at its base size, and twice that a size step up', () => {
    const game = documentBoard(2_000)
    const node = docOf(game)
    const index = eraOf(game).costIndex
    expect(burnOf(game, node)).toBeCloseTo(0.2 * index, 8)
    const bigger = tune(game, node.id, { size: 2 })
    expect(burnOf(bigger, docOf(bigger))).toBeCloseTo(0.4 * index, 8)
  })

  test('is placeable only with its research, and only from Series A', () => {
    expect(RESEARCH['document-db'].era).toBe(3)
    expect(Result.isFailure(place(rich(preseedGame()), 'doc', 240, 280))).toBe(true)
    const seed: Board = { ...rich(preseedGame()), stage: 2 }
    expect(researchReady(seed, 'document-db')).toBe(false)
    expect(Result.isFailure(study(seed, 'document-db'))).toBe(true)
    const seriesAWithout: Board = { ...rich(preseedGame()), stage: 3 }
    expect(Result.isSuccess(study(seriesAWithout, 'document-db'))).toBe(true)
    const owned: Board = { ...seriesAWithout, researched: ['document-db'] }
    expect(ok(place(owned, 'doc', 240, 280)).nodes.some((node) => node.type === 'doc')).toBe(true)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with no Document Store in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'doc')).toBe(false)
    expect(game.nodes.every((node) => node.transactions === false)).toBe(true)
    const ledger = solve(game)
    expect(ledger.revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
