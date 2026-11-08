import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { REQUEST_KINDS } from '../catalog/kinds.ts'

/** WAF paranoia levels (05 "WAF"): bots blocked, real users blocked, and CPU per request. */
export const PARANOIA = [
  { level: 1, block: 0.6, falsePositive: 0.001, cpu: 1 },
  { level: 2, block: 0.8, falsePositive: 0.005, cpu: 1.5 },
  { level: 3, block: 0.92, falsePositive: 0.02, cpu: 2.5 },
  { level: 4, block: 0.98, falsePositive: 0.06, cpu: 4 },
] as const
/** "Under attack" mode challenges every request: it blocks nearly all junk and some real users, and adds latency. A challenge costs paranoia 1's CPU. */
export const UNDER_ATTACK = { block: 0.99, falsePositive: 0.01, latency: 40, cpu: 1 } as const
/**
 * Share by which Bot management lowers a WAF's false positives (10 "Track: Infrastructure"): a
 * suspicious client is challenged instead of blocked, so a real user it flags still gets through.
 * The design gives the direction and no rate, so half is proposed.
 */
export const BOT_MANAGEMENT_FALSE = 0.5

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const wafGlossary: ReadonlyArray<string> = ['rate-limiting', 'waf-web-application-firewall']

/** The saved properties of a waf Node, with the defaults an old save decodes to. */
export const wafFields = {
  /** A WAF's paranoia level, 1 to 4. */
  paranoia: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(2))),
  underAttack: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const wafDef = def({
  id: 'waf',
  code: 'waf',
  name: 'WAF',
  product: 'ModSecurity',
  group: 'edge',
  blurb: 'Blocks bots before they reach the app, and some real users with them.',
  cost: 260,
  burn: 0.1,
  latency: 2,
  accepts: REQUEST_KINDS,
  sends: REQUEST_KINDS,
  unlock: 'waf',
  steps: 6,
  limiting: true,
})
