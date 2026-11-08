import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import { DRILL_RECOVERED, DRILL_RPO, DRILL_RTO, DRILL_SECONDS } from './catalog.ts'
import { planState } from './machine.ts'

export const DrillPhase = Schema.TaggedUnion({
  Running: {
    startedAt: Schema.Finite,
    rpo: Schema.Finite,
  },
  Recovered: {
    startedAt: Schema.Finite,
    rto: Schema.Finite,
    rpo: Schema.Finite,
  },
  Failed: {
    startedAt: Schema.Finite,
    rpo: Schema.Finite,
    reason: Schema.Literals(['timeout', 'data-loss']),
  },
})
export type DrillPhase = typeof DrillPhase.Type

export const DrillEvent = Schema.TaggedUnion({
  Ticked: {
    elapsed: Schema.Finite,
    errorShare: Schema.Finite,
  },
  Reset: {},
})
export type DrillEvent = typeof DrillEvent.Type

const States = Machine.state({ states: DrillPhase.cases })
const Events = Machine.eventsFromSchemas(DrillEvent)

export const drillMachine = Machine.make({
  root: States,
  events: Events,
  branches: {
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
          guard: ({ event }) =>
            (event.errorShare < DRILL_RECOVERED && event.elapsed > 0) ||
            event.elapsed >= DRILL_SECONDS + DRILL_RTO,
          resolve: ({ state, event, select }) => {
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
    Recovered: {},
    Failed: {},
  },
})

export const step = (phase: DrillPhase, event: DrillEvent): DrillPhase =>
  planState(drillMachine, phase, event)

export const drillPassed = (phase: DrillPhase | null): boolean =>
  DrillPhase.guards.Recovered(phase) && phase.rto < DRILL_RTO && phase.rpo < DRILL_RPO

export const drillDone = (phase: DrillPhase | null): boolean =>
  phase !== null && !DrillPhase.guards.Running(phase)

export const drillRto = (phase: DrillPhase | null): number | null =>
  DrillPhase.guards.Recovered(phase) ? phase.rto : null
