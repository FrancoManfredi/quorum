import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const Closed = Schema.TaggedStruct('Closed', {})
/** Calls fail fast until `until`; the Link sends nothing. */
export const Open = Schema.TaggedStruct('Open', { until: Schema.Finite })
export const Breaker = Schema.Union([Closed, Open])
export type Breaker = typeof Breaker.Type

/** Calls failed, so the breaker opened until `until`. */
export const Tripped = Schema.TaggedStruct('Tripped', { until: Schema.Finite })
/** A Step reached `at`: the open window is over. */
export const ClosedAt = Schema.TaggedStruct('ClosedAt', { at: Schema.Finite })
export const BreakerEvent = Schema.Union([Tripped, ClosedAt])
export type BreakerEvent = typeof BreakerEvent.Type

const States = Machine.state({
  states: { Closed, Open },
})

const Events = Machine.events({
  Tripped: { until: Schema.Finite },
  ClosedAt: { at: Schema.Finite },
})

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
        // A Step may land after `until`; it never closes the breaker early.
        ClosedAt: {
          target: 'Closed',
          guard: ({ state, event }) => event.at >= state.until,
          data: () => ({ _tag: 'Closed' }),
        },
      },
    },
  },
})

/** The next breaker state, or the same one when the event does not apply. */
export const step = (breaker: Breaker, event: BreakerEvent): Breaker =>
  planState(breakerMachine, breaker, event)

/** The Link fails fast and sends nothing. */
export const isOpen = (breaker: Breaker): boolean => breaker._tag === 'Open'

/** The sim second the breaker closes again, or null while it is closed. */
export const openUntil = (breaker: Breaker): number | null =>
  breaker._tag === 'Open' ? breaker.until : null
