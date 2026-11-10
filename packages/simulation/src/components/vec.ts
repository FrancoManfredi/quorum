import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Nearest-neighbour queries one Vector Index answers a second at size 1 (05 "Stats": 500). */
export const VEC_QUERIES = 500
/**
 * Index types (07 "Vector Index"). Exact compares the query to every vector: perfect recall, and
 * slow once the index outgrows a scan. HNSW walks a graph instead: twice the queries, twice the
 * memory in Burn, and 95% recall. The 95% is the design's; the capacity and the Burn multiple
 * are 2 and 2.
 */
export const VEC_INDEXES = {
  exact: { name: 'Exact', recall: 1, queries: 1, burn: 1 },
  hnsw: { name: 'HNSW', recall: 0.95, queries: 2, burn: 2 },
} as const
/**
 * `ai` value with the company's own documents behind the answer (07 "Vector Index": "answers use
 * the company's own data").  An
 * approximate index takes its recall's share of the lift.
 */
export const VEC_AI_LIFT = 1.35

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const vecGlossary: ReadonlyArray<string> = ['model-inference']

/** A Vector Index's type (07 "Vector Index"): exact, or approximate HNSW. */
export const VecIndexType = Schema.Literals(['exact', 'hnsw'])
export type VecIndexType = typeof VecIndexType.Type

/** The saved properties of a vec Node, with the defaults an old save decodes to. */
export const vecFields = {
  /** A Vector Index's type: exact, or approximate HNSW (07 "Vector Index"). */
  indexType: VecIndexType.pipe(Schema.withDecodingDefaultKey(Effect.succeed('exact' as const))),
} as const

// It holds the embeddings a prompt retrieves from: nearest-neighbour reads, and an index that
// lives in memory (07 "Vector Index").
export const vecDef = def({
  id: 'vec',
  code: 'vec',
  name: 'Vector Index',
  product: 'pgvector, Pinecone, Qdrant',
  group: 'data',
  blurb:
    'Answers nearest-neighbour lookups over your embeddings. It holds the index in memory, and a prompt that reaches it earns more.',
  cost: 400,
  burn: 0.3,
  latency: 20,
  accepts: ['q-vector'],
  maxOut: 0,
  unlock: 'embeddings',
  steps: 6,
  limiting: true,
  coldStart: true,
})
