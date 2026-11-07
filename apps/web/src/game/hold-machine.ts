import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   A buy or upgrade control repeats while it is held (15 "Bulk actions"). One
   state says whether a control is held and which Node it buys for, so a lift
   after a switch cannot keep repeating the old Node.
   ========================================================================== */

export const Idle = Schema.TaggedStruct('Idle', {})

export const Held = Schema.TaggedStruct('Held', {
  nodeId: Schema.String,
  /** The wall clock of the last buy. */
  at: Schema.Finite,
})

export const HoldFlow = Schema.Union([Idle, Held])
export type HoldFlow = typeof HoldFlow.Type

export const HoldStarted = Schema.TaggedStruct('HoldStarted', {
  nodeId: Schema.String,
  at: Schema.Finite,
})
export const HoldRepeated = Schema.TaggedStruct('HoldRepeated', {
  nodeId: Schema.String,
  at: Schema.Finite,
})
export const HoldLifted = Schema.TaggedStruct('HoldLifted', {})
export const HoldFlowEvent = Schema.Union([HoldStarted, HoldRepeated, HoldLifted])
export type HoldFlowEvent = typeof HoldFlowEvent.Type

const States = Machine.state({ states: { Idle, Held } })

const Events = Machine.events({
  HoldStarted: { nodeId: Schema.String, at: Schema.Finite },
  HoldRepeated: { nodeId: Schema.String, at: Schema.Finite },
  HoldLifted: {},
})

export const holdMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Idle' },
  states: {
    Idle: {
      on: {
        HoldStarted: {
          target: 'Held',
          data: ({ event }) => ({ _tag: 'Held', nodeId: event.nodeId, at: event.at }),
        },
      },
    },
    Held: {
      on: {
        /** Pressing another control drops the old one and holds the new one. */
        HoldStarted: {
          target: 'Held',
          data: ({ event }) => ({ _tag: 'Held', nodeId: event.nodeId, at: event.at }),
        },
        /** A repeat for a control that is no longer held does not land. */
        HoldRepeated: {
          target: 'Held',
          guard: ({ state, event }) => state.nodeId === event.nodeId,
          data: ({ state, event }) => ({ ...state, at: event.at }),
        },
        HoldLifted: { target: 'Idle' },
      },
    },
  },
})

/** The next hold, or the same one when the event does not apply. */
export const step = (flow: HoldFlow, event: HoldFlowEvent): HoldFlow =>
  planState(holdMachine, flow, event)
