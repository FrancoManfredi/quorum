import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'
import type { RequestKind } from '../catalog/kinds.ts'

/**
 * API Gateway (05 "API Gateway"): dollars per request served, × cost index. Its Burn is on the
 * Cost panel's Requests line, beside the functions'.
 */
export const GATEWAY_PRICE = 0.002
/** Rate limits a Gateway offers, in requests per second; 0 is no limit at all. */
export const GATEWAY_LIMITS = [0, 100, 500, 1_000, 2_500, 5_000] as const
/**
 * Requests a Gateway's token bucket holds on top of its rate limit, once Rate limiting is
 * researched (10 "Track: Infrastructure"). A burst up to this many requests passes whole and the
 * long-run average holds; the design gives the mechanism and no size, so 200 is proposed.
 */
export const GATEWAY_BURST = 200
export const GATEWAY_AUTH_MS = 2
/**
 * Request coalescing (05 "API Gateway"): a Gateway merges identical reads that are in flight at
 * once. `COALESCE_HOT` of a read kind's requests ask for a few popular objects, and `COALESCE_WINDOW`
 * seconds is how long a read stays in flight, so at a rate of λ the share of the hot ones that
 * find an identical read in flight is λw / (1 + λw): spikes merge more.
 */
export const COALESCE_KINDS: ReadonlyArray<RequestKind> = ['page', 'read', 'feed', 'search']
export const COALESCE_HOT = 0.3
export const COALESCE_WINDOW = 0.05

/** The saved properties of a gw Node, with the defaults an old save decodes to. */
export const gwFields = {
  /** A Gateway validates each request's token once, so the services behind it skip it (05 "API Gateway"). */
  authEdge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Gateway merges identical reads that are in flight at once (05 "API Gateway"). */
  merge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Requests a Gateway's token bucket holds on top of its limit; 0 is a flat cap (05). */
  burst: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
  /** Requests per second an API Gateway lets through; 0 is no limit (05 "API Gateway"). */
  rateLimit: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

export const gwDef = def({
  id: 'gw',
  code: 'gw',
  name: 'API Gateway',
  product: 'Kong',
  group: 'edge',
  blurb:
    'Rate-limits and routes API calls. Past its rate limit, requests fail as throttled, and it bills per request.',
  cost: 300,
  latency: 6,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'api-gateway',
  limiting: true,
})
