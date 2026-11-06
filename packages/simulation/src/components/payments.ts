import { def } from './define.ts'

export const paymentsDef = def({
  id: 'payments',
  code: 'pay',
  name: 'Payments',
  product: 'Invoices',
  group: 'ops',
  blurb: 'Revenue waits here. The drawer holds about a minute of it.',
  cost: 0,
  latency: 0,
  accepts: [],
  maxOut: 0,
  fixed: true,
  steps: 6,
})
