import { def } from './define.ts'

/** Push Provider: messages per second, and the price of one × cost index (05 "Push and Email Provider"): Amazon SES's $0.10 per 1,000. */
export const MSGP_RATE = 10_000
export const MSGP_PRICE = 0.0001

export const msgpDef = def({
  id: 'msgp',
  code: 'msgp',
  name: 'Push Provider',
  product: 'Amazon SNS',
  group: 'data',
  blurb: 'Sends push notifications and email. Paid per message, 10,000 a second.',
  cost: 0,
  latency: 100,
  accepts: ['notify'],
  maxOut: 0,
  unlock: 'notifications',
  limiting: true,
})
