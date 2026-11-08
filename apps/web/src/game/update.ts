import { AppRoute, onBoard, urlOf, urlToAppRoute } from './route.ts'
import { DEFAULT_LOGO } from './logos.ts'
import { EMPTY_SAVE_INDEX } from './saves.ts'
import { Listbox, Menu as UiMenu } from '@foldkit/ui'
import * as VolumeSlider from '@quorum/ui/primitives/slider'
import { initFrameworkPicker, initRuntimePicker } from './stack-picker.ts'
import {
  CheckRoom,
  LoadFounder,
  LoadSaves,
  AppendLog,
  ConnectBoard,
  LoadPrefs,
  LoadSandboxStore,
  PlaySound,
  PushUrl,
  ReplaceUrl,
} from './commands.ts'
import { Message } from './message.ts'
import { bootStep } from './boot-machine.ts'
import { contextOf, diffOf, line } from './telemetry.ts'
import { cueNode, noticed } from './reveal.ts'
import { cueOf } from './cues.ts'
import { emptyFounder } from '@quorum/simulation/founder'
import { freshBoard, milestones, sync, type UpdateResult } from './update/shared.ts'
import { isExited } from './company-machine.ts'
import { isSending, isSent } from './survey-machine.ts'
import { has } from '@quorum/simulation/lookups'
import { ledgerOf, Model, halted, EMPTY_ROOM, EMPTY_SURVEY } from './model.ts'
import { nameOf } from '../platform/room-socket.ts'
import { newGame } from '@quorum/simulation/company'
import { type ApiRpc } from '@/platform/rpc.ts'
import { type Ledger } from '@quorum/simulation/ledger'
import { type LogEntry } from './playlog.ts'
import { type Runtime } from 'foldkit'
import { companiesHandlers } from './update/companies.ts'
import { sessionHandlers } from './update/session.ts'
import { shellHandlers } from './update/shell.ts'
import { clockHandlers } from './update/clock.ts'
import { keysHandlers } from './update/keys.ts'
import { canvasHandlers } from './update/canvas.ts'
import { optionsHandlers } from './update/options.ts'
import { tradeoffHandlers } from './update/tradeoff.ts'
import { incidentsHandlers } from './update/incidents.ts'
import { mirrorsHandlers } from './update/mirrors.ts'
import { exitHandlers } from './update/exit.ts'
import { teamHandlers } from './update/team.ts'
import { panelsHandlers } from './update/panels.ts'
import { saveHandlers } from './update/save.ts'
import { roomHandlers } from './update/room.ts'

/** Every Message. Handlers live in ./update, grouped by what they touch; this file routes them. */

export { TICK_MS, REPEAT_MS, SPEEDS, speedsOf } from './update/constant.ts'

export const initialModel = (): Model => {
  const seatName = nameOf()
  return Model.make({
    route: AppRoute.Title(),
    boot: { _tag: 'Ready' },
    panel: 'none',
    toast: null,
    toastSeq: 0,
    board: freshBoard(newGame()),
    room: { ...EMPTY_ROOM, name: seatName, draft: seatName },
    company: null,
    companyPhase: { _tag: 'None' },
    saves: EMPTY_SAVE_INDEX,
    savesReady: false,
    oldSave: false,
    draft: { name: '', logo: DEFAULT_LOGO },
    saveFocus: null,
    saveConfirm: { _tag: 'List' },
    founder: emptyFounder(),
    survey: EMPTY_SURVEY,
    passed: [],
    freeBoard: null,
    today: '',
    prefs: {
      locale: 'en',
      seenTradeoffs: [],
      muted: false,
      volume: 100,
      autoPause: false,
      blurPause: true,
      easyMode: false,
      motion: 'system',
      text: 'normal',
      theme: 'light',
      agentAccess: false,
      analytics: true,
    },
    glossary: { focus: null, returnTo: 'none', query: '', category: null },
    languagePicker: Listbox.init({ id: 'interface-language' }),
    volumeSlider: VolumeSlider.init({ id: 'volume', min: 0, max: 100, step: 5 }),
    runtimePicker: initRuntimePicker(),
    frameworkPicker: initFrameworkPicker(),
    moreMenu: UiMenu.init({ id: 'more-menu' }),
  })
}

/** A fresh load opens the screen its URL names. A board opens once the file or
 *  store that fills it has loaded, so a reload stays on the board the player
 *  was playing; a fresh load on the title screen still waits behind the
 *  clock-in splash. */
export const init: Runtime.RoutingApplicationInit<Model, Message, void, ApiRpc> = (url) => {
  const route = urlToAppRoute(url)
  const base = initialModel()
  return {
    model: {
      ...base,
      route,
      // A Room URL joins straight away; the welcome fills the Board.
      ...(AppRoute.guards.Room(route)
        ? {
            panel: 'room' as const,
            room: { ...base.room, phase: { _tag: 'Connecting' as const, code: route.room } },
          }
        : {}),
      // A board URL skips the splash: the player was already clocked in.
      boot: onBoard(route) ? { _tag: 'Ready' } : { _tag: 'Shut' },
    },
    commands: [
      LoadSaves({}),
      LoadSandboxStore({}),
      LoadPrefs({}),
      LoadFounder({}),
      ...(AppRoute.guards.Room(route) ? [CheckRoom({ code: route.room })] : []),
      ...(url.pathname === urlOf(route) ? [] : [ReplaceUrl({ url: urlOf(route) })]),
    ],
  }
}

export const QUIET = new Set([
  'Ticked',
  'Synced',
  'Navigated',
  'NodeSampleChosen',
  'ToastCleared',
  'Saved',
  'SavesLoaded',
  'CompanyLoaded',
  'CompanyDeleted',
  // The Inspector's Stack pickers are UI state; the option they choose is logged.
  'RuntimePickerChanged',
  'FrameworkPickerChanged',
  // Sent by the compute worker several times a second.
  'BottleneckFound',
  'PreviewComputed',
  'HoldLifted',
  // The answers are the player's words; only sending them is a gesture.
  'SurveyChanged',
])

/** A team drag sends a Message per pointer move; only the drop that moves someone is a gesture. */
export const quiet = (model: Model, message: Message, after: Model): boolean =>
  QUIET.has(message._tag) ||
  // The Dashboard crosshair sends a Message on every pointer move, and choosing a
  // Postmortem reads the Game without changing it, as the Inspector's sample does.
  (message._tag === 'DashboardChanged' &&
    (message.message._tag === 'Hovered' || message.message._tag === 'PostmortemChosen')) ||
  ((message._tag === 'TeamChanged' || message._tag === 'ResearchChanged') &&
    message.message._tag === 'DragChanged' &&
    after.board.game === model.board.game)

export const fieldsOf = (message: Message): Record<string, unknown> =>
  Object.fromEntries(Object.entries(message).filter(([key]) => key !== '_tag'))

/**
 * The Exit survey's figures for the playtest log and its PostHog event. The
 * answers stay out; their lengths say only whether each question was answered.
 * A late answer that the UI ignored does not count.
 */
const surveyOf = (model: Model, after: Model, message: Message): Record<string, unknown> => {
  const exited = isExited(model.companyPhase) ? model.companyPhase : null
  if (
    message._tag !== 'SurveySent' ||
    !exited ||
    !isSending(model.survey.phase) ||
    !isSent(after.survey.phase)
  )
    return {}
  return {
    survey: {
      exit: exited.row.exit,
      stage: exited.row.stage,
      payout: exited.row.payout,
      legacy: exited.row.legacy,
      issues_chars: model.survey.issues.trim().length,
      likes_chars: model.survey.likes.trim().length,
      locale: model.prefs.locale,
    },
  }
}

/** Logs the gesture, what it changed, why it was refused, and any toast it raised. */
export const logged = (model: Model, message: Message, result: UpdateResult): UpdateResult => {
  const logs: Array<LogEntry> = []
  const after = result.model
  const time = after.board.game.time
  const raised = after.toast && after.toast.id !== model.toast?.id ? after.toast : null
  if (!quiet(model, message, after)) {
    const ledger: Ledger = ledgerOf(model)
    const refused =
      raised?.tone === 'warn' && after.board.game === model.board.game ? raised.message : undefined
    logs.push(
      line(time, message._tag, {
        ...fieldsOf(message),
        ...surveyOf(model, after, message),
        ...(refused ? { refused } : {}),
        diff: diffOf(model.board.game, after.board.game),
        ...(after.panel !== model.panel ? { panel: after.panel } : {}),
        context: contextOf(model, ledger),
      }),
    )
  }
  if (raised) logs.push(line(time, 'Toast', { message: raised.message, tone: raised.tone }))
  if (logs.length === 0) return result
  return { ...result, commands: [...(result.commands ?? []), AppendLog({ entries: logs })] }
}

/** The URL follows the route: a Message that opens another screen adds a
 *  history entry for it. ChangedUrl already came from the URL, and a handler
 *  that corrects the URL itself keeps its own command. */
export const withUrl = (model: Model, message: Message, result: UpdateResult): UpdateResult => {
  const url = urlOf(result.model.route)
  if (message._tag === 'ChangedUrl' || url === urlOf(model.route)) return result
  const moved = (result.commands ?? []).some(
    (command) => command.name === 'PushUrl' || command.name === 'ReplaceUrl',
  )
  if (moved) return result
  return { ...result, commands: [...(result.commands ?? []), PushUrl({ url })] }
}

/** Messages that move a Company to another Era. */
export const ROUNDS = new Set(['RoundRaised', 'RoundDeclined', 'CheatRound'])

/** Whether the board draws anything differently after a Message, or has just come on screen. */
export const boardChanged = (before: Model, after: Model): boolean =>
  before.board.game !== after.board.game ||
  before.prefs.locale !== after.prefs.locale ||
  before.board.region !== after.board.region ||
  before.board.bottleneck !== after.board.bottleneck ||
  before.board.selected !== after.board.selected ||
  before.board.selection !== after.board.selection ||
  before.board.flow !== after.board.flow ||
  before.board.clipboard !== after.board.clipboard ||
  before.founder.playbooks !== after.founder.playbooks ||
  before.board.nodeHistory !== after.board.nodeHistory ||
  halted(before) !== halted(after) ||
  (before.panel === 'research') !== (after.panel === 'research') ||
  cueNode(before) !== cueNode(after) ||
  (onBoard(after.route) && !onBoard(before.route))

/** The board follows the Model: one SyncBoard after any Message that changed what it draws.
 *  A fit asked for in the same Message runs inside it, after the new state is drawn. */
export const withBoard = (model: Model, result: UpdateResult): UpdateResult => {
  if (!boardChanged(model, result.model)) return result
  const commands = result.commands ?? []
  const fit = commands.some((command) => command.name === 'FitBoard')
  return {
    ...result,
    commands: [
      ...commands.filter((command) => command.name !== 'FitBoard'),
      sync(result.model, fit),
    ],
  }
}

/** Leaving the title for a board plays the monitor's connect sequence first, unless motion is reduced. */
export const connect = (model: Model, result: UpdateResult): UpdateResult =>
  onBoard(model.route) || !onBoard(result.model.route) || model.prefs.motion === 'reduce'
    ? result
    : {
        model: { ...result.model, boot: bootStep(result.model.boot, { _tag: 'BoardOpened' }) },
        commands: [...(result.commands ?? []), ConnectBoard({})],
      }

function handle(model: Model, message: Message): UpdateResult {
  return Message.match<UpdateResult>(message, {
    ...companiesHandlers(model),
    ...sessionHandlers(model),
    ...shellHandlers(model),
    ...clockHandlers(model),
    ...keysHandlers(model, route),
    ...canvasHandlers(model, route),
    ...optionsHandlers(model),
    ...tradeoffHandlers(model, route),
    ...incidentsHandlers(model),
    ...mirrorsHandlers(model),
    ...exitHandlers(model),
    ...teamHandlers(model),
    ...panelsHandlers(model, route),
    ...saveHandlers(model, route),
    ...roomHandlers(model),
  })
}

/** Handles a Message and adds its sound cue. Messages that route to another
 *  Message (keys, the Collect footer) sound once, as the Message they became. */
function route(model: Model, message: Message): UpdateResult {
  const handled = handle(model, message)
  const result = { ...handled, model: noticed(handled.model, message) }
  if (result.model.prefs.muted || result.commands?.some((command) => command.name === 'PlaySound'))
    return result
  const cue = cueOf(model, message, result.model)
  return cue ? { ...result, commands: [...(result.commands ?? []), PlaySound(cue)] } : result
}

export const update = (model: Model, message: Message): UpdateResult => {
  if (model.boot._tag === 'Connecting' && message._tag === 'KeyPressed') return { model }
  const result = connect(model, withUrl(model, message, route(model, message)))
  const moved = ROUNDS.has(message._tag) && result.model.board.game.stage !== model.board.game.stage
  return logged(
    model,
    message,
    withBoard(model, moved ? milestones(model, result, [], ledgerOf(result.model)) : result),
  )
}

export const percentilesVisible = (model: Model): boolean => has(model.board.game, 'percentiles')
