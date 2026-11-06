import { def } from '../define.ts'

export const searchDef = def({
  id: 'search',
  code: 'fts',
  name: 'Search Engine',
  product: 'Elasticsearch',
  group: 'data',
  blurb: 'Answers search queries. 400 per second per size step.',
  cost: 300,
  burn: 0.25,
  latency: 15,
  accepts: ['q-search'],
  maxOut: 0,
  unlock: 'full-text-search',
  steps: 8,
  limiting: true,
})
