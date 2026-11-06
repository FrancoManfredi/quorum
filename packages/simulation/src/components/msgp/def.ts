import { def } from '../define.ts'

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
