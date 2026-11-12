import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/**
 * Where the key check stands. `Idle` is also the resting phase of an active key:
 * what the browser holds is in `Model.access`, and this only tracks the check in
 * flight, so a refused key and a saved one cannot disagree.
 */
export const KeyPhase = Schema.TaggedUnion({
  Idle: {},
  Checking: {},
  Refused: { note: Schema.String },
})
export type KeyPhase = typeof KeyPhase.Type

export const KeyEvent = Schema.TaggedUnion({
  Submitted: {},
  Accepted: {},
  Refused: { note: Schema.String },
  /** The player changes the field, so a refusal about the old text stops showing. */
  Edited: {},
  Cleared: {},
})
export type KeyEvent = typeof KeyEvent.Type

const States = Machine.state({ states: KeyPhase.cases })
const Events = Machine.eventsFromSchemas(KeyEvent)

export const keyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Idle' },
  states: {
    Idle: {
      on: {
        Submitted: { target: 'Checking' },
      },
    },
    Checking: {
      on: {
        Accepted: { target: 'Idle' },
        Refused: {
          target: 'Refused',
          data: ({ event }) => ({ _tag: 'Refused', note: event.note }),
        },
        Cleared: { target: 'Idle' },
      },
    },
    Refused: {
      on: {
        Submitted: { target: 'Checking' },
        Edited: { target: 'Idle' },
        Cleared: { target: 'Idle' },
      },
    },
  },
})

export const keyStep = (phase: KeyPhase, event: KeyEvent): KeyPhase =>
  planState(keyMachine, phase, event)
