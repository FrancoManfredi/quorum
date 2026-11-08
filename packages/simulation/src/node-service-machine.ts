import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const InService = Schema.TaggedStruct('InService', {})
/** Taking no new traffic at `since`, finishing the work it holds. */
export const Draining = Schema.TaggedStruct('Draining', { since: Schema.Finite })
/** The Company shut it down: it serves nothing and bills nothing. */
export const Shut = Schema.TaggedStruct('Shut', {})
export const NodeService = Schema.Union([InService, Draining, Shut])
export type NodeService = typeof NodeService.Type

export const Drained = Schema.TaggedStruct('Drained', { at: Schema.Finite })
/** Its held work finished, so it rejoins the rotation. */
export const DrainFinished = Schema.TaggedStruct('DrainFinished', {})
export const Shutdown = Schema.TaggedStruct('Shutdown', {})
/** The player brought a shut Node back. */
export const Restarted = Schema.TaggedStruct('Restarted', {})
export const NodeServiceEvent = Schema.Union([Drained, DrainFinished, Shutdown, Restarted])
export type NodeServiceEvent = typeof NodeServiceEvent.Type

const States = Machine.state({
  states: { InService, Draining, Shut },
})

const Events = Machine.events({
  Drained: { at: Schema.Finite },
  DrainFinished: {},
  Shutdown: {},
  Restarted: {},
})

export const nodeServiceMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'InService' },
  states: {
    InService: {
      on: {
        Drained: {
          target: 'Draining',
          data: ({ event }) => ({ _tag: 'Draining', since: event.at }),
        },
        // A drain that never started has nothing to finish.
        Shutdown: { target: 'Shut', data: () => ({ _tag: 'Shut' }) },
      },
    },
    Draining: {
      on: {
        DrainFinished: { target: 'InService', data: () => ({ _tag: 'InService' }) },
        // A second drain keeps the first one's start: the window runs from it.
        Shutdown: { target: 'Shut', data: () => ({ _tag: 'Shut' }) },
      },
    },
    Shut: {
      on: {
        Shutdown: { target: 'Shut', data: () => ({ _tag: 'Shut' }) },
        Restarted: { target: 'InService', data: () => ({ _tag: 'InService' }) },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (service: NodeService, event: NodeServiceEvent): NodeService =>
  planState(nodeServiceMachine, service, event)

/** The Company shut it down, so it serves nothing and bills nothing. */
export const isShut = (service: NodeService): boolean => service._tag === 'Shut'

/** It takes no new traffic while the work it holds finishes. */
export const isDraining = (service: NodeService): boolean => service._tag === 'Draining'
