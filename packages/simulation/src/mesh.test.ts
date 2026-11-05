import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, study, type Action } from './actions.ts'
import { MESH_HOP_MS, MESH_OVERHEAD, RESEARCH } from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-02f8200.json' with { type: 'json' }
import { burnOf, eraOf, insightTotal, isDown, researchReady } from './lookups.ts'
import { solve } from './solve.ts'
import { Game } from './state.ts'
import type { Game as Board, GameNode } from './state.ts'
import { step } from './step.ts'
import { platformTax } from './team.ts'

/*
 * The Service Mesh (05 "Service Mesh"): a sidecar beside every service that links into it. It
 * retries and breaks each Link, watches it for Insight, costs a millisecond a hop and 5% of the
 * service's CPU, and takes Platform Dev Hours.
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

const seriesB = (): Board => ({
  ...rich(preseedGame()),
  stage: 4,
  // Small enough that the box is not saturated: the sidecar's own cost is what shows.
  users: 400,
  shipped: ['password-login', 'profile-photos'],
  researched: [...preseedGame().researched, 'containers', 'service-mesh'],
})

/** A Series B Company whose App Server has a sidecar, and one with the same Design and none. */
const meshedBoard = (): Board => {
  const base = seriesB()
  const clustured = ok(place(base, 'cluster', 1_040, 640))
  const cluster = last(clustured)
  const wired = ok(connect(clustured, 'server', cluster))
  const placed = ok(place(wired, 'mesh', 1_040, 820))
  const mesh = last(placed)
  return ok(connect(placed, 'server', mesh))
}

/** The same board without the mesh, so the sidecar's effects are the only difference. */
const plainBoard = (): Board => {
  const game = meshedBoard()
  const mesh = meshOf(game).id
  return {
    ...game,
    nodes: game.nodes.filter((node) => node.id !== mesh),
    links: game.links.filter((edge) => edge.from !== mesh && edge.to !== mesh),
  }
}

const meshOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'mesh')
  if (!node) throw new Error('Missing the Service Mesh')
  return node
}

const serverOf = (game: Board): GameNode => {
  const node = game.nodes.find((entry) => entry.type === 'server')
  if (!node) throw new Error('Missing the App Server')
  return node
}

describe('the Service Mesh', () => {
  test('adds one millisecond to each hop its members make', () => {
    const meshed = solve(meshedBoard())
    const plain = solve(plainBoard())
    expect(MESH_HOP_MS).toBe(1)
    // A read makes one call to the Database: a millisecond more on the user's path, and a little
    // more waiting on a box that has 5% less CPU to serve from.
    const read = (meshed.kinds.read?.mean ?? 0) - (plain.kinds.read?.mean ?? 0)
    expect(read).toBeGreaterThan(0.9)
    expect(read).toBeLessThan(1.5)
    // Every call pays it, whatever the kind: a write pays it on its own call to the Database.
    const write = (meshed.kinds.write?.mean ?? 0) - (plain.kinds.write?.mean ?? 0)
    expect(write).toBeGreaterThan(0.9)
  })

  test('takes about 5% of a member’s CPU, and bills it as the sidecar’s Burn', () => {
    const meshed = meshedBoard()
    const plain = plainBoard()
    const withSidecar = solve(meshed).nodes[serverOf(meshed).id]
    const without = solve(plain).nodes[serverOf(plain).id]
    if (!withSidecar || !without) throw new Error('Missing the App Server')
    expect(MESH_OVERHEAD).toBe(0.05)
    // The sidecar's cores are the member's, minus its share.
    expect(
      (withSidecar.resources.cpu?.total ?? 0) / (without.resources.cpu?.total ?? 1),
    ).toBeCloseTo(1 - MESH_OVERHEAD, 9)
    expect(withSidecar.capacity).toBeLessThan(without.capacity)
    // The mesh has no box: it bills the share of each member's Burn its sidecar takes.
    const member = burnOf(meshed, serverOf(meshed))
    expect(burnOf(meshed, meshOf(meshed))).toBeCloseTo(MESH_OVERHEAD * member, 8)
    // Only members bill: a mesh with nothing linked into it is free to run.
    const lonely = {
      ...meshed,
      links: meshed.links.filter((edge) => edge.to !== meshOf(meshed).id),
    }
    expect(burnOf(lonely, meshOf(lonely))).toBeCloseTo(0, 8)
  })

  test('retries and breaks the Links out of a member, with no research for either', () => {
    const game = meshedBoard()
    const plain = plainBoard()
    const broken = (board: Board): Board =>
      tune(board, 'database', {
        life: { _tag: 'Restarting', left: 60, cause: 'failure', warm: 0 } as GameNode['life'],
      })
    const withMesh = solve(broken(game))
    const without = solve(broken(plain))
    const link = (board: Board, ledger: ReturnType<typeof solve>): number =>
      ledger.links.find((entry) => entry.from === serverOf(board).id)?.failure ?? 0
    // The sidecar watches every Link, so a failing one is measured and retried.
    expect(link(game, withMesh)).toBeGreaterThan(0)
    expect(link(plain, without)).toBeCloseTo(0, 9)
    // After a Step with half its calls failing, the sidecar's breaker opens by itself.
    expect(step(broken(game), 1).game.links.some((edge) => edge.open > 0)).toBe(true)
    expect(step(broken(plain), 1).game.links.some((edge) => edge.open > 0)).toBe(false)
  })

  test('earns 20% more Insight on the traffic it watches', () => {
    const meshed = solve(meshedBoard())
    const plain = solve(plainBoard())
    const withMetrics = insightTotal(meshed.insight)
    const without = insightTotal(plain.insight)
    expect(withMetrics).toBeGreaterThan(0)
    expect(withMetrics / without).toBeCloseTo(1.2, 1)
  })

  test('takes Platform Dev Hours while it runs', () => {
    const game = meshedBoard()
    const plain = plainBoard()
    expect(platformTax(game)).toBeGreaterThan(platformTax(plain))
    // A Platform team does that work instead, and pays nothing.
    const staffed: Board = {
      ...game,
      teams: [{ ...game.teams[0]!, kind: 'platform' }],
      engineers: [
        { id: 'e1', team: game.teams[0]!.id, language: 'php', hiredAt: 0, salary: 1 } as never,
      ],
    }
    expect(platformTax(staffed)).toBe(0)
    // A mesh that is down renews nothing and takes no Dev Hours.
    expect(platformTax(tune(game, meshOf(game).id, { shut: true }))).toBe(platformTax(plain))
  })

  test('is placeable only with its research, and only from Series B', () => {
    expect(RESEARCH['service-mesh'].era).toBe(4)
    expect(RESEARCH['service-mesh'].requires).toEqual(['containers'])
    expect(Result.isFailure(place(rich(preseedGame()), 'mesh', 240, 280))).toBe(true)
    const seriesA: Board = {
      ...rich(preseedGame()),
      stage: 3,
      researched: [...preseedGame().researched, 'autoscaling', 'containers'],
    }
    expect(researchReady(seriesA, 'service-mesh')).toBe(false)
    expect(Result.isFailure(study(seriesA, 'service-mesh'))).toBe(true)
    const seriesB: Board = { ...seriesA, stage: 4 }
    expect(Result.isSuccess(study(seriesB, 'service-mesh'))).toBe(true)
    const owned: Board = { ...seriesB, researched: [...seriesB.researched, 'service-mesh'] }
    expect(ok(place(owned, 'mesh', 240, 280)).nodes.some((node) => node.type === 'mesh')).toBe(true)
  })

  test('only App Servers and Workers come under it, one mesh each', () => {
    const game = meshedBoard()
    const database = game.nodes.find((node) => node.type === 'database')?.id ?? 'database'
    const user = game.nodes.find((node) => node.type === 'users')?.id ?? 'users'
    expect(Result.isFailure(connect(game, database, meshOf(game).id))).toBe(true)
    expect(Result.isFailure(connect(game, user, meshOf(game).id))).toBe(true)
    expect(Result.isFailure(connect(game, serverOf(game).id, meshOf(game).id))).toBe(true)
    expect(isDown(meshOf(game))).toBe(false)
  })
})

describe('an old save', () => {
  test('opens, solves and steps with no Service Mesh in it', () => {
    const game = Schema.decodeUnknownSync(Game)(save)
    expect(game.nodes.some((node) => node.type === 'mesh')).toBe(false)
    expect(solve(game).revenue).toBeGreaterThan(0)
    expect(step(game, 1).game.time).toBe(game.time + 1)
    expect(eraOf(game).costIndex).toBeGreaterThan(0)
  })
})
