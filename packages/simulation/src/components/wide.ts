import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * Wide-column Store (07 "Wide-column Store"): replica operations per second at size 1 (three
 * nodes at 10,000 each). A write costs N of them, a read R. The replication settings it offers.
 */
export const WIDE_OPS = 30_000
export const QUORUM_N = [1, 2, 3, 4, 5] as const
/** Share of a weak-quorum store's reads that miss the latest write, per unit of write share.  */
export const WIDE_STALE = 0.5
/** Overlap is not linearizability: checkouts on a quorum store still see these (07).  */
export const WIDE_TX_STALE = 0.02
export const WIDE_TX_DUPLICATE = 0.01

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const wideGlossary: ReadonlyArray<string> = [
  'consistent-hashing',
  'eventual-consistency',
  'hedged-request',
  'hot-key',
  'leaderless-replication',
  'quorum',
  'tail-at-scale',
]

/** The saved properties of a wide Node, with the defaults an old save decodes to. */
export const wideFields = {
  r: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  w: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(1))),
  /** Sim seconds one of its replicas stays lost (a Wide-column Store keeps serving). */
  lost: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

export const wideDef = def({
  id: 'wide',
  code: 'wide',
  name: 'Wide-column Store',
  product: 'Apache Cassandra',
  group: 'data',
  blurb: 'Replicates each key to N nodes. Reads ask R of them, writes wait for W.',
  cost: 1_200,
  burn: 1.2,
  latency: 3,
  accepts: ['q-read', 'q-write', 'q-tx', 'k-write'],
  maxOut: 0,
  unlock: 'leaderless',
  steps: 6,
  limiting: true,
})
