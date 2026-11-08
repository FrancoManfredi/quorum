import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const HirePhase = Schema.TaggedUnion({
  Pending: { readyAt: Schema.Finite },
  Joined: {},
})
export type HirePhase = typeof HirePhase.Type

export const HireEvent = Schema.TaggedUnion({
  Hired: { readyAt: Schema.Finite },
  Joined: { at: Schema.Finite },
})
export type HireEvent = typeof HireEvent.Type

const States = Machine.state({ states: HirePhase.cases })
const Events = Machine.eventsFromSchemas(HireEvent)

export const hireMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Pending', data: { readyAt: 0 } },
  states: {
    Pending: {
      on: {
        Hired: {
          target: 'Pending',
          data: ({ event }) => ({ _tag: 'Pending', readyAt: event.readyAt }),
        },
        Joined: {
          target: 'Joined',
          guard: ({ state, event }) => event.at >= state.readyAt,
          data: () => ({ _tag: 'Joined' }),
        },
      },
    },
    Joined: {},
  },
})

export const step = (phase: HirePhase, event: HireEvent): HirePhase =>
  planState(hireMachine, phase, event)

export const isJoined = HirePhase.guards.Joined
