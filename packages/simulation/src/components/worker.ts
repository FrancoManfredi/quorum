import { def } from './define.ts'

/** While a poison message is stuck, Workers spend this share of their time on it.  */
export const POISON_SHARE = 0.9
/** Seconds a failed task waits before its next attempt, with backoff.  */
export const TASK_RETRY_SECONDS = 30
/** Tasks each Worker process takes from the Queue ahead of time (05 "Worker": Prefetch). */
export const PREFETCH = [1, 10, 100] as const
/** Milliseconds a Worker waits on the broker for each fetch, ack included.  */
export const FETCH_MS = 20

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
