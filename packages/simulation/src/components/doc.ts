import { def } from './define.ts'

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
