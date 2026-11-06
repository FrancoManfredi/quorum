import { PSP_CAPACITY, SLOW_CHARGE_MS } from '../catalog.ts'
import { failed, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A Managed Component: 400 ms per charge, and its own outages.
export const pspRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      PSP_CAPACITY * flatScale(node),
      arriving,
      {
        fixed: 400,
        variable: 30 + (solver.game.incident?.kind === 'double-charge' ? SLOW_CHARGE_MS : 0),
      },
      solver.boost(node),
    ),
  outcome: (answer, node, kind) =>
    answer.game.incident?.kind === 'psp-outage' && node.provider === 'first'
      ? failed('upstream')
      : through(answer.ownHop(kind)),
  ...terminal,
}
