import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

export const clusterRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixedMs: 0, variableMs: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}
