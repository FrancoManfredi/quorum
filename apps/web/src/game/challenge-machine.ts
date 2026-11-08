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

export const Building = Schema.TaggedStruct('Building', {
  id: Schema.String,
  totals: RunTotals,
})
export const Running = Schema.TaggedStruct('Running', {
  id: Schema.String,
  totals: RunTotals,
  /** The build board at Run, restored by Rebuild. */
  board: Game,
  /** The Design at Run, and the actions logged since. */
  replay: Replay,
})
export const Result = Schema.TaggedStruct('Result', {
  id: Schema.String,
  totals: RunTotals,
  board: Game,
  replay: Replay,
  result: ChallengeResult,
})
export const ChallengeRun = Schema.Union([Building, Running, Result])
export type ChallengeRun = typeof ChallengeRun.Type
/** A scored run: the only phase with a result. */
export type ChallengeResultRun = Extract<ChallengeRun, Readonly<{ _tag: 'Result' }>>
/** A run in progress: the only phase with a replay and a build board. */
export type ChallengeRunningRun = Extract<ChallengeRun, Readonly<{ _tag: 'Running' }>>

export const Run = Schema.TaggedStruct('Run', {
  board: Game,
  replay: Replay,
})
export const Ticked = Schema.TaggedStruct('Ticked', { totals: RunTotals })
export const ActionLogged = Schema.TaggedStruct('ActionLogged', { action: ReplayAction })
export const Finished = Schema.TaggedStruct('Finished', { result: ChallengeResult })
export const Rebuilt = Schema.TaggedStruct('Rebuilt', {})
export const ChallengeEvent = Schema.Union([Run, Ticked, ActionLogged, Finished, Rebuilt])
export type ChallengeEvent = typeof ChallengeEvent.Type

type ChallengeBuildingRun = Extract<ChallengeRun, Readonly<{ _tag: 'Building' }>>

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

const States = Machine.state({ states: { Building, Running, Result } })

const Events = Machine.events({
  Run: { board: Game, replay: Replay },
  Ticked: { totals: RunTotals },
  ActionLogged: { action: ReplayAction },
  Finished: { result: ChallengeResult },
  Rebuilt: {},
})

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

/** The next phase, or the same one when the event does not apply. */
export const challengeStep = (run: ChallengeRun, event: ChallengeEvent): ChallengeRun =>
  planState(challengeMachine, run, event)
