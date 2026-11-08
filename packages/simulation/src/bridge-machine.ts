import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/** No offer waits: Cash is not short yet, or the offer is gone. */
export const None = Schema.TaggedStruct('None', {})
/** An offer waits for the player's answer. */
export const Offered = Schema.TaggedStruct('Offered', {
  grant: Schema.Finite,
  dilution: Schema.Finite,
})
/** The offer left the table, taken or expired. */
export const Taken = Schema.TaggedStruct('Taken', {})
export const BridgeState = Schema.Union([None, Offered, Taken])
export type BridgeState = typeof BridgeState.Type

/** Investors put a bridge on the table. */
export const OfferedEvent = Schema.TaggedStruct('Offered', {
  grant: Schema.Finite,
  dilution: Schema.Finite,
})
export const Accepted = Schema.TaggedStruct('Accepted', {})
/** Nobody answered it, so it left the table. */
export const Expired = Schema.TaggedStruct('Expired', {})
export const BridgeEvent = Schema.Union([OfferedEvent, Accepted, Expired])
export type BridgeEvent = typeof BridgeEvent.Type

const States = Machine.state({
  states: { None, Offered, Taken },
})

const Events = Machine.events({
  Offered: { grant: Schema.Finite, dilution: Schema.Finite },
  Accepted: {},
  Expired: {},
})

export const bridgeMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'None' },
  states: {
    // An answer without an offer is stale: there is nothing to take or let expire.
    None: {
      on: {
        Offered: {
          target: 'Offered',
          data: ({ event }) => ({
            _tag: 'Offered',
            grant: event.grant,
            dilution: event.dilution,
          }),
        },
      },
    },
    // The first answer decides the offer; a second offer waits for the next shortfall.
    Offered: {
      on: {
        Accepted: { target: 'Taken', data: () => ({ _tag: 'Taken' }) },
        Expired: { target: 'Taken', data: () => ({ _tag: 'Taken' }) },
      },
    },
    // The offer is gone, so nothing puts it back on the table.
    Taken: {},
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (state: BridgeState, event: BridgeEvent): BridgeState =>
  planState(bridgeMachine, state, event)
