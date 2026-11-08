import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'
import { Reveal as RevealSchema, type Reveal } from './machine-state.ts'

export const CUE_TICKS = 120

export const DisclosureFlow = Schema.TaggedUnion({
  Idle: {
    revealed: Schema.Array(RevealSchema),
  },
  Queued: {
    revealed: Schema.Array(RevealSchema),
    pending: Schema.NonEmptyArray(RevealSchema),
  },
  Cueing: {
    revealed: Schema.Array(RevealSchema),
    pending: Schema.Array(RevealSchema),
    key: RevealSchema,
    left: Schema.Finite,
  },
})
export type DisclosureFlow = typeof DisclosureFlow.Type

export const DisclosureEvent = Schema.TaggedUnion({
  Ticked: {
    triggered: Schema.Array(RevealSchema),
  },
  Used: { key: RevealSchema },
  RevealedAtStart: {
    triggered: Schema.Array(RevealSchema),
  },
})
export type DisclosureEvent = typeof DisclosureEvent.Type

type IdleState = typeof DisclosureFlow.cases.Idle.Type
type QueuedState = typeof DisclosureFlow.cases.Queued.Type
type CueingState = typeof DisclosureFlow.cases.Cueing.Type

const idle = (revealed: ReadonlyArray<Reveal>): IdleState => ({
  _tag: 'Idle',
  revealed: [...revealed],
})

const queued = (
  revealed: ReadonlyArray<Reveal>,
  pending: Readonly<[Reveal, ...ReadonlyArray<Reveal>]>,
): QueuedState => ({ _tag: 'Queued', revealed: [...revealed], pending: [...pending] })

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

const States = Machine.state({ states: DisclosureFlow.cases })
const Events = Machine.eventsFromSchemas(DisclosureEvent)

export const disclosureMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
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

export const step = (flow: DisclosureFlow, event: DisclosureEvent): DisclosureFlow =>
  planState(disclosureMachine, flow, event)
