import { def } from './define.ts'

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
