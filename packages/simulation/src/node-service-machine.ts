import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const NodeService = Schema.TaggedUnion({
  InService: {},
  Draining: { since: Schema.Finite },
  Shut: {},
})
export type NodeService = typeof NodeService.Type

export const NodeServiceEvent = Schema.TaggedUnion({
  Drained: { at: Schema.Finite },
  DrainFinished: {},
  Shutdown: {},
  Restarted: {},
})
export type NodeServiceEvent = typeof NodeServiceEvent.Type

const States = Machine.state({ states: NodeService.cases })
const Events = Machine.eventsFromSchemas(NodeServiceEvent)

export const nodeServiceMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'InService' },
  states: {
    InService: {
      on: {
        Drained: {
          target: 'Draining',
          data: ({ event }) => ({ _tag: 'Draining', since: event.at }),
        },
        Shutdown: { target: 'Shut', data: () => ({ _tag: 'Shut' }) },
      },
    },
    Draining: {
      on: {
        DrainFinished: { target: 'InService', data: () => ({ _tag: 'InService' }) },
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

export const step = (service: NodeService, event: NodeServiceEvent): NodeService =>
  planState(nodeServiceMachine, service, event)

export const isShut = NodeService.guards.Shut

export const isDraining = NodeService.guards.Draining
