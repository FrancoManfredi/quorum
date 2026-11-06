import { REQUEST_KINDS, RUNTIMES } from '../catalog.ts'
import { inCluster, meshOf } from '../lookups.ts'
import { mixOf } from '../features.ts'
import { serverModel } from '../capacity.ts'
import { type ComponentRule, answerCalls, serveCalls } from '../rule-kit.ts'

export const serverRule: ComponentRule = {
  model: (solver, node, arriving) =>
    serverModel({
      game: solver.game,
      node,
      arriving,
      callLatency: solver.callLatency(node),
      delegated: solver.delegates(node),
      local: solver.runsLocalDb(node),
      inflight: solver.inflight(node),
      boost: solver.boost(node),
      sampling: solver.sampling(node),
      hashing: solver.game.incident?.kind === 'loop' ? 4 : 1,
      offloaded: solver.offloads(node),
      pod: inCluster(solver.game, node),
      mesh: meshOf(solver.game, node),
    }),
  serve: serveCalls,
  outcome: answerCalls,
  // Every app process holds its own pool to each database it reaches.
  connections: (solver, node, model) => {
    if (solver.runsLocalDb(node)) return 0
    const surge = solver.game.incident?.kind === 'connections' ? 2 : 1
    return (model?.processes ?? 0) * RUNTIMES[node.runtime].connections * surge
  },
  probe: (game) => {
    const mix = mixOf(game)
    return Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, mix[kind] ?? 0]))
  },
}
