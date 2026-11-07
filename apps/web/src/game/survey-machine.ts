import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   The Exit survey (13 "The Exit"). It is open after a Company ends, sending
   while the API Worker has the answers, and sent, failed, or skipped after
   that. The two answers stay on the Model; this machine tracks the send.
   ========================================================================== */

/** The survey waits for answers. */
export const Open = Schema.TaggedStruct('Open', {})
/** The answers are with the API Worker. */
export const Sending = Schema.TaggedStruct('Sending', {})
/** The API Worker accepted the answers. */
export const Sent = Schema.TaggedStruct('Sent', {})
/** The send failed at `note`, and the player can try again. */
export const Failed = Schema.TaggedStruct('Failed', { note: Schema.String })
/** The player chose not to answer. */
export const Skipped = Schema.TaggedStruct('Skipped', {})
export const SurveyPhase = Schema.Union([Open, Sending, Sent, Failed, Skipped])
export type SurveyPhase = typeof SurveyPhase.Type

/** The player sent the answers. */
export const Submitted = Schema.TaggedStruct('Submitted', {})
/** The API Worker accepted the answers. */
export const SentEvent = Schema.TaggedStruct('Sent', {})
/** The API Worker rejected the answers, or the network did. */
export const FailedEvent = Schema.TaggedStruct('Failed', { note: Schema.String })
/** The player skipped the survey. */
export const SkippedEvent = Schema.TaggedStruct('Skipped', {})
/** The next Company starts with a fresh survey. */
export const Reset = Schema.TaggedStruct('Reset', {})
export const SurveyEvent = Schema.Union([Submitted, SentEvent, FailedEvent, SkippedEvent, Reset])
export type SurveyEvent = typeof SurveyEvent.Type

const States = Machine.state({
  states: { Open, Sending, Sent, Failed, Skipped },
})

const Events = Machine.events({
  Submitted: {},
  Sent: {},
  Failed: { note: Schema.String },
  Skipped: {},
  Reset: {},
})

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
        // A send that already failed cannot land: the player may retry from Failed.
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

/** The next survey phase, or the same one when the event does not apply. */
export const step = (phase: SurveyPhase, event: SurveyEvent): SurveyPhase =>
  planState(surveyMachine, phase, event)

/** The survey waits for an answer, or a retry after a failed send. */
export const canSubmit = (phase: SurveyPhase): boolean =>
  phase._tag === 'Open' || phase._tag === 'Failed'

/** The answers are with the API Worker. */
export const isSending = (phase: SurveyPhase): boolean => phase._tag === 'Sending'

/** The API Worker accepted the answers. */
export const isSent = (phase: SurveyPhase): boolean => phase._tag === 'Sent'

/** The player chose not to answer. */
export const isSkipped = (phase: SurveyPhase): boolean => phase._tag === 'Skipped'

/** Why the last send failed, or null. */
export const noteOf = (phase: SurveyPhase): string | null =>
  phase._tag === 'Failed' ? phase.note : null
