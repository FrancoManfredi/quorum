import { MSGP_RATE } from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { through } from '../distribution.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A Managed Component: 10,000 messages a second, paid per message.
export const msgpRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      MSGP_RATE * flatScale(node),
      arriving,
      { fixedMs: 100, variableMs: 10 },
      solver.boost(node),
    ),
  outcome: (answer, _, kind) => through(answer.ownHop(kind)),
  ...terminal,
}
