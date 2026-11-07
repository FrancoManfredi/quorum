import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   A Public quarter's guidance window (10 "Era 7"). Guidance is open on the
   quarter's first calendar day: the player sets it, or the day passes and the
   quarter runs as it is. The rollover itself stays in `quarters.ts`; this
   machine only says whether guidance is still open.
   ========================================================================== */

/** The quarter is young enough for the player to set guidance. */
export const AwaitingGuidance = Schema.TaggedStruct('AwaitingGuidance', {})
/** Guidance is set, or its window closed: the quarter runs to its end. */
export const Running = Schema.TaggedStruct('Running', {})
export const QuarterPhase = Schema.Union([AwaitingGuidance, Running])
export type QuarterPhase = typeof QuarterPhase.Type

/** The player set this quarter's guidance. */
export const GuidanceSet = Schema.TaggedStruct('GuidanceSet', {})
/** The guidance window closed with no choice, so the quarter runs as it is. */
export const Started = Schema.TaggedStruct('Started', {})
export const QuarterEvent = Schema.Union([GuidanceSet, Started])
export type QuarterEvent = typeof QuarterEvent.Type

const States = Machine.state({
  states: { AwaitingGuidance, Running },
})

const Events = Machine.events({
  GuidanceSet: {},
  Started: {},
})

export const quarterMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'AwaitingGuidance' },
  states: {
    AwaitingGuidance: {
      on: {
        GuidanceSet: { target: 'Running' },
        Started: { target: 'Running' },
      },
    },
    // Guidance is closed for this quarter: nothing reopens it.
    Running: {},
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: QuarterPhase, event: QuarterEvent): QuarterPhase =>
  planState(quarterMachine, phase, event)
