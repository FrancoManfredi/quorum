import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game } from '../state.ts'
import { RESEARCH } from '../catalog.ts'
import { has } from '../lookups.ts'
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

/**
 * Makes a Read Replica synchronous (07 "Read Replica"): every write waits for it, and it serves no
 * stale read. Needs Synchronous replication.
 */
export const setSync = (game: Game, id: string, sync: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'replica') return notAllowed('Only a Read Replica replicates synchronously.')
    if (sync && !has(game, 'sync-replication'))
      return no(
        Refusal.Locked({
          what: 'Synchronous replication',
          research: RESEARCH['sync-replication'].name,
        }),
      )
    return ok(node.sync === sync ? game : patch(game, id, { sync }))
  })
