import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const QuarterPhase = Schema.TaggedUnion({
  AwaitingGuidance: {},
  Running: {},
})
export type QuarterPhase = typeof QuarterPhase.Type

export const QuarterEvent = Schema.TaggedUnion({
  GuidanceSet: {},
  Started: {},
})
export type QuarterEvent = typeof QuarterEvent.Type

const States = Machine.state({ states: QuarterPhase.cases })
const Events = Machine.eventsFromSchemas(QuarterEvent)

export const quarterMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'AwaitingGuidance' },
  states: {
    AwaitingGuidance: {
      on: {
        GuidanceSet: { target: 'Running' },
        Started: { target: 'Running' },
      },
    },
    Running: {},
  },
})

export const step = (phase: QuarterPhase, event: QuarterEvent): QuarterPhase =>
  planState(quarterMachine, phase, event)
