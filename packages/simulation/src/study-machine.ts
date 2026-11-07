import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   A Study (10 "Studies"). It waits in the queue, runs when it reaches the
   front, and completes when its progress reaches the whole. The research, the
   Insight draw, and the queue order stay on the Game's studies; this machine
   only tracks where one Study stands.
   ========================================================================== */

/** It waits in the queue with `progress` of its base duration done. */
export const Queued = Schema.TaggedStruct('Queued', { progress: Schema.Finite })
/** It runs, with `progress` of its base duration done. */
export const Running = Schema.TaggedStruct('Running', { progress: Schema.Finite })
/** It is researched: the caller removes it from the Game's studies. */
export const Completed = Schema.TaggedStruct('Completed', {})
export const StudyPhase = Schema.Union([Queued, Running, Completed])
export type StudyPhase = typeof StudyPhase.Type

/** A Study enters the queue with `progress` done; the caller builds its state. */
export const QueuedEvent = Schema.TaggedStruct('Queued', { progress: Schema.Finite })
/** The Study reached the front of the queue. */
export const Started = Schema.TaggedStruct('Started', {})
/** A Step advanced the Study to `progress`. */
export const Ticked = Schema.TaggedStruct('Ticked', { progress: Schema.Finite })
/** Its progress reached the whole, so the queue removes it. */
export const CompletedEvent = Schema.TaggedStruct('Completed', {})
export const StudyEvent = Schema.Union([QueuedEvent, Started, Ticked, CompletedEvent])
export type StudyEvent = typeof StudyEvent.Type

const States = Machine.state({
  states: { Queued, Running, Completed },
})

const Events = Machine.events({
  Queued: { progress: Schema.Finite },
  Started: {},
  Ticked: { progress: Schema.Finite },
  Completed: {},
})

export const studyMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Queued', data: { progress: 0 } },
  states: {
    // A queued Study only starts; the caller stamps a new Study's progress.
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
        // Only a running Study can complete.
        Completed: { target: 'Completed', data: () => ({ _tag: 'Completed' }) },
      },
    },
    // The Study is researched: nothing reopens it.
    Completed: {},
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: StudyPhase, event: StudyEvent): StudyPhase =>
  planState(studyMachine, phase, event)
