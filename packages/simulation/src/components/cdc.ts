import { def } from './define.ts'

/** Changes a second a CDC Connector publishes at its one size (05 "Stats": 20,000). */
export const CDC_RATE = 20_000
/**
 * What counts as a change: every write the Database takes, a checkout included, and the timeline
 * writes a fan-out makes (07 "Fan-out"). A read changes nothing.
 */
export const CDC_CHANGES = ['q-write', 'q-tx', 'k-write'] as const

/**
 * Milliseconds a change spends in the connector before it is published.
 */
export const CDC_MS = 2

// It reads a Database's write-ahead log and publishes every change to an Event Stream, so the
// app writes once and the copies follow (05 "CDC Connector").
export const cdcDef = def({
  id: 'cdc',
  code: 'cdc',
  name: 'CDC Connector',
  product: 'Debezium',
  group: 'compute',
  blurb:
    'Link a Database into it. It reads every change off the write log and publishes it to an Event Stream, so the app never writes twice.',
  cost: 300,
  burn: 0.05,
  latency: CDC_MS,
  accepts: [],
  sends: ['task'],
  maxOut: 1,
  mirror: true,
  unlock: 'cdc',
  limiting: true,
})
