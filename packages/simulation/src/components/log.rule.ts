import { BACKLOG_MS, DRAIN_SECONDS, LOG_ACKS, LOG_RATE, LOG_READ_RATE } from '../catalog.ts'
import { failSome, failed, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { type ComponentRule, hotKeyFactor, noConnections, noProbe, slotOf } from '../rule-kit.ts'

// A log, not a queue (07 "Event Stream"): it appends what producers send, and its consumers
// read one partition each at their own pace, so they lag behind and the messages stay.
export const logRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      (LOG_RATE * flatScale(node)) / hotKeyFactor(solver.game, node),
      arriving,
      { fixed: LOG_ACKS[node.acks].latency * 5, variable: 0.1 },
      solver.boost(node),
    ),
  // It offers its consumers what arrived plus a share of its lag, and no faster than one
  // consumer per partition can read (07 "Event Stream": "A consumer group can use at most one
  // consumer per partition").
  serve: (serve, node, rates, share) => {
    if (share <= 0) return
    const arrived = (rates.task ?? 0) * share
    const room = Math.max(0, serve.solver.drainable(node) - arrived)
    const read = LOG_READ_RATE * Math.max(1, Math.floor(node.partitions))
    serve.route('task', Math.min(arrived + Math.min(node.depth / DRAIN_SECONDS, room), read))
  },
  // The producer waits for its append only. A consumer further behind than the retention window
  // loses the oldest events, and one that reads unkeyed events sees them out of order.
  outcome: (answer, node, kind) => {
    const own = answer.ownHop(kind)
    // With no Worker linked, nothing consumes the stream.
    if (answer.downstream(kind).fail.stranded >= 1) return failed('stranded')
    const appended = through({ ...own, fixed: own.fixed + BACKLOG_MS * node.depth })
    const slot = slotOf(answer.pass, node)
    const inflow = answer.pass.arriving[slot]?.task ?? 0
    // How far behind the producer its consumers are, in seconds of arriving work.
    const lag = inflow > 0 ? node.depth / inflow : 0
    const expired = lag > node.retain && lag > 0 ? 1 - node.retain / lag : 0
    // Order holds only inside a partition, so an unkeyed stream spreads one entity's events and
    // they apply out of order: the value a consumer writes is the older one.
    const unordered = node.keyed ? 0 : 1 - 1 / Math.max(1, Math.floor(node.partitions))
    return failSome(failSome(appended, expired, 'dropped'), unordered, 'stale')
  },
  connections: noConnections,
  probe: noProbe,
}
