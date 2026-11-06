import { def } from '../define.ts'

export const queueDef = def({
  id: 'queue',
  code: 'mq',
  name: 'Queue',
  product: 'RabbitMQ',
  group: 'compute',
  blurb: 'Takes work now so Workers can do it later. Users wait only for the enqueue.',
  cost: 360,
  burn: 0.1,
  latency: 2,
  accepts: ['task'],
  sends: ['task'],
  unlock: 'queues',
  steps: 6,
  limiting: true,
})
