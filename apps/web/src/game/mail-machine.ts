import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   A Mail's lifecycle (GDD 18): it waits for the player, holds the answer they
   chose, and resolves when its cause is gone. Whether it is read, and which
   folder holds it, stay outside this machine.
   ========================================================================== */

export const Active = Schema.TaggedStruct('Active', {})
export const Answered = Schema.TaggedStruct('Answered', {
  answer: Schema.String,
  answerId: Schema.String,
})
export const Resolved = Schema.TaggedStruct('Resolved', { at: Schema.Finite })
export const MailPhase = Schema.Union([Active, Answered, Resolved])
export type MailPhase = typeof MailPhase.Type

/** An event and a state can share a name: the tag says which protocol it belongs to. */
export const AnsweredEvent = Schema.TaggedStruct('Answered', {
  answer: Schema.String,
  answerId: Schema.String,
})
export const ClosedEvent = Schema.TaggedStruct('Closed', { at: Schema.Finite })
export const ReopenedEvent = Schema.TaggedStruct('Reopened', {})
export const ArrivedEvent = Schema.TaggedStruct('Arrived', {})
export const MailPhaseEvent = Schema.Union([
  AnsweredEvent,
  ClosedEvent,
  ReopenedEvent,
  ArrivedEvent,
])
export type MailPhaseEvent = typeof MailPhaseEvent.Type

type AnsweredState = Extract<MailPhase, Readonly<{ _tag: 'Answered' }>>
type ResolvedState = Extract<MailPhase, Readonly<{ _tag: 'Resolved' }>>

const answered = (answer: string, answerId: string): AnsweredState => ({
  _tag: 'Answered',
  answer,
  answerId,
})

const resolved = (at: number): ResolvedState => ({ _tag: 'Resolved', at })

const States = Machine.state({ states: { Active, Answered, Resolved } })

const Events = Machine.events({
  Answered: { answer: Schema.String, answerId: Schema.String },
  Closed: { at: Schema.Finite },
  Reopened: {},
  Arrived: {},
})

export const mailMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Active' },
  states: {
    Active: {
      on: {
        Answered: {
          target: 'Answered',
          data: ({ event }) => answered(event.answer, event.answerId),
        },
        Closed: {
          target: 'Resolved',
          data: ({ event }) => resolved(event.at),
        },
      },
    },
    Answered: {
      on: {
        /** Another answer replaces the first: the newest choice is the one that holds. */
        Answered: {
          target: 'Answered',
          data: ({ event }) => answered(event.answer, event.answerId),
        },
        Closed: {
          target: 'Resolved',
          data: ({ event }) => resolved(event.at),
        },
        /** A new line makes the Thread current again, so the buttons come back. */
        Arrived: { target: 'Active' },
      },
    },
    Resolved: {
      on: {
        /** A reply after resolution answers the Thread again. */
        Answered: {
          target: 'Answered',
          data: ({ event }) => answered(event.answer, event.answerId),
        },
        Arrived: { target: 'Active' },
        Reopened: { target: 'Active' },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: MailPhase, event: MailPhaseEvent): MailPhase =>
  planState(mailMachine, phase, event)
