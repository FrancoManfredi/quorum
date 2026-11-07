import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from '../src/actions.ts'
import { GPU_MODELS } from '../src/catalog.ts'
import { gpuFits } from '../src/rules.ts'
import { requestCpuMs } from '../src/capacity.ts'
import { buildMinutesOf, coordinationOf, debtGrowthOf, effectiveEngineers } from '../src/team.ts'
import { certExpired, logLoss } from '../src/lookups.ts'
import { evictionShareOf } from '../src/rules.ts'
import { solveFlow } from '../src/solve.ts'
import { step } from '../src/step.ts'
import { freeSandbox } from '../src/sandbox.ts'
import type { Game, GameNode } from '../src/state.ts'

/* What a framework, a runtime and a Component option do to the numbers they name (06, 05, 07). */

const ok = (action: Actions.Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const withStack = (framework: GameNode['framework'], runtime: GameNode['runtime']): Game => {
  const game = freeSandbox()
  return {
    ...game,
    nodes: game.nodes.map((node) =>
      node.type === 'server' ? { ...node, runtime, framework } : node,
    ),
  }
}

describe('frameworks', () => {
  test('structure lowers coordination and debt growth, Elysia lowers debt growth, and Express raises it', () => {
    expect(coordinationOf(withStack('symfony', 'php_fpm'))).toBe(0.7)
    expect(coordinationOf(withStack('nestjs', 'node'))).toBe(0.7)
    expect(coordinationOf(withStack('spring-boot', 'tomcat'))).toBe(0.7)
    expect(coordinationOf(withStack('none', 'node'))).toBe(1)
    expect(debtGrowthOf(withStack('express', 'node'))).toBe(1.1)
    expect(debtGrowthOf(withStack('elysia', 'bun'))).toBe(0.85)
    expect(effectiveEngineers(20, 0.7)).toBeGreaterThan(effectiveEngineers(20, 1))
  })

  test('Quarkus halves what a native image adds to a build', () => {
    const plain = buildMinutesOf(withStack('none', 'graal'))
    const quarkus = buildMinutesOf(withStack('quarkus', 'graal'))
    expect(plain).toBe(buildMinutesOf(withStack('none', 'tomcat')) * 3)
    expect(quarkus).toBeLessThan(plain)
  })
})

describe('options', () => {
  test('Auth at the edge takes the token check off the services', () => {
    const game = freeSandbox()
    const server = game.nodes.find((node) => node.type === 'server') as GameNode
    const gateway = ok(Actions.place(game, 'gw', 100, 100))
    const id = gateway.nodes.at(-1)?.id as string
    const edged = ok(Actions.setGatewayOptions(gateway, id, { authEdge: true }))
    expect(requestCpuMs(edged, server, 'read')).toBeLessThan(requestCpuMs(gateway, server, 'read'))
  })

  test('periodic restarts need a persistent runtime', () => {
    const game = withStack('none', 'node')
    const server = game.nodes.find((node) => node.type === 'server') as GameNode
    expect(
      ok(Actions.setRecycle(game, server.id, true)).nodes.find((n) => n.id === server.id)?.recycle,
    ).toBe(true)
    const php = withStack('none', 'php_fpm')
    const fpm = php.nodes.find((node) => node.type === 'server') as GameNode
    expect(Result.isFailure(Actions.setRecycle(php, fpm.id, true))).toBe(true)
  })

  test('a model that does not fit in the GPU fails, and a smaller precision fits it', () => {
    const placed = ok(Actions.place(freeSandbox(), 'gpu', 100, 100))
    const id = placed.nodes.at(-1)?.id as string
    const large = ok(Actions.setGpuModel(placed, id, 'large'))
    const node = large.nodes.find((entry) => entry.id === id) as GameNode
    expect(GPU_MODELS.large.gb).toBeGreaterThan(16)
    expect(gpuFits(node)).toBe(false)
    expect(gpuFits({ ...node, gpu: 'a100' })).toBe(true)
  })

  test('a broker with one replica loses everything, and acks=all with replicas loses nothing', () => {
    const placed = ok(Actions.place(freeSandbox(), 'log', 100, 100))
    const node = placed.nodes.at(-1) as GameNode
    expect(logLoss({ ...node, n: 1 })).toBe(1)
    expect(logLoss({ ...node, n: 3, acks: 'all' })).toBe(0)
    expect(logLoss({ ...node, n: 3, acks: '1' })).toBeGreaterThan(0)
  })
})

describe('certificates, evictions and boxes', () => {
  test('a manager issues a certificate to each Node that terminates TLS, and none renews without it', () => {
    let game = { ...freeSandbox(), sandbox: false, stage: 2, cash: 1e9 }
    game = ok(Actions.place(game, 'lb', 100, 100))
    game = ok(Actions.place(game, 'pki', 100, 400))
    game = step(game, 1).game
    const lb = game.nodes.find((node) => node.type === 'lb') as GameNode
    expect(lb.certUntil).not.toBeNull()
    expect(game.nodes.find((node) => node.type === 'pki')?.certUntil).toBeNull()
    const expired = { ...game, time: (lb.certUntil ?? 0) + 1 }
    expect(certExpired(expired, lb)).toBe(true)
  })

  test('a Cache the hot data does not fit evicts, and one that fits does not', () => {
    const game = { ...freeSandbox(), users: 5_000_000 }
    const placed = ok(Actions.place(game, 'cache', 100, 100))
    const cache = placed.nodes.find((node) => node.type === 'cache') as GameNode
    expect(evictionShareOf(placed, cache)).toBeGreaterThan(0)
    expect(evictionShareOf({ ...placed, users: 10 }, cache)).toBe(0)
    expect(solveFlow(placed).nodes[cache.id]?.evictions).not.toBeNull()
  })

  test('boxing two Nodes draws one box, and unboxing keeps the Nodes', () => {
    const base = ok(Actions.place(freeSandbox(), 'lb', 100, 100))
    const game = ok(Actions.place(base, 'dns', 100, 400))
    const ids = game.nodes.slice(-2).map((node) => node.id)
    const boxed = ok(Actions.boxNodes(game, ids))
    expect(boxed.boxes).toHaveLength(1)
    const loose = ok(Actions.unboxNodes(boxed, ids))
    expect(loose.boxes).toHaveLength(0)
    expect(loose.nodes).toHaveLength(game.nodes.length)
    expect(Result.isFailure(Actions.boxNodes(game, ids.slice(0, 1)))).toBe(true)
  })
})
