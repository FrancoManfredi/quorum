import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, study, type Action } from './actions.ts'
import { LOG_RATE, LOG_READ_RATE, RESEARCH } from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf, eraOf, researchReady } from './lookups.ts'
import { RULES, type Solver } from './rules.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'

/*
 * The Event Stream (05, 07): a log rather than a queue. It appends what producers send, hands
 * consumers one partition each, keeps what they have not read yet, and bills its replicas.
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

/** A Series B Company whose uploads go through an Event Stream to a Worker. */
const streamBoard = (): Board => {
  const base: Board = {
    ...rich(preseedGame()),
    stage: 4,
    users: 4_000,
    shipped: ['password-login', 'profile-photos'],
    researched: [
      ...preseedGame().researched,
      'event-streaming',
      'background-jobs',
      'queues',
      'lang-node',
    ],
  }
  const streamed = ok(place(base, 'log', 760, 480))
  const log = last(streamed)
  const worked = ok(place(streamed, 'worker', 1_040, 480))
  const worker = last(worked)
  const server = worked.nodes.find((node) => node.type === 'server')?.id ?? 'server'
  const wired = ok(connect(worked, server, log))
  const consumed = ok(connect(wired, log, worker))
  return ok(connect(consumed, worker, 'database'))
}

/** A Solver whose consumers have room for every event, so the stream's own limits decide. */
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

/** Tasks a second the stream hands its consumers, for a given lag and partition count. */
const handedOn = (game: Board, node: GameNode): number => {
  const rates = { task: 1_000 }
  let sent = 0
  RULES.log.serve(
    { solver: solver(game), route: (_kind, rate) => (sent += rate), setHits: () => {} },
    node,
    rates,
    1,
  )
  return sent
}

const logOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'log')
  if (!node) throw new Error('Missing the Event Stream')
  return node
}

describe('the Event Stream', () => {
  test('appends 100,000 messages a second at size 1, and twice that a size step up', () => {
    const game = streamBoard()
    expect(LOG_RATE).toBe(100_000)
    const own = solve(game).nodes[logOf(game).id]
    if (!own) throw new Error('Missing the Event Stream')
    expect(own.capacity).toBeGreaterThanOrEqual(LOG_RATE)
    const bigger = tune(game, logOf(game).id, { size: 2 })
    expect(solve(bigger).nodes[logOf(game).id]?.capacity ?? 0).toBeGreaterThan(own.capacity)
  })

  test('passes its tasks to the consumers behind it, and keeps what they have not read', () => {
    const game = streamBoard()
    const ledger = solve(game)
    const own = ledger.nodes[logOf(game).id]
    const worker = game.nodes.find((node) => node.type === 'worker')
    if (!own || !worker) throw new Error('Missing the stream or its consumer')
    expect(own.traffic.task ?? 0).toBeGreaterThan(0)
    expect(own.out.task ?? 0).toBeGreaterThan(0)
    expect(ledger.nodes[worker.id]?.inbound ?? 0).toBeGreaterThan(0)
    // Lag is the stream's own depth: a consumer behind leaves events unread.
    expect(own.age).not.toBeNull()
    // With no consumer linked, nothing reads the log, and the work it holds is stranded.
    const unconsumed = solve({
      ...game,
      links: game.links.filter((edge) => !(edge.from === logOf(game).id && edge.to === worker.id)),
    })
    expect(unconsumed.nodes[logOf(game).id]?.out.task ?? 0).toBe(0)
    expect(unconsumed.errors.stranded).toBeGreaterThan(0)
    const behind = tune(game, logOf(game).id, { depth: 5_000 })
    expect(step(behind, 1).game.nodes.find((node) => node.type === 'log')?.depth).not.toBe(
      logOf(game).depth,
    )
  })

  test('reads one consumer per partition, so one partition caps how fast the lag drains', () => {
    const game = tune(streamBoard(), logOf(streamBoard()).id, { depth: 400_000, partitions: 1 })
    expect(LOG_READ_RATE).toBe(20_000)
    // One partition hands on one consumer's rate, however long the backlog behind it is.
    expect(handedOn(game, logOf(game))).toBeCloseTo(LOG_READ_RATE, 6)
    const wide = tune(game, logOf(game).id, { partitions: 6 })
    expect(handedOn(wide, logOf(wide))).toBeGreaterThan(LOG_READ_RATE * 2)
    // The Ledger reads the same limit: one partition cannot offer more than its consumer takes.
    const narrow = solve(game).nodes[logOf(game).id]
    if (!narrow) throw new Error('Missing the Event Stream')
    expect(narrow.out.task ?? 0).toBeLessThanOrEqual(LOG_READ_RATE)
  })

  test('drops what a consumer leaves unread past the retention window', () => {
    const game = streamBoard()
    const lagging = tune(game, logOf(game).id, { depth: 5_000_000, retain: 600 })
    expect(solve(lagging).errors.dropped).toBeGreaterThan(0)
    const kept = tune(lagging, logOf(game).id, { retain: 10_080 })
    expect(solve(kept).errors.dropped).toBeLessThan(solve(lagging).errors.dropped)
  })

  test('orders only inside a partition, so an unkeyed stream applies events out of order', () => {
    const game = streamBoard()
    const unkeyed = tune(game, logOf(game).id, { keyed: false, partitions: 6 })
    expect(solve(game).errors.stale).toBeCloseTo(0, 9)
    expect(solve(unkeyed).errors.stale).toBeGreaterThan(0)
    // One partition holds every event in one place, so nothing can overtake anything.
    const single = tune(unkeyed, logOf(game).id, { partitions: 1 })
    expect(solve(single).errors.stale).toBeCloseTo(0, 9)
  })

  test('burns 0.30 a second, and a replica of every partition adds disk', () => {
    const game = streamBoard()
    const index = eraOf(game).costIndex
    const one = tune(game, logOf(game).id, { n: 1 })
    expect(burnOf(one, logOf(one))).toBeCloseTo(0.3 * index, 8)
    const three = tune(game, logOf(game).id, { n: 3 })
    expect(burnOf(three, logOf(three))).toBeGreaterThan(burnOf(one, logOf(one)))
    // Each size step doubles the brokers' Burn.
    const bigger = tune(three, logOf(three).id, { size: 2 })
    expect(burnOf(bigger, logOf(bigger))).toBeCloseTo(burnOf(three, logOf(three)) * 2, 8)
  })

  test('is placeable only with its research, and only from Series B', () => {
    expect(RESEARCH['event-streaming'].era).toBe(4)
    expect(RESEARCH['event-streaming'].requires).toEqual(['queues'])
    expect(Result.isFailure(place(rich(preseedGame()), 'log', 240, 280))).toBe(true)
    const seriesA: Board = {
      ...rich(preseedGame()),
      stage: 3,
      researched: [...preseedGame().researched, 'queues'],
    }
    expect(researchReady(seriesA, 'event-streaming')).toBe(false)
    expect(Result.isFailure(study(seriesA, 'event-streaming'))).toBe(true)
    const seriesB: Board = { ...seriesA, stage: 4 }
    expect(Result.isSuccess(study(seriesB, 'event-streaming'))).toBe(true)
    const owned: Board = { ...seriesB, researched: [...seriesB.researched, 'event-streaming'] }
    expect(ok(place(owned, 'log', 240, 280)).nodes.some((node) => node.type === 'log')).toBe(true)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with no Event Stream in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'log')).toBe(false)
    expect(game.nodes.every((node) => node.partitions === 3 && node.keyed)).toBe(true)
    const ledger = solve(game)
    expect(ledger.revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
  })
})
