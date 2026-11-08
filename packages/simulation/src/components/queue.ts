import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Messages per second one RabbitMQ node takes (05 "Queue"). */
export const QUEUE_RATE = 20_000
/** Milliseconds a backlog of one message adds to the enqueue: a large backlog slows the broker.  */
export const BACKLOG_MS = 0.01
/** A Queue offers its Workers its backlog over this many seconds. */
export const DRAIN_SECONDS = 10
/** Max attempts a Queue with a dead-letter queue offers (05 "Worker"). Sidekiq retries 25 times. */
export const MAX_ATTEMPTS = [1, 3, 10, 25] as const
/** A Queue with no dead-letter queue retries forever; the math stops at Sidekiq's 25. */
export const FOREVER_ATTEMPTS = 25
/** Max lengths a Queue offers; 0 means no limit (RabbitMQ `x-max-length`). */
export const QUEUE_LENGTHS = [0, 1_000, 10_000, 100_000] as const
/** A Queue bills each task as a message: SQS's $0.40 per million requests, three requests a message, times 1,200. */
export const QUEUE_MESSAGE_PRICE = 0.00144

/** The glossary entries this Component teaches; the wiki Component page links to them. */
export const queueGlossary: ReadonlyArray<string> = [
  'at-least-once-delivery',
  'backpressure',
  'dead-letter-queue',
  'transactional-outbox',
]

/** The saved properties of a queue Node, with the defaults an old save decodes to. */
export const queueFields = {
  /** A Queue moves a task that keeps failing to a dead-letter queue. */
  dlq: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Most tasks a Queue holds; past it, new tasks are refused. 0 means no limit. */
  maxLength: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

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
