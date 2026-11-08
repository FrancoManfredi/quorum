import { Machine } from '@typeonce/effect-machine'
import { Schema } from 'effect'
import {
  ChallengeResult,
  NO_TOTALS,
  RunTotals,
  type ChallengeResult as ChallengeResultType,
} from '@quorum/simulation/challenges'
import { Replay, ReplayAction } from '@quorum/simulation/replay'
import { Game } from '@quorum/simulation/state'
import { planState } from './machine.ts'

export const ChallengeRun = Schema.TaggedUnion({
  Building: {
    id: Schema.String,
    totals: RunTotals,
  },
  Running: {
    id: Schema.String,
    totals: RunTotals,
    board: Game,
    replay: Replay,
  },
  Result: {
    id: Schema.String,
    totals: RunTotals,
    board: Game,
    replay: Replay,
    result: ChallengeResult,
  },
})
export type ChallengeRun = typeof ChallengeRun.Type

export type ChallengeResultRun = typeof ChallengeRun.cases.Result.Type

export type ChallengeRunningRun = typeof ChallengeRun.cases.Running.Type

export const ChallengeEvent = Schema.TaggedUnion({
  Run: {
    board: Game,
    replay: Replay,
  },
  Ticked: { totals: RunTotals },
  ActionLogged: { action: ReplayAction },
  Finished: { result: ChallengeResult },
  Rebuilt: {},
})
export type ChallengeEvent = typeof ChallengeEvent.Type

type ChallengeBuildingRun = typeof ChallengeRun.cases.Building.Type

const building = (id: string): ChallengeBuildingRun => ({
  _tag: 'Building',
  id,
  totals: NO_TOTALS,
})

const scored = (state: ChallengeRunningRun, result: ChallengeResultType): ChallengeResultRun => ({
  _tag: 'Result',
  id: state.id,
  totals: state.totals,
  board: state.board,
  replay: state.replay,
  result,
})

const States = Machine.state({ states: ChallengeRun.cases })
const Events = Machine.eventsFromSchemas(ChallengeEvent)

export const challengeMachine = Machine.make({ root: States, events: Events }).handle({
  initial: { target: 'Building', data: { id: '', totals: NO_TOTALS } },
  states: {
    Building: {
      on: {
        Run: {
          target: 'Running',
          data: ({ state, event }) => ({
            _tag: 'Running',
            id: state.id,
            totals: NO_TOTALS,
            board: event.board,
            replay: event.replay,
          }),
        },
      },
    },
    Running: {
      on: {
        Ticked: {
          target: 'Running',
          data: ({ state, event }) => ({ ...state, totals: event.totals }),
        },
        ActionLogged: {
          target: 'Running',
          data: ({ state, event }) => ({
            ...state,
            replay: {
              ...state.replay,
              actions: [...state.replay.actions, { step: state.totals.step, action: event.action }],
            },
          }),
        },
        Finished: {
          target: 'Result',
          data: ({ state, event }) => scored(state, event.result),
        },
        Rebuilt: {
          target: 'Building',
          data: ({ state }) => building(state.id),
        },
      },
    },
    Result: {
      on: {
        Rebuilt: {
          target: 'Building',
          data: ({ state }) => building(state.id),
        },
      },
    },
  },
})

export const challengeStep = (run: ChallengeRun, event: ChallengeEvent): ChallengeRun =>
  planState(challengeMachine, run, event)
