import { describe, expect, test } from 'vitest'
import {
  AXES,
  LANGUAGE_IDS,
  RUNTIME_IDS,
  RUNTIMES,
  type LanguageId,
  type RuntimeId,
} from '../src/catalog.ts'
import { preseedGame } from '../src/company.ts'
import { solveFlow } from '../src/solve.ts'
import type { Game } from '../src/state.ts'

/*
 * Dominance (16 "Dominance"): no runtime beats its siblings everywhere. Within a language, each
 * runtime is the best at least one reference score, by at least 10%, and across languages BEAM
 * holds the most realtime connections per GB.
 */

const stack = (runtime: RuntimeId): Game => {
  const game = preseedGame(1)
  return {
    ...game,
    nodes: game.nodes.map((node) =>
      node.type === 'server' ? { ...node, runtime, framework: 'none', workers: 64 } : node,
    ),
  }
}

const serving = (runtime: RuntimeId): number => {
  const game = stack(runtime)
  const server = game.nodes.find((node) => node.type === 'server')
  return solveFlow(game).nodes[server?.id ?? '']?.capacity ?? 0
}

const SCORES: Readonly<Record<string, (runtime: RuntimeId) => number>> = {
  throughput: serving,
  memory: (id) => 1 / RUNTIMES[id].memoryMb,
  connections: (id) => 1 / (RUNTIMES[id].connectionKB ?? Number.POSITIVE_INFINITY),
  startup: (id) => 1 / (1 + RUNTIMES[id].startupSeconds),
  coldSpeed: (id) => RUNTIMES[id].warmFrom,
  noStall: (id) => (RUNTIMES[id].blocking === null ? 1 : 0),
  noPause: (id) => 1 / (RUNTIMES[id].gc?.pauseMs ?? 0.01),
  leakProof: (id) => (RUNTIMES[id].persistent ? 0 : 1),
  poolFree: (id) => (RUNTIMES[id].pool ? 0 : 1),
  ...Object.fromEntries(
    AXES.map((axis) => [axis, (id: RuntimeId) => RUNTIMES[id].axes[axis]] as const),
  ),
}

const siblings = (language: LanguageId): ReadonlyArray<RuntimeId> =>
  RUNTIME_IDS.filter((id) => RUNTIMES[id].language === language)

/** The scores a runtime wins by at least 10% over every sibling. */
const wins = (runtime: RuntimeId, peers: ReadonlyArray<RuntimeId>): ReadonlyArray<string> =>
  Object.entries(SCORES)
    .filter(([, score]) =>
      peers.every((other) => other === runtime || score(runtime) >= score(other) * 1.1),
    )
    .map(([name]) => name)

describe('dominance', () => {
  test.each(RUNTIME_IDS.filter((id) => siblings(RUNTIMES[id].language).length > 1))(
    '%s beats its language siblings on a reference score',
    (runtime) => {
      expect(wins(runtime, siblings(RUNTIMES[runtime].language)), runtime).not.toEqual([])
    },
  )

  test('BEAM holds more realtime connections per GB than Go and Kestrel', () => {
    expect(wins('beam', ['beam', 'go', 'kestrel']).length).toBeGreaterThan(0)
  })

  test('every language has a runtime', () => {
    for (const language of LANGUAGE_IDS) expect(siblings(language).length).toBeGreaterThan(0)
  })
})
