import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place } from '../src/actions.ts'
import { solveFlow } from '../src/solve.ts'
import { solverOf } from '../src/solve-pass.ts'
import { graphOf } from '../src/solve-graph.ts'
import { hop, through } from '../src/distribution.ts'
import { searchRule } from '../src/components/search.rule.ts'
import { CDC_DROP_STALE, CDC_LAG_STALE, DUAL_WRITE_STALE, OUTBOX_STALE } from '../src/catalog.ts'
import { freeSandbox } from '../src/sandbox.ts'
import type { Game, GameNode } from '../src/state.ts'

const ownHop = () => hop({ fixedMs: 1, variableMs: 1, share: 1, tailP: 0, tailMs: 0 })

const answerFor = (
  game: Game,
  pass: {
    at: Map<string, number>
    models: Array<unknown>
    arriving?: ReadonlyArray<Partial<Record<string, number>>>
  },
) =>
  ({
    game,
    pass: { arriving: [], ...pass },
    ownHop,
    downstream: () => through(ownHop()),
    delegates: false,
    runsLocalDb: false,
    offloads: false,
  }) as unknown as Parameters<typeof searchRule.outcome>[0]

const searchNode = (id = 'search'): GameNode =>
  ({
    id,
    type: 'search',
    searchVariant: 'elasticsearch',
    refresh: 1,
    heap: 'half',
    searchShards: 1,
    searchReplicas: 0,
    life: { _tag: 'Running' },
  }) as unknown as GameNode

const cdcNode = (id = 'cdc'): GameNode =>
  ({
    id,
    type: 'cdc',
    service: { _tag: 'InService' },
    life: { _tag: 'Running' },
  }) as unknown as GameNode

const passWithCdc = (cdcId: string, share: number) => ({
  at: new Map([
    [cdcId, 0],
    ['search', 1],
  ]),
  models: [{ share }, {}],
  arriving: [{}, { change: 1 }],
})

describe('CDC and outbox staleness', () => {
  test('dual writes leave a stale share with no outbox or CDC from Series B', () => {
    const base = freeSandbox()
    const game = {
      ...base,
      stage: 4,
      researched: base.researched.filter((id) => id !== 'outbox'),
      nodes: [],
    } as Game
    const out = searchRule.outcome(
      answerFor(game, { at: new Map(), models: [] }),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBe(DUAL_WRITE_STALE)
  })

  test('an outbox shrinks divergence to a lag window, not zero', () => {
    const game = {
      ...freeSandbox(),
      stage: 4,
      researched: [...freeSandbox().researched, 'outbox'],
    } as Game
    const out = searchRule.outcome(
      answerFor(game, { at: new Map(), models: [] }),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBe(OUTBOX_STALE)
    expect(out.stale).toBeGreaterThan(0)
    expect(out.stale).toBeLessThan(DUAL_WRITE_STALE)
  })

  test('a CDC with no path to the Search Engine leaves the dual-write share', () => {
    const base = freeSandbox()
    const game = {
      ...base,
      stage: 4,
      researched: base.researched.filter((id) => id !== 'outbox'),
      nodes: [cdcNode()],
    } as Game
    const out = searchRule.outcome(
      answerFor(game, {
        at: new Map([
          ['cdc', 0],
          ['search', 1],
        ]),
        models: [{ share: 1 }, {}],
        arriving: [{}, {}],
      }),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBe(DUAL_WRITE_STALE)
  })

  test('a healthy CDC Connector leaves only its processing lag', () => {
    const game = { ...freeSandbox(), stage: 4, nodes: [cdcNode()] } as Game
    const out = searchRule.outcome(answerFor(game, passWithCdc('cdc', 1)), searchNode(), 'q-search')
    expect(out.stale).toBe(CDC_LAG_STALE)
    expect(out.stale).toBeGreaterThan(0)
  })

  test('an overloaded CDC Connector drops changes and the copies diverge', () => {
    const game = { ...freeSandbox(), stage: 4, nodes: [cdcNode()] } as Game
    const out = searchRule.outcome(
      answerFor(game, passWithCdc('cdc', 0.4)),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBeCloseTo(CDC_LAG_STALE + 0.6 * CDC_DROP_STALE)
    expect(out.stale).toBeGreaterThan(CDC_LAG_STALE)
  })
})

describe('a CDC Connector reaches the copies', () => {
  test('a Stream carries changes to a Search Engine and lowers its stale share', () => {
    const ok = (result: Result.Result<Game, unknown>): Game => {
      if (Result.isFailure(result)) throw new Error(JSON.stringify(result.failure))
      return result.success
    }
    const warm = (game: Game): Game => ({
      ...game,
      nodes: game.nodes.map((node) => ({ ...node, life: { _tag: 'Running' } as const })),
    })
    let game: Game = { ...freeSandbox(), stage: 4, users: 3_000 }
    const database = game.nodes.find((node) => node.type === 'database')!.id
    let search: string
    let placed = ok(place(game, 'search', 900, 400))
    search = placed.nodes.at(-1)!.id
    game = ok(connect(placed, 'server', search))
    const before = solveFlow(warm(game))
    let cdc: string
    placed = ok(place(game, 'cdc', 900, 600))
    cdc = placed.nodes.at(-1)!.id
    game = ok(connect(placed, database, cdc))
    let stream: string
    placed = ok(place(game, 'log', 900, 800))
    stream = placed.nodes.at(-1)!.id
    game = ok(connect(placed, cdc, stream))
    game = ok(connect(game, stream, search))
    let warehouse: string
    placed = ok(place(game, 'warehouse', 1_200, 800))
    warehouse = placed.nodes.at(-1)!.id
    game = ok(connect(placed, stream, warehouse))
    const after = solveFlow(warm(game))
    const changes = after.nodes[cdc]!.out['change'] ?? 0
    expect(after.nodes[search]!.traffic['change'] ?? 0).toBeCloseTo(changes)
    expect(after.nodes[warehouse]!.traffic['change'] ?? 0).toBeCloseTo(changes)
    expect(after.errors.stale).toBeLessThan(before.errors.stale)
    expect(after.nodes[cdc]!.out['change'] ?? 0).toBeGreaterThan(0)
  })

  test('a Stream that feeds only a Warehouse can drain its change backlog', () => {
    const ok = (result: Result.Result<Game, unknown>): Game => {
      if (Result.isFailure(result)) throw new Error(JSON.stringify(result.failure))
      return result.success
    }
    let game: Game = { ...freeSandbox(), stage: 4 }
    const database = game.nodes.find((node) => node.type === 'database')!.id
    let placed = ok(place(game, 'cdc', 900, 600))
    const cdc = placed.nodes.at(-1)!.id
    game = ok(connect(placed, database, cdc))
    placed = ok(place(game, 'log', 900, 800))
    const stream = placed.nodes.at(-1)!.id
    game = ok(connect(placed, cdc, stream))
    placed = ok(place(game, 'warehouse', 1_200, 800))
    const warehouse = placed.nodes.at(-1)!.id
    game = ok(connect(placed, stream, warehouse))
    const log = game.nodes.find((node) => node.id === stream)!
    const solver = solverOf({ game, graph: graphOf(game) } as unknown as Parameters<
      typeof solverOf
    >[0])
    expect(solver.drainable(log, 'change')).toBe(Number.POSITIVE_INFINITY)
  })
})
