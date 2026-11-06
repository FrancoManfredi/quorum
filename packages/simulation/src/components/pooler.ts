import { Effect, Schema } from 'effect'
import { def } from './define.ts'

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
  blurb: 'Many app connections share 20 database connections.',
  cost: 80,
  burn: 0.03,
  latency: 0.3,
  accepts: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan', 'k-write'],
  unlock: 'pooling',
  steps: 4,
  sends: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  limiting: true,
})
