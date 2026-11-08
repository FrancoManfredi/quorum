import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const Boot = Schema.TaggedUnion({
  Shut: {},
  Clocking: {},
  Ready: {},
  Connecting: {},
})
export type Boot = typeof Boot.Type

export const BootEvent = Schema.TaggedUnion({
  ClockedIn: {},
  TitleRevealed: {},
  BoardOpened: {},
  Connected: {},
})
export type BootEvent = typeof BootEvent.Type

const States = Machine.state({ states: Boot.cases })
const Events = Machine.eventsFromSchemas(BootEvent)

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

export const bootStep = (boot: Boot, event: BootEvent): Boot => planState(bootMachine, boot, event)

export const titleIsOpen = Boot.isAnyOf(['Ready', 'Connecting'])

export const connecting = Boot.guards.Connecting
