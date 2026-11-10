import { Actions, planIn } from '../board-actions.ts'
import { EMPTY_HISTORY } from '../history.ts'
import { EMPTY_INBOX, savedInbox } from '../inbox.ts'
import { EMPTY_RESEARCH } from '../research.ts'
import { earnAchievements } from '@quorum/simulation/founder'
import { Game } from '@quorum/simulation/state'
import { applyIntents, type Intent } from '@quorum/simulation/room'
import type { Action } from '@quorum/simulation/action-kit'
import { Message } from '../message.ts'
import {
  Model,
  SandboxStore,
  halted,
  offCompany,
  placingOf,
  playingId,
  roomLive,
  stampedPlaybook,
  boardChallenge,
  ANNOTATION_GROUPS,
  type Board,
  type Tone,
} from '../model.ts'
import { Result } from 'effect'
import { StepEvent } from '@quorum/simulation/events'
import { Update } from 'foldkit'
import {
  WriteCompany,
  WriteFounder,
  AppendLog,
  ClearToast,
  PlaySound,
  SendRoom,
  SyncBoard,
  TOAST_MS,
} from '../commands.ts'
import { beginChange, figuresOf, pushUndo, snapshotOf, type Reversal } from '../feedback.ts'
import { copyIn, type Messages } from '../../i18n/messages.ts'
import { countStats, detectAchievements } from '@quorum/simulation/achievements'
import { cueNode } from '../reveal.ts'
import { offerOf } from '../offer.ts'
import { eraReachedOf, line } from '../telemetry.ts'
import { fileOf, refreshedIndex } from '../saves.ts'
import { ghostReason } from '@quorum/simulation/playbook'
import { initTeam } from '../team.ts'
import { nodeLabel, normalizeOrdinals } from '@quorum/simulation/labels'
import { onBoard } from '../route.ts'
import { reasonIn, refusalIn } from '../../i18n/refusal.ts'
import { solveFlow } from '@quorum/simulation/solve'
import { type AchievementId } from '@quorum/simulation/catalog'
import { type ApiRpc } from '@/platform/rpc.ts'
import { type Ledger } from '@quorum/simulation/ledger'

export type UpdateResult = Update.Return<Model, Message, ApiRpc>

export type AnyCommand = NonNullable<UpdateResult['commands']>[number]

/** A Message that a handler re-dispatches as another Message. */

export type Dispatch = (model: Model, message: Message) => UpdateResult

/** The handlers one group of Messages contributes to the root match. */

export type MessageCases<Output, Tags extends Message['_tag']> = {
  readonly [Tag in Tags]: (value: Extract<Message, { _tag: Tag }>) => Output
}

/** A board that starts on `game`: nothing selected, nothing measured yet, and an empty Inbox. */
export const freshBoard = (game: Game): Board => ({
  game: normalizeOrdinals(game),
  session: { _tag: 'Company' },
  region: 'na',
  selected: null,
  selection: [],
  flow: { _tag: 'Idle' },
  clipboard: null,
  buildGroup: null,
  hold: { _tag: 'Idle' },
  team: initTeam(),
  research: EMPTY_RESEARCH,
  insightHelp: false,
  clock: {
    speed: 1,
    mode: { _tag: 'Running' },
    carry: 0,
    savedAt: game.time,
    sampledAt: game.time,
  },
  change: { _tag: 'Idle' },
  tradeoff: { _tag: 'Closed' },
  disclosure: { _tag: 'Idle', revealed: [] },
  undo: [],
  redo: [],
  bottleneck: null,
  bottleneckAt: -1,
  screenshot: false,
  whatIfs: null,
  nodeHistory: {},
  nodeSample: null,
  inbox: EMPTY_INBOX,
  dashboard: {
    history: EMPTY_HISTORY,
    range: 360,
    hover: null,
    postmortem: null,
    groups: [...ANNOTATION_GROUPS],
    compare: true,
    table: false,
    kind: null,
    service: null,
    region: null,
  },
  lastGoal: '',
  lastBottleneck: '',
  alertQuiet: [],
  researchOffer: null,
})

/**
 * What a Company's moment earns beyond the Game: achievements, and the
 * incident and Era sounds. Never in a Sandbox or Challenge.
 */
export const milestones = (
  before: Model,
  result: UpdateResult,
  events: ReadonlyArray<StepEvent>,
  ledger: Ledger,
): UpdateResult => {
  const after = result.model
  if (!onBoard(after.route) || offCompany(after)) return result
  const commands: Array<AnyCommand> = [...(result.commands ?? [])]
  const stats = countStats(after.founder.stats, events)
  const earned = detectAchievements(
    {
      before: before.board.game,
      after: after.board.game,
      ledger,
      previousLedger: solveFlow(before.board.game),
      events,
      stats,
    },
    after.founder.achievements,
  )
  let next = after
  if (stats !== after.founder.stats && events.some((event) => event._tag === 'IncidentResolved'))
    next = { ...next, founder: { ...next.founder, stats } }
  const [achieved, earnedCommands] = achieve(next, earned)
  next = achieved
  commands.push(...earnedCommands)
  if (next.founder !== after.founder && earnedCommands.length === 0)
    commands.push(WriteFounder({ founder: next.founder }))
  if (!next.prefs.muted) {
    if (after.board.game.stage > before.board.game.stage)
      commands.push(PlaySound({ sound: 'era', pitch: 1, spatial: false }))
    else if (events.some((event) => event._tag === 'IncidentStarted'))
      commands.push(PlaySound({ sound: 'incident', pitch: 1, spatial: false }))
  }
  const time = after.board.game.time
  if (after.board.game.stage > before.board.game.stage)
    commands.push(AppendLog({ entries: [line(time, 'EraReached', eraReachedOf(after, ledger))] }))
  const researched = after.board.game.researched.filter(
    (id) => !before.board.game.researched.includes(id),
  )
  if (researched.length > 0)
    commands.push(
      AppendLog({
        entries: [
          line(time, 'ResearchCompleted', { ids: researched, era: after.board.game.stage }),
        ],
      }),
    )
  return next === after && commands.length === (result.commands ?? []).length
    ? result
    : { model: next, commands }
}

/** The copy in the player's language: a Toast is written when it is raised. */
export const say = (model: Model): Messages => copyIn(model.prefs.locale)

/** The panel under the open one: Settings on the board goes back to the game menu. */
export const closePanel = (model: Model): Model => ({
  ...model,
  panel: model.panel === 'settings' && onBoard(model.route) ? 'menu' : 'none',
})

export const sync = (model: Model, fit: boolean, focus: string | null = null): AnyCommand =>
  SyncBoard({
    fit,
    focus,
    game: model.board.game,
    locale: model.prefs.locale,
    bottleneck: model.board.bottleneck,
    selected: model.board.selected,
    selection: model.board.selection,
    placing: placingOf(model),
    stamp: stampOf(model),
    history: Object.fromEntries(
      Object.entries(model.board.nodeHistory).map(([id, samples]) => [
        id,
        samples.map((sample) => sample.utilization),
      ]),
    ),
    region: model.board.region,
    paused: halted(model),
    speed: model.board.clock.speed,
    suspended: model.panel === 'research',
    cue: cueNode(model),
  })

/** The Company save: the Game, and what this Company has shown so far. */
export const savePayloadOf = (model: Model, board: Board = model.board) => ({
  game: board.game,
  revealed: board.disclosure.revealed,
  pending:
    board.disclosure._tag === 'Queued' || board.disclosure._tag === 'Cueing'
      ? board.disclosure.pending
      : [],
  dashboard: board.dashboard.history,
  inbox: savedInbox(board.inbox),
})

/** The open Company's file, with what the board has shown so far. Null when no Company is open. */
export const saveOf = (model: Model): AnyCommand | null => {
  const id = playingId(model)
  if (id === null || !fileOf(model.saves, id)) return null
  // A Sandbox or Challenge on the board keeps the Company aside: that board is the one to save.
  const board = offCompany(model) ? model.company : model.board
  if (board === null) return null
  return WriteCompany({
    id,
    index: refreshedIndex(model.saves, board.game),
    ...savePayloadOf(model, board),
  })
}

export const saveCommands = (model: Model): ReadonlyArray<AnyCommand> => {
  const command = saveOf(model)
  return command === null ? [] : [command]
}

/** The Playbook being placed, as the board draws it: ghosts where research is missing. */
export const stampOf = (model: Model) => {
  const playbook = stampedPlaybook(model)
  if (!playbook) return null
  return playbook.nodes.map((node) => ({
    type: node.type,
    dx: node.dx,
    dy: node.dy,
    ghost: ghostReason(model.board.game, node, model.board.region) !== null,
  }))
}

/** The Model with a toast raised, and the Command that clears it later. The same message twice in
 *  a row raises it once, with a count, so a burst of refusals reads as one instead of blinking. */
export const toasted = (model: Model, message: string, tone: Tone): [Model, AnyCommand] => {
  const previous = model.toast
  const repeat = previous !== null && previous.message === message && previous.tone === tone
  const id = model.toastSeq + 1
  const count = repeat && previous !== null ? previous.count + 1 : 1
  return [
    { ...model, toast: { id, message, tone, count }, toastSeq: id },
    ClearToast({ id, after: TOAST_MS[tone] }),
  ]
}

export const withToast = (
  model: Model,
  message: string,
  tone: Tone,
  extra: ReadonlyArray<AnyCommand> = [],
): UpdateResult => {
  const [next, clear] = toasted(model, message, tone)
  return { model: next, commands: [clear, ...extra] }
}

export type ActOptions = Readonly<{
  /** Board actions go on the undo stack. */
  undoable?: boolean
  patch?: (model: Model, game: Game) => Partial<Board>
  /** The panel the action opens, from the Game it made. */
  panel?: (game: Game) => Model['panel']
  note?: (game: Game) => readonly [string, Tone] | null
}>

/** What a handler asks the board to do: an action, one Intent, or a batch. */
export type ActTarget = Action | Game | Intent | ReadonlyArray<Action | Game | Intent>

const isIntent = (target: Action | Game | Intent): target is Intent =>
  typeof target === 'object' && target !== null && 'ns' in target && 'args' in target

/** An action carries its Intent; anything a Seat may not send has none. */
const intentsOf = (target: ActTarget): ReadonlyArray<Intent> | null => {
  const batch = Array.isArray(target) ? target : [target]
  const plans = batch.map((entry) => (isIntent(entry) ? entry : planIn(entry)))
  return plans.some((plan) => plan === null) ? null : (plans as ReadonlyArray<Intent>)
}

/** An action of the Simulation: a refusal, or the Game it produced. */
const appliedOf = (target: Action | Game): Action =>
  Result.isResult(target) ? (target as Action) : Result.succeed(target as Game)

/**
 * Applies a Simulation action, or the same action as Intents. In a live Room
 * the Intents go to the server, which owns the Game; the local apply is only
 * optimism until the next snapshot.
 */
export const act = (
  model: Model,
  label: string,
  target: ActTarget,
  options: ActOptions = {},
): UpdateResult => {
  const intents = intentsOf(target)
  if (intents === null && roomLive(model))
    return withToast(model, say(model).room.notAvailable, 'warn')
  const action =
    intents === null ? appliedOf(target as Action | Game) : applyIntents(model.board.game, intents)
  return Result.match(action, {
    // A locked click leaves an offer the player can take later; anything else is a sentence and gone.
    onFailure: (refusal) => {
      const offer = offerOf(refusal)
      return offer === null
        ? withToast(model, refusalIn(say(model), refusal), 'warn')
        : { model: { ...model, board: { ...model.board, researchOffer: offer } } }
    },
    onSuccess: (applied) => {
      if (applied === model.board.game) return { model }
      // A run replays the Design it started with: only logged run actions may change it.
      const challenge = boardChallenge(model.board)
      if (challenge && challenge._tag !== 'Building')
        return withToast(model, say(model).toasts.rebuildToChange, 'warn')
      // The player is at the board while an Incident runs: the first action acknowledges it.
      const game = Actions.acknowledge(applied)
      const measured = beginChange(model.board, label, figuresOf(solveFlow(model.board.game)))
      const next: Model = {
        ...model,
        panel: options.panel?.(game) ?? model.panel,
        board: {
          ...measured,
          ...options.patch?.(model, game),
          game,
          // The Design changed: search for the Bottleneck again on the next tick.
          bottleneckAt: -1,
          ...(options.undoable
            ? pushUndo(
                model.board,
                snapshotOf(
                  label,
                  model.board.game,
                  game.cash - model.board.game.cash,
                  model.board.game.time,
                ),
              )
            : {}),
        },
      }
      const note = options.note?.(game)
      const sent =
        intents !== null && roomLive(model)
          ? SendRoom({ message: { _tag: 'Intents', id: model.room.seq, intents } })
          : null
      const stamped =
        sent === null ? next : { ...next, room: { ...next.room, seq: next.room.seq + 1 } }
      const result = note ? withToast(stamped, note[0], note[1]) : { model: stamped }
      return sent === null ? result : { ...result, commands: [...(result.commands ?? []), sent] }
    },
  })
}

/** Applies an undo or a redo, or says why it cannot. */
export const reverse = (
  model: Model,
  reversal: Reversal | string,
  verb: 'Undid' | 'Redid',
): UpdateResult => {
  if (typeof reversal === 'string') return withToast(model, reasonIn(say(model), reversal), 'plain')
  // Undo rewrites the Game on this tab, and a Room owns it. Every Seat's moves
  // land in one order, so there is no tab whose history to unwind.
  if (roomLive(model)) return withToast(model, say(model).room.notAvailable, 'warn')
  const challenge = boardChallenge(model.board)
  if (challenge && challenge._tag !== 'Building')
    return withToast(model, say(model).toasts.rebuildToChange, 'warn')
  const measured = beginChange(
    model.board,
    `${verb} ${reversal.label}`,
    figuresOf(solveFlow(model.board.game)),
  )
  const next: Model = {
    ...model,
    board: {
      ...measured,
      game: reversal.game,
      undo: reversal.undo,
      redo: reversal.redo,
      bottleneckAt: -1,
    },
  }
  const t = say(model).toasts
  return withToast(
    next,
    verb === 'Undid' ? t.undid(reversal.label) : t.redid(reversal.label),
    'plain',
  )
}

export const nodeName = (game: Game, id: string): string => {
  const node = game.nodes.find((entry) => entry.id === id)
  return node ? nodeLabel(game, node) : 'A Node'
}

export const percent = (share: number): string => `${Math.round(share * 100)}%`

/** Earns achievements: the Founder record, a toast each, and a chime unless muted. */
export const achieve = (
  model: Model,
  ids: ReadonlyArray<AchievementId>,
): readonly [Model, ReadonlyArray<AnyCommand>] => {
  const fresh = ids.filter((id) => !model.founder.achievements.includes(id))
  if (fresh.length === 0) return [model, []]
  let next: Model = { ...model, founder: earnAchievements(model.founder, fresh) }
  const commands: Array<AnyCommand> = [WriteFounder({ founder: next.founder })]
  for (const id of fresh) {
    const [raised, clear] = toasted(
      next,
      say(next).toasts.achievement(say(next).catalog.achievements[id].name),
      'primary',
    )
    next = raised
    commands.push(clear)
  }
  if (!next.prefs.muted)
    commands.push(PlaySound({ sound: 'achievement', pitch: 1, spatial: false }))
  commands.push(
    AppendLog({
      entries: fresh.map((id) => line(next.board.game.time, 'AchievementEarned', { id })),
    }),
  )
  return [next, commands]
}

/** What the Sandbox store holds for this Model. */
export const storeOf = (model: Model): SandboxStore => ({
  passed: model.passed,
  free: model.freeBoard,
})
