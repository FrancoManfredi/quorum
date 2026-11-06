import { through } from '../distribution.ts'
import { type ComponentRule, terminal, unlimited } from '../rule-kit.ts'

export const authRule: ComponentRule = {
  model: unlimited(120, 15),
  outcome: (answer, _, kind) => through(answer.ownHop(kind)),
  ...terminal,
}
