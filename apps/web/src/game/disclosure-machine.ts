import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { Reveal as RevealSchema, type Reveal } from './machine-state.ts'

/** UI ticks one cue glows, and the longest the next one waits for it: 30 s at any speed. */
export const CUE_TICKS = 120

export const Idle = Schema.TaggedStruct('Idle', {
  revealed: Schema.Array(RevealSchema),
})
export const Queued = Schema.TaggedStruct('Queued', {
  revealed: Schema.Array(RevealSchema),
  pending: Schema.NonEmptyArray(RevealSchema),
})
export const Cueing = Schema.TaggedStruct('Cueing', {
  revealed: Schema.Array(RevealSchema),
  pending: Schema.Array(RevealSchema),
  key: RevealSchema,
  left: Schema.Finite,
})
export const DisclosureFlow = Schema.Union([Idle, Queued, Cueing])
export type DisclosureFlow = typeof DisclosureFlow.Type

export const Ticked = Schema.TaggedStruct('Ticked', {
  triggered: Schema.Array(RevealSchema),
})
export const Used = Schema.TaggedStruct('Used', { key: RevealSchema })
export const RevealedAtStart = Schema.TaggedStruct('RevealedAtStart', {
  triggered: Schema.Array(RevealSchema),
})
export const DisclosureEvent = Schema.Union([Ticked, Used, RevealedAtStart])
export type DisclosureEvent = typeof DisclosureEvent.Type

type IdleState = Extract<DisclosureFlow, Readonly<{ _tag: 'Idle' }>>
type QueuedState = Extract<DisclosureFlow, Readonly<{ _tag: 'Queued' }>>
type CueingState = Extract<DisclosureFlow, Readonly<{ _tag: 'Cueing' }>>

const idle = (revealed: ReadonlyArray<Reveal>): IdleState => ({
  _tag: 'Idle',
  revealed: [...revealed],
})

const queued = (
  revealed: ReadonlyArray<Reveal>,
  pending: Readonly<[Reveal, ...ReadonlyArray<Reveal>]>,
): QueuedState => ({ _tag: 'Queued', revealed: [...revealed], pending: [...pending] })

/** A key counts as shown from the moment its cue starts: the glow is the last of it. */
const cue = (
  revealed: ReadonlyArray<Reveal>,
  pending: ReadonlyArray<Reveal>,
  key: Reveal,
): CueingState => ({
  _tag: 'Cueing',
  revealed: [...revealed, key],
  pending: [...pending],
  key,
  left: CUE_TICKS,
})

/** The triggers not already shown or waiting, in the order they fired. */
const fresh = (
  revealed: ReadonlyArray<Reveal>,
  pending: ReadonlyArray<Reveal>,
  triggered: ReadonlyArray<Reveal>,
): ReadonlyArray<Reveal> => {
  const seen = new Set<Reveal>([...revealed, ...pending])
  const keys: Array<Reveal> = []
  for (const key of triggered) {
    if (seen.has(key)) continue
    seen.add(key)
    keys.push(key)
  }
  return keys
}

const shown = (revealed: ReadonlyArray<Reveal>, key: Reveal): ReadonlyArray<Reveal> =>
  revealed.includes(key) ? [...revealed] : [...revealed, key]

const waiting = (pending: ReadonlyArray<Reveal>, key: Reveal): ReadonlyArray<Reveal> =>
  pending.filter((entry) => entry !== key)

const unique = (keys: ReadonlyArray<Reveal>): ReadonlyArray<Reveal> => [...new Set(keys)]

const sameKeys = (left: ReadonlyArray<Reveal>, right: ReadonlyArray<Reveal>): boolean =>
  left.length === right.length && left.every((key, index) => key === right[index])

const States = Machine.state({ states: { Idle, Queued, Cueing } })

const Events = Machine.events({
  Ticked: { triggered: Schema.Array(RevealSchema) },
  Used: { key: RevealSchema },
  RevealedAtStart: { triggered: Schema.Array(RevealSchema) },
})

export const disclosureMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
    /** Where a cue or a queue leaves the flow: a new cue, a queue, or nothing left to show. */
    settle: {
      cue: { target: 'Cueing' },
      queued: { target: 'Queued' },
      idle: { target: 'Idle' },
      unchanged: { none: true },
    },
  },
}).handle({
  initial: { target: 'Idle', data: { revealed: [] } },
  states: {
    Idle: {
      on: {
        Ticked: {
          branches: 'settle',
          guard: ({ state, event }) => fresh(state.revealed, [], event.triggered).length > 0,
          resolve: ({ state, event, select }) => {
            const [key, ...rest] = fresh(state.revealed, [], event.triggered)
            return key === undefined
              ? select.unchanged()
              : select.cue({ data: cue(state.revealed, rest, key) })
          },
        },
        Used: {
          target: 'Idle',
          guard: ({ state, event }) => !state.revealed.includes(event.key),
          data: ({ state, event }) => idle([...state.revealed, event.key]),
        },
        RevealedAtStart: {
          target: 'Idle',
          guard: ({ state, event }) => !sameKeys(state.revealed, event.triggered),
          data: ({ event }) => idle(unique(event.triggered)),
        },
      },
    },
    Queued: {
      on: {
        Ticked: {
          target: 'Cueing',
          data: ({ state, event }) => {
            const next = state.pending[0]
            const rest = [
              ...state.pending.slice(1),
              ...fresh(state.revealed, state.pending, event.triggered),
            ]
            return cue(state.revealed, rest, next)
          },
        },
        Used: {
          branches: 'settle',
          guard: ({ state, event }) =>
            !state.revealed.includes(event.key) || state.pending.includes(event.key),
          resolve: ({ state, event, select }) => {
            const revealed = shown(state.revealed, event.key)
            const [next, ...rest] = waiting(state.pending, event.key)
            return next === undefined
              ? select.idle({ data: idle(revealed) })
              : select.queued({ data: queued(revealed, [next, ...rest]) })
          },
        },
        RevealedAtStart: {
          target: 'Idle',
          data: ({ event }) => idle(unique(event.triggered)),
        },
      },
    },
    Cueing: {
      on: {
        Ticked: {
          branches: 'settle',
          resolve: ({ state, event, select }) => {
            const pending = [
              ...state.pending,
              ...fresh(state.revealed, state.pending, event.triggered),
            ]
            const left = state.left - 1
            if (left > 0) return select.cue({ data: { ...state, pending, left } })
            const [next, ...rest] = pending
            return next === undefined
              ? select.idle({ data: idle(state.revealed) })
              : select.cue({ data: cue(state.revealed, rest, next) })
          },
        },
        Used: {
          branches: 'settle',
          guard: ({ state, event }) =>
            state.key === event.key ||
            state.pending.includes(event.key) ||
            !state.revealed.includes(event.key),
          resolve: ({ state, event, select }) => {
            const revealed = shown(state.revealed, event.key)
            const pending = waiting(state.pending, event.key)
            if (state.key !== event.key)
              return select.cue({ data: { ...state, revealed, pending } })
            const [next, ...rest] = pending
            return next === undefined
              ? select.idle({ data: idle(revealed) })
              : select.queued({ data: queued(revealed, [next, ...rest]) })
          },
        },
        RevealedAtStart: {
          target: 'Idle',
          data: ({ event }) => idle(unique(event.triggered)),
        },
      },
    },
  },
})

/** The next disclosure, or the same one when the event changes nothing. */
export const step = (flow: DisclosureFlow, event: DisclosureEvent): DisclosureFlow =>
  planState(disclosureMachine, flow, event)
