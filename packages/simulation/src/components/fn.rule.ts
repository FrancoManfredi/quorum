import {
  EXPORT_MS_PER_GB,
  FUNCTION_LIMIT_MS,
  REQUEST_KINDS,
  RUNTIMES,
  SERVERLESS_CONCURRENCY,
  SERVERLESS_IDLE_SECONDS,
  SERVERLESS_MS,
  type RequestKind,
} from '../catalog.ts'
import { failed, hop, through } from '../distribution.ts'

import { mixOf } from '../features.ts'
import {
  type Calls,
  type NodeModel,
  type ServerContext,
  callsOf,
  cpuOf,
  waitOf,
} from '../capacity.ts'
import { coldStartMs } from '../lookups.ts'
import { warmOf } from '../life.ts'
import type { Game, GameNode } from '../state.ts'
import { type ComponentRule, answerCalls, serveCalls } from '../rule-kit.ts'

/**
 * Share of invocations that find no warm execution environment (05 "Cold starts"): an
 * environment goes away after `SERVERLESS_IDLE_SECONDS` without work, so at a low request rate
 * the next invocation starts cold. 1 / (1 + λ × idle) is 1 at an idle function and near 0 under
 * steady load.
 */
export const coldShareOf = (rate: number): number =>
  1 / (1 + Math.max(0, rate) * SERVERLESS_IDLE_SECONDS)

export type ServerlessContext = Readonly<{
  game: Game
  node: GameNode
  arriving: Readonly<Partial<Record<RequestKind, number>>>
  /** Mean latency of one call to each backend, in ms. */
  callLatency: Calls
  /** An Auth Provider takes this function's logins. */
  delegated: boolean
  /** CPU overhead from Analytics sampling this Node. */
  sampling: number
  /** Login hashing costs this many times more (incident "Event loop block"). */
  hashing: number
  /** Capacity multiplier, for the bottleneck test. */
  boost: number
}>

/**
 * A Serverless Function (05 "Serverless Function"): one execution environment per in-flight
 * request, up to the concurrency cap, and nothing resident when it idles. An execution lasts the
 * request's own CPU plus the calls it waits on, so Little's law turns a mean execution into the
 * requests a second the cap allows. Each environment is one core and its own memory, so the CPU
 * the code needs is what the cap divides.
 */
export const serverlessModel = (context: ServerlessContext): NodeModel => {
  const { game, node, arriving } = context
  const code: ServerContext = {
    game,
    node,
    arriving,
    callLatency: context.callLatency,
    delegated: context.delegated,
    local: false,
    inflight: 0,
    boost: context.boost,
    sampling: context.sampling,
    hashing: context.hashing,
  }
  const kinds = REQUEST_KINDS.filter((kind) => (arriving[kind] ?? 0) > 0)
  const rate = kinds.reduce((sum, kind) => sum + (arriving[kind] ?? 0), 0)
  const calls = Object.fromEntries(
    REQUEST_KINDS.map((kind) => [kind, callsOf(game, node, kind, context.delegated)]),
  ) as Record<RequestKind, Calls>
  // An environment runs one request at a time on one core: its own CPU, then the calls it waits on.
  const cpu = Object.fromEntries(
    REQUEST_KINDS.map((kind) => [kind, cpuOf(code, kind, calls[kind])]),
  ) as Record<RequestKind, number>
  const waiting = (kind: RequestKind): number => waitOf(calls[kind], context.callLatency)
  const concurrency = SERVERLESS_CONCURRENCY * context.boost
  // Little's law: executions in flight = requests a second × the seconds each one lasts.
  const inflight = kinds.reduce(
    (sum, kind) => sum + ((arriving[kind] ?? 0) * (cpu[kind] + waiting(kind))) / 1_000,
    0,
  )
  const utilization = concurrency > 0 ? inflight / concurrency : rate > 0 ? 99 : 0
  const share = utilization > 1 ? 1 / utilization : 1
  // A new environment starts cold, and one that was reaped after an idle gap starts cold too.
  const cold = Math.max(1 - warmOf(node.life), coldShareOf(rate))
  const used = inflight * share
  return {
    utilization,
    limit: utilization <= 0 ? 'none' : 'throughput',
    share,
    capacity: rate > 0 ? rate / Math.max(utilization, 1e-9) : 0,
    service: Object.fromEntries(
      REQUEST_KINDS.map((kind) => [
        kind,
        { fixed: SERVERLESS_MS, variable: cpu[kind] + waiting(kind) },
      ]),
    ),
    tailP: cold,
    tailMs: coldStartMs(node),
    // Every in-flight execution holds its own database connections (05 "Connections").
    processes: used,
    inflight: used,
    resources: {
      cpu: null,
      ram: null,
      slots: { used, total: concurrency },
      network: null,
      credits: null,
    },
    throttled: false,
    swapping: false,
  }
}

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
