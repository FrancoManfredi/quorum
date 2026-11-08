import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const Autoscaler = Schema.TaggedUnion({
  Steady: {},
  Scaling: {
    pending: Schema.Finite,
    readyIn: Schema.Finite,
  },
})
export type Autoscaler = typeof Autoscaler.Type

export const AutoscalerEvent = Schema.TaggedUnion({
  Scaled: {
    pending: Schema.Finite,
    readyIn: Schema.Finite,
  },
  Ready: {},
})
export type AutoscalerEvent = typeof AutoscalerEvent.Type

const States = Machine.state({ states: Autoscaler.cases })
const Events = Machine.eventsFromSchemas(AutoscalerEvent)

export const autoscalerMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Steady' },
  states: {
    Steady: {
      on: {
        Scaled: {
          target: 'Scaling',
          data: ({ event }) => ({
            _tag: 'Scaling',
            pending: event.pending,
            readyIn: event.readyIn,
          }),
        },
      },
    },
    Scaling: {
      on: {
        Scaled: {
          target: 'Scaling',
          data: ({ event }) => ({
            _tag: 'Scaling',
            pending: event.pending,
            readyIn: event.readyIn,
          }),
        },
        Ready: { target: 'Steady' },
      },
    },
  },
})

export const step = (scaler: Autoscaler, event: AutoscalerEvent): Autoscaler =>
  planState(autoscalerMachine, scaler, event)

export const isScaling = Autoscaler.guards.Scaling
