import { BACKLOG_MS, DRAIN_SECONDS, QUEUE_RATE } from '../catalog.ts'
import { failSome, failed, through } from '../distribution.ts'

import { flatScale } from '../lookups.ts'
import { type ComponentRule, flat, noConnections, noProbe, slotOf } from '../rule-kit.ts'

export const queueRule: ComponentRule = {
  model: flat({ fixed: 2, variable: 0.05 }, (node) => QUEUE_RATE * flatScale(node)),
  // It offers its Workers what arrived, plus a share of its backlog as far as they have room.
  serve: (serve, node, rates, share) => {
    if (share <= 0) return
    const arrived = (rates.task ?? 0) * share
    const room = Math.max(0, serve.solver.drainable(node) - arrived)
    serve.route('task', arrived + Math.min(node.depth / DRAIN_SECONDS, room))
  },
  // The caller waits for the enqueue only. A long backlog slows the broker.
  outcome: (answer, node, kind) => {
    const own = answer.ownHop(kind)
    // With no Worker linked, the task has nowhere to go.
    if (answer.downstream(kind).fail.stranded >= 1) return failed('stranded')
    const enqueued = through({ ...own, fixed: own.fixed + BACKLOG_MS * node.depth })
    // A full Queue refuses what its Workers cannot take (RabbitMQ `reject-publish`).
    if (node.maxLength <= 0 || node.depth < node.maxLength) return enqueued
    const slot = slotOf(answer.pass, node)
    const inflow = answer.pass.arriving[slot]?.task ?? 0
    const drained = answer.pass.drained[slot] ?? 0
    return inflow > 0 ? failSome(enqueued, Math.max(0, 1 - drained / inflow), 'dropped') : enqueued
  },
  connections: noConnections,
  probe: noProbe,
}
