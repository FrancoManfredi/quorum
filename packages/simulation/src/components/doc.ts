import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * Ops a Document Store answers a second at size 1 (05 "Stats": 3,000). It has no buffer cache,
 * no IOPS volume and no connection limit: one flat rate covers reads and writes, which is the
 * shape that differs from a relational table (07 "Document Store").
 */
export const DOC_OPS = 3_000
/**
 * Ops one join costs it: a checkout spread over several documents, or a report scanning the whole
 * collection (07 "Document Store": "`report` and `q-tx` across documents cost 3×").
 */
export const DOC_JOIN_COST = 3
/** Milliseconds one op takes the store's own server.  */
export const DOC_OP_MS = 1
/** Multi-document transactions add this share to a write's latency (07 "Document Store": +50%). */
export const DOC_TXN_LATENCY = 0.5
/**
 * Share of checkouts that land half-applied without multi-document transactions, so a retry
 * charges again: the atomicity the option buys back (07 "Document Store").
 */
export const DOC_PARTIAL = 0.02
/**
 * Dev Hours every Feature pays on a Design with a Document Store (07 "Document Store"): no joins
 * means each new access pattern is its own collection and index to write and read, so it costs
 * this multiple of a Feature's hours.
 */
export const DOC_PATTERN_FACTOR = 1.1
/** A Feature that changes the data shape costs this share of its Dev Hours there (07: −25%). */
export const DOC_SHAPE_DH = 0.75

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const docGlossary: ReadonlyArray<string> = ['hot-key', 'sharding']

/** The saved properties of a doc Node, with the defaults an old save decodes to. */
export const docFields = {
  /** A Document Store runs multi-document transactions: atomic checkouts, and slower writes (07). */
  transactions: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

// It holds documents, not rows: no joins and no connection limit, one flat rate of reads and
// writes, and every query pattern is its own collection and index (07 "Document Store").
export const docDef = def({
  id: 'doc',
  code: 'doc',
  name: 'Document Store',
  product: 'MongoDB, Firestore',
  group: 'data',
  blurb:
    'Holds documents instead of rows. No joins and no connections to pool: one flat rate of reads and writes, and each query needs its own index.',
  cost: 260,
  burn: 0.2,
  latency: 3,
  accepts: ['q-read', 'q-write', 'q-tx', 'q-scan'],
  fallback: ['q-scan'],
  maxOut: 0,
  unlock: 'document-db',
  steps: 8,
  limiting: true,
  coldStart: true,
})
