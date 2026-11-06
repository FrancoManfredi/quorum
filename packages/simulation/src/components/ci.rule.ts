import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// The Pipeline ships deploys and carries no traffic: nothing routes into it.
export const ciRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}
