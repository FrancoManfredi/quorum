import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { STABLE_TICKS, STEADY_TICKS } from './machine-state.ts'
import { planState } from './machine.ts'
import { Change, Delta, Figures } from './machine-state.ts'

/* ==========================================================================
   Feedback after a change: the figures settle, then a delta compares before
   and after. A worse delta lasts until the next change; a better one counts
   down. The machine has no clock, so the handler stamps the change's start and
   the delta's id and shownAt, and keeps the SETTLE_LIMIT escape.
   ========================================================================== */

export const Idle = Schema.TaggedStruct('Idle', {})

export const Settling = Schema.TaggedStruct('Settling', { change: Change })

export const Settled = Schema.TaggedStruct('Settled', {
  delta: Delta,
  /** Ticks "Stable" still shows. */
  ticks: Schema.Finite,
})

/** A worse delta stays: it says why the figures did not come back. */
export const Lasting = Schema.TaggedStruct('Lasting', { delta: Delta })

export const ChangeState = Schema.Union([Idle, Settling, Settled, Lasting])
export type ChangeState = typeof ChangeState.Type

/** The ledger sample a change compares; `Change.recent` holds the same shape. */
const Sample = Schema.Struct({
  revenue: Schema.Finite,
  served: Schema.Finite,
  errors: Schema.Finite,
})

export const Changed = Schema.TaggedStruct('Changed', {
  label: Schema.String,
  before: Figures,
  startedAt: Schema.Finite,
})

export const Ticked = Schema.TaggedStruct('Ticked', {
  sample: Sample,
  after: Figures,
  /** Some Node is down or still warming, so the figures cannot hold yet. */
  warming: Schema.Boolean,
  at: Schema.Finite,
  seq: Schema.Finite,
})

export const Expired = Schema.TaggedStruct('Expired', {})

export const ChangeEvent = Schema.Union([Changed, Ticked, Expired])
export type ChangeEvent = typeof ChangeEvent.Type

type SampleValue = typeof Sample.Type
type ChangedEvent = typeof Changed.Type
type SettlingState = typeof Settling.Type

/** Two samples agree: revenue and served within 1%, error share within 0.1 points. */
const close = (a: SampleValue, b: SampleValue): boolean =>
  Math.abs(a.revenue - b.revenue) <= Math.max(1e-6, 0.01 * Math.abs(b.revenue)) &&
  Math.abs(a.served - b.served) <= Math.max(1e-6, 0.01 * Math.abs(b.served)) &&
  Math.abs(a.errors - b.errors) <= 0.001

/** Trailing samples that agree with the newest one. */
const steadyCount = (recent: ReadonlyArray<SampleValue>): number => {
  const newest = recent.at(-1)
  if (!newest) return 0
  let count = 0
  for (let index = recent.length - 1; index >= 0; index -= 1) {
    const sample = recent[index]
    if (!sample || !close(sample, newest)) break
    count += 1
  }
  return count
}

/** The delta a settled change shows. The handler stamps its id and shownAt. */
const deltaOf = (change: Change, after: Figures, at: number, seq: number): Delta => ({
  id: seq,
  label: change.count > 1 ? `${change.count} changes` : change.label,
  before: change.before,
  after,
  worse:
    after.revenue < change.before.revenue * 0.98 || after.errors > change.before.errors + 0.005,
  shownAt: at,
})

/** A new change starts settling. The handler stamps its startedAt. */
const begun = (event: ChangedEvent): SettlingState => ({
  _tag: 'Settling',
  change: {
    label: event.label,
    count: 1,
    startedAt: event.startedAt,
    before: event.before,
    recent: [],
    steady: 0,
  },
})

/** A change during a settling one extends it: several quick changes settle as one. */
const extended = (change: Change, event: ChangedEvent): SettlingState => ({
  _tag: 'Settling',
  change: { ...change, label: event.label, count: change.count + 1, recent: [], steady: 0 },
})

const States = Machine.state({ states: { Idle, Settling, Settled, Lasting } })

const Events = Machine.events({
  Changed: { label: Schema.String, before: Figures, startedAt: Schema.Finite },
  Ticked: {
    sample: Sample,
    after: Figures,
    warming: Schema.Boolean,
    at: Schema.Finite,
    seq: Schema.Finite,
  },
  Expired: {},
})

export const changeMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
    // A tick either holds while the figures move, or settles into a delta.
    tick: {
      settling: { target: 'Settling' },
      settled: { target: 'Settled' },
      lasting: { target: 'Lasting' },
    },
    // "Stable" counts down, and the last tick closes the delta.
    countdown: {
      settled: { target: 'Settled' },
      idle: { target: 'Idle' },
    },
  },
}).handle({
  initial: { target: 'Idle' },
  states: {
    Idle: {
      on: {
        Changed: { target: 'Settling', data: ({ event }) => begun(event) },
      },
    },
    Settling: {
      on: {
        Changed: {
          target: 'Settling',
          data: ({ state, event }) => extended(state.change, event),
        },
        Ticked: {
          branches: 'tick',
          resolve: ({ state, event, select }) => {
            const recent = [...state.change.recent, event.sample].slice(-STEADY_TICKS)
            const steady = steadyCount(recent)
            const change = { ...state.change, recent, steady }
            if (steady < STEADY_TICKS || event.warming)
              return select.settling({ data: { _tag: 'Settling', change } })
            const delta = deltaOf(change, event.after, event.at, event.seq)
            return delta.worse
              ? select.lasting({ data: { _tag: 'Lasting', delta } })
              : select.settled({ data: { _tag: 'Settled', delta, ticks: STABLE_TICKS } })
          },
        },
      },
    },
    Settled: {
      on: {
        Changed: { target: 'Settling', data: ({ event }) => begun(event) },
        Ticked: {
          branches: 'countdown',
          resolve: ({ state, select }) =>
            state.ticks > 1
              ? select.settled({
                  data: { _tag: 'Settled', delta: state.delta, ticks: state.ticks - 1 },
                })
              : select.idle(),
        },
      },
    },
    Lasting: {
      on: {
        Changed: { target: 'Settling', data: ({ event }) => begun(event) },
        Ticked: {
          target: 'Lasting',
          data: ({ state }) => ({ _tag: 'Lasting', delta: state.delta }),
        },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (state: ChangeState, event: ChangeEvent): ChangeState =>
  planState(changeMachine, state, event)
