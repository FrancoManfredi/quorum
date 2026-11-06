import { def } from './define.ts'

export const wideDef = def({
  id: 'wide',
  code: 'wide',
  name: 'Wide-column Store',
  product: 'Apache Cassandra',
  group: 'data',
  blurb: 'Replicates each key to N nodes. Reads ask R of them, writes wait for W.',
  cost: 1_200,
  burn: 1.2,
  latency: 3,
  accepts: ['q-read', 'q-write', 'q-tx', 'k-write'],
  maxOut: 0,
  unlock: 'leaderless',
  steps: 6,
  limiting: true,
})
