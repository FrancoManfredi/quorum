import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * Realtime Hub (05 "Realtime Hub", 06 "Realtime connections"): KB of RAM its first box gives to
 * open connections. Each size step doubles it. A box holds as many connections as fit at its
 * runtime's cost per connection, 1 MB for a Java platform thread down to about 5 KB for a BEAM
 * process, so the runtime decides how many a dollar holds.
 */
export const HUB_RAM_KB = 8 * 1_048_576
/** Presence spends this share of a Hub's CPU on joins and leaves, so a box holds fewer connections.  */
export const PRESENCE_CPU = 0.15
/** Presence earns this multiple of a realtime message: social features pay for who is online.  */
export const PRESENCE_VALUE = 1.25
/** Share of the reconnect wave a Hub that just came back refuses without jittered backoff.  */
export const HERD_REFUSED = 0.5

/** The saved properties of a ws Node, with the defaults an old save decodes to. */
export const wsFields = {
  /** A Realtime Hub tracks who is online: more per message, and CPU spent on each join. */
  presence: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Realtime Hub lets clients reconnect with jittered backoff after a restart. */
  backoff: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** A Realtime Hub runs several boxes behind one pub/sub backbone; without it, one box takes all. */
  clustering: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
} as const

export const wsDef = def({
  id: 'ws',
  code: 'ws',
  name: 'Realtime Hub',
  product: 'Socket.IO',
  group: 'compute',
  blurb: 'Holds a connection open for every realtime message. How many fit depends on the runtime.',
  cost: 400,
  burn: 0.15,
  latency: 1,
  accepts: ['rt'],
  maxOut: 0,
  unlock: 'websockets',
  steps: 8,
  limiting: true,
})
