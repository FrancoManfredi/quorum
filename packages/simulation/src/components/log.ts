import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/** Messages a second one broker appends at size 1 (05 "Stats": 100,000 per broker). */
export const LOG_RATE = 100_000
/**
 * Messages a second one partition hands its consumer. A consumer group can use at most one
 * consumer per partition (07 "Event Stream"), so a stream reads no faster than its partitions.
 *
 */
export const LOG_READ_RATE = 20_000
/** Partitions a stream offers, as button values: parallelism, and the width of the order it keeps. */
export const LOG_PARTITIONS = [1, 3, 6, 12] as const
/**
 * Acknowledgements (07 "Event Stream"): what a producer waits for before it moves on. `0` does not
 * wait, `1` waits for the partition leader, `all` for every replica. Each is a multiple of the
 * 5 ms append. The multiples are
 */
export const LOG_ACKS = {
  '0': { name: 'No ack', latency: 0.4 },
  '1': { name: 'Leader', latency: 1 },
  all: { name: 'All replicas', latency: 1.5 },
} as const
/** Retention windows a stream offers, in sim seconds: 10 calendar hours, 2.5 days, and a week. */
export const LOG_RETENTION = [600, 3_600, 10_080] as const
/**
 * Burn each replica past the first adds to a broker, as a share of its own rate: every partition
 * is copied, and the copies are disk (07 "Event Stream": "costs more disk").
 */
export const LOG_REPLICA_BURN = 0.5
/** Replicas a stream keeps of each partition: 1, 2, or 3 (07 "Event Stream"). */
export const LOG_REPLICAS = [1, 2, 3] as const
/**
 * The share of the events a broker holds that a failure takes with it (07 "Event Stream":
 * `acks` trades write latency for durability). With one replica the failed broker held the only
 * copy. With more, `acks=all` waited for every replica, so none is lost; `acks=1` acknowledged
 * after the leader alone, so what the followers had not yet copied is lost; `acks=0` did not wait
 * at all, so the producer's last events never arrived.
 */
export const LOG_LOSS = { '0': 0.1, '1': 0.05, all: 0 } as const

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const logGlossary: ReadonlyArray<string> = [
  'at-least-once-delivery',
  'cdc-change-data-capture',
]

/** What an Event Stream's producer waits for before it moves on (07 "Event Stream"). */
export const Acks = Schema.Literals(['0', '1', 'all'])
export type Acks = typeof Acks.Type

/** The saved properties of a log Node, with the defaults an old save decodes to. */
export const logFields = {
  /** Partitions an Event Stream splits into (07 "Event Stream"): its readers, and its order. */
  partitions: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3))),
  /** What a producer waits for before it moves on: `0`, `1`, or `all` (07 "Event Stream"). */
  acks: Acks.pipe(Schema.withDecodingDefaultKey(Effect.succeed('all' as const))),
  /** Sim seconds an Event Stream keeps a message, for replay (07 "Event Stream"). */
  retain: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(3_600))),
  /** An Event Stream keys its partitions by entity, so one entity's events stay in order (07). */
  keyed: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
} as const

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
