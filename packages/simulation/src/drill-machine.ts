import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { DRILL_RECOVERED, DRILL_RPO, DRILL_RTO, DRILL_SECONDS } from './catalog.ts'
import { planState } from './machine.ts'

/* ==========================================================================
   The DR drill (10 "Era 6: Pre-IPO"). The home region fails for a minute: the
   drill recovers when the error share falls back under 1%, and it times out
   when the outage runs its full length plus the RTO budget. The start, the
   RPO, and whether the drill passed stay on the Game's Drill; this machine
   only tracks where the run stands.
   ========================================================================== */

/** The drill runs: it began at `startedAt` and would lose `rpo` minutes of writes. */
export const Running = Schema.TaggedStruct('Running', {
  startedAt: Schema.Finite,
  rpo: Schema.Finite,
})
/** Users are served again: recovery took `rto` minutes. */
export const Recovered = Schema.TaggedStruct('Recovered', {
  startedAt: Schema.Finite,
  rto: Schema.Finite,
  rpo: Schema.Finite,
})
/** The drill ended without recovering; `reason` names why. */
export const Failed = Schema.TaggedStruct('Failed', {
  startedAt: Schema.Finite,
  rpo: Schema.Finite,
  reason: Schema.Literals(['timeout', 'data-loss']),
})
export const DrillPhase = Schema.Union([Running, Recovered, Failed])
export type DrillPhase = typeof DrillPhase.Type

/** A Step's elapsed drill time, in calendar minutes, and the current error share. */
export const Ticked = Schema.TaggedStruct('Ticked', {
  elapsed: Schema.Finite,
  errorShare: Schema.Finite,
})
/** The caller clears the Game's `drill` field; the machine carries no null. */
export const Reset = Schema.TaggedStruct('Reset', {})
export const DrillEvent = Schema.Union([Ticked, Reset])
export type DrillEvent = typeof DrillEvent.Type

const States = Machine.state({
  states: { Running, Recovered, Failed },
})

const Events = Machine.events({
  Ticked: { elapsed: Schema.Finite, errorShare: Schema.Finite },
  Reset: {},
})

export const drillMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
    // A tick either records a recovery, ends the drill, or leaves it running.
    tick: {
      recovered: { target: 'Recovered' },
      failed: { target: 'Failed' },
    },
  },
}).handle({
  initial: { target: 'Running', data: { startedAt: 0, rpo: 0 } },
  states: {
    Running: {
      on: {
        Ticked: {
          branches: 'tick',
          // A tick that neither recovers nor times out leaves the drill as it was.
          guard: ({ event }) =>
            (event.errorShare < DRILL_RECOVERED && event.elapsed > 0) ||
            event.elapsed >= DRILL_SECONDS + DRILL_RTO,
          resolve: ({ state, event, select }) => {
            // One sim second is one calendar minute: the elapsed time is the RTO.
            if (event.errorShare < DRILL_RECOVERED && event.elapsed > 0)
              return select.recovered({
                data: {
                  _tag: 'Recovered',
                  startedAt: state.startedAt,
                  rto: event.elapsed,
                  rpo: state.rpo,
                },
              })
            return select.failed({
              data: {
                _tag: 'Failed',
                startedAt: state.startedAt,
                rpo: state.rpo,
                reason: 'timeout',
              },
            })
          },
        },
      },
    },
    // A finished drill records its outcome once: later ticks change nothing.
    Recovered: {},
    Failed: {},
  },
})

/** The next phase, or the same one when the event does not apply. */
export const step = (phase: DrillPhase, event: DrillEvent): DrillPhase =>
  planState(drillMachine, phase, event)

/** The drill passed: users were served again in time, and the data loss is small enough. */
export const drillPassed = (phase: DrillPhase | null): boolean =>
  phase?._tag === 'Recovered' && phase.rto < DRILL_RTO && phase.rpo < DRILL_RPO

/** The drill is over, whether it passed or not. */
export const drillDone = (phase: DrillPhase | null): boolean =>
  phase !== null && phase._tag !== 'Running'

/** The recovery time in calendar minutes, once the drill recovered. */
export const drillRto = (phase: DrillPhase | null): number | null =>
  phase?._tag === 'Recovered' ? phase.rto : null
