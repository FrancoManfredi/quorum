import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Milliseconds every write waits for a synchronous replica in the same zone. */
export const SYNC_MS = 2
/** Calendar minutes a new Read Replica copies per GB before it serves, and the least it takes. */
export const REPLICA_SYNC_MINUTES_PER_GB = 0.5
/** Share of rows an asynchronous promotion loses: writes still in flight never shipped (07 "Failover"). */
export const PROMOTE_DATA_LOSS = 0.02

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const replicaGlossary: ReadonlyArray<string> = [
  'eventual-consistency',
  'read-replica',
  'read-your-writes-consistency',
  'replication-lag',
]

/** The saved properties of a replica Node, with the defaults an old save decodes to. */
export const replicaFields = {
  /** A Read Replica every write waits for (07 "Read Replica"). */
  sync: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const replicaDef = def({
  id: 'replica',
  code: 'rep',
  name: 'Read Replica',
  product: 'PostgreSQL or MySQL replica',
  group: 'data',
  blurb: 'Answers reads from a copy. Lags behind writes, so some API reads come back stale.',
  cost: 160,
  sized: true,
  latency: 2,
  accepts: ['q-read'],
  maxOut: 0,
  unlock: 'replication',
  limiting: true,
  coldStart: true,
})
