import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   A funding round (09 "Funding rounds"). An Era's Milestone puts one offer on
   the table; the player raises or declines it, and the next Era starts once
   the round is answered. The grant, dilution, and Era advance stay in
   `actions.ts`; this machine only tracks where the offer stands.
   ========================================================================== */

/** No offer waits: the Era's Milestone has not been reached, or its round is answered. */
export const Waiting = Schema.TaggedStruct('Waiting', {})
/** An offer waits for the player's answer. */
export const Offered = Schema.TaggedStruct('Offered', {})
/** The player took the round. */
export const Raised = Schema.TaggedStruct('Raised', {})
/** The player turned the round down. */
export const Declined = Schema.TaggedStruct('Declined', {})
export const EraRound = Schema.Union([Waiting, Offered, Raised, Declined])
export type EraRound = typeof EraRound.Type

/** The Milestone was reached and the round was offered; the answer; the Era advance. */
export const EraRoundEvent = Schema.Union([
  Schema.TaggedStruct('Offered', {}),
  Schema.TaggedStruct('Raised', {}),
  Schema.TaggedStruct('Declined', {}),
  Schema.TaggedStruct('Advanced', {}),
])
export type EraRoundEvent = typeof EraRoundEvent.Type

const States = Machine.state({
  states: { Waiting, Offered, Raised, Declined },
})

const Events = Machine.events({
  Offered: {},
  Raised: {},
  Declined: {},
  Advanced: {},
})

export const eraRoundMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Waiting' },
  states: {
    // An answer without an offer is stale: there is nothing to raise or decline.
    Waiting: {
      on: {
        Offered: { target: 'Offered' },
      },
    },
    // The first answer decides the round; a second offer waits for the next Era.
    Offered: {
      on: {
        Raised: { target: 'Raised' },
        Declined: { target: 'Declined' },
      },
    },
    // The next Era's Milestone can put a new offer on the table after an answer.
    Raised: {
      on: {
        Offered: { target: 'Offered' },
        Advanced: { target: 'Waiting' },
      },
    },
    Declined: {
      on: {
        Offered: { target: 'Offered' },
        Advanced: { target: 'Waiting' },
      },
    },
  },
})

/** The next round phase, or the same one when the event does not apply. */
export const step = (round: EraRound, event: EraRoundEvent): EraRound =>
  planState(eraRoundMachine, round, event)
