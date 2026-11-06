import { def } from './define.ts'

// A partitioned, replicated log: producers append, consumers read at their own pace, and the
// messages stay after they are read (07 "Event Stream").
export const logDef = def({
  id: 'log',
  code: 'log',
  name: 'Event Stream',
  product: 'Apache Kafka',
  group: 'compute',
  blurb:
    'A log, not a queue: events stay after they are read, so a consumer can replay them. Consumers read one partition each and fall behind at their own pace.',
  cost: 900,
  burn: 0.3,
  latency: 5,
  accepts: ['task'],
  sends: ['task'],
  unlock: 'event-streaming',
  steps: 6,
  limiting: true,
})
