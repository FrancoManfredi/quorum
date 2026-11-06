import { databaseModel } from '../capacity.ts'
import { databaseRule } from './database.rule.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A Read Replica runs the Database's model and answers only reads.
export const replicaRule: ComponentRule = {
  model: (solver, node, arriving) =>
    databaseModel({ game: solver.game, node, arriving, boost: solver.boost(node) }),
  outcome: (answer, node, kind) => databaseRule.outcome(answer, node, kind),
  ...terminal,
  probe: () => ({ 'q-read': 1 }),
}
