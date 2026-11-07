import { Effect, Schema } from 'effect'
import {
  BACKEND_KINDS,
  COMPONENTS,
  REQUEST_KINDS,
  type RequestKind,
} from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { nodeLabelOf } from '@quorum/simulation/labels'
import { isDown } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'

const Rates = Schema.Record(Schema.String, Schema.Finite)

/** Inspector history is session state, not part of the replayed Game. */
export const NodeSample = Schema.Struct({
  time: Schema.Finite,
  inbound: Schema.Finite,
  capacity: Schema.Finite,
  utilization: Schema.Finite,
  traffic: Rates,
  sources: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      ordinal: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
      rate: Schema.Finite,
    }),
  ),
  limit: Schema.Literals([
    'cpu',
    'credits',
    'memory',
    'workers',
    'connections',
    'network',
    'disk',
    'throughput',
    'none',
  ]),
  dropped: Schema.Finite,
  refused: Schema.Finite,
  down: Schema.Boolean,
  disk: Schema.Boolean,
  swapping: Schema.Boolean,
  throttled: Schema.Boolean,
  hitRatio: Schema.NullOr(Schema.Finite),
  queue: Schema.NullOr(
    Schema.Struct({
      depth: Schema.Finite,
      out: Schema.Finite,
      stalled: Schema.Boolean,
      wait: Schema.Finite,
    }),
  ),
  /** Load diagnosis (12): mean work per request, each kind's share of it, and where it comes from. */
  cost: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  workShare: Rates.pipe(Schema.withDecodingDefaultKey(Effect.succeed({}))),
  workUnit: Schema.NullOr(Schema.Literals(['cpu', 'workers', 'network', 'disk'])).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
  /** Requests per second that are retries or hedged copies, and Cache or CDN misses. */
  repeated: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  misses: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Requests per second here that each Users' Request kind causes, and what the Users send. */
  origins: Rates.pipe(Schema.withDecodingDefaultKey(Effect.succeed({}))),
  sent: Rates.pipe(Schema.withDecodingDefaultKey(Effect.succeed({}))),
  /** The Node this one calls that adds the most time per call. */
  slowest: Schema.NullOr(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      ordinal: Schema.Finite,
      latency: Schema.Finite,
    }),
  ).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
})
export type NodeSample = typeof NodeSample.Type

export const HISTORY_POINTS = 144
export const HISTORY_EVERY = 10
export const TRAFFIC_KINDS = [...REQUEST_KINDS, ...BACKEND_KINDS]

export const hasTraffic = (node: GameNode): boolean => {
  const def = COMPONENTS[node.type]
  return def.accepts.length > 0 && !def.fixed && !def.control && !def.tap
}

export const sampleNode = (game: Game, node: GameNode, ledger: Ledger): NodeSample => {
  const own = ledger.nodes[node.id]!
  const into = ledger.links.filter((link) => link.to === node.id && link.rate > 0)
  const misses = into
    .filter((link) => {
      const type = game.nodes.find((entry) => entry.id === link.from)?.type
      return type === 'cache' || type === 'cdn'
    })
    .reduce((sum, link) => sum + link.rate, 0)
  const sent: Record<string, number> = {}
  for (const kind of Object.keys(own.origins) as Array<RequestKind>)
    sent[kind] = ledger.kinds[kind]?.rate ?? 0
  const slowest = ledger.links
    .filter((link) => link.from === node.id && link.rate > 0)
    .map((link) => game.nodes.find((entry) => entry.id === link.to)!)
    .filter((child) => hasTraffic(child))
    .reduce<GameNode | null>(
      (best, child) =>
        best === null ||
        (ledger.nodes[child.id]?.latency ?? 0) > (ledger.nodes[best.id]?.latency ?? 0)
          ? child
          : best,
      null,
    )
  return {
    time: game.time,
    inbound: own.inbound,
    capacity: own.capacity,
    utilization: own.utilization,
    traffic: own.traffic,
    sources: into.map((link) => {
      const source = game.nodes.find((entry) => entry.id === link.from)!
      const label = nodeLabelOf(game, source)
      return { id: source.id, name: label.name, ordinal: label.ordinal, rate: link.rate }
    }),
    limit: own.limit,
    dropped: own.dropped,
    refused: own.refused,
    down: isDown(node),
    disk: own.disk,
    swapping: own.swapping,
    throttled: own.throttled,
    hitRatio: own.hitRatio,
    queue:
      node.type === 'queue'
        ? {
            depth: node.depth,
            out: Object.values(own.out).reduce((sum, rate) => sum + rate, 0),
            stalled: own.age === Number.POSITIVE_INFINITY,
            wait: own.age !== null && Number.isFinite(own.age) ? own.age : 0,
          }
        : null,
    cost: own.cost,
    workShare: own.workShare,
    workUnit: own.workUnit,
    repeated: own.repeated,
    misses: Math.min(misses, own.inbound),
    origins: own.origins,
    sent,
    slowest: slowest
      ? {
          id: slowest.id,
          name: nodeLabelOf(game, slowest).name,
          ordinal: nodeLabelOf(game, slowest).ordinal,
          latency: ledger.nodes[slowest.id]?.latency ?? 0,
        }
      : null,
  }
}

/** Samples one calendar hour apart: the history keeps one calendar day. */
export const HOUR_SAMPLES = HISTORY_POINTS / 24

/**
 * Load change (12 "Load diagnosis"): the change in utilization from `earlier` to `sample`, split
 * into more demand, more cost per request, and less capacity, in utilization points.
 * Utilization is inbound × cost ÷ room, so each part is its factor's share of the change in the
 * logarithm. When the work moved to another resource, cost is not comparable, and the part
 * demand does not explain counts as cost.
 */
export const loadChangeOf = (
  sample: NodeSample,
  earlier: NodeSample,
): Readonly<{ demand: number; cost: number; capacity: number }> | null => {
  const values = [sample.utilization, earlier.utilization, sample.inbound, earlier.inbound]
  if (values.some((value) => !(value > 0))) return null
  const total = Math.log(sample.utilization / earlier.utilization)
  const delta = sample.utilization - earlier.utilization
  if (Math.abs(total) < 1e-6) return { demand: 0, cost: 0, capacity: 0 }
  const demand = Math.log(sample.inbound / earlier.inbound)
  const comparable = sample.workUnit === earlier.workUnit && sample.cost > 0 && earlier.cost > 0
  const cost = comparable ? Math.log(sample.cost / earlier.cost) : total - demand
  const scale = delta / total
  return { demand: demand * scale, cost: cost * scale, capacity: (total - demand - cost) * scale }
}

/** The sample one calendar hour before the one at `index` (−1 for live), or the oldest kept. */
export const hourBefore = (
  history: ReadonlyArray<NodeSample>,
  index: number,
): NodeSample | undefined => {
  const at = (index === -1 ? history.length : index) - HOUR_SAMPLES
  return at >= 0 ? history[at] : index === 0 ? undefined : history[0]
}

/** Samples whose cost per request moved by a sixth or more since the one before, by index. */
export const costShifts = (history: ReadonlyArray<NodeSample>): ReadonlyArray<number> =>
  history.flatMap((sample, index) => {
    const before = history[index - 1]
    if (!before || before.workUnit !== sample.workUnit || !(before.cost > 0) || !(sample.cost > 0))
      return []
    return Math.abs(Math.log(sample.cost / before.cost)) >= Math.log(7 / 6) ? [index] : []
  })

/** A recommendation needs a measured constraint, not just a large traffic share. */
export const hintOf = (sample: NodeSample): string | null => {
  if (sample.down)
    return 'This component is down. Check its incident or restart status before resizing it.'
  if (sample.swapping)
    return 'RAM is exhausted and this component is swapping. Reduce resident memory or add RAM.'
  if (sample.throttled)
    return 'CPU credits are exhausted. Consider a non-burstable instance or reduce sustained CPU work.'
  if (sample.refused > 0)
    return 'The connection limit is refusing queries. Consider connection pooling or reduce database concurrency.'
  if (sample.disk && (sample.traffic['q-read'] ?? 0) > 0)
    return 'The working set exceeds RAM and reads hit disk. Consider more RAM, caching, or a read replica.'
  if (sample.queue && sample.queue.depth > 0 && sample.queue.stalled)
    return 'Queued work is stalled. Check that Workers are connected and their downstream calls can complete.'
  if (sample.utilization < 0.9 || sample.inbound <= 0) return null
  switch (sample.limit) {
    case 'cpu':
      return 'CPU limits capacity. Reduce CPU-heavy work or add compute capacity.'
    case 'workers':
      return 'Worker slots limit capacity. Check downstream latency before adding workers.'
    case 'memory':
      return 'Memory limits capacity. Reduce per-request memory or add RAM.'
    case 'network':
      return 'Network bandwidth limits capacity. Consider smaller payloads or more network capacity.'
    case 'disk':
      return 'Disk throughput limits capacity. Reduce disk work or increase storage throughput.'
    case 'throughput':
      return 'Throughput limits capacity. Reduce incoming work or increase this component’s capacity.'
    default:
      return null
  }
}

/** Below this peak utilization over the kept history, the rightsizing report marks a Node. */
export const RIGHTSIZE_THRESHOLD = 0.3

/**
 * Rightsizing marks a Node whose peak utilization over its kept history stayed under 30% (10
 * "Track: Cost", `rightsizing`): it never got close to busy, so its box is bigger than it needs.
 * Needs at least a full day of history (`HISTORY_POINTS`) so a quiet early moment does not count.
 */
export const oversized = (history: ReadonlyArray<NodeSample>): boolean =>
  history.length >= HISTORY_POINTS &&
  Math.max(...history.map((sample) => sample.utilization)) < RIGHTSIZE_THRESHOLD
