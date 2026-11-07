import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { planState } from './machine.ts'

/* ==========================================================================
   The Incident loop (11 "The incident loop"). An incident is quiet until its
   first signal lands, and a player can act before that signal: without
   Alerting the board shows nothing until requests fail. Severity, remaining
   time, magnitude, and the cost fields stay on the Game's Incident; this
   machine only tracks how far the response got.
   ========================================================================== */

/** No incident runs, so the Game's `incident` is null. */
export const Quiet = Schema.TaggedStruct('Quiet', {})
/** A player acted before the signal: without Alerting, nothing paged them. */
export const Responded = Schema.TaggedStruct('Responded', { ackAt: Schema.Finite })
/** The first signal landed, and nobody has acknowledged it yet. */
export const Announced = Schema.TaggedStruct('Announced', { signalAt: Schema.Finite })
/** The signal landed and someone answered it, in either order. */
export const Acknowledged = Schema.TaggedStruct('Acknowledged', {
  signalAt: Schema.Finite,
  ackAt: Schema.Finite,
})
export const IncidentPhase = Schema.Union([Quiet, Responded, Announced, Acknowledged])
export type IncidentPhase = typeof IncidentPhase.Type

/** The first signal landed at `at`: the pager, or the board when nothing pages. */
export const Signalled = Schema.TaggedStruct('Signalled', { at: Schema.Finite })
/** A player first acted at `at`, or the on-call rotation answered the page. */
export const Acked = Schema.TaggedStruct('Acked', { at: Schema.Finite })
/** The incident ended; the caller clears the Game's `incident` field. */
export const Resolved = Schema.TaggedStruct('Resolved', {})
export const IncidentEvent = Schema.Union([Signalled, Acked, Resolved])
export type IncidentEvent = typeof IncidentEvent.Type

const States = Machine.state({
  states: { Quiet, Responded, Announced, Acknowledged },
})

const Events = Machine.events({
  Signalled: { at: Schema.Finite },
  Acked: { at: Schema.Finite },
  Resolved: {},
})

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
        // The signal lands after the action, so both times are known now.
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
        // The signal and the acknowledgement are recorded once, at their first Step.
        Resolved: { target: 'Quiet' },
      },
    },
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: IncidentPhase, event: IncidentEvent): IncidentPhase =>
  planState(incidentMachine, phase, event)

/** The sim second the first signal landed, or null before it does. */
export const signalAtOf = (phase: IncidentPhase): number | null => {
  switch (phase._tag) {
    case 'Announced':
    case 'Acknowledged':
      return phase.signalAt
    case 'Quiet':
    case 'Responded':
      return null
  }
}

/** The sim second someone first answered the incident, or null until they do. */
export const ackAtOf = (phase: IncidentPhase): number | null => {
  switch (phase._tag) {
    case 'Responded':
    case 'Acknowledged':
      return phase.ackAt
    case 'Quiet':
    case 'Announced':
      return null
  }
}

/** Someone answered the incident, before or after its signal. */
export const hasAck = (phase: IncidentPhase): boolean => ackAtOf(phase) !== null

/**
 * The incident festered: nobody answered it and its time ran out (11 "Cascades").
 * The caller still has to check that no earlier incident started this one.
 */
export const isLeftAlone = (phase: IncidentPhase, remaining: number): boolean =>
  !hasAck(phase) && remaining <= 0
