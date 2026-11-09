import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game } from '../state.ts'
import { RESEARCH } from '../catalog.ts'
import { has, databasesOf } from '../lookups.ts'
import { databaseModel } from '../capacity.ts'
import { warming } from '../life.ts'
import { PROMOTE_DATA_LOSS } from './replica.ts'
import { databaseRule } from './database.rule.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// A Read Replica runs the Database's model and answers only reads.
export const replicaRule: ComponentRule = {
  model: (solver, node, arriving) =>
    databaseModel({
      game: solver.game,
      node,
      arriving,
      boost: solver.boost(node),
      cdcMirrored: solver.cdcMirrored(node),
    }),
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

/**
 * Promotes a Read Replica to the primary (07 "Failover"): the replica becomes a Database, the old
 * primary becomes its replica and is fenced, so writes never split between two primaries. A
 * synchronous replica never lost a write, so nothing is lost; an asynchronous one still held
 * writes in flight, so promotion loses them. The new primary starts cold. Needs one Database.
 */
export const promoteReplica = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'replica') return notAllowed('Only a Read Replica can be promoted.')
    const databases = databasesOf(game)
    if (databases.length !== 1) return notAllowed('Promote needs exactly one Database.')
    const primary = databases[0] as (typeof databases)[number]
    const loss = node.sync ? 0 : PROMOTE_DATA_LOSS
    return ok({
      ...game,
      data: game.data * (1 - loss),
      nodes: game.nodes.map((entry) => {
        if (entry.id === node.id)
          return {
            ...entry,
            type: 'database' as const,
            sync: false,
            topology: 'single' as const,
            life: warming(0),
          }
        if (entry.id === primary.id) return { ...entry, type: 'replica' as const, sync: false }
        return entry
      }),
    })
  })
