import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// Feature Flags carry nothing either: what they change is how far a bad deploy reaches, which
// `badDeployShare` reads from the Design (05 "Feature Flags", 08 "Rollout").
export const ffRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}
