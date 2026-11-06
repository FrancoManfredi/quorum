import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * Payment Provider fee per successful checkout (09 "Third-party fees"): Stripe's standard US card
 * price, a share of the value plus a fixed part. The checkout value is real dollars, so the cost
 * index does not scale the fixed part.
 */
export const PSP_RATE = 0.029
export const PSP_FIXED = 0.3
/** What the second Payment Provider charges, against the first's fees: a smaller vendor, dearer per checkout. */
export const SECOND_PROVIDER_FEE = 1.15
/** Checkouts per second the Payment Provider takes at its first usage tier; each tier doubles it. */
export const PSP_CAPACITY = 1_000

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const pspGlossary: ReadonlyArray<string> = ['idempotency']

/** The saved properties of a psp Node, with the defaults an old save decodes to. */
export const pspFields = {
  /** The Payment Provider a checkout goes to: the first, or a second that an outage of the first leaves alone (18). */
  provider: Schema.Literals(['first', 'second']).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('first' as const)),
  ),
} as const

export const pspDef = def({
  id: 'psp',
  code: 'psp',
  name: 'Payment Provider',
  product: 'Stripe',
  group: 'data',
  blurb: 'Charges cards for checkouts. 2.9% plus $0.30 per checkout.',
  cost: 0,
  latency: 400,
  accepts: ['charge'],
  maxOut: 0,
  unlock: 'checkout',
  steps: 8,
  limiting: true,
})
