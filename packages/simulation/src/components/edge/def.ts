import { def } from '../define.ts'
import { REQUEST_KINDS } from '../../catalog/kinds.ts'

/** Milliseconds an Edge Function adds to a request: it starts in under 5 ms (05 "Stats"). */
export const EDGE_MS = 5

// It runs small handlers in every region's edge, so a user reaches it without a round trip.
export const edgeDef = def({
  id: 'edge',
  code: 'edge',
  name: 'Edge Function',
  product: 'Cloudflare Workers',
  group: 'compute',
  blurb:
    'Runs small handlers next to the user: 5 ms, no cold start, and a CPU ceiling instead of a box.',
  cost: 0,
  latency: EDGE_MS,
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
  unlock: 'edge-compute',
  stack: true,
})
