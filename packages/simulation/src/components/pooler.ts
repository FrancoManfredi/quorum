import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const poolerGlossary: ReadonlyArray<string> = ['connection-pooling']

export const PoolerMode = Schema.Literals(['session', 'transaction', 'statement'])
export type PoolerMode = typeof PoolerMode.Type

/** The saved properties of a pooler Node, with the defaults an old save decodes to. */
export const poolerFields = {
  /** The Connection Pooler's mode. Saves from before modes pooled by transaction. */
  mode: PoolerMode.pipe(Schema.withDecodingDefaultKey(Effect.succeed('transaction' as const))),
} as const

export const poolerDef = def({
  id: 'pooler',
  code: 'pool',
  name: 'Connection Pooler',
  product: 'PgBouncer',
  group: 'data',
  blurb: 'Many app connections share 20 database connections. It pools to one host.',
  cost: 80,
  burn: 0.03,
  latency: 0.3,
  accepts: ['q-read', 'q-write', 'q-tx'],
  fallback: [],
  unlock: 'pooling',
  steps: 4,
  sends: ['q-read', 'q-write', 'q-tx'],
  // It pools to one host and reads no SQL: a Load Balancer after it spreads the reads.
  maxOut: 1,
  limiting: true,
})
