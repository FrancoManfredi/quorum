import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

export const IncidentPhase = Schema.TaggedUnion({
  Quiet: {},
  Responded: { ackAt: Schema.Finite },
  Announced: { signalAt: Schema.Finite },
  Acknowledged: {
    signalAt: Schema.Finite,
    ackAt: Schema.Finite,
  },
})
export type IncidentPhase = typeof IncidentPhase.Type

export const IncidentEvent = Schema.TaggedUnion({
  Signalled: { at: Schema.Finite },
  Acked: { at: Schema.Finite },
  Resolved: {},
})
export type IncidentEvent = typeof IncidentEvent.Type

const States = Machine.state({ states: IncidentPhase.cases })
const Events = Machine.eventsFromSchemas(IncidentEvent)

export const incidentMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Quiet' },
  states: {
    Quiet: {
      on: {
        Signalled: {
          target: 'Announced',
          data: ({ event }) => ({ _tag: 'Announced', signalAt: event.at }),
        },
        Acked: {
          target: 'Responded',
          data: ({ event }) => ({ _tag: 'Responded', ackAt: event.at }),
        },
        Resolved: { target: 'Quiet' },
      },
    },
    Responded: {
      on: {
        Signalled: {
          target: 'Acknowledged',
          data: ({ state, event }) => ({
            _tag: 'Acknowledged',
            signalAt: event.at,
            ackAt: state.ackAt,
          }),
        },
        Resolved: { target: 'Quiet' },
      },
    },
    Announced: {
      on: {
        Acked: {
          target: 'Acknowledged',
          data: ({ state, event }) => ({
            _tag: 'Acknowledged',
            signalAt: state.signalAt,
            ackAt: event.at,
          }),
        },
        Resolved: { target: 'Quiet' },
      },
    },
    Acknowledged: {
      on: {
        Resolved: { target: 'Quiet' },
      },
    },
  },
})

export const step = (phase: IncidentPhase, event: IncidentEvent): IncidentPhase =>
  planState(incidentMachine, phase, event)

export const signalAtOf = (phase: IncidentPhase): number | null =>
  IncidentPhase.match(phase, {
    Quiet: () => null,
    Responded: () => null,
    Announced: ({ signalAt }) => signalAt,
    Acknowledged: ({ signalAt }) => signalAt,
  })

export const ackAtOf = (phase: IncidentPhase): number | null =>
  IncidentPhase.match(phase, {
    Quiet: () => null,
    Responded: ({ ackAt }) => ackAt,
    Announced: () => null,
    Acknowledged: ({ ackAt }) => ackAt,
  })

export const hasAck = (phase: IncidentPhase): boolean => ackAtOf(phase) !== null

export const isLeftAlone = (phase: IncidentPhase, remaining: number): boolean =>
  !hasAck(phase) && remaining <= 0
