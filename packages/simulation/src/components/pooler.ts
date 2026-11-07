import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { DATA_KINDS } from '../catalog/kinds.ts'

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
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
  accepts: DATA_KINDS,
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan', 'k-write'],
  unlock: 'pooling',
  steps: 4,
  sends: DATA_KINDS,
  // It pools to one host and reads no SQL: a Load Balancer after it spreads the reads.
  maxOut: 1,
  limiting: true,
})
