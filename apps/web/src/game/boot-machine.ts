import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   The boot sequence: the clock-in reader, the title, and the monitor's
   connect animation before a board. One state says where the app is.
   ========================================================================== */

export const Shut = Schema.TaggedStruct('Shut', {})
export const Clocking = Schema.TaggedStruct('Clocking', {})
export const Ready = Schema.TaggedStruct('Ready', {})
export const Connecting = Schema.TaggedStruct('Connecting', {})
export const Boot = Schema.Union([Shut, Clocking, Ready, Connecting])
export type Boot = typeof Boot.Type

export const ClockedIn = Schema.TaggedStruct('ClockedIn', {})
export const TitleRevealed = Schema.TaggedStruct('TitleRevealed', {})
export const BoardOpened = Schema.TaggedStruct('BoardOpened', {})
export const Connected = Schema.TaggedStruct('Connected', {})
export const BootEvent = Schema.Union([ClockedIn, TitleRevealed, BoardOpened, Connected])
export type BootEvent = typeof BootEvent.Type

const States = Machine.state({ states: { Shut, Clocking, Ready, Connecting } })

const Events = Machine.events({
  ClockedIn: {},
  TitleRevealed: {},
  BoardOpened: {},
  Connected: {},
})

export const bootMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Shut' },
  states: {
    Shut: {
      on: {
        ClockedIn: { target: 'Clocking' },
      },
    },
    Clocking: {
      on: {
        TitleRevealed: { target: 'Ready' },
      },
    },
    Ready: {
      on: {
        BoardOpened: { target: 'Connecting' },
      },
    },
    Connecting: {
      on: {
        Connected: { target: 'Ready' },
      },
    },
  },
})

/** The next state, or the same one when the event does not apply. */
export const bootStep = (boot: Boot, event: BootEvent): Boot => planState(bootMachine, boot, event)

/** The title has finished revealing, so the booth replaces the reader. */
export const titleIsOpen = (boot: Boot): boolean =>
  boot._tag === 'Ready' || boot._tag === 'Connecting'

/** The monitor is playing its connect sequence: the clock holds and keys are ignored. */
export const connecting = (boot: Boot): boolean => boot._tag === 'Connecting'
