import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { STABLE_TICKS, STEADY_TICKS } from './machine-state.ts'
import { planState } from './machine.ts'
import { Change, Delta, Figures } from './machine-state.ts'

export const ChangeState = Schema.TaggedUnion({
  Idle: {},
  Settling: { change: Change },
  Settled: {
    delta: Delta,
    ticks: Schema.Finite,
  },
  Lasting: { delta: Delta },
})
export type ChangeState = typeof ChangeState.Type

const Sample = Schema.Struct({
  revenue: Schema.Finite,
  served: Schema.Finite,
  errors: Schema.Finite,
})

export const ChangeEvent = Schema.TaggedUnion({
  Changed: {
    label: Schema.String,
    before: Figures,
    startedAt: Schema.Finite,
  },
  Ticked: {
    sample: Sample,
    after: Figures,
    warming: Schema.Boolean,
    at: Schema.Finite,
    seq: Schema.Finite,
  },
  Expired: {},
})
export type ChangeEvent = typeof ChangeEvent.Type

type SampleValue = typeof Sample.Type
type ChangedEvent = typeof ChangeEvent.cases.Changed.Type
type SettlingState = typeof ChangeState.cases.Settling.Type

const close = (a: SampleValue, b: SampleValue): boolean =>
  Math.abs(a.revenue - b.revenue) <= Math.max(1e-6, 0.01 * Math.abs(b.revenue)) &&
  Math.abs(a.served - b.served) <= Math.max(1e-6, 0.01 * Math.abs(b.served)) &&
  Math.abs(a.errors - b.errors) <= 0.001

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

const deltaOf = (change: Change, after: Figures, at: number, seq: number): Delta => ({
  id: seq,
  label: change.count > 1 ? `${change.count} changes` : change.label,
  before: change.before,
  after,
  worse:
    after.revenue < change.before.revenue * 0.98 || after.errors > change.before.errors + 0.005,
  shownAt: at,
})

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

const extended = (change: Change, event: ChangedEvent): SettlingState => ({
  _tag: 'Settling',
  change: { ...change, label: event.label, count: change.count + 1, recent: [], steady: 0 },
})

const States = Machine.state({ states: ChangeState.cases })
const Events = Machine.eventsFromSchemas(ChangeEvent)

export const changeMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
    tick: {
      settling: { target: 'Settling' },
      settled: { target: 'Settled' },
      lasting: { target: 'Lasting' },
    },
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

export const step = (state: ChangeState, event: ChangeEvent): ChangeState =>
  planState(changeMachine, state, event)
