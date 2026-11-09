import {
  type Action,
  Refusal,
  answering,
  no,
  notAllowed,
  ok,
  patch,
  spend,
  withNode,
} from '../action-kit.ts'
import type { Backup, DbRetention, DbTopology, Game, IopsClass, ShardKey } from '../state.ts'
import {
  MATERIALIZED_STALE,
  RESEARCH,
  RESTORE_DRILL_DH,
  RESTORE_FAILURE,
  SHARD_COUNTS,
  SHARD_KEYS,
  MULTI_CONFLICT,
  DISTRIBUTED_TX_FAILURE,
} from '../catalog.ts'
import { nextRandom } from '../random.ts'
import { answered, failSome, failed, through, type Outcome } from '../distribution.ts'
import { databaseModel } from '../capacity.ts'
import { has, replacePrice, shardingOf, databasesOf, topologyOf, syncStalled } from '../lookups.ts'
import { type ComponentRule, slotOf, terminal } from '../rule-kit.ts'

export const databaseRule: ComponentRule = {
  model: (solver, node, arriving) =>
    databaseModel({
      game: solver.game,
      node,
      arriving,
      boost: solver.boost(node),
      connections: solver.connections(node),
    }),
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
      failRefused: refused,
    }
    const own = through(answer.ownHop(kind), [[reply, 1]])
    // A multi-leader certifies every write against its peers: when two leaders touch the same row
    // at once, the first commit wins and the loser rolls back (07 "Multi-leader").
    if (
      node.type === 'database' &&
      (kind === 'q-write' || kind === 'q-tx' || kind === 'blob-put') &&
      topologyOf(answer.game) === 'multi'
    ) {
      const count = databasesOf(answer.game).length
      if (count > 1) return failSome(own, Math.min(0.5, MULTI_CONFLICT * (count - 1)), 'refused')
    }
    // A transaction across shards commits on each of them, and any one can fail (07 "Partitioning").
    // Physical sharding (07 "Topologies") widens the same count: N Databases are N shards.
    if (kind === 'q-tx') {
      const topology = topologyOf(answer.game)
      const count = databasesOf(answer.game).length
      const logical = shardingOf(node)
      const shards = logical.shards * (topology === 'sharded' ? Math.max(1, count) : 1)
      const key = SHARD_KEYS[node.shardKey]
      const cross = shards > 1 ? key.cross * (1 - 1 / shards) : 0
      const failure = cross * DISTRIBUTED_TX_FAILURE * shards
      return failSome(own, failure, 'timeout')
    }
    return own
  },
  ...terminal,
  probe: () => ({ 'q-read': 1 }),
}

/**
 * Sets a Database's backups. Needs Point-in-time recovery. A backup nobody has restored is
 * untested, so writing one rolls the design's 20% chance that it would not restore; with
 * Restore drills the Company tests every backup as it takes it, so the roll never fails
 * (07 "Backups").
 */
export const setBackup = (game: Game, id: string, backup: Backup): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database keeps backups.')
    if (backup !== 'none' && !has(game, 'pitr'))
      return no(Refusal.Locked({ what: 'Backups', research: RESEARCH.pitr.name }))
    if (node.backup === backup) return ok(game)
    if (backup === 'none') return ok(patch(game, id, { backup, restore: 'ok' }))
    return ok(rollRestore(patch(game, id, { backup }), id))
  })

/**
 * Tests a backup nobody has restored: rolls the design's 20% chance that it would not restore and
 * advances the seed, so the same save always finds the same answer. Restore drills remove the roll.
 */
export const rollRestore = (game: Game, id: string): Game => {
  const [roll, seed] = nextRandom(game.seed)
  const failed = !has(game, 'restore-drills') && roll < RESTORE_FAILURE
  return { ...patch(game, id, { restore: failed ? 'failed' : 'ok' }), seed }
}

/**
 * Runs a restore drill on a Database's backup (07 "Backups"). It costs Dev Hours, and an untested
 * restore fails on the design's 20% until Restore drills; a backup that fails is broken, and the
 * drill writes a new one. With the research the drill always restores.
 */
export const runRestoreDrill = (game: Game, id: string): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database keeps backups.')
    if (node.backup === 'none') return notAllowed('Take a backup before drilling a restore.')
    if (game.devHours < RESTORE_DRILL_DH)
      return notAllowed(`A restore drill needs ${RESTORE_DRILL_DH} Dev Hours.`)
    return ok({ ...rollRestore(game, id), devHours: game.devHours - RESTORE_DRILL_DH })
  })

/**
 * Turns a Database's materialized view on or off (Materialized views): a report scans the stored
 * view for half the CPU, and the figures are as old as its refresh.
 */
export const setMaterialized = (game: Game, id: string, materialized: boolean): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database holds a materialized view.')
    if (materialized && !has(game, 'precompute'))
      return no(Refusal.Locked({ what: 'A view', research: RESEARCH.precompute.name }))
    return ok(node.materialized === materialized ? game : patch(game, id, { materialized }))
  })

/** Picks the volume a Database's reads and writes wait on (07 "Capacity"). Needs no research. */
export const setStorageIops = (game: Game, id: string, iops: IopsClass): Action =>
  withNode(game, id, (node) =>
    node.type === 'database'
      ? ok(node.iops === iops ? game : patch(game, id, { iops }))
      : notAllowed('Only a Database has a volume.'),
  )

/**
 * Splits a Database into shards (07 "Partitioning"). Needs Sharding. Each shard is another copy of
 * the Database, and the writes divide across them.
 */
export const setShards = (game: Game, id: string, shards: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database shards.')
    if (!(SHARD_COUNTS as ReadonlyArray<number>).includes(shards))
      return notAllowed(`Shard counts are ${SHARD_COUNTS.join(', ')}.`)
    if (shards > 1 && !has(game, 'sharding'))
      return no(Refusal.Locked({ what: 'Sharding', research: RESEARCH.sharding.name }))
    return ok(node.shards === shards ? game : patch(game, id, { shards }))
  })

/**
 * Picks the key a Database shards on (07 "Partitioning"). It moves the data, so a Company changes
 * it through `queueReshard`; this is the Sandbox's and a replay's instant change.
 */
export const setShardKey = (game: Game, id: string, shardKey: ShardKey): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database shards.')
    if (SHARD_KEYS[shardKey] === undefined)
      return notAllowed(`Shard keys are ${Object.keys(SHARD_KEYS).join(', ')}.`)
    return ok(node.shardKey === shardKey ? game : patch(game, id, { shardKey }))
  })

/**
 * What a Database does with rows past its window (07 "Data volume"). Needs Retention policies.
 * Keeping everything is the default, so it needs nothing.
 */
export const setDbRetention = (game: Game, id: string, keep: DbRetention): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database keeps rows.')
    if (keep !== 'keep' && !has(game, 'retention'))
      return no(Refusal.Locked({ what: 'Retention', research: RESEARCH.retention.name }))
    return ok(node.keep === keep ? game : patch(game, id, { keep }))
  })

/**
 * Picks how more than one Database holds the rows (07 "Topologies"). One choice for every
 * Database: `single` is one primary with Read Replicas, `sharded` splits the rows across them,
 * `multi` copies every row to every Database and lets each take writes.
 */
export const setTopology = (game: Game, id: string, topology: DbTopology): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'database') return notAllowed('Only a Database picks a topology.')
    return ok({
      ...game,
      nodes: game.nodes.map((entry) =>
        entry.type === 'database' ? { ...entry, topology } : entry,
      ),
    })
  })

/** Expands a full Database volume: writes come back. Costs what a replacement would. */
export const expandVolume = (game: Game): Action => {
  const target = game.nodes.find((node) => node.id === game.incident?.nodeId)
  if (game.incident?.kind !== 'disk-full' || !target) return notAllowed('No disk is full.')
  return spend(game, replacePrice(game, target), 'A bigger volume', (paid) =>
    paid.incident
      ? { ...paid, incident: { ...answering(paid, paid.incident), remaining: 0 } }
      : paid,
  )
}
