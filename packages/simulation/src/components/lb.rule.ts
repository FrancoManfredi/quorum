import { L4_CAPACITY, L4_MS, P2C_CAPACITY } from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import {
  type ComponentRule,
  flatCapacity,
  noConnections,
  noProbe,
  passOn,
  relay,
} from '../rule-kit.ts'

export const lbRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      flatCapacity(node) *
        (node.variant === 'l4' ? L4_CAPACITY : 1) *
        (node.policy === 'p2c' && has(solver.game, 'lb-algorithms') ? P2C_CAPACITY : 1),
      arriving,
      // An L4 forwards TCP: no HTTP parsing, so a fifth of the hop (05 "Load Balancer").
      { fixed: node.variant === 'l4' ? L4_MS : 1, variable: 0.1 },
      solver.boost(node),
    ),
  serve: passOn,
  outcome: relay,
  connections: noConnections,
  probe: noProbe,
}
