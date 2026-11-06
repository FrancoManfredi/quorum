import { def } from './define.ts'

export const workerDef = def({
  id: 'worker',
  code: 'wrk',
  name: 'Worker',
  product: 'Sidekiq',
  group: 'compute',
  blurb:
    'Runs your code on tasks from a Queue. Users never wait for it. Link it to the data an export reads.',
  cost: 60,
  sized: true,
  latency: 0,
  accepts: ['task'],
  sends: ['q-read', 'q-write', 'notify', 'callout'],
  unlock: 'background-jobs',
  stack: true,
  limiting: true,
  coldStart: true,
})
