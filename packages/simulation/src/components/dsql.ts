import { def } from './define.ts'

/** Distributed SQL: transactions per second at size 1 (three nodes at 2,000), and what a read costs of one. */
export const DSQL_TX = 6_000
export const DSQL_READ_COST = 0.25

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const dsqlGlossary: ReadonlyArray<string> = ['quorum', 'raft', 'synchronous-replication']

export const dsqlDef = def({
  id: 'dsql',
  code: 'dsql',
  name: 'Distributed SQL',
  product: 'CockroachDB',
  group: 'data',
  blurb: 'SQL on Raft. Every write waits for a majority of its replicas.',
  cost: 2_500,
  burn: 1.95,
  latency: 3,
  accepts: ['q-read', 'q-write', 'q-tx'],
  maxOut: 0,
  unlock: 'consensus',
  steps: 6,
  limiting: true,
})
