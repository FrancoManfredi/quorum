import { through } from '../distribution.ts'
import { type ComponentRule, terminal, unlimited } from '../rule-kit.ts'

// Columnar scans: slow, unlimited, and paid per scan.
export const warehouseRule: ComponentRule = {
  model: unlimited(1_500, 200),
  outcome: (answer, _, kind) => through(answer.ownHop(kind)),
  ...terminal,
}
