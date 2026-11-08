import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'
import type { Kind } from '../catalog/kinds.ts'

/** A CDN's hit ratio per kind at the default TTL (05 "CDN"): 70% of pages, 75% of video. */
export const CDN_HIT: Partial<Record<Kind, number>> = { page: 0.7, media: 0.75 }
/** With Tiered caching, a CDN answers this share of video. */
export const TIERED_MEDIA_HIT = 0.92
/** CDN TTLs in seconds, and what each does to the hit ratio.  */
export const CDN_TTLS = [
  { ttl: 60, factor: 0.8 },
  { ttl: 300, factor: 1 },
  { ttl: 3_600, factor: 1.2 },
] as const
/**
 * Share a page view gains with Edge-side includes (10 "Track: Infrastructure"): the CDN caches the
 * shared shell of a logged-in page and fills in the personal parts at the edge, which a logged-in
 * page could not cache at all (05 "CDN": "70% of anonymous traffic").
 */
export const ESI_PAGE_HIT = 0.2

/** Share of `page` answers a CDN that did not purge serves from the last deploy until its TTL passes. */
export const STALE_AFTER_DEPLOY = 0.3

/**
 * What a CDN's cache key holds (05 "CDN"). Each field a key leaves out raises the hit ratio, and
 * a page that depends on the field is then served to the wrong user: with Edge-side includes a
 * logged-in page is cached, so a key without the cookie leaks it. `leak` is the incident weight.
 */
export const CACHE_KEYS = {
  full: { name: 'Path, query and cookies', hit: 1, leak: 0 },
  query: { name: 'Path and query', hit: 1.1, leak: 1 },
  path: { name: 'Path only', hit: 1.2, leak: 2.5 },
} as const

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const cdnGlossary: ReadonlyArray<string> = [
  'cache-hit-rate',
  'cdn-content-delivery-network',
  'egress',
]

/** What a CDN's cache key holds (05 "CDN"): path, query string and cookies, or less of them. */
export const CacheKey = Schema.Literals(['full', 'query', 'path'])
export type CacheKey = typeof CacheKey.Type

/** The saved properties of a cdn Node, with the defaults an old save decodes to. */
export const cdnFields = {
  /** A CDN clears its cache when a deploy ships (05 "CDN"). */
  purge: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** What a CDN's cache key holds (05 "CDN"). */
  cacheKey: CacheKey.pipe(Schema.withDecodingDefaultKey(Effect.succeed('full' as const))),
  /** Sim time until a CDN that did not purge still serves the old deploy's pages. */
  staleUntil: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

export const cdnDef = def({
  id: 'cdn',
  code: 'cdn',
  name: 'CDN',
  product: 'Cloudflare',
  group: 'edge',
  blurb: 'Answers cacheable pages near the user. Egress from the edge costs less.',
  cost: 220,
  burn: 0.05,
  latency: 8,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'cdn',
})
