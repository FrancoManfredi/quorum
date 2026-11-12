import { MailMessage, Snippet } from './mail-text.ts'
import { TradeoffOption } from '@quorum/ui/game/tradeoff'
import { Listbox, Menu as UiMenu } from '@foldkit/ui'
import * as VolumeSlider from '@quorum/ui/primitives/slider'
import { Locale } from '../i18n/index.ts'
import { Effect, Schema } from 'effect'
import { DragAndDrop } from '@foldkit/ui'
import { DOCK_GROUPS, REQUEST_KINDS, type DockGroup } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { solveFlow } from '@quorum/simulation/solve'
import { exitOffers } from '@quorum/simulation/exit'
import { Founder } from '@quorum/simulation/founder'
import { Playbook } from '@quorum/simulation/playbook'
import { Boot } from './boot-machine.ts'
import { Reveal } from './machine-state.ts'
export { Change, Delta, Figures, PreviewFigures, Reveal } from './machine-state.ts'
import { CompanyPhase, companyIdOf, isExited, isPlaying } from './company-machine.ts'
import { SurveyPhase } from './survey-machine.ts'
export { CompanyPhase } from './company-machine.ts'
import { TradeoffState } from './tradeoff-machine.ts'
export { TradeoffState } from './tradeoff-machine.ts'
import { ClockMode, away as clockAwayOf, paused as clockPausedOf } from './clock-machine.ts'
import { RoomPhase, inRoom } from './room-machine.ts'
import { Seat, Vote } from '@quorum/simulation/room'
import { KeyedFeature } from '@quorum/rpc'
import { KeyPhase } from './key-machine.ts'
import { ChangeState } from './change-machine.ts'
import { ConfirmDelete } from './confirm-delete-machine.ts'
import { DisclosureFlow } from './disclosure-machine.ts'
import { BoardFlow } from './board-machine.ts'
import { MailPhase } from './mail-machine.ts'
import { SENDER_KINDS } from './copy/senders.ts'
import { SandboxId, SandboxRun, Session } from './session-machine.ts'
import { History } from './history.ts'
import { NodeSample } from './node-metrics.ts'
import { StackPicker } from './stack-picker.ts'
import { AppRoute, MENU_PAGES } from './route.ts'
import { LogoId } from './logos.ts'
import { fileOf, SaveIndex } from './saves.ts'
import {
  ComponentId,
  FeatureId,
  Game,
  GameLink,
  GameNode,
  ResearchId,
  Region,
} from '@quorum/simulation/state'

export const Panel = Schema.Literals([
  'none',
  'room',
  'research',
  'team',
  'exit',
  'exited',
  'playbooks',
  'help',
  'offer',
  'era',
  'end',
  'dev',
  'passed',
  'challenge',
  'menu',
  'settings',
  'inbox',
  'dashboard',
  'churn',
  'mirror',
  'cost',
  'vitals',
])
export type Panel = typeof Panel.Type

export const BuildGroupKey = Schema.Literals(
  DOCK_GROUPS.map((group) => group.key) as [DockGroup, ...Array<DockGroup>],
)

export const Menu = Schema.Literals(['main', ...MENU_PAGES])
export type Menu = typeof Menu.Type

export { SandboxId, SandboxRun } from './session-machine.ts'

/** What the Sandbox keeps in localStorage, apart from the Company save. */
export const SandboxStore = Schema.Struct({
  passed: Schema.Array(SandboxId),
  free: Schema.NullOr(Game),
})
export type SandboxStore = typeof SandboxStore.Type

/** The Exit survey: two answers, and where they stand with the API Worker. */
export const Survey = Schema.Struct({
  issues: Schema.String,
  likes: Schema.String,
  phase: SurveyPhase,
})
export type Survey = typeof Survey.Type

export const EMPTY_SURVEY: Survey = {
  issues: '',
  likes: '',
  phase: { _tag: 'Open' },
}

/** The open Challenge: a Build, a Run, or a scored Result. */
import { ChallengeRun } from './challenge-machine.ts'
export {
  ChallengeRun,
  type ChallengeResultRun,
  type ChallengeRunningRun,
} from './challenge-machine.ts'

export const Tone = Schema.Literals(['plain', 'ok', 'warn', 'danger', 'primary'])
export type Tone = typeof Tone.Type

export const Toast = Schema.Struct({
  id: Schema.Finite,
  message: Schema.String,
  tone: Tone,
  /** How many times this same message has arrived in a row: a repeat shows once, with a count. */
  count: Schema.Finite,
})
export type Toast = typeof Toast.Type

/** One line in a Thread: what was said, and when. */
export const MailEntry = Schema.Struct({
  time: Schema.Finite,
  text: Schema.String,
  /** What the text says as data, so it can be shown in another language. */
  message: Schema.optionalKey(MailMessage),
  /** The last word of a Thread, as data, when the entry is one. */
  closing: Schema.optionalKey(Snippet),
})

/** A button on a Mail. The id says what it does; `update.ts` maps it to a Message. */
export const MailAction = Schema.Struct({ id: Schema.String, label: Schema.String })

/** One Thread: Mail about one thing from one Sender. It stays until the player deletes it. */
const MAIL_FIELDS = {
  id: Schema.Finite,
  key: Schema.String,
  sender: Schema.String,
  subject: Schema.String,
  message: Schema.optionalKey(MailMessage),
  time: Schema.Finite,
  entries: Schema.Array(MailEntry),
  actions: Schema.Array(MailAction),
  read: Schema.Boolean,
  trashed: Schema.Boolean,
  spam: Schema.Boolean,
} as const

export const Mail = Schema.Struct({ ...MAIL_FIELDS, phase: MailPhase })
export type Mail = typeof Mail.Type

export const Folder = Schema.Literals(['action', 'fyi', 'spam', 'trash'])
export type Folder = typeof Folder.Type

/** A Mail's label: one per Sender kind, and the Inbox's filter chips (18 "The Inbox"). */
export const MailLabel = Schema.Literals(SENDER_KINDS)
export type MailLabel = typeof MailLabel.Type

/** An option a Tradeoff card previews; the board's compute jobs share it. */
export { TradeoffOption }

export const TradeoffKind = Schema.Literals(['runtime', 'framework', 'family'])
export type TradeoffKind = typeof TradeoffKind.Type

/** The element that just appeared: it glows until the player uses it or its UI ticks run out. */
export const RevealCue = Schema.Struct({ key: Reveal, left: Schema.Finite })
export type RevealCue = typeof RevealCue.Type

/** Motion: follow the system setting, or reduce it whatever the system says. */
export const Motion = Schema.Literals(['system', 'reduce'])
export type Motion = typeof Motion.Type

/** Interface text: its own size, or 150% (15 "Accessibility"). The board's cards scale with its zoom. */
export const TextSize = Schema.Literals(['normal', 'large'])
export type TextSize = typeof TextSize.Type

/** The board's palette. The title screen is always dark. */
export const Theme = Schema.Literals(['light', 'dark'])
export type Theme = typeof Theme.Type

/** What the player's browser remembers apart from saves: settings, and the option sets confirmed once. */
export const Prefs = Schema.Struct({
  locale: Locale.pipe(Schema.withDecodingDefaultKey(Effect.succeed('en' as const))),
  seenTradeoffs: Schema.Array(TradeoffKind).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  muted: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** How loud sound effects play, as a percentage of the mastered mix: 0 is silent, 100 the full level. */
  volume: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(100))),
  autoPause: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  blurPause: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
  /** Pause, speed, and the auto-pause on a SEV1 or SEV2. Off, the clock runs at 1× and never stops for the player. */
  easyMode: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  motion: Motion.pipe(Schema.withDecodingDefaultKey(Effect.succeed('system' as const))),
  text: TextSize.pipe(Schema.withDecodingDefaultKey(Effect.succeed('normal' as const))),
  theme: Theme.pipe(Schema.withDecodingDefaultKey(Effect.succeed('light' as const))),
  agentAccess: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Share anonymous usage data. Off stops capture and persists the choice. */
  analytics: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
})
export type Prefs = typeof Prefs.Type

/** The Design before a board action, and the Cash it moved. Design pieces only, to keep the Model small. */
export const Undo = Schema.Struct({
  label: Schema.String,
  nodes: Schema.Array(GameNode),
  links: Schema.Array(GameLink),
  nextId: Schema.Finite,
  /** The signed Cash change of the action: negative for a purchase, positive for a sale. */
  cash: Schema.Finite,
  at: Schema.Finite,
})
export type Undo = typeof Undo.Type

/** The Dashboard's annotation groups: the kinds of mark a Chart draws (12 "Annotations"). */
export const ANNOTATION_GROUPS = ['design', 'deploys', 'incidents', 'company', 'research'] as const
export const AnnotationGroup = Schema.Literals(ANNOTATION_GROUPS)
export type AnnotationGroup = typeof AnnotationGroup.Type

/** The Dashboard panel: its long history, time range, crosshair, and the controls above the rows. */
export const Dashboard = Schema.Struct({
  /** The 15-minute and 1-hour blocks, beyond the Game's 600 Samples. */
  history: History,
  range: Schema.Finite,
  hover: Schema.NullOr(Schema.Finite),
  /** The Postmortem the Incidents row shows, or null for the list alone. */
  postmortem: Schema.NullOr(Schema.Finite),
  /** The annotation groups the Charts draw, so the player can hide the ones in the way. */
  groups: Schema.Array(AnnotationGroup),
  /** Draw yesterday's line under the current series (12 "Controls"). */
  compare: Schema.Boolean,
  /** Show each time series' values as a table instead of its plot (12 "Controls"). */
  table: Schema.Boolean,
  /** The request kind the per-kind panels narrow to, or null for every kind. */
  kind: Schema.NullOr(Schema.Literals(REQUEST_KINDS)),
  /** The Service the per-kind panels narrow to, or null for every Service. */
  service: Schema.NullOr(Schema.String).pipe(Schema.withDecodingDefaultKey(Effect.succeed(null))),
  /** The region the per-region panels narrow to, or null for every region. */
  region: Schema.NullOr(Region),
})
export type Dashboard = typeof Dashboard.Type

/** A Sender the player silenced, until the game time the mute runs out. */
export const MailMute = Schema.Struct({ sender: Schema.String, until: Schema.Finite })
export type MailMute = typeof MailMute.Type

/** The Inbox: the Mail the game has sent, and how the panel and its preview card show it. */
export const Inbox = Schema.Struct({
  mail: Schema.Array(Mail),
  focus: Schema.NullOr(Schema.Finite),
  /** The Mail whose preview card waits above the Inbox button until the player reads or dismisses it. */
  peek: Schema.NullOr(Schema.Finite),
  /** The last event tick the world wrote Mail for. */
  bucket: Schema.Finite,
  /** The Sandbox's mail generator: the sample the next send uses. */
  sample: Schema.String,
  folder: Folder,
  /** The label the chips filter the folder by, or null for every kind. */
  label: Schema.NullOr(MailLabel),
  /** Senders the player muted: their Mail lands read, with no preview card, until the hour is up. */
  mutes: Schema.Array(MailMute),
  /** The Postbox's spam filter is on (18 "Spam and phishing"); it needs the Spam filter research. */
  filter: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
})
export type Inbox = typeof Inbox.Type

/** The Team panel's transient drag gesture for moving engineers between teams. */
export const ServiceDraft = Schema.Struct({
  /** The name typed for the Service a split makes. */
  name: Schema.String,
  owner: Schema.String,
  features: Schema.Array(FeatureId),
})
export type ServiceDraft = typeof ServiceDraft.Type

/** The one name the Team panel is editing: a team, or a Service. */
export const RenameTarget = Schema.Literals(['team', 'service'])
export type RenameTarget = typeof RenameTarget.Type

export const RenameDraft = Schema.Struct({
  target: RenameTarget,
  id: Schema.String,
  draft: Schema.String,
})
export type RenameDraft = typeof RenameDraft.Type

export const Team = Schema.Struct({
  drag: DragAndDrop.Model,
  service: ServiceDraft,
  /** The name being edited, or null when no field is open. */
  rename: Schema.NullOr(RenameDraft),
})
export type Team = typeof Team.Type

/** The research item the Research panel shows in its side pane; null picks one. */
export const Research = Schema.Struct({
  focus: Schema.NullOr(ResearchId),
  drag: DragAndDrop.Model,
  /** The pool deck lists every pool, not only the ones in reach. */
  poolsOpen: Schema.Boolean,
  /** The side pane's width in px; the tree takes the rest. */
  sheetWidth: Schema.Finite,
})
export type Research = typeof Research.Type

/** The board's clock: its speed, whether it runs, and when it last saved and sampled. */
export const Clock = Schema.Struct({
  speed: Schema.Finite,
  mode: ClockMode,
  /** Steps owed but not run yet: a tick at 1× is 2.5 Steps. */
  carry: Schema.Finite,
  /** Game time of the last save, so the clock saves every few seconds. */
  savedAt: Schema.Finite,
  /** Game time of the last log sample. */
  sampledAt: Schema.Finite,
})
export type Clock = typeof Clock.Type

/** One what-if row (12 "Load diagnosis"): a Node's utilization before and after one change. */
export const WhatIfRow = Schema.Struct({
  change: Schema.Literals(['larger', 'retries-off']),
  target: Schema.String,
  before: Schema.Finite,
  after: Schema.Finite,
})
export type WhatIfRow = typeof WhatIfRow.Type

/**
 * One board: the Company, a Sandbox or a Challenge being played, and
 * everything the player does on it. Entering another board starts a fresh
 * one; the Company's board waits aside while a Sandbox or Challenge is open.
 */
export const Board = Schema.Struct({
  /** The Company, or the Sandbox or Challenge while one is open. */
  game: Game,
  /** What the board plays. Exactly one of the three, never two at once. */
  session: Session,
  region: Region,
  selected: Schema.NullOr(Schema.String),
  /** Nodes picked with shift for a Playbook. */
  selection: Schema.Array(Schema.String),
  /** What a click on the board does, and what follows the pointer. */
  flow: BoardFlow,
  clipboard: Schema.NullOr(Playbook),
  /** The open build tray, or null when the dock shows only its group icons. */
  buildGroup: Schema.NullOr(BuildGroupKey),
  team: Team,
  research: Research,
  /** The Insight card's help section is open. */
  insightHelp: Schema.Boolean,
  clock: Clock,
  change: ChangeState,
  tradeoff: TradeoffState,
  disclosure: DisclosureFlow,
  /** Board actions to undo, newest last, at most 50. */
  undo: Schema.Array(Undo),
  /** Undone actions to redo, newest last. A new action clears it. */
  redo: Schema.Array(Undo),
  /** The Bottleneck, searched once per sim second, not on every tick. */
  bottleneck: Schema.NullOr(Schema.String),
  /** The sim second of the last search; minus one searches again on the next tick. */
  bottleneckAt: Schema.Finite,
  /** The Board outside the game's chrome: the player is framing a screenshot. */
  screenshot: Schema.Boolean,
  /** The Inspector's what-if rows for the Node `nodeId`, from the sim second `at`. */
  whatIfs: Schema.NullOr(
    Schema.Struct({
      nodeId: Schema.String,
      at: Schema.Finite,
      rows: Schema.Array(WhatIfRow),
    }),
  ),
  /** Recorded traffic and load per Node, at most one calendar day in this session. */
  nodeHistory: Schema.Record(Schema.String, Schema.Array(NodeSample)),
  nodeSample: Schema.NullOr(Schema.Struct({ nodeId: Schema.String, time: Schema.Finite })),
  inbox: Inbox,
  dashboard: Dashboard,
  /** The rules the player has acknowledged: they stay quiet until a rule clears. */
  alertQuiet: Schema.Array(Schema.Literals(['errors', 'latency', 'saturation', 'queue', 'budget'])),
  /** A Research a locked click reached for: the offer waits until the player takes it, dismisses it,
   *  or studies it. `what` is the option's name as the refusal wrote it, so the sentence stays. */
  researchOffer: Schema.NullOr(Schema.Struct({ id: ResearchId, what: Schema.String })),
  /** The last goal and bottleneck logged, so the log records changes only. */
  lastGoal: Schema.String,
  lastBottleneck: Schema.String,
})
export type Board = typeof Board.Type

/** The open Sandbox, or null when the board plays the Company or a Challenge. */
export const boardSandbox = (board: Board): SandboxRun | null =>
  board.session._tag === 'Sandbox' ? board.session.run : null

/** The open Challenge, or null when the board plays the Company or a Sandbox. */
export const boardChallenge = (board: Board): ChallengeRun | null =>
  board.session._tag === 'Challenge' ? board.session.run : null

/** The session: what lasts while the page is open, and the board being played. */
/** The Room this tab is in, and what the Room last said. */
export const Room = Schema.Struct({
  phase: RoomPhase,
  seats: Schema.Array(Seat),
  speed: Schema.Finite,
  vote: Schema.NullOr(Vote),
  /** The number on the next Intent batch this tab sends. */
  seq: Schema.Finite,
  /** The name this tab sends on the next Hello, and shows in the Seat list. */
  name: Schema.String,
  /** What the name field holds while the player types. */
  draft: Schema.String,
})
export type Room = typeof Room.Type

export const EMPTY_ROOM: Room = {
  phase: { _tag: 'Idle' },
  seats: [],
  speed: 1,
  vote: null,
  seq: 1,
  name: '',
  draft: '',
}

/** The Room is live: the server steps the Company, not this tab. */
export const roomLive = (model: Model): boolean => inRoom(model.room.phase)

/** The Company file that is online in this Room, or null. */
export const onlineFileOf = (model: Model, code: string) =>
  model.saves.companies.find((file) => file.online?.code === code) ?? null

/** The code of the Room this tab is in, or null. */
export const roomCode = (model: Model): string | null =>
  RoomPhase.guards.Idle(model.room.phase) ? null : model.room.phase.code

/** This tab holds the owner Seat. */
export const roomOwner = (model: Model): boolean =>
  RoomPhase.guards.Online(model.room.phase) && model.room.phase.owner

/**
 * The feature key this browser holds, and what the API Worker said it unlocks.
 * There are no accounts, so a key is the only thing that ties a player to the
 * features they paid for or were invited to. `key-machine.ts` holds the check.
 */
export const Access = Schema.Struct({
  /** The key in the form the API Worker reads it, or null before one is activated. */
  key: Schema.NullOr(Schema.String),
  features: Schema.Array(KeyedFeature),
  /** When the key stops working, in epoch milliseconds, or null for no end. */
  expiresAt: Schema.NullOr(Schema.Finite),
})
export type Access = typeof Access.Type

export const EMPTY_ACCESS: Access = { key: null, features: [], expiresAt: null }

/** A section of Settings. `settings.ts` holds their labels, order, and rows. */
export const SettingsSection = Schema.Literals([
  'sound',
  'play',
  'display',
  'privacy',
  'access',
  'save',
])
export type SettingsSection = typeof SettingsSection.Type

export const Model = Schema.Struct({
  route: AppRoute,
  /** Where the app is in its boot sequence: the clock-in splash, the title, or a board opening. */
  boot: Boot,
  panel: Panel,
  toast: Schema.NullOr(Toast),
  toastSeq: Schema.Finite,
  board: Board,
  /** The Room this tab is in, or an idle one. */
  room: Room,
  /** The Company's board, kept aside while a Sandbox or Challenge is open. */
  company: Schema.NullOr(Board),
  /** Which Company the page is playing, and what is happening to it. */
  companyPhase: CompanyPhase,
  /** The Companies saved in the browser, and the one Continue opens. */
  saves: SaveIndex,
  /** The list has been read, so a Room link knows whether it holds the owner token. */
  savesReady: Schema.Boolean,
  /** The founding screen: the name and logo the next Company starts with. */
  draft: Schema.Struct({ name: Schema.String, logo: LogoId }),
  /** The Company file the Companies page shows, or null for the list. */
  saveFocus: Schema.NullOr(Schema.String),
  /** The player asked to delete the focused Company; the next press confirms. */
  saveConfirm: ConfirmDelete,
  /** The player across Companies, kept apart from the Company save. */
  founder: Founder,
  /** The Exit survey, until the player leaves the exited Company. */
  survey: Survey,
  passed: Schema.Array(SandboxId),
  /** The free Sandbox as the player left it. */
  freeBoard: Schema.NullOr(Game),
  /** Today's UTC date, for the daily drill. */
  today: Schema.String,
  /** The player's settings, kept in the browser apart from saves. */
  prefs: Prefs,
  /** The feature key this browser holds, kept with the settings. */
  access: Access,
  /** The key field, while the player types or pastes one. */
  keyDraft: Schema.String,
  /** Where the key check stands, so the field can say it is working or why it failed. */
  keyPhase: KeyPhase,
  /** The Settings section the title's page shows. The board's panel shows them all. */
  settingsSection: SettingsSection,
  languagePicker: Listbox.Model,
  /** The Settings panel's sound level, whose value lives in `prefs.volume`. */
  volumeSlider: VolumeSlider.Model,
  /** The inline Stack pickers on the Inspector's App Server or Worker. */
  runtimePicker: StackPicker,
  frameworkPicker: StackPicker,
  moreMenu: UiMenu.Model,
})
export type Model = typeof Model.Type

/** The Ledger the views show: the flow solve, with the Bottleneck the clock last searched. */
export const ledgerOf = (model: Model): Ledger => ({
  ...solveFlow(model.board.game),
  bottleneck: model.board.bottleneck,
})

/** The Company file the phase names, or null when no Company is named. */
export const currentFile = (model: Model) => fileOf(model.saves, companyIdOf(model.companyPhase))

/** The Company the phase plays on the board. */
export const playingId = (model: Model): string | null =>
  isPlaying(model.companyPhase) ? model.companyPhase.id : null

/** A Company is open: its file exists and its Game is on the board. */
export const hasCompany = (model: Model): boolean =>
  playingId(model) !== null && currentFile(model) !== null

/** The board is not the Company: a Sandbox or a Challenge is open. */
export const offCompany = (model: Model): boolean => model.board.session._tag !== 'Company'

/** The most Legacy an Exit pays now, or null while no Exit is on the table. */
export const exitLegacy = (model: Model): number | null => {
  if (offCompany(model) || isExited(model.companyPhase)) return null
  const offers = exitOffers(model.board.game, ledgerOf(model))
  return offers.length === 0 ? null : Math.max(...offers.map((offer) => offer.legacy))
}

/** The game menu, or the Settings it opens, is over the board. */
export const inMenu = (model: Model): boolean =>
  model.panel === 'menu' || model.panel === 'settings'

/** The clock holds still: the player paused it, or the game menu is open. */
/** The clock holds still: paused for any reason, or the game menu is open. */
export const halted = (model: Model): boolean =>
  !roomLive(model) &&
  (clockPausedOf(model.board.clock.mode) || inMenu(model) || model.boot._tag === 'Connecting')

/** The clock is paused, whatever the reason. A live Room never pauses: the server owns it. */
export const clockPaused = (model: Model): boolean =>
  !roomLive(model) && clockPausedOf(model.board.clock.mode)

/** The pause came from the window losing focus. */
export const clockAway = (model: Model): boolean => clockAwayOf(model.board.clock.mode)

/** The Playbook that follows the pointer, if any. */
export const stampedPlaybook = (model: Model): Playbook | null => {
  const flow = model.board.flow
  if (flow._tag !== 'Stamping') return null
  return flow.source === 'clipboard'
    ? model.board.clipboard
    : (model.founder.playbooks[flow.source] ?? null)
}

/** The Component a click on the board places, if any. */
export const placingOf = (model: Model): typeof ComponentId.Type | null =>
  model.board.flow._tag === 'Placing' ? model.board.flow.type : null

/** The Node a keyboard link starts from, if any. */
export const linkFromOf = (board: Board): string | null =>
  board.flow._tag === 'Linking' ? board.flow.from : null

/** The Nodes a sale waits on, if any. */
export const confirmSellOf = (board: Board): ReadonlyArray<string> | null =>
  board.flow._tag === 'ConfirmingSell' ? board.flow.ids : null
