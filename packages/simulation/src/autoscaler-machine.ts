import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const Steady = Schema.TaggedStruct('Steady', {})
export const Scaling = Schema.TaggedStruct('Scaling', {
  pending: Schema.Finite,
  readyIn: Schema.Finite,
})
export const Autoscaler = Schema.Union([Steady, Scaling])
export type Autoscaler = typeof Autoscaler.Type

/** The Autoscaler asked for `pending` more copies, ready in `readyIn` seconds. */
export const Scaled = Schema.TaggedStruct('Scaled', {
  pending: Schema.Finite,
  readyIn: Schema.Finite,
})
export const Ready = Schema.TaggedStruct('Ready', {})
export const AutoscalerEvent = Schema.Union([Scaled, Ready])
export type AutoscalerEvent = typeof AutoscalerEvent.Type

const States = Machine.state({
  states: { Steady, Scaling },
})

const Events = Machine.events({
  Scaled: { pending: Schema.Finite, readyIn: Schema.Finite },
  Ready: {},
})

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
        // A second scale replaces the wait: it asks from the copies that serve now.
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

/** The next autoscaler state, or the same one when the event does not apply. */
export const step = (scaler: Autoscaler, event: AutoscalerEvent): Autoscaler =>
  planState(autoscalerMachine, scaler, event)

/** Copies are booting and have not joined yet. */
export const isScaling = (scaler: Autoscaler): boolean => scaler._tag === 'Scaling'
