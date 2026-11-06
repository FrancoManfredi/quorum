import type { GameNode } from '../state.ts'
import {
  GATEWAY_AUTH_MS,
  COALESCE_KINDS,
  COALESCE_HOT,
  COALESCE_WINDOW,
  type Kind,
  type RequestKind,
} from '../catalog.ts'
import { failSome } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import {
  type ComponentRule,
  each,
  flatCapacity,
  gatewayShare,
  noConnections,
  noProbe,
  relay,
  slotOf,
} from '../rule-kit.ts'

/**
 * Share of a read kind's requests a Gateway merges into one already in flight (05 "Request
 * coalescing"): the popular reads that overlap, which grows with the rate.
 */
const merged = (node: GameNode, kind: Kind, rate: number): number => {
  if (!node.merge || !COALESCE_KINDS.includes(kind as RequestKind)) return 0
  const overlap = rate * COALESCE_WINDOW
  return (COALESCE_HOT * overlap) / (1 + overlap)
}

// A Gateway relays every kind, and past its rate limit it answers throttled instead (05).
export const gwRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      flatCapacity(node),
      arriving,
      { fixed: 6 + (node.authEdge ? GATEWAY_AUTH_MS : 0), variable: 0.1 },
      solver.boost(node),
    ),
  serve: (serve, node, rates, share) => {
    const kept = gatewayShare(node, rates)
    each(rates, share, (kind, processed) =>
      serve.route(kind, processed * kept * (1 - merged(node, kind, processed * kept))),
    )
  },
  outcome: (answer, node, kind) =>
    failSome(
      relay(answer, node, kind),
      1 - gatewayShare(node, answer.pass.arriving[slotOf(answer.pass, node)] ?? {}),
      'throttled',
    ),
  connections: noConnections,
  probe: noProbe,
}
