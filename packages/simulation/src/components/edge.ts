import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'
import type { LanguageId } from '../catalog/runtimes.ts'

/**
 * An Edge Function's bill (05 "Edge Function": Burn "Per request"): dollars per request × cost
 * index, on the Requests line. Cloudflare Workers list $0.30 per million requests, multiplied by
 * 1,200 like Lambda's, so a request served at the edge costs about what one served by a function
 * does, without the GB-seconds.
 */
export const EDGE_REQUEST_PRICE = 0.00036
/**
 * CPU milliseconds one request may spend at the edge before it fails as `timeout` (05 "Edge
 * Function": "CPU-heavy kinds fail as `timeout`"). Cloudflare's free plan gives 10 ms a request.
 */
export const EDGE_CPU_MS = 10
/** MB one edge isolate holds: the small memory ceiling a handler runs in (Cloudflare Workers). */
export const EDGE_MEMORY_MB = 128
/**
 * Languages that run at the edge (05 "Edge Function"): JavaScript and TypeScript, and Rust and Go
 * compiled to WebAssembly. A Stack in any other language is refused there.
 */
export const EDGE_LANGUAGES: ReadonlyArray<LanguageId> = ['node', 'rust', 'go']
/** Share of `read` a CDN answers from the edge key-value cache an Edge Function holds (05 "CDN"). */
export const EDGE_READ_HIT = 0.3

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
  accepts: REQUEST_KINDS.filter((kind) => kind !== 'rt'),
  sends: [
    'q-read',
    'q-write',
    'auth',
    'q-search',
    'q-vector',
    'blob-put',
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
