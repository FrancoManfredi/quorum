import { def } from '../define.ts'

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
