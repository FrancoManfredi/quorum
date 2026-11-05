import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, disconnect, place, study, type Action } from './actions.ts'
import {
  ML_AI_BONUS,
  RESEARCH,
  VEC_AI_LIFT,
  VEC_INDEXES,
  VEC_QUERIES,
  type RuntimeId,
} from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf, eraOf, researchReady } from './lookups.ts'
import { aiValueOf, mlValueOf } from './rules.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'

/*
 * The Vector Index (05, 07): nearest-neighbour lookups over the company's own documents, the
 * memory its index costs, and the `ai` value a retrieval path unlocks.
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

/** A Series B Company with an AI assistant, its model, and a Vector Index to retrieve from. */
const vectorBoard = (runtime: RuntimeId = 'node'): Board => {
  const base: Board = {
    ...rich(preseedGame()),
    stage: 4,
    users: 4_000,
    shipped: ['password-login', 'ai-assistant'],
    researched: [
      ...preseedGame().researched,
      'embeddings',
      'hosted-models',
      'lang-node',
      'lang-python',
      'fw-fastapi',
    ],
  }
  const indexed = ok(place(base, 'vec', 760, 480))
  const index = last(indexed)
  const modelled = ok(place(indexed, 'llm', 1_040, 480))
  const model = last(modelled)
  const server = modelled.nodes.find((node) => node.type === 'server')?.id ?? 'server'
  const linked = ok(connect(modelled, server, model))
  const wired = ok(connect(linked, server, index))
  return tune(wired, server, { runtime })
}

const nodeOf = (game: Board, type: 'vec' | 'server'): GameNode => {
  const node = game.nodes.find((entry) => entry.type === type)
  if (!node) throw new Error(`Missing the ${type}`)
  return node
}

/** Dollars a second the Design earns: the same demand, with or without the retrieval path. */
const revenueOf = (game: Board): number => solve(game).revenue

describe('the Vector Index', () => {
  test('answers 500 nearest-neighbour lookups a second at size 1, twice as many per size step', () => {
    const game = vectorBoard()
    const index = nodeOf(game, 'vec')
    const ledger = solve(game)
    const own = ledger.nodes[index.id]
    if (!own) throw new Error('Missing the Vector Index')
    expect(VEC_QUERIES).toBe(500)
    // One prompt a second reaches it, so its capacity is its own, not its load.
    expect(own.capacity).toBeGreaterThanOrEqual(VEC_QUERIES)
    const bigger = tune(game, index.id, { size: 2 })
    expect(solve(bigger).nodes[index.id]?.capacity).toBeGreaterThan(own.capacity)
  })

  test('is where a prompt retrieves from: one lookup per prompt, and nothing else reaches it', () => {
    const game = vectorBoard()
    const ledger = solve(game)
    const index = nodeOf(game, 'vec')
    const own = ledger.nodes[index.id]
    if (!own) throw new Error('Missing the Vector Index')
    expect(own.traffic['q-search'] ?? 0).toBeGreaterThan(0)
    expect(own.out['q-search'] ?? 0).toBe(0)
    expect(own.connections).toBeNull()
    // With no index linked, the App Server sends no lookup at all.
    const bare = disconnect(game, nodeOf(game, 'server').id, index.id)
    expect(solve(bare).nodes[index.id]?.inbound ?? 0).toBe(0)
  })

  test('lifts the value of a prompt, and the Python bonus needs it there', () => {
    const game = vectorBoard('uvicorn')
    const server = nodeOf(game, 'server')
    expect(aiValueOf(game, server, 'ai')).toBeCloseTo(VEC_AI_LIFT * ML_AI_BONUS, 6)
    expect(aiValueOf(game, server, 'read')).toBe(1)
    // Without the index in the path there is nothing to embed, and nothing to quote.
    const bare = disconnect(game, server.id, nodeOf(game, 'vec').id)
    expect(aiValueOf(bare, server, 'ai')).toBe(1)
    expect(mlValueOf(server, 'ai', false)).toBe(1)
    // Linear prompts earn the lift without the Python bonus.
    const linear = vectorBoard('go')
    expect(aiValueOf(linear, nodeOf(linear, 'server'), 'ai')).toBeCloseTo(VEC_AI_LIFT, 6)
    // The Ledger earns it: the same demand, answered from the company's own documents, is worth more.
    expect(revenueOf(game)).toBeGreaterThan(revenueOf(bare))
  })

  test('holds its graph in memory, so HNSW burns twice what an exact index does', () => {
    const game = vectorBoard()
    const index = nodeOf(game, 'vec')
    const burn = (board: Board): number => burnOf(board, nodeOf(board, 'vec'))
    const exact = burn(game)
    expect(exact).toBeCloseTo(0.3 * eraOf(game).costIndex, 8)
    const approximate = burn(tune(game, index.id, { indexType: 'hnsw' }))
    expect(approximate).toBeCloseTo(exact * VEC_INDEXES.hnsw.burn, 8)
  })

  test('an approximate index answers twice as many lookups and misses one neighbour in twenty', () => {
    const game = vectorBoard()
    const index = nodeOf(game, 'vec')
    const approximate = tune(game, index.id, { indexType: 'hnsw' })
    const exact = solve(game)
    const fast = solve(approximate)
    expect(fast.nodes[index.id]?.capacity ?? 0).toBeCloseTo(
      (exact.nodes[index.id]?.capacity ?? 0) * VEC_INDEXES.hnsw.queries,
      6,
    )
    expect(VEC_INDEXES.exact.recall).toBe(1)
    expect(VEC_INDEXES.hnsw.recall).toBe(0.95)
    // Searches go through it, so a lookup that misses its document is a stale search result.
    expect(exact.kinds.search?.success ?? 0).toBeGreaterThan(fast.kinds.search?.success ?? 1)
    expect(exact.kinds.search?.success ?? 0).toBeCloseTo(1, 6)
  })

  test('is placeable only with its research, and only from Series B', () => {
    expect(RESEARCH.embeddings.era).toBe(4)
    expect(Result.isFailure(place(rich(preseedGame()), 'vec', 240, 280))).toBe(true)
    const seriesA: Board = { ...rich(preseedGame()), stage: 3 }
    expect(researchReady(seriesA, 'embeddings')).toBe(false)
    expect(Result.isFailure(study(seriesA, 'embeddings'))).toBe(true)
    const seriesB: Board = { ...rich(preseedGame()), stage: 4 }
    expect(Result.isSuccess(study(seriesB, 'embeddings'))).toBe(true)
    const owned: Board = { ...seriesB, researched: ['embeddings'] }
    expect(ok(place(owned, 'vec', 240, 280)).nodes.some((node) => node.type === 'vec')).toBe(true)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with no Vector Index in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'vec')).toBe(false)
    expect(game.nodes.every((node) => node.indexType === 'exact')).toBe(true)
    const ledger = solve(game)
    expect(ledger.revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
