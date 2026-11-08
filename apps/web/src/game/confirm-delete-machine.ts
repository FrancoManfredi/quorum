import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const ConfirmDelete = Schema.TaggedUnion({
  List: {},
  Confirming: {
    id: Schema.String,
  },
})
export type ConfirmDelete = typeof ConfirmDelete.Type

export const ConfirmDeleteEvent = Schema.TaggedUnion({
  Asked: {
    id: Schema.String,
  },
  Cancelled: {},
  Confirmed: {},
})
export type ConfirmDeleteEvent = typeof ConfirmDeleteEvent.Type

const States = Machine.state({ states: ConfirmDelete.cases })
const Events = Machine.eventsFromSchemas(ConfirmDeleteEvent)

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

export const step = (phase: ConfirmDelete, event: ConfirmDeleteEvent): ConfirmDelete =>
  planState(confirmDeleteMachine, phase, event)
