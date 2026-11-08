import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/** The Dev Hours are still being built. */
export const Building = Schema.TaggedStruct('Building', {})
/** The data copies until `until`, in sim seconds. */
export const Copying = Schema.TaggedStruct('Copying', { until: Schema.Finite })
/** The copy landed: the caller applies it and clears the Game's field. */
export const Landed = Schema.TaggedStruct('Landed', {})
export const DataMovePhase = Schema.Union([Building, Copying, Landed])
export type DataMovePhase = typeof DataMovePhase.Type

/** The Dev Hours finished, so the copy starts and ends at `until`. */
export const Built = Schema.TaggedStruct('Built', { until: Schema.Finite })
/** The copy reached `until` and the Database can run its new shape. */
export const LandedEvent = Schema.TaggedStruct('Landed', {})
export const DataMoveEvent = Schema.Union([Built, LandedEvent])
export type DataMoveEvent = typeof DataMoveEvent.Type

const States = Machine.state({
  states: { Building, Copying, Landed },
})

const Events = Machine.events({
  Built: { until: Schema.Finite },
  Landed: {},
})

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
        // Only a copy that has started can land.
        Landed: { target: 'Landed', data: () => ({ _tag: 'Landed' }) },
      },
    },
    // The move is over: a later build or landing belongs to another move.
    Landed: {},
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: DataMovePhase, event: DataMoveEvent): DataMovePhase =>
  planState(dataMoveMachine, phase, event)

/** The copy landed, so the caller applies it and clears the Game's field. */
export const finished = (phase: DataMovePhase): boolean => phase._tag === 'Landed'
