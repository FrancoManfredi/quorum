import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const EraRound = Schema.TaggedUnion({
  Waiting: {},
  Offered: {},
  Raised: {},
  Declined: {},
})
export type EraRound = typeof EraRound.Type

export const EraRoundEvent = Schema.TaggedUnion({
  Offered: {},
  Raised: {},
  Declined: {},
  Advanced: {},
})
export type EraRoundEvent = typeof EraRoundEvent.Type

const States = Machine.state({ states: EraRound.cases })
const Events = Machine.eventsFromSchemas(EraRoundEvent)

export const eraRoundMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Waiting' },
  states: {
    Waiting: {
      on: {
        Offered: { target: 'Offered' },
      },
    },
    Offered: {
      on: {
        Raised: { target: 'Raised' },
        Declined: { target: 'Declined' },
      },
    },
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

export const step = (round: EraRound, event: EraRoundEvent): EraRound =>
  planState(eraRoundMachine, round, event)
