import { describe, expect, test } from 'vitest'
import { RUNTIMES } from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { solveFlow } from '../src/solve.ts'
import type { FrameworkId, RuntimeId } from '../src/catalog.ts'
import type { Game } from '../src/state.ts'

/*
 * Runtime balance targets (16 "Runtime balance targets"): the comparisons between runtimes that
 * a player meets when choosing a Stack. Each one reads the real Ledger on a Pre-seed Design.
 */

const withStack = (runtime: RuntimeId, framework: FrameworkId): Game => {
  const game = preseedGame(1)
  return {
    ...game,
    researched: [...game.researched, 'lang-go', 'lang-ruby', 'fw-rails', 'fw-gin'],
    nodes: game.nodes.map((node) =>
      node.type === 'server' ? { ...node, runtime, framework, workers: 64 } : node,
    ),
  }
}

const capacityOf = (game: Game): number => {
  const server = game.nodes.find((node) => node.type === 'server')
  return solveFlow(game).nodes[server?.id ?? '']?.capacity ?? 0
}
const velocityOf = (game: Game): number => solveFlow(game).velocity

describe('runtime balance targets', () => {
  test('a Java runtime starts at 30% speed and is warm after 30 s', () => {
    expect(RUNTIMES.tomcat.warmFrom).toBe(0.3)
    expect(RUNTIMES.tomcat.warmup).toBe(30)
  })

  test('Rust serves the same load for 25% to 40% less server cost than Go', () => {
    const saved = 1 - capacityOf(withStack('go', 'none')) / capacityOf(withStack('tokio', 'none'))
    expect(saved).toBeGreaterThanOrEqual(0.25)
    expect(saved).toBeLessThanOrEqual(0.4)
  })

  test('Rust takes 50% to 70% more Dev Hours than Go for the same features', () => {
    const more = velocityOf(withStack('go', 'none')) / velocityOf(withStack('tokio', 'none')) - 1
    expect(more).toBeGreaterThanOrEqual(0.5)
    expect(more).toBeLessThanOrEqual(0.7)
  })

  test('Elixir holds 3× to 5× the realtime connections per GB that Node.js does', () => {
    const times = (RUNTIMES.node.connectionKB ?? 0) / (RUNTIMES.beam.connectionKB ?? 1)
    expect(times).toBeGreaterThanOrEqual(3)
    expect(times).toBeLessThanOrEqual(5)
  })

  test('Rails takes 35% to 50% fewer Dev Hours than Go for the same features', () => {
    const fewer = 1 - velocityOf(withStack('go', 'gin')) / velocityOf(withStack('puma', 'rails'))
    expect(fewer).toBeGreaterThanOrEqual(0.35)
    expect(fewer).toBeLessThanOrEqual(0.5)
  })
})
