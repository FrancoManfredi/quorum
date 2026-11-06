import { def } from './define.ts'

export const databaseDef = def({
  id: 'database',
  code: 'sql',
  name: 'Database',
  product: 'PostgreSQL or MySQL',
  group: 'data',
  blurb: 'The source of truth. Postgres forks a process per connection; MySQL gives each a thread.',
  cost: 90,
  sized: true,
  latency: 2,
  accepts: ['q-read', 'q-write', 'q-search', 'blob-put', 'q-tx', 'blob-get', 'q-scan', 'k-write'],
  fallback: ['q-search', 'blob-put', 'blob-get', 'q-scan', 'k-write'],
  maxOut: 0,
  limiting: true,
  coldStart: true,
})
