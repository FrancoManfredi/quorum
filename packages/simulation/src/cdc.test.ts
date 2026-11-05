import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, study, type Action } from './actions.ts'
import { CDC_RATE, COMPONENTS, RESEARCH } from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf, eraOf, researchReady } from './lookups.ts'
import { RULES, type Solver } from './rules.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'

/*
 * The CDC Connector (05, 07): it reads a Database's write-ahead log and publishes every change to
 * an Event Stream. The app writes once, the copies follow, and the write never waits for them.
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

/** A Series B Company that copies its Database's changes to an Event Stream its Workers read. */
const changeBoard = (): Board => {
  const base: Board = {
    ...rich(preseedGame()),
    stage: 4,
    users: 4_000,
    shipped: ['password-login', 'profile-photos'],
    researched: [
      ...preseedGame().researched,
      'caching',
      'event-streaming',
      'background-jobs',
      'queues',
      'data-warehouse',
      'cdc',
    ],
  }
  const streamed = ok(place(base, 'log', 1_040, 280))
  const log = last(streamed)
  const consumed = ok(place(streamed, 'worker', 1_300, 280))
  const worker = last(consumed)
  // The reader answers its reads from a Cache: a reader that wrote to the Database would close a
  // loop the board refuses (a change that causes a write that causes a change).
  const cached = ok(place(consumed, 'cache', 1_300, 520))
  const cache = last(cached)
  const wired = ok(connect(cached, log, worker))
  const read = ok(connect(wired, worker, cache))
  const sourced = ok(place(read, 'cdc', 1_040, 480))
  const cdc = last(sourced)
  const copied = ok(connect(sourced, 'database', cdc))
  return ok(connect(copied, cdc, log))
}

/** The same Design without the connector: the app writes once and nothing follows. */
const plainBoard = (): Board => {
  const game = changeBoard()
  return {
    ...game,
    nodes: game.nodes.filter((node) => node.type !== 'cdc'),
    links: game.links.filter(
      (edge) => edge.from !== connectorOf(game).id && edge.to !== connectorOf(game).id,
    ),
  }
}

const connectorOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'cdc')
  if (!node) throw new Error('Missing the CDC Connector')
  return node
}

const streamOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'log')
  if (!node) throw new Error('Missing the Event Stream')
  return node
}

/** A Solver with nothing else in the way, for the rule's own limits. */
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
  drainable: () => Number.POSITIVE_INFINITY,
})

describe('the CDC Connector', () => {
  test('publishes 20,000 changes a second at its one size', () => {
    const game = changeBoard()
    expect(CDC_RATE).toBe(20_000)
    const own = solve(game).nodes[connectorOf(game).id]
    if (!own) throw new Error('Missing the CDC Connector')
    expect(own.capacity).toBeGreaterThanOrEqual(CDC_RATE)
    // Past its rate it drops changes: the stream falls behind, it does not queue.
    const busy = RULES.cdc.model(solver(game), connectorOf(game), { 'q-write': CDC_RATE * 2 })
    expect(busy.share).toBeCloseTo(0.5, 6)
  })

  test('copies the writes the Database took, and takes none of its traffic', () => {
    const game = changeBoard()
    const ledger = solve(game)
    const own = ledger.nodes[connectorOf(game).id]
    const stream = ledger.nodes[streamOf(game).id]
    const worker = game.nodes.find((node) => node.type === 'worker')
    if (!own || !stream || !worker)
      throw new Error('Missing the connector, the stream, or its reader')
    expect(own.inbound).toBeGreaterThan(0)
    expect(own.out.task ?? 0).toBeGreaterThan(0)
    expect(stream.inbound).toBeGreaterThan(0)
    expect(ledger.nodes[worker.id]?.inbound ?? 0).toBeGreaterThan(0)
    // The Database keeps every write it had: the connector reads a copy off the log.
    const withConnector = solve(game).nodes.database?.inbound ?? 0
    const without = solve(plainBoard()).nodes.database?.inbound ?? 0
    expect(withConnector).toBeCloseTo(without, 6)
    // With nothing consuming the stream, nothing reads its changes.
    const unread = solve({
      ...game,
      links: game.links.filter(
        (edge) => !(edge.from === streamOf(game).id && edge.to === worker.id),
      ),
    })
    expect(unread.nodes[streamOf(game).id]?.out.task ?? 0).toBe(0)
  })

  test('never makes the write wait for the copy', () => {
    const game = changeBoard()
    const withConnector = solve(game)
    const without = solve(plainBoard())
    expect(withConnector.kinds.buy?.mean ?? 0).toBeCloseTo(without.kinds.buy?.mean ?? 0, 6)
    expect(withConnector.revenue).toBeCloseTo(without.revenue, 6)
    // Its own hop is small: the lag is the stream's, not the connector's.
    expect(COMPONENTS.cdc.latency).toBeGreaterThan(0)
    expect(solve(game).nodes[connectorOf(game).id]?.latency ?? 0).toBeLessThan(50)
  })

  test('republishes in the order the writes committed, and the stream decides the rest', () => {
    const game = changeBoard()
    // One change out for each write in: the connector neither merges two nor reorders them.
    const own = solve(game).nodes[connectorOf(game).id]
    if (!own) throw new Error('Missing the CDC Connector')
    expect(own.out.task ?? 0).toBeGreaterThanOrEqual(own.inbound - 1e-6)
    // A stream the app also writes to, so its order is on the user's path: keyed by the row's
    // primary key one row's changes stay in one partition and in order.
    const server = game.nodes.find((node) => node.type === 'server')?.id ?? 'server'
    const shared = ok(connect(changeBoard(), server, streamOf(game).id))
    expect(solve(shared).errors.stale).toBeCloseTo(0, 9)
    const roundRobin = tune(shared, streamOf(shared).id, { keyed: false, partitions: 6 })
    expect(solve(roundRobin).errors.stale).toBeGreaterThan(0)
    // One partition holds every change in one place, so nothing can overtake anything.
    const single = tune(roundRobin, streamOf(roundRobin).id, { partitions: 1 })
    expect(solve(single).errors.stale).toBeCloseTo(0, 9)
  })

  test('lags where the stream lags: its backlog is the stream’s', () => {
    const game = changeBoard()
    const behind = tune(game, streamOf(game).id, { depth: 40_000 })
    expect(step(behind, 1).game.nodes.find((node) => node.type === 'log')?.depth).not.toBe(
      streamOf(game).depth,
    )
    // Nothing buffers inside the connector itself: it has no backlog of its own to grow.
    expect(connectorOf(game).depth).toBe(0)
  })

  test('burns 0.05 a second at its one size', () => {
    const game = changeBoard()
    expect(burnOf(game, connectorOf(game))).toBeCloseTo(0.05 * eraOf(game).costIndex, 8)
  })

  test('is placeable only with its research, and only from Series B', () => {
    expect(RESEARCH.cdc.era).toBe(4)
    expect(RESEARCH.cdc.requires).toEqual(['event-streaming', 'data-warehouse'])
    expect(Result.isFailure(place(rich(preseedGame()), 'cdc', 240, 280))).toBe(true)
    const seriesA: Board = {
      ...rich(preseedGame()),
      stage: 3,
      researched: [...preseedGame().researched, 'queues', 'event-streaming', 'data-warehouse'],
    }
    expect(researchReady(seriesA, 'cdc')).toBe(false)
    expect(Result.isFailure(study(seriesA, 'cdc'))).toBe(true)
    const seriesB: Board = { ...seriesA, stage: 4 }
    expect(Result.isSuccess(study(seriesB, 'cdc'))).toBe(true)
    const owned: Board = { ...seriesB, researched: [...seriesB.researched, 'cdc'] }
    expect(ok(place(owned, 'cdc', 240, 280)).nodes.some((node) => node.type === 'cdc')).toBe(true)
  })

  test('only a Database can be read, and it reads one at most', () => {
    const game = changeBoard()
    const server = game.nodes.find((node) => node.type === 'server')?.id ?? 'server'
    const other = ok(place(game, 'cdc', 400, 800))
    const second = last(other)
    // An App Server writes through the Database, not into the connector.
    expect(Result.isFailure(connect(other, server, second))).toBe(true)
    expect(Result.isFailure(connect(other, 'database', second))).toBe(false)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with no CDC Connector in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'cdc')).toBe(false)
    expect(game.certificate ?? null).toBe(null)
    expect(game.services[0]?.rollouts).toEqual({})
    expect(solve(game).revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
