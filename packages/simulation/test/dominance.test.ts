import { describe, expect, test } from 'vitest'
import {
  AXES,
  FRAMEWORK_IDS,
  FRAMEWORKS,
  LANGUAGE_IDS,
  REQUEST_KINDS,
  RUNTIME_IDS,
  RUNTIMES,
  type FrameworkId,
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

const FRAMEWORK_SCORES: Readonly<Record<string, (id: FrameworkId) => number>> = {
  cpu: (id) => 1 / FRAMEWORKS[id].overhead,
  memory: (id) => 1 / (1 + FRAMEWORKS[id].memoryMb),
  velocity: (id) => FRAMEWORKS[id].velocity,
  coordination: (id) => 1 / (FRAMEWORKS[id].coordination ?? 1),
  debt: (id) => 1 / (FRAMEWORKS[id].debt ?? 1),
  workerHours: (id) => 1 / (FRAMEWORKS[id].workerHours ?? 1),
  workerOverhead: (id) => 1 / (FRAMEWORKS[id].workerOverhead ?? 1),
  noOrm: (id) => (FRAMEWORKS[id].orm ? 0 : 1),
  cacheable: (id) => FRAMEWORKS[id].cacheable ?? 0,
  internalTools: (id) => 1 / (FRAMEWORKS[id].internalTools ?? 1),
  nativeBuild: (id) => 1 / (FRAMEWORKS[id].nativeBuild ?? 1),
  startup: (id) => 1 / (1 + FRAMEWORKS[id].startupSeconds),
  ...Object.fromEntries(
    REQUEST_KINDS.map(
      (kind) =>
        [
          `cpu-${kind}`,
          (id: FrameworkId) => 1 / (FRAMEWORKS[id].overhead * (FRAMEWORKS[id].cpu?.[kind] ?? 1)),
        ] as const,
    ),
  ),
  ...Object.fromEntries(
    REQUEST_KINDS.map(
      (kind) => [`value-${kind}`, (id: FrameworkId) => FRAMEWORKS[id].value[kind] ?? 1] as const,
    ),
  ),
  ...Object.fromEntries(
    AXES.map((axis) => [`axis-${axis}`, (id: FrameworkId) => FRAMEWORKS[id].axes[axis]] as const),
  ),
}

const frameworkSiblings = (language: LanguageId): ReadonlyArray<FrameworkId> => [
  'none',
  ...FRAMEWORK_IDS.filter((id) => FRAMEWORKS[id].language === language),
]

/** Whether one framework is at least as good on every score and better on one by 10%. */
const dominates = (a: FrameworkId, b: FrameworkId): boolean => {
  const scores = Object.values(FRAMEWORK_SCORES)
  return (
    scores.every((score) => score(a) >= score(b)) &&
    scores.some((score) => score(a) > score(b) * 1.1)
  )
}

describe('framework dominance', () => {
  test.each(LANGUAGE_IDS)('%s frameworks never strictly dominate a sibling', (language) => {
    const peers = frameworkSiblings(language)
    for (const a of peers)
      for (const b of peers) if (a !== b) expect(dominates(a, b), `${a} over ${b}`).toBe(false)
  })
})
