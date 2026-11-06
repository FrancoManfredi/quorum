import { def } from '../define.ts'
import { REQUEST_KINDS } from '../../catalog/kinds.ts'

export const serverDef = def({
  id: 'server',
  code: 'app',
  name: 'App Server',
  product: 'VM',
  group: 'compute',
  blurb: 'Runs your code. Answers requests and sends queries to the database.',
  cost: 60,
  sized: true,
  latency: 2,
  accepts: REQUEST_KINDS,
  sends: [
    'q-read',
    'q-write',
    'auth',
    'q-search',
    'blob-put',
    'task',
    'blob-get',
    'q-tx',
    'charge',
    'q-scan',
    'infer',
    'notify',
    'callout',
    'k-write',
  ],
  stack: true,
  limiting: true,
  coldStart: true,
})
