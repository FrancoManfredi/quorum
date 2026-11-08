import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const SurveyPhase = Schema.TaggedUnion({
  Open: {},
  Sending: {},
  Sent: {},
  Failed: { note: Schema.String },
  Skipped: {},
})
export type SurveyPhase = typeof SurveyPhase.Type

export const SurveyEvent = Schema.TaggedUnion({
  Submitted: {},
  Sent: {},
  Failed: { note: Schema.String },
  Skipped: {},
  Reset: {},
})
export type SurveyEvent = typeof SurveyEvent.Type

const States = Machine.state({ states: SurveyPhase.cases })
const Events = Machine.eventsFromSchemas(SurveyEvent)

export const surveyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Open' },
  states: {
    Open: {
      on: {
        Submitted: { target: 'Sending' },
        Skipped: { target: 'Skipped' },
        Reset: { target: 'Open' },
      },
    },
    Sending: {
      on: {
        Sent: { target: 'Sent' },
        Failed: {
          target: 'Failed',
          data: ({ event }) => ({ _tag: 'Failed', note: event.note }),
        },
        Reset: { target: 'Open' },
      },
    },
    Failed: {
      on: {
        Submitted: { target: 'Sending' },
        Skipped: { target: 'Skipped' },
        Reset: { target: 'Open' },
      },
    },
    Sent: {
      on: {
        Reset: { target: 'Open' },
      },
    },
    Skipped: {
      on: {
        Reset: { target: 'Open' },
      },
    },
  },
})

export const step = (phase: SurveyPhase, event: SurveyEvent): SurveyPhase =>
  planState(surveyMachine, phase, event)

export const canSubmit = SurveyPhase.isAnyOf(['Open', 'Failed'])

export const isSending = SurveyPhase.guards.Sending

export const isSent = SurveyPhase.guards.Sent

export const isSkipped = SurveyPhase.guards.Skipped

export const noteOf = (phase: SurveyPhase): string | null =>
  SurveyPhase.match(phase, {
    Open: () => null,
    Sending: () => null,
    Sent: () => null,
    Failed: ({ note }) => note,
    Skipped: () => null,
  })
