import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const ClockMode = Schema.TaggedUnion({
  Running: {},
  PausedByPlayer: {},
  PausedByBlur: {},
  PausedByIncident: {},
})
export type ClockMode = typeof ClockMode.Type

export const ClockEvent = Schema.TaggedUnion({
  PauseToggled: {},
  Blurred: {},
  Focused: {},
  SevereIncident: {},
  Resumed: {},
  Paused: {},
})
export type ClockEvent = typeof ClockEvent.Type

const States = Machine.state({ states: ClockMode.cases })
const Events = Machine.eventsFromSchemas(ClockEvent)

export const clockMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Running' },
  states: {
    Running: {
      on: {
        PauseToggled: { target: 'PausedByPlayer' },
        Blurred: { target: 'PausedByBlur' },
        SevereIncident: { target: 'PausedByIncident' },
        Paused: { target: 'PausedByPlayer' },
      },
    },
    PausedByPlayer: {
      on: {
        PauseToggled: { target: 'Running' },
        Resumed: { target: 'Running' },
        Paused: { target: 'PausedByPlayer' },
      },
    },
    PausedByBlur: {
      on: {
        PauseToggled: { target: 'Running' },
        Focused: { target: 'Running' },
        Resumed: { target: 'Running' },
        Paused: { target: 'PausedByPlayer' },
      },
    },
    PausedByIncident: {
      on: {
        PauseToggled: { target: 'Running' },
        Resumed: { target: 'Running' },
        Paused: { target: 'PausedByPlayer' },
      },
    },
  },
})

export const clockStep = (mode: ClockMode, event: ClockEvent): ClockMode =>
  planState(clockMachine, mode, event)

export const paused = (mode: ClockMode): boolean => !ClockMode.guards.Running(mode)

export const away = ClockMode.guards.PausedByBlur
