import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const Breaker = Schema.TaggedUnion({
  Closed: {},
  Open: { until: Schema.Finite },
})
export type Breaker = typeof Breaker.Type

export const BreakerEvent = Schema.TaggedUnion({
  Tripped: { until: Schema.Finite },
  ClosedAt: { at: Schema.Finite },
})
export type BreakerEvent = typeof BreakerEvent.Type

const States = Machine.state({ states: Breaker.cases })
const Events = Machine.eventsFromSchemas(BreakerEvent)

export const breakerMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Closed' },
  states: {
    Closed: {
      on: {
        Tripped: {
          target: 'Open',
          data: ({ event }) => ({ _tag: 'Open', until: event.until }),
        },
      },
    },
    Open: {
      on: {
        ClosedAt: {
          target: 'Closed',
          guard: ({ state, event }) => event.at >= state.until,
          data: () => ({ _tag: 'Closed' }),
        },
      },
    },
  },
})

export const step = (breaker: Breaker, event: BreakerEvent): Breaker =>
  planState(breakerMachine, breaker, event)

export const isOpen = Breaker.guards.Open

export const openUntil = (breaker: Breaker): number | null =>
  Breaker.match(breaker, {
    Closed: () => null,
    Open: ({ until }) => until,
  })
