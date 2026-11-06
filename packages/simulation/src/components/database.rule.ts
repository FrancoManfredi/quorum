import { MATERIALIZED_STALE } from '../catalog.ts'
import { NO_FAILURES, answered, failSome, failed, through, type Outcome } from '../distribution.ts'
import { databaseModel } from '../capacity.ts'
import { has, shardingOf, syncStalled } from '../lookups.ts'
import { type ComponentRule, slotOf, terminal } from '../rule-kit.ts'

export const databaseRule: ComponentRule = {
  model: (solver, node, arriving) =>
    databaseModel({ game: solver.game, node, arriving, boost: solver.boost(node) }),
  outcome: (answer, node, kind) => {
    // A full disk: Postgres cannot extend a file, so every write fails.
    if (
      answer.game.incident?.kind === 'disk-full' &&
      answer.game.incident.nodeId === node.id &&
      (kind === 'q-write' || kind === 'q-tx' || kind === 'blob-put')
    )
      return failed('refused')
    // A migration holds the table's lock while it copies it: writes queue and time out
    // (11 "Schema migration lock").
    if (
      answer.game.incident?.kind === 'migration-lock' &&
      answer.game.incident.nodeId === node.id &&
      (kind === 'q-write' || kind === 'q-tx')
    )
      return failed('timeout')
    // A deleted table: every read and write that needs it fails until a restore (11).
    if (
      answer.game.incident?.kind === 'accidental-delete' &&
      answer.game.incident.nodeId === node.id &&
      (kind === 'q-read' || kind === 'q-write' || kind === 'q-tx')
    )
      return failed('refused')
    // A synchronous replica that is down stalls every write the primary takes, because each one
    // waits for it (07 "Read Replica").
    if (
      node.type === 'database' &&
      (kind === 'q-write' || kind === 'q-tx') &&
      syncStalled(answer.game)
    )
      return failed('timeout')
    const pool = answer.pass.connections[slotOf(answer.pass, node)]
    const refused = pool && pool.used > pool.max ? 1 - pool.max / pool.used : 0
    // A report read from a materialized view is as fresh as its last refresh (10 "Performance").
    const staleScan =
      kind === 'q-scan' && node.materialized && has(answer.game, 'precompute')
        ? MATERIALIZED_STALE
        : 0
    const reply: Outcome = {
      ...answered(0, 0),
      success: 1 - refused,
      stale: Math.max(
        node.type === 'replica' && kind === 'q-read' && !node.sync ? answer.pass.staleShare : 0,
        staleScan,
      ),
      fail: { ...NO_FAILURES, refused },
    }
    const own = through(answer.ownHop(kind), [[reply, 1]])
    // A transaction across shards commits on each of them, and any one can fail (07 "Partitioning").
    return kind === 'q-tx' ? failSome(own, shardingOf(node).failure, 'timeout') : own
  },
  ...terminal,
  probe: () => ({ 'q-read': 1 }),
}
