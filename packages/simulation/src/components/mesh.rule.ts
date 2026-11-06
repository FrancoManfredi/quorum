import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A mesh carries nothing: it puts a sidecar beside each App Server and Worker that links into it,
// and the solve reads that from the Design (05 "Service Mesh").
export const meshRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}
