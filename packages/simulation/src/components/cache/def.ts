import { def } from '../define.ts'

export const cacheDef = def({
  id: 'cache',
  code: 'kv',
  name: 'Cache',
  product: 'Redis',
  group: 'data',
  blurb:
    'Answers read queries from memory while the hot data fits. Writes pass through and invalidate.',
  cost: 150,
  burn: 0.06,
  latency: 0.5,
  accepts: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan'],
  unlock: 'caching',
  steps: 8,
  sends: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  limiting: true,
  coldStart: true,
})
