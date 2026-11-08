import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const StudyPhase = Schema.TaggedUnion({
  Queued: { progress: Schema.Finite },
  Running: { progress: Schema.Finite },
  Completed: {},
})
export type StudyPhase = typeof StudyPhase.Type

export const StudyEvent = Schema.TaggedUnion({
  Queued: { progress: Schema.Finite },
  Started: {},
  Ticked: { progress: Schema.Finite },
  Completed: {},
})
export type StudyEvent = typeof StudyEvent.Type

const States = Machine.state({ states: StudyPhase.cases })
const Events = Machine.eventsFromSchemas(StudyEvent)

export const studyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Queued', data: { progress: 0 } },
  states: {
    Queued: {
      on: {
        Started: {
          target: 'Running',
          data: ({ state }) => ({ _tag: 'Running', progress: state.progress }),
        },
      },
    },
    Running: {
      on: {
        Ticked: {
          target: 'Running',
          data: ({ event }) => ({ _tag: 'Running', progress: event.progress }),
        },
        Completed: { target: 'Completed', data: () => ({ _tag: 'Completed' }) },
      },
    },
    Completed: {},
  },
})

export const step = (phase: StudyPhase, event: StudyEvent): StudyPhase =>
  planState(studyMachine, phase, event)
