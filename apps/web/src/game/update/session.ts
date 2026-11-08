import * as Actions from '@quorum/simulation/actions'
import * as Work from '@quorum/simulation/work'
import { AppRoute, onBoard, urlOf, urlToAppRoute } from '../route.ts'
import { COMPONENTS, STEP_SECONDS, TASKS } from '@quorum/simulation/catalog'
import { EMPTY_HISTORY } from '../history.ts'
import { completeChallenge } from '@quorum/simulation/founder'
import { Game } from '@quorum/simulation/state'
import {
  Model,
  SandboxStore,
  hasCompany,
  offCompany,
  boardChallenge,
  boardSandbox,
  type Board,
  type ChallengeRun,
  type SandboxRun,
} from '../model.ts'
import {
  NO_TOTALS,
  advanceRun,
  beginRun,
  challengeById,
  resultOf,
  responseAllowed,
  stepsOf,
  type Challenge,
} from '@quorum/simulation/challenges'
import { Option, Result, Schema } from 'effect'
import { SIM_VERSION } from '@quorum/simulation/version'
import { mostSteps } from './constant.ts'
import { WriteFounder, AppendLog, FitBoard, ReplaceUrl, WriteSandboxStore } from '../commands.ts'
import { bigBoard, stressBoard } from '@quorum/ui/board/stress'
import { boxOf, freeSpot, type Box } from '@quorum/ui/board/geometry'
import { challengeStep } from '../challenge-machine.ts'
import { designOf, type ReplayAction, type Response } from '@quorum/simulation/replay'
import { leaveExited } from './companies.ts'
import { freeSandbox, GUIDED, sandboxOf, START } from '@quorum/simulation/sandbox'
import {
  freshBoard,
  say,
  saveCommands,
  withToast,
  act,
  storeOf,
  type AnyCommand,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { isFinalEra } from '@quorum/simulation/lookups'
import { line } from '../telemetry.ts'
import { newGame } from '@quorum/simulation/company'
import { normalizeOrdinals } from '@quorum/simulation/labels'
import { reasonIn } from '../../i18n/refusal.ts'
import { savedIndex } from '../saves.ts'
import { sessionStep } from '../session-machine.ts'
import { isAway, isExited } from '../company-machine.ts'
import { clockStep } from '../clock-machine.ts'
import { type Url } from 'foldkit/url'

/** Opens a route's screen. A board that cannot open (no Company to continue)
 *  leaves the Model as it is; a locked Challenge lands on the Challenge list. */
export const open = (model: Model, route: AppRoute): UpdateResult =>
  AppRoute.match<UpdateResult>(route, {
    Title: () => ({ model: { ...model, route } }),
    Menu: ({ menu }) => ({
      model: {
        ...model,
        route,
        ...(menu === 'companies' ? {} : { saveFocus: null, saveConfirm: { _tag: 'List' } }),
      },
    }),
    Company: () => (hasCompany(model) ? continued(model) : { model }),
    Sandbox: ({ sandbox }) =>
      sandbox === 'free'
        ? enterSandbox(model, model.freeBoard ?? freeSandbox(), { id: null, progress: START })
        : enterSandbox(model, GUIDED[sandbox].start(), { id: sandbox, progress: START }),
    Challenge: ({ challenge }) => {
      const entry = challengeById(challenge)
      return entry ? enterChallenge(model, challenge) : { model }
    },
  })

/** Follows a URL from back, forward, or a link: closes the open board, opens
 *  the route's screen, and corrects the URL when that screen cannot open. */
export const visit = (model: Model, url: Url): UpdateResult => {
  const route = urlToAppRoute(url)
  if (urlOf(route) === urlOf(model.route)) return { model }
  const left = onBoard(model.route) ? leaveBoard(model) : { model }
  const opened = open(left.model, route)
  const landed = urlOf(opened.model.route)
  return {
    model: opened.model,
    commands: [
      ...(left.commands ?? []),
      ...(opened.commands ?? []),
      ...(landed === urlOf(route) ? [] : [ReplaceUrl({ url: landed })]),
    ],
  }
}

export const parseStore = Schema.decodeUnknownOption(Schema.fromJsonString(SandboxStore))

/** The Company's board that waits aside: one already loaded in the background, else the board played now. */
const heldCompany = (model: Model): Board | null =>
  offCompany(model) ? model.company : (model.company ?? model.board)

/** Opens a Sandbox on the board. The Company waits aside until the title screen. */
export const enterSandbox = (model: Model, game: Game, run: SandboxRun): UpdateResult => {
  const board = freshBoard(game)
  const next: Model = {
    ...model,
    route: AppRoute.Sandbox({ sandbox: run.id ?? 'free' }),
    toast: null,
    panel: 'none',
    company: heldCompany(model),
    board: {
      ...board,
      session: sessionStep(board.session, { _tag: 'SandboxOpened', run }),
    },
  }
  return {
    model: next,
    commands: [
      FitBoard({}),
      AppendLog({ entries: [line(game.time, 'SandboxStarted', { sandbox: run.id ?? 'free' })] }),
    ],
  }
}

/** Swaps the free Sandbox's Game, keeping the player's view. */
export const replaceFree = (model: Model, game: Game, text: string): UpdateResult => {
  if (boardSandbox(model.board)?.id !== null) return { model }
  const normalized = normalizeOrdinals(game)
  const next: Model = {
    ...model,
    freeBoard: normalized,
    board: {
      ...model.board,
      game: normalized,
      selected: null,
      flow: { _tag: 'Idle' },
      undo: [],
      redo: [],
      change: { _tag: 'Idle' },
      bottleneck: null,
      bottleneckAt: -1,
      nodeHistory: {},
      nodeSample: null,
      dashboard: { ...model.board.dashboard, history: EMPTY_HISTORY },
      clock: { ...model.board.clock, savedAt: game.time, sampledAt: game.time },
    },
  }
  return withToast(next, text, 'plain', [FitBoard({}), WriteSandboxStore({ store: storeOf(next) })])
}

/** Changes the free Sandbox's demand or mix in place. */
export const tuneFree = (model: Model, game: Game): UpdateResult => {
  if (boardSandbox(model.board)?.id !== null) return { model }
  const next: Model = { ...model, board: { ...model.board, game, bottleneckAt: -1 } }
  return { model: next }
}

/** Demand steps on the free Sandbox, in users. */
export const DEMAND_STEPS = [100, 250, 500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000]

/** After a round: the Era card, or the end of the slice. */
export const afterRound = (game: Game): Model['panel'] => (isFinalEra(game) ? 'end' : 'era')

/**
 * A Challenge's start with its cards apart: each card in board order moves to the nearest
 * spot that keeps its clearance in its region. Fixed cards stay put, so the run's board,
 * which takes the Design's positions, shows the same layout.
 */
export const spreadOut = (game: Game): Game => {
  const settled = new Map<string, Array<Box>>()
  const taken = (region: string) => settled.get(region) ?? []
  for (const node of game.nodes.filter((entry) => COMPONENTS[entry.type].fixed))
    settled.set(node.region, [...taken(node.region), boxOf(node)])
  let next = game
  for (const node of game.nodes.filter((entry) => !COMPONENTS[entry.type].fixed)) {
    const spot = freeSpot(taken(node.region), boxOf(node))
    settled.set(node.region, [...taken(node.region), { ...boxOf(node), ...spot }])
    if (spot.x !== node.x || spot.y !== node.y) next = Actions.move(next, node.id, spot.x, spot.y)
  }
  return next
}

export const boardOf = (challenge: Challenge): Game =>
  spreadOut({ ...challenge.start(), users: challenge.demand[0]?.users ?? 0 })

/** Opens a Challenge's build board. The Company waits aside, as for a Sandbox. */
export const enterChallenge = (model: Model, id: string): UpdateResult => {
  const challenge = challengeById(id)
  if (!challenge) return { model }
  const game = boardOf(challenge)
  const next: Model = {
    ...model,
    route: AppRoute.Challenge({ challenge: id }),
    toast: null,
    panel: 'none',
    company: heldCompany(model),
    board: {
      ...freshBoard(game),
      session: sessionStep(freshBoard(game).session, {
        _tag: 'ChallengeOpened',
        run: { _tag: 'Building', id, totals: NO_TOTALS },
      }),
    },
  }
  return {
    model: next,
    commands: [
      FitBoard({}),
      AppendLog({ entries: [line(game.time, 'ChallengeStarted', { challenge: id })] }),
    ],
  }
}

/** Run: the Design restarts from t = 0 on the Challenge's seed. Only this run is scored. */
export const startRun = (model: Model, run: ChallengeRun): UpdateResult => {
  const challenge = challengeById(run.id)
  if (!challenge || run._tag !== 'Building') return { model }
  const replay = {
    v: 1 as const,
    challenge: run.id,
    simVersion: SIM_VERSION,
    design: designOf(model.board.game),
    actions: [],
  }
  return Result.match(beginRun(challenge, replay), {
    onFailure: (reason) => withToast(model, reasonIn(say(model), reason), 'warn'),
    onSuccess: (game) => {
      const next: Model = {
        ...model,
        panel: 'none',
        board: {
          ...model.board,
          game,
          session: sessionStep(model.board.session, {
            _tag: 'ChallengeUpdated',
            run: challengeStep(run, { _tag: 'Run', board: model.board.game, replay }),
          }),
          flow: { _tag: 'Idle' },
          selected: null,
          bottleneckAt: -1,
          clock: {
            ...model.board.clock,
            carry: 0,
            mode: clockStep(model.board.clock.mode, { _tag: 'Resumed' }),
          },
        },
      }
      return { model: next }
    },
  })
}

/** Runs canonical Steps: the clock's share, or every one left when `all`. */
export const runSteps = (
  model: Model,
  run: ChallengeRun,
  all: boolean,
  elapsedMs = 0,
): Readonly<{ model: Model; done: boolean }> => {
  const challenge = challengeById(run.id)
  if (!challenge || run._tag !== 'Running') return { model, done: false }
  // A run owes the real time that passed, at the chosen speed, in the Challenge's own Steps.
  const most = (mostSteps(model.board.clock.speed) * STEP_SECONDS) / challenge.stepSeconds
  const owed = all
    ? Number.POSITIVE_INFINITY
    : Math.min(
        model.board.clock.carry +
          (elapsedMs * model.board.clock.speed) / (1_000 * challenge.stepSeconds),
        most,
      )
  const total = stepsOf(challenge)
  let game = model.board.game
  let totals = run.totals
  let taken = 0
  while (totals.step < total && taken + 1 <= owed) {
    const next = advanceRun(challenge, run.replay, game, totals)
    game = next.game
    totals = next.totals
    taken += 1
  }
  return {
    model: {
      ...model,
      board: {
        ...model.board,
        game,
        session: sessionStep(model.board.session, {
          _tag: 'ChallengeUpdated',
          run: challengeStep(run, { _tag: 'Ticked', totals }),
        }),
        clock: { ...model.board.clock, carry: all ? 0 : owed - taken },
      },
    },
    done: totals.step >= total,
  }
}

/** The run is over: the provisional result shows, and the server is asked to confirm it. */
export const finishRun = (model: Model): UpdateResult => {
  const run = boardChallenge(model.board)
  const challenge = run ? challengeById(run.id) : undefined
  if (!run || !challenge || run._tag !== 'Running') return { model }
  const result = resultOf(challenge, model.board.game, run.totals)
  const first = result.passed && !model.founder.completed.includes(run.id)
  const founder = result.passed
    ? completeChallenge(model.founder, run.id, challenge.legacy)
    : model.founder
  const next: Model = {
    ...model,
    founder,
    panel: 'challenge',
    board: {
      ...model.board,
      session: sessionStep(model.board.session, {
        _tag: 'ChallengeUpdated',
        run: challengeStep(run, { _tag: 'Finished', result }),
      }),
    },
  }
  const commands: Array<AnyCommand> = [
    AppendLog({
      entries: [line(model.board.game.time, 'ChallengeRun', { challenge: run.id, ...result })],
    }),
  ]
  if (founder !== model.founder) commands.push(WriteFounder({ founder }))
  return first && challenge.legacy > 0
    ? withToast(next, say(model).toasts.firstCompletion(challenge.legacy), 'ok', commands)
    : { model: next, commands }
}

export const runTick = (model: Model, run: ChallengeRun, elapsedMs: number): UpdateResult => {
  const ran = runSteps(model, run, false, elapsedMs)
  return ran.done ? finishRun(ran.model) : { model: ran.model }
}

/** A run action is logged at the next Step and applied there, as the server will apply it. */
export const logRunAction = (model: Model, action: ReplayAction): UpdateResult | null => {
  const run = boardChallenge(model.board)
  if (run?._tag !== 'Running') return null
  return {
    model: {
      ...model,
      board: {
        ...model.board,
        session: sessionStep(model.board.session, {
          _tag: 'ChallengeUpdated',
          run: challengeStep(run, { _tag: 'ActionLogged', action }),
        }),
      },
    },
  }
}

/** An incident response during a run: logged like any run action, or refused when the Challenge forbids it. */
export const logResponse = (model: Model, response: Response): UpdateResult | null => {
  const run = boardChallenge(model.board)
  if (run?._tag !== 'Running') return null
  const challenge = challengeById(run.id)
  const action: ReplayAction = { _tag: 'Respond', response }
  if (challenge && !responseAllowed(challenge, action))
    return withToast(model, say(model).toasts.challengeForbids, 'warn')
  return logRunAction(model, action)
}

/** Leaves a Challenge for the Challenges menu; the Company comes back as it was. */
/** The Company's board as the player left it for a Sandbox or Challenge. Its Bottleneck is searched again. */
export const companyBoard = (model: Model): Board =>
  model.company ? { ...model.company, bottleneckAt: -1 } : freshBoard(newGame())

export const leaveChallenge = (model: Model): UpdateResult => ({
  model: {
    ...model,
    route: AppRoute.Menu({ menu: 'challenges' }),
    panel: 'none',
    board: {
      ...companyBoard(model),
      session: sessionStep(model.board.session, { _tag: 'Closed' }),
    },
    company: null,
  },
})

export const continued = (model: Model): UpdateResult => {
  const next: Model = {
    ...model,
    route: AppRoute.Company(),
    panel: isAway(model.companyPhase) ? 'away' : 'none',
    board: {
      ...model.board,
      clock: {
        ...model.board.clock,
        mode: clockStep(model.board.clock.mode, { _tag: 'Resumed' }),
      },
    },
  }
  return {
    model: next,
    commands: [AppendLog({ entries: [line(model.board.game.time, 'SessionResumed', {})] })],
  }
}

/** Closes the board for the title screen. A Sandbox or Challenge gives the Company back. */
export const leaveBoard = (model: Model): UpdateResult => {
  if (isExited(model.companyPhase)) return leaveExited(model, 'found')
  if (boardChallenge(model.board)) return leaveChallenge(model)
  if (!boardSandbox(model.board))
    return {
      model: {
        ...model,
        route: AppRoute.Title(),
        panel: 'none',
        saves: savedIndex(model.saves, model.board.game, Date.now()),
        board: { ...model.board, flow: { _tag: 'Idle' } },
      },
      commands: saveCommands(model),
    }
  const free = boardSandbox(model.board)
  const freeBoard = free?.id === null ? model.board.game : model.freeBoard
  const next: Model = {
    ...model,
    route: AppRoute.Menu({ menu: 'sandbox' }),
    panel: 'none',
    board: {
      ...companyBoard(model),
      session: sessionStep(model.board.session, { _tag: 'Closed' }),
    },
    company: null,
    freeBoard,
  }
  return { model: next, commands: [WriteSandboxStore({ store: storeOf(next) })] }
}

type SessionTag =
  | 'SandboxStoreLoaded'
  | 'ChallengeStarted'
  | 'ChallengeRan'
  | 'ChallengeFinished'
  | 'ChallengeRebuilt'
  | 'FixChosen'
  | 'GuidedStarted'
  | 'FreeSandboxStarted'
  | 'FreeSandboxReset'
  | 'StressBoardLoaded'
  | 'CompanyCopied'
  | 'DemandStepped'
  | 'MixChosen'

export const sessionHandlers = (model: Model): MessageCases<UpdateResult, SessionTag> => ({
  SandboxStoreLoaded: ({ json }) =>
    Option.match(json === null ? Option.none() : parseStore(json), {
      // A reload on a Sandbox opens it once its stored board has loaded.
      onNone: () => (model.route._tag === 'Sandbox' ? open(model, model.route) : { model }),
      onSome: (store) => {
        const loaded: Model = { ...model, passed: store.passed, freeBoard: store.free }
        return model.route._tag === 'Sandbox' ? open(loaded, model.route) : { model: loaded }
      },
    }),

  ChallengeStarted: ({ id }) => enterChallenge(model, id),

  ChallengeRan: () => {
    const run = boardChallenge(model.board)
    return run ? startRun(model, run) : { model }
  },

  ChallengeFinished: () => {
    const run = boardChallenge(model.board)
    if (run?._tag !== 'Running') return { model }
    return finishRun(runSteps(model, run, true).model)
  },

  ChallengeRebuilt: () => {
    const run = boardChallenge(model.board)
    if (!run || run._tag === 'Building') return { model }
    const next: Model = {
      ...model,
      panel: 'none',
      board: {
        ...model.board,
        game: run.board,
        bottleneckAt: -1,
        session: sessionStep(model.board.session, {
          _tag: 'ChallengeUpdated',
          run: challengeStep(run, { _tag: 'Rebuilt' }),
        }),
      },
    }
    return { model: next }
  },

  FixChosen: ({ fix, on }) =>
    act(model, `${TASKS[fix].name} ${on ? 'on' : 'off'}`, Work.setFix(model.board.game, fix, on), {
      undoable: true,
    }),

  GuidedStarted: ({ id }) => enterSandbox(model, GUIDED[id].start(), { id, progress: START }),

  FreeSandboxStarted: () =>
    enterSandbox(model, model.freeBoard ?? freeSandbox(), { id: null, progress: START }),

  FreeSandboxReset: () => replaceFree(model, freeSandbox(), say(model).toasts.sandboxReset),

  StressBoardLoaded: ({ big }) =>
    big
      ? replaceFree(model, bigBoard(), say(model).toasts.bigBoardLoaded)
      : replaceFree(model, stressBoard(), say(model).toasts.stressBoardLoaded),

  CompanyCopied: () =>
    model.company && hasCompany(model)
      ? replaceFree(model, sandboxOf(model.company.game), say(model).toasts.designCopied)
      : withToast(model, say(model).toasts.noCompanyToCopy, 'plain'),

  DemandStepped: ({ direction }) => {
    const index = DEMAND_STEPS.findIndex((users) => users >= model.board.game.users)
    const at = index === -1 ? DEMAND_STEPS.length - 1 : index
    const users =
      DEMAND_STEPS[Math.max(0, Math.min(DEMAND_STEPS.length - 1, at + direction))] ?? 1_000
    return tuneFree(model, { ...model.board.game, users })
  },

  MixChosen: ({ stage }) => tuneFree(model, { ...model.board.game, stage }),
})
