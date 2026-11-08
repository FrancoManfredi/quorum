import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/**
 * The offer is accepted and the engineer joins at `readyAt`. A fresh machine
 * has no date yet: the caller sends `Hired` with the offer's own.
 */
export const Pending = Schema.TaggedStruct('Pending', { readyAt: Schema.Finite })
export const Joined = Schema.TaggedStruct('Joined', {})
export const HirePhase = Schema.Union([Pending, Joined])
export type HirePhase = typeof HirePhase.Type

/**
 * An offer was accepted at `readyAt`, or the Step at `at` tried to join the
 * engineer: the phase only joins once `at` reaches the date.
 */
export const HireEvent = Schema.Union([
  Schema.TaggedStruct('Hired', { readyAt: Schema.Finite }),
  Schema.TaggedStruct('Joined', { at: Schema.Finite }),
])
export type HireEvent = typeof HireEvent.Type

const States = Machine.state({
  states: { Pending, Joined },
})

const Events = Machine.events({
  Hired: { readyAt: Schema.Finite },
  Joined: { at: Schema.Finite },
})

export const hireMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Pending', data: { readyAt: 0 } },
  states: {
    Pending: {
      on: {
        // A re-negotiated offer moves the date, not the phase.
        Hired: {
          target: 'Pending',
          data: ({ event }) => ({ _tag: 'Pending', readyAt: event.readyAt }),
        },
        // A Step may land after the date; it never joins the engineer early.
        Joined: {
          target: 'Joined',
          guard: ({ state, event }) => event.at >= state.readyAt,
          data: () => ({ _tag: 'Joined' }),
        },
      },
    },
    // An engineer joins once: a later event cannot take them off the payroll.
    Joined: {},
  },
})

/** The next hire phase, or the same one when the event does not apply. */
export const step = (phase: HirePhase, event: HireEvent): HirePhase =>
  planState(hireMachine, phase, event)

export const isJoined = (phase: HirePhase): boolean => phase._tag === 'Joined'
