import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// So do Secrets and Certificates: the Step renews the certificate while one is live, and lets it
// run out when none is (05 "Secrets and Certificates").
export const pkiRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixedMs: 0, variableMs: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}
