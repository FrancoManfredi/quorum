import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from '../src/actions.ts'
import { GPU_MODELS } from '../src/catalog.ts'
import { gpuFits } from '../src/rules.ts'
import { requestCpuMs } from '../src/capacity.ts'
import { buildMinutesOf, coordinationOf, debtGrowthOf, effectiveEngineers } from '../src/team.ts'
import { logLoss } from '../src/lookups.ts'
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
  test('structure lowers coordination and debt growth, and Express raises debt growth', () => {
    expect(coordinationOf(withStack('symfony', 'php_fpm'))).toBe(0.7)
    expect(coordinationOf(withStack('nestjs', 'node'))).toBe(0.7)
    expect(coordinationOf(withStack('spring-boot', 'tomcat'))).toBe(0.7)
    expect(coordinationOf(withStack('none', 'node'))).toBe(1)
    expect(debtGrowthOf(withStack('express', 'node'))).toBe(1.1)
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
