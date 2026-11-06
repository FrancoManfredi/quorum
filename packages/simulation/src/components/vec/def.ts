import { def } from '../define.ts'

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
  accepts: ['q-search'],
  maxOut: 0,
  unlock: 'embeddings',
  steps: 6,
  limiting: true,
  coldStart: true,
})
