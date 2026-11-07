import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   The board's clock. Running, paused by the player, paused because the window
   lost focus, or auto-paused by a severe Incident: four phases, one reason.
   ========================================================================== */

export const Running = Schema.TaggedStruct('Running', {})
export const PausedByPlayer = Schema.TaggedStruct('PausedByPlayer', {})
export const PausedByBlur = Schema.TaggedStruct('PausedByBlur', {})
export const PausedByIncident = Schema.TaggedStruct('PausedByIncident', {})
export const ClockMode = Schema.Union([Running, PausedByPlayer, PausedByBlur, PausedByIncident])
export type ClockMode = typeof ClockMode.Type

export const PauseToggled = Schema.TaggedStruct('PauseToggled', {})
export const Blurred = Schema.TaggedStruct('Blurred', {})
export const Focused = Schema.TaggedStruct('Focused', {})
export const SevereIncident = Schema.TaggedStruct('SevereIncident', {})
export const Resumed = Schema.TaggedStruct('Resumed', {})
export const Paused = Schema.TaggedStruct('Paused', {})
export const ClockEvent = Schema.Union([
  PauseToggled,
  Blurred,
  Focused,
  SevereIncident,
  Resumed,
  Paused,
])
export type ClockEvent = typeof ClockEvent.Type

const States = Machine.state({
  states: { Running, PausedByPlayer, PausedByBlur, PausedByIncident },
})

const Events = Machine.events({
  PauseToggled: {},
  Blurred: {},
  Focused: {},
  SevereIncident: {},
  Resumed: {},
  Paused: {},
})

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

/** The next clock mode, or the same one when the event does not apply. */
export const clockStep = (mode: ClockMode, event: ClockEvent): ClockMode =>
  planState(clockMachine, mode, event)

/** The clock holds still. */
export const paused = (mode: ClockMode): boolean => mode._tag !== 'Running'

/** The pause came from the window losing focus, so focus resumes it. */
export const away = (mode: ClockMode): boolean => mode._tag === 'PausedByBlur'
