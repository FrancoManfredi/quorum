import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const HoldFlow = Schema.TaggedUnion({
  Idle: {},
  Held: {
    nodeId: Schema.String,
    at: Schema.Finite,
  },
})
export type HoldFlow = typeof HoldFlow.Type

export const HoldFlowEvent = Schema.TaggedUnion({
  HoldStarted: {
    nodeId: Schema.String,
    at: Schema.Finite,
  },
  HoldRepeated: {
    nodeId: Schema.String,
    at: Schema.Finite,
  },
  HoldLifted: {},
})
export type HoldFlowEvent = typeof HoldFlowEvent.Type

const States = Machine.state({ states: HoldFlow.cases })
const Events = Machine.eventsFromSchemas(HoldFlowEvent)

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
        HoldStarted: {
          target: 'Held',
          data: ({ event }) => ({ _tag: 'Held', nodeId: event.nodeId, at: event.at }),
        },
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

export const step = (flow: HoldFlow, event: HoldFlowEvent): HoldFlow =>
  planState(holdMachine, flow, event)
