import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const List = Schema.TaggedStruct('List', {})

export const Confirming = Schema.TaggedStruct('Confirming', {
  id: Schema.String,
})

export const ConfirmDelete = Schema.Union([List, Confirming])
export type ConfirmDelete = typeof ConfirmDelete.Type

export const Asked = Schema.TaggedStruct('Asked', {
  id: Schema.String,
})
export const Cancelled = Schema.TaggedStruct('Cancelled', {})
export const Confirmed = Schema.TaggedStruct('Confirmed', {})
export const ConfirmDeleteEvent = Schema.Union([Asked, Cancelled, Confirmed])
export type ConfirmDeleteEvent = typeof ConfirmDeleteEvent.Type

const States = Machine.state({ states: { List, Confirming } })

const Events = Machine.events({
  Asked: { id: Schema.String },
  Cancelled: {},
  Confirmed: {},
})

export const confirmDeleteMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'List' },
  states: {
    List: {
      on: {
        Asked: {
          target: 'Confirming',
          data: ({ event }) => ({ _tag: 'Confirming', id: event.id }),
        },
      },
    },
    Confirming: {
      on: {
        Cancelled: { target: 'List' },
        Confirmed: { target: 'List' },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: ConfirmDelete, event: ConfirmDeleteEvent): ConfirmDelete =>
  planState(confirmDeleteMachine, phase, event)
