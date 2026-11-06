import type { Game, GameNode } from '../state.ts'
import {
  BACKEND_KINDS,
  RUNTIMES,
  EDGE_CPU_MS,
  EDGE_LANGUAGES,
  EDGE_MS,
  isBackendKind,
  type Kind,
  type RequestKind,
} from '../catalog.ts'
import { callsOf, flatModel, requestCpuMs } from '../capacity.ts'
import { failed } from '../distribution.ts'

import { type ComponentRule, answerCalls, each, noConnections, noProbe } from '../rule-kit.ts'

/* ---------- the Edge Function ---------- */

/** Whether the Service's Stack runs at the edge: JavaScript, TypeScript, or Rust or Go to WASM. */
export const edgeRuns = (node: GameNode): boolean =>
  EDGE_LANGUAGES.includes(RUNTIMES[node.runtime].language)

/**
 * Whether one request of a kind fits the Edge Function's CPU ceiling (05 "Edge Function"): past
 * it the handler is killed, so CPU-heavy kinds fail as `timeout`. A login whose hash an Auth
 * Provider takes is a thin call and fits.
 */
const edgeFits = (game: Game, node: GameNode, kind: Kind, delegated = false): boolean =>
  !isBackendKind(kind) && requestCpuMs(game, node, kind, delegated) <= EDGE_CPU_MS

// Small handlers next to the user (05 "Edge Function"): 5 ms, no cold start, and a CPU ceiling
// that CPU-heavy kinds hit as a `timeout`.
export const edgeRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      Number.POSITIVE_INFINITY,
      arriving,
      { fixed: EDGE_MS, variable: 0 },
      solver.boost(node),
    ),
  serve: (serve, node, rates, share) => {
    const { game } = serve.solver
    const delegated = serve.solver.delegates(node)
    // JavaScript, TypeScript, or Rust or Go compiled to WebAssembly: anything else is refused.
    if (!edgeRuns(node)) return
    each(rates, share, (kind, processed) => {
      if (!edgeFits(game, node, kind, delegated)) return
      const calls = callsOf(game, node, kind as RequestKind, delegated)
      for (const backend of BACKEND_KINDS) serve.route(backend, processed * (calls[backend] ?? 0))
    })
  },
  outcome: (answer, node, kind) =>
    !edgeRuns(node)
      ? failed('refused')
      : !edgeFits(answer.game, node, kind, answer.delegates)
        ? failed('timeout')
        : answerCalls(answer, node, kind),
  // A handler opens no pool of its own: the edge reaches the data tier through the platform.
  connections: noConnections,
  probe: noProbe,
}
