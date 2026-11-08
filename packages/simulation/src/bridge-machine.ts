import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const BridgeState = Schema.TaggedUnion({
  None: {},
  Offered: {
    grant: Schema.Finite,
    dilution: Schema.Finite,
  },
  Taken: {},
})
export type BridgeState = typeof BridgeState.Type

export const BridgeEvent = Schema.TaggedUnion({
  Offered: {
    grant: Schema.Finite,
    dilution: Schema.Finite,
  },
  Accepted: {},
  Expired: {},
})
export type BridgeEvent = typeof BridgeEvent.Type

const States = Machine.state({ states: BridgeState.cases })
const Events = Machine.eventsFromSchemas(BridgeEvent)

export const bridgeMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'None' },
  states: {
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
    Offered: {
      on: {
        Accepted: { target: 'Taken', data: () => ({ _tag: 'Taken' }) },
        Expired: { target: 'Taken', data: () => ({ _tag: 'Taken' }) },
      },
    },
    Taken: {},
  },
})

export const step = (state: BridgeState, event: BridgeEvent): BridgeState =>
  planState(bridgeMachine, state, event)
