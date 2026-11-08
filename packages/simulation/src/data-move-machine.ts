import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const DataMovePhase = Schema.TaggedUnion({
  Building: {},
  Copying: { until: Schema.Finite },
  Landed: {},
})
export type DataMovePhase = typeof DataMovePhase.Type

export const DataMoveEvent = Schema.TaggedUnion({
  Built: { until: Schema.Finite },
  Landed: {},
})
export type DataMoveEvent = typeof DataMoveEvent.Type

const States = Machine.state({ states: DataMovePhase.cases })
const Events = Machine.eventsFromSchemas(DataMoveEvent)

export const dataMoveMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Building' },
  states: {
    Building: {
      on: {
        Built: {
          target: 'Copying',
          data: ({ event }) => ({ _tag: 'Copying', until: event.until }),
        },
      },
    },
    Copying: {
      on: {
        Landed: { target: 'Landed', data: () => ({ _tag: 'Landed' }) },
      },
    },
    Landed: {},
  },
})

export const step = (phase: DataMovePhase, event: DataMoveEvent): DataMovePhase =>
  planState(dataMoveMachine, phase, event)

export const finished = DataMovePhase.guards.Landed
