import { Effect, Schema } from 'effect'
import { def } from './define.ts'
import { DATA_KINDS, REQUEST_KINDS } from '../catalog/kinds.ts'

/** How a Load Balancer splits traffic, and the research each policy needs. */
export const LB_POLICIES = {
  weighted: { label: 'Weighted', research: null },
  'round-robin': { label: 'Round robin', research: null },
  'least-conn': { label: 'Least conn', research: 'lb-algorithms' },
  p2c: { label: 'Two choices', research: 'lb-algorithms' },
  hash: { label: 'Consistent hash', research: 'lb-algorithms' },
} as const
/** Power of two choices keeps no global state: its LB handles this much more traffic... */
export const P2C_CAPACITY = 1.5
/** ...at the price of this share of traffic split evenly, whatever the load. */
export const P2C_IMBALANCE = 0.1
/** Seconds between a Load Balancer's health checks. All but 10 s need Health checks. */
export const CHECK_INTERVALS = [2, 10, 30] as const
/**
 * What the L4 variant changes (05 "Load Balancer"): ten times the throughput, 0.2 ms instead of
 * 1 ms, and cheaper. The exact price cut is proposed: 05 says only "cheaper".
 */
export const L4_CAPACITY = 10
export const L4_MS = 0.2
export const L4_BURN = 0.6
/** A Load Balancer's variants (05 "Load Balancer"). */
export const LB_VARIANTS = {
  l7: { name: 'L7', research: null },
  l4: { name: 'L4', research: 'l4-lb' },
} as const
export type LbVariant = keyof typeof LB_VARIANTS

/**
 * Sticky sessions (05 "Load Balancer"): the share of a Load Balancer's traffic that belongs to
 * users already pinned to a target. Pinned users do not move when a copy is added, so the oldest
 * copy holds the most of them: each copy after the first holds `STICKY_DECAY` times the pinned
 * users of the one before. A pinned user whose target dies loses the session, and the rest of the
 * traffic follows the Load Balancer's algorithm as before.
 */
export const STICKY_SHARE = 0.4
export const STICKY_DECAY = 0.8

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const lbGlossary: ReadonlyArray<string> = [
  'health-check',
  'load-balancer',
  'vertical-and-horizontal-scaling',
]

export const LbPolicy = Schema.Literals(['weighted', 'round-robin', 'least-conn', 'p2c', 'hash'])
export type LbPolicy = typeof LbPolicy.Type

/** The saved properties of a lb Node, with the defaults an old save decodes to. */
export const lbFields = {
  policy: LbPolicy.pipe(Schema.withDecodingDefaultKey(Effect.succeed('weighted' as const))),
  /** A Load Balancer keeps a user on one target (05 "Load Balancer"). */
  sticky: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Load Balancer lets a new copy take traffic gradually (11 "JVM warmup under load"). */
  slowStart: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Load Balancer's variant: L7 reads HTTP, L4 forwards TCP (05 "Load Balancer"). */
  variant: Schema.Literals(['l7', 'l4']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('l7' as const)),
  ),
  /** Seconds between a Load Balancer's health checks. */
  checkEvery: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(10))),
  /** A deep health check also checks the server's database. */
  deepCheck: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const lbDef = def({
  id: 'lb',
  code: 'lb',
  name: 'Load Balancer',
  product: 'NGINX',
  group: 'edge',
  blurb:
    'Splits traffic across App Servers or Database hosts and drops a dead host at its next health check.',
  cost: 120,
  burn: 0.08,
  latency: 1,
  accepts: [...REQUEST_KINDS, ...DATA_KINDS],
  unlock: 'load-balancing',
  steps: 6,
  sends: [...REQUEST_KINDS, ...DATA_KINDS],
  limiting: true,
})
