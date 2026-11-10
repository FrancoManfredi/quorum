import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { MAX_CONNECTIONS } from '../catalog/instances.ts'

/**
 * Relational database engines (07 "Variants"). Each is a different shape of the same work, not a
 * better or worse number.
 *
 * - Postgres forks a process per connection, so it meets `max_connections` (100) early and each
 *   backend holds its own memory. Its planner and MVCC make reads and scans cheaper, and its
 *   full-text search is the stronger one. Those same row versions leave dead tuples for VACUUM, it
 *   takes a table lock for many schema changes, and its streaming replication applies behind writes.
 * - MySQL gives each connection a thread, so one box holds more of them with less memory. InnoDB's
 *   write path is cheaper, and online DDL avoids most migration locks. Reads and scans cost more,
 *   full-text search costs twice the CPU, and row-based replication keeps replicas closer.
 *
 * The multipliers are against the model's reference cost. `connectionMB` is the memory one server
 * connection holds, and `lag` scales how far writes leave a replica behind.
 */
export const DB_ENGINES = {
  postgres: {
    name: 'PostgreSQL',
    connections: MAX_CONNECTIONS,
    connectionMB: 8,
    read: 0.95,
    write: 1.15,
    scan: 0.9,
    searchCost: 1,
    migration: 1.25,
    lag: 1,
    bloat: true,
  },
  mysql: {
    name: 'MySQL',
    connections: 500,
    connectionMB: 1,
    read: 1.05,
    write: 0.85,
    scan: 1.1,
    searchCost: 2,
    migration: 0.75,
    lag: 0.8,
    bloat: false,
  },
} as const

/**
 * IOPS a Database's volume answers (07 "Capacity"): a read that misses the buffer cache and every
 * write goes to disk, and waits on it. A general purpose volume answers 3,000; a provisioned one
 * up to 64,000. Provisioned storage bills this multiple of the box's Burn: the
 * design says "at higher cost" and gives no rate.
 */
export const STORAGE_IOPS = {
  general: { name: 'General purpose', iops: 3_000, burn: 1 },
  provisioned: { name: 'Provisioned IOPS', iops: 64_000, burn: 1.5 },
} as const

/** Shard counts a Database splits into (07 "Partitioning"): writes scale with them.  */
export const SHARD_COUNTS = [1, 2, 4, 8] as const

/**
 * Retention policies (07 "Data volume", "Relational database"): what a Database does with rows
 * older than its window. Keep everything bills every GB and answers a report from the table;
 * archive moves old rows to cheap storage and a report waits on the restore; delete drops them,
 * so a report rebuilds its figures from the event log at three times the scan. The 30-day window
 * and the three prices are proposed: the design names the trade and gives no numbers.
 */
export const DB_RETENTIONS = {
  keep: { name: 'Keep everything', days: 0, price: 1, scanMs: 0, rebuild: 1 },
  archive: {
    name: 'Archive after 30 d',
    days: 30,
    price: 0.1,
    scanMs: 200,
    rebuild: 1,
  },
  delete: {
    name: 'Delete after 30 d',
    days: 30,
    price: 0,
    scanMs: 0,
    rebuild: 3,
  },
} as const
/** KB one row costs the Database: the row, its indexes, and its share of the WAL.  */
export const ROW_KB = 10
/**
 * How much dearer a Database's GB are than Object Storage's, per GB per second: gp3 is $0.08 per
 * GB-month and S3 Standard $0.023, so about 3.5×.
 */
export const DB_STORAGE_MULT = 3.5

/** Share of backups an untested restore fails (07 "Backups"): the design's own 20%. */
export const RESTORE_FAILURE = 0.2
/** Dev Hours a manual restore drill costs: a half day of an engineer.  */
export const RESTORE_DRILL_DH = 4
/** Milliseconds one disk operation takes on a volume, before it queues: 1,000 / its IOPS. */
export const diskMs = (volume: keyof typeof STORAGE_IOPS): number =>
  1_000 / STORAGE_IOPS[volume].iops
/** Share of a report's scan CPU a materialized view saves (10 "Track: Performance": 50%). */
export const MATERIALIZED_SCAN = 0.5
/** Share of report answers a materialized view serves before its next refresh. */
export const MATERIALIZED_STALE = 0.05
/** Denormalization's CPU multipliers (10 "Track: Performance": read −30%, write +20%). */
export const DENORMALIZED_READ = 0.7
export const DENORMALIZED_WRITE = 1.2

/** Backups (07 "Backups"): RPO in calendar minutes, and Burn on top of the Database's. Costs proposed. */
export const BACKUPS = {
  none: { name: 'None', rpo: Number.POSITIVE_INFINITY, burn: 0 },
  nightly: { name: 'Nightly', rpo: 1_440, burn: 0.05 },
  pitr: { name: 'PITR', rpo: 2, burn: 0.15 },
} as const

/**
 * The shard keys. `hot` is the share of the load one key puts on its busiest shard before the
 * even split: a range key sends new users to the last shard, a tenant key sends the big tenant to
 * one. `cross` is the share of transactions that span shards, as a multiple of the chance two
 * random keys differ. `farMs` is the round trip a user in another region pays.
 */
export const SHARD_KEYS = {
  hash: { name: 'Hash of user ID', hot: 0, cross: 1, farMs: 0 },
  range: { name: 'Range of IDs', hot: 0.5, cross: 1, farMs: 0 },
  tenant: { name: 'By tenant', hot: 0.3, cross: 0.1, farMs: 0 },
  region: { name: 'By region', hot: 0, cross: 0.2, farMs: 70 },
} as const
/** A report or a search touches every shard: each shard past the first adds this share of the CPU, and this many ms. */
export const SCATTER_CPU = 0.15
export const SCATTER_MS = 2
/** Chance a distributed transaction fails on one shard that takes part in it. */
export const DISTRIBUTED_TX_FAILURE = 0.005
/** Dev Hours to change a Database's shard count or key, and the share of its IOPS the copy leaves. */
export const RESHARD_DH = 24
export const RESHARD_IOPS = 0.5
/** Calendar minutes the data copy of a resharding takes per GB, at least a calendar day. */
export const RESHARD_MINUTES_PER_GB = 1

/**
 * What a schema-change tool adds to the Dev Hours of a Feature that adds a query shape on a
 * relational Database (07 \"Schema migrations\"): online migrations 10%, expand and contract 25%.
 */
export const ONLINE_MIGRATION_DH = 1.1
export const EXPAND_CONTRACT_DH = 1.25
/** Share of a write's CPU each index adds (07 "Indexes"). */
export const INDEX_WRITE_COST = 0.05
/**
 * Calendar minutes a restore takes per GB of rows, and the least it takes; a point-in-time
 * restore replays the log on top of a snapshot, so it reads twice the GB.
 */
export const RESTORE_MINUTES_PER_GB = 0.5
export const RESTORE_MIN_MINUTES = 5
/** Sim seconds a schema migration's lock holds per GB of rows, on top of its base, and its most. */
export const MIGRATION_LOCK_PER_GB = 0.1

/** The volume a Database's reads and writes wait on (07 "Capacity"). */
export const IopsClass = Schema.Literals(['general', 'provisioned'])
export type IopsClass = typeof IopsClass.Type

/** What a Database does with rows older than its window (07 "Data volume"). */
export const DbRetention = Schema.Literals(['keep', 'archive', 'delete'])
export type DbRetention = typeof DbRetention.Type

/** The key a Database shards on (07 "Partitioning"). */
export const ShardKey = Schema.Literals(['hash', 'range', 'tenant', 'region'])
export type ShardKey = typeof ShardKey.Type

/**
 * How more than one Database holds the rows (07 "Topologies").
 *
 * - `single`: one primary, Read Replicas for reads. A second Database is not a follower.
 * - `sharded`: each Database holds its partition of the rows. A report or search reads them all.
 * - `multi`: each Database holds every row and takes writes. Certification drops conflicting writes.
 */
export const DbTopology = Schema.Literals(['single', 'sharded', 'multi'])
export type DbTopology = typeof DbTopology.Type

/** Write CPU a multi-leader replica set pays to replicate each write (07 "Multi-leader"). */
export const MULTI_WRITE_CPU = 1.25
/** Share of concurrent multi-leader writes that certify against each other (07 "Multi-leader"). */
export const MULTI_CONFLICT = 0.02

/** The saved properties of a database Node, with the defaults an old save decodes to. */
export const databaseFields = {
  /** The key a Database shards on (07 "Partitioning"). */
  shardKey: ShardKey.pipe(Schema.withDecodingDefaultKey(Effect.succeed('hash' as const))),
  /** The Database's volume (07 "Capacity"): general purpose, or provisioned for more IOPS. */
  iops: IopsClass.pipe(Schema.withDecodingDefaultKey(Effect.succeed('general' as const))),
  /** Shards the Database splits into (07 "Partitioning"): writes scale with them. */
  shards: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** What a Database does with rows past its window (07 "Data volume"). */
  keep: DbRetention.pipe(Schema.withDecodingDefaultKey(Effect.succeed('keep' as const))),
  /** A Database answers reports from a stored view, at half the scan CPU (Materialized views). */
  materialized: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** How more than one Database holds the rows (07 "Topologies"). */
  topology: DbTopology.pipe(Schema.withDecodingDefaultKey(Effect.succeed('single' as const))),
} as const

export const databaseDef = def({
  id: 'database',
  code: 'sql',
  name: 'Database',
  product: 'PostgreSQL or MySQL',
  group: 'data',
  blurb:
    'The relational source of truth. A Read Replica copies it and takes no writes. A bigger size restarts it. Postgres reads and scans cheaper; MySQL writes cheaper and changes schema online.',
  cost: 90,
  sized: true,
  latency: 2,
  accepts: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan', 'k-write'],
  maxOut: 0,
  limiting: true,
  coldStart: true,
})
