import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

/** Milliseconds an invocation spends on its own bookkeeping before its code runs.  */
export const SERVERLESS_MS = 1

// It runs the Service's code per request and owns no box: idle costs nothing, a use bills
// (09 "The cloud bill"), and an environment that went away starts cold.
export const fnDef = def({
  id: 'fn',
  code: 'fn',
  name: 'Serverless Function',
  product: 'AWS Lambda',
  group: 'compute',
  blurb:
    'Runs your code per request with no box to pay for: nothing while it idles, a cold start when it has, and 1,000 executions at once.',
  cost: 0,
  latency: SERVERLESS_MS,
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
  unlock: 'serverless',
  stack: true,
  limiting: true,
  coldStart: true,
})
