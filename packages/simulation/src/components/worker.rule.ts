import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
import {
  BACKEND_KINDS,
  POISON_SHARE,
  PREFETCH,
  RUNTIMES,
  type Kind,
  type RequestKind,
} from '../catalog.ts'
import { asyncCallsOf, serverModel } from '../capacity.ts'
import { failSome, through } from '../distribution.ts'
import { hopMs, inCluster, meshOf } from '../lookups.ts'
import {
  type ComponentRule,
  type Pass,
  codeCrashes,
  noProbe,
  slotOf,
  taskMixOf,
} from '../rule-kit.ts'

/** A Queue's or Worker's task mix in a pass, or null when no task reached it. */
const mixIn = (pass: Pass, node: GameNode): Partial<Record<RequestKind, number>> | null => {
  const tasks = pass.tasks[slotOf(pass, node)]
  if (!tasks) return null
  let total = 0
  for (const kind of Object.keys(tasks) as Array<RequestKind>) total += tasks[kind] ?? 0
  if (total <= 0) return null
  const shares: Partial<Record<RequestKind, number>> = {}
  for (const kind of Object.keys(tasks) as Array<RequestKind>)
    shares[kind] = (tasks[kind] ?? 0) / total
  return shares
}

export const workerRule: ComponentRule = {
  // Each task costs the async part of the kind it came from, once per attempt. A poison
  // message eats most of its time.
  model: (solver, node, arriving) => {
    const tasks =
      ((arriving.task ?? 0) * solver.attempts(node)) /
      (solver.poisoned(node) ? 1 - POISON_SHARE : 1)
    const mix = solver.taskMix(node)
    const work: Partial<Record<RequestKind, number>> = {}
    for (const kind of Object.keys(mix) as Array<RequestKind>) work[kind] = tasks * (mix[kind] ?? 0)
    return serverModel({
      game: solver.game,
      node,
      arriving: work,
      callLatency: solver.callLatency(node),
      delegated: false,
      local: false,
      inflight: solver.inflight(node),
      boost: solver.boost(node),
      sampling: solver.sampling(node),
      hashing: 1,
      worker: true,
      pod: inCluster(solver.game, node),
      mesh: meshOf(solver.game, node),
    })
  },
  // It sends the async part's calls, once per attempt: an export's 50 reads.
  serve: (serve, node, rates, share) => {
    const tasks = (rates.task ?? 0) * share * serve.solver.attempts(node)
    if (tasks <= 0) return
    const mix = serve.solver.taskMix(node)
    for (const kind of Object.keys(mix) as Array<RequestKind>) {
      const calls = asyncCallsOf(serve.solver.game, kind)
      for (const backend of BACKEND_KINDS)
        serve.route(backend, tasks * (mix[kind] ?? 0) * (calls[backend] ?? 0))
    }
  },
  // One attempt: its own time, its calls, and the code's own failures. Users never wait for it.
  outcome: (answer, node, kind) => {
    const { game } = answer
    const mix = mixIn(answer.pass, node) ?? taskMixOf(game)
    const calls: Partial<Record<Kind, number>> = {}
    for (const origin of Object.keys(mix) as Array<RequestKind>) {
      const each = asyncCallsOf(game, origin)
      for (const backend of BACKEND_KINDS)
        calls[backend] = (calls[backend] ?? 0) + (mix[origin] ?? 0) * (each[backend] ?? 0)
    }
    const hop = hopMs(game)
    return failSome(
      through(
        answer.ownHop(kind),
        BACKEND_KINDS.flatMap((backend) =>
          (calls[backend] ?? 0) > 0
            ? [[answer.downstream(backend, hop), calls[backend] ?? 0] as const]
            : [],
        ),
      ),
      codeCrashes(game, node, kind, Object.keys(mix) as Array<Kind>),
      'crash',
    )
  },
  // A Worker holds a pool to each database it reads, like an App Server.
  connections: (_, node, model) => (model?.processes ?? 0) * RUNTIMES[node.runtime].connections,
  probe: noProbe,
}

/** Sets how many tasks each Worker process takes from its Queue ahead of time. */
export const setPrefetch = (game: Game, id: string, prefetch: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'worker') return notAllowed('Only a Worker prefetches tasks.')
    if (!(PREFETCH as ReadonlyArray<number>).includes(prefetch))
      return notAllowed(`Prefetch is ${PREFETCH.join(', ')}.`)
    return ok(node.prefetch === prefetch ? game : patch(game, id, { prefetch }))
  })
