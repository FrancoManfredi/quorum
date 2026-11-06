import { def } from './define.ts'

export const replicaDef = def({
  id: 'replica',
  code: 'rep',
  name: 'Read Replica',
  product: 'PostgreSQL replica',
  group: 'data',
  blurb: 'Answers reads. Lags behind writes, so some API reads come back stale.',
  cost: 160,
  sized: true,
  latency: 2,
  accepts: ['q-read'],
  maxOut: 0,
  unlock: 'replication',
  limiting: true,
  coldStart: true,
})
