import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const MailPhase = Schema.TaggedUnion({
  Active: {},
  Answered: {
    answer: Schema.String,
    answerId: Schema.String,
  },
  Resolved: { at: Schema.Finite },
})
export type MailPhase = typeof MailPhase.Type

export const MailPhaseEvent = Schema.TaggedUnion({
  Answered: {
    answer: Schema.String,
    answerId: Schema.String,
  },
  Closed: { at: Schema.Finite },
  Reopened: {},
  Arrived: {},
})
export type MailPhaseEvent = typeof MailPhaseEvent.Type

type AnsweredState = typeof MailPhase.cases.Answered.Type
type ResolvedState = typeof MailPhase.cases.Resolved.Type

const answered = (answer: string, answerId: string): AnsweredState => ({
  _tag: 'Answered',
  answer,
  answerId,
})

const resolved = (at: number): ResolvedState => ({ _tag: 'Resolved', at })

const States = Machine.state({ states: MailPhase.cases })
const Events = Machine.eventsFromSchemas(MailPhaseEvent)

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
        Answered: {
          target: 'Answered',
          data: ({ event }) => answered(event.answer, event.answerId),
        },
        Closed: {
          target: 'Resolved',
          data: ({ event }) => resolved(event.at),
        },
        Arrived: { target: 'Active' },
      },
    },
    Resolved: {
      on: {
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

export const step = (phase: MailPhase, event: MailPhaseEvent): MailPhase =>
  planState(mailMachine, phase, event)
