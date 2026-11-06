import { EXPORT_MS_PER_GB, FUNCTION_LIMIT_MS, REQUEST_KINDS, RUNTIMES } from '../catalog.ts'
import { failed, hop, through } from '../distribution.ts'

import { mixOf } from '../features.ts'
import { serverlessModel } from '../capacity.ts'
import { type ComponentRule, answerCalls, serveCalls } from '../rule-kit.ts'

// It runs the Service's code with no box: one execution per in-flight request up to the
// concurrency cap, and a bill for each use (05 "Serverless Function").
export const fnRule: ComponentRule = {
  model: (solver, node, arriving) =>
    serverlessModel({
      game: solver.game,
      node,
      arriving,
      callLatency: solver.callLatency(node),
      delegated: solver.delegates(node),
      sampling: solver.sampling(node),
      hashing: solver.game.incident?.kind === 'loop' ? 4 : 1,
      boost: solver.boost(node),
    }),
  serve: serveCalls,
  outcome: (answer, node, kind) => {
    const own = answerCalls(answer, node, kind)
    if (kind !== 'job') return own
    // An export runs as long as the rows it reads take; past 15 minutes the function is killed.
    const ms = answer.game.data * EXPORT_MS_PER_GB
    if (ms > FUNCTION_LIMIT_MS) return failed('timeout')
    return through({ ...hop({ fixed: ms }) }, [[own, 1]])
  },
  // Each concurrent execution opens its own connections: a spike exhausts the Database's pool.
  connections: (_, node, model) => (model?.processes ?? 0) * RUNTIMES[node.runtime].connections,
  // An LB weighs it by the Era's mix, as it weighs an App Server.
  probe: (game) => {
    const mix = mixOf(game)
    return Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, mix[kind] ?? 0]))
  },
}
