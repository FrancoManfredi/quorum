import { TradeoffOption } from '@quorum/ui/game/tradeoff'
import { Listbox, Menu as UiMenu } from '@foldkit/ui'
import { Locale } from '../i18n/index.ts'
import { Effect, Schema } from 'effect'
import { DragAndDrop } from '@foldkit/ui'
import { BUILD_GROUPS, REQUEST_KINDS, type BuildGroup } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { solveFlow } from '@quorum/simulation/solve'
import { HistoryRow, exitOffers } from '@quorum/simulation/exit'
import { Founder } from '@quorum/simulation/founder'
import { Playbook } from '@quorum/simulation/playbook'
import { Boot } from './boot-machine.ts'
import { SENDER_KINDS } from './copy/senders.ts'
import { SandboxId, SandboxRun, Session } from './session-machine.ts'
import { histogramQuery } from './challenge-query.ts'
import { History } from './history.ts'
import { NodeSample } from './node-metrics.ts'
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

/* ==========================================================================
   Quorum — what the UI holds. The Game is the saved company; everything else
   is the player's view of it. The Ledger is never stored: views derive it
   from the Game with `ledgerOf`.
   ========================================================================== */

export const Panel = Schema.Literals([
  'none',
  'research',
  'team',
  'exit',
  'exited',
  'away',
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
  'glossary',
  'inbox',
  'dashboard',
  'churn',
  'mirror',
  'cost',
])
export type Panel = typeof Panel.Type

export const BuildGroupKey = Schema.Literals(
  BUILD_GROUPS.map((group) => group.key) as [BuildGroup, ...Array<BuildGroup>],
)

/** The title menu's page. */
export const Menu = Schema.Literals(['main', ...MENU_PAGES])
export type Menu = typeof Menu.Type

export { SandboxId, SandboxRun } from './session-machine.ts'

/** What the Sandbox keeps in localStorage, apart from the Company save. */
export const SandboxStore = Schema.Struct({
  passed: Schema.Array(SandboxId),
  free: Schema.NullOr(Game),
})
export type SandboxStore = typeof SandboxStore.Type

/** What happened while the player was away (15 "Offline return"). */
export const Away = Schema.Struct({
  seconds: Schema.Finite,
  away: Schema.Finite,
  usersBefore: Schema.Finite,
  usersAfter: Schema.Finite,
  cash: Schema.Finite,
  studied: Schema.Array(ResearchId),
  devHours: Schema.Finite,
  peak: Schema.Finite,
  peakHour: Schema.Finite,
  peakNode: Schema.NullOr(Schema.String),
  lost: Schema.Boolean,
})
export type Away = typeof Away.Type

/** The Company that just exited: its history row, and the research it could pass on. */
export const Exited = Schema.Struct({
  row: HistoryRow,
  researched: Schema.Array(ResearchId),
})
export type Exited = typeof Exited.Type

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
})
export type Toast = typeof Toast.Type

/** One line in a Thread: what was said, and when. */
export const MailEntry = Schema.Struct({ time: Schema.Finite, text: Schema.String })

/** A button on a Mail. The id says what it does; `update.ts` maps it to a Message. */
export const MailAction = Schema.Struct({ id: Schema.String, label: Schema.String })

/** One Thread: Mail about one thing from one Sender. It stays until the player deletes it. */
export const Mail = Schema.Struct({
  id: Schema.Finite,
  key: Schema.String,
  sender: Schema.String,
  subject: Schema.String,
  /** Game time of the newest entry. */
  time: Schema.Finite,
  entries: Schema.Array(MailEntry),
  actions: Schema.Array(MailAction),
  /** What the player chose, once they chose; it replaces the buttons. */
  answer: Schema.NullOr(Schema.String),
  read: Schema.Boolean,
  trashed: Schema.Boolean,
  spam: Schema.Boolean,
  /** Game time its cause went away, or null while it holds. */
  resolved: Schema.NullOr(Schema.Finite),
})
export type Mail = typeof Mail.Type

export const Folder = Schema.Literals(['action', 'fyi', 'spam', 'trash'])
export type Folder = typeof Folder.Type

/** A Mail's label: one per Sender kind, and the Inbox's filter chips (18 "The Inbox"). */
export const MailLabel = Schema.Literals(SENDER_KINDS)
export type MailLabel = typeof MailLabel.Type

/** The figures a change is measured by. */
export const Figures = Schema.Struct({
  revenue: Schema.Finite,
  latency: Schema.Finite,
  p99: Schema.Finite,
  errors: Schema.Finite,
})
export type Figures = typeof Figures.Type

/** A change the player made, settling: queues drain, caches and runtimes warm up. */
export const Change = Schema.Struct({
  label: Schema.String,
  count: Schema.Finite,
  startedAt: Schema.Finite,
  before: Figures,
  /** Revenue, served, and error share over the last few ticks, to tell when they stop moving. */
  recent: Schema.Array(
    Schema.Struct({ revenue: Schema.Finite, served: Schema.Finite, errors: Schema.Finite }),
  ),
  /** Trailing ticks the figures have held within 1%. */
  steady: Schema.Finite,
})
export type Change = typeof Change.Type

/** An option a Tradeoff card previews; the board's compute jobs share it. */
export { TradeoffOption }

export const TradeoffKind = Schema.Literals(['runtime', 'framework', 'family'])
export type TradeoffKind = typeof TradeoffKind.Type

/** What a ghost run says an option does to the player's Design. */
export const PreviewFigures = Schema.Struct({
  before: Figures,
  after: Figures,
  burn: Schema.Array(Schema.Finite),
  restart: Schema.Finite,
  cash: Schema.Finite,
})
export type PreviewFigures = typeof PreviewFigures.Type

/** The open Tradeoff card: hovered, or pinned by a click until Confirm or Cancel. */
export const Tradeoff = Schema.Struct({
  nodeId: Schema.String,
  option: TradeoffOption,
  pinned: Schema.Boolean,
  preview: Schema.NullOr(PreviewFigures),
  /** Why the option cannot be chosen, when it cannot. */
  refusal: Schema.NullOr(Schema.String),
})
export type Tradeoff = typeof Tradeoff.Type

/** An element a first Company shows only once it is useful (15 "Progressive disclosure"). */
export const Reveal = Schema.Literals([
  'undo',
  'collect',
  'resize',
  'research',
  'errors',
  'team',
  'engineering',
  'autopilot',
  'glossary',
])
export type Reveal = typeof Reveal.Type

/** The element that just appeared: it glows until the player uses it or its UI ticks run out. */
export const RevealCue = Schema.Struct({ key: Reveal, left: Schema.Finite })
export type RevealCue = typeof RevealCue.Type

/** Motion: follow the system setting, or reduce it whatever the system says. */
export const Motion = Schema.Literals(['system', 'reduce'])
export type Motion = typeof Motion.Type

/** Interface text: its own size, or 150% (15 "Accessibility"). The board's cards scale with its zoom. */
export const TextSize = Schema.Literals(['normal', 'large'])
export type TextSize = typeof TextSize.Type

/** What the player's browser remembers apart from saves: settings, and the option sets confirmed once. */
export const Prefs = Schema.Struct({
  locale: Locale.pipe(Schema.withDecodingDefaultKey(Effect.succeed('en' as const))),
  seenTradeoffs: Schema.Array(TradeoffKind).pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  muted: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  autoPause: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  blurPause: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
  motion: Motion.pipe(Schema.withDecodingDefaultKey(Effect.succeed('system' as const))),
  text: TextSize.pipe(Schema.withDecodingDefaultKey(Effect.succeed('normal' as const))),
  agentAccess: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  /** Share anonymous usage data. Off stops capture and persists the choice. */
  analytics: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(true))),
})
export type Prefs = typeof Prefs.Type

/** The result of a change, once it settled. */
export const Delta = Schema.Struct({
  id: Schema.Finite,
  label: Schema.String,
  before: Figures,
  after: Figures,
  worse: Schema.Boolean,
  shownAt: Schema.Finite,
})
export type Delta = typeof Delta.Type

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
  /** The time range in calendar minutes. */
  range: Schema.Finite,
  /** The Sample the crosshair is on. */
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
  /** The region the per-region panels narrow to, or null for every region. */
  region: Schema.NullOr(Region),
})
export type Dashboard = typeof Dashboard.Type

/** A Sender the player silenced, until the game time the mute runs out. */
export const MailMute = Schema.Struct({ sender: Schema.String, until: Schema.Finite })
export type MailMute = typeof MailMute.Type

/** The Inbox: the Mail the game has sent, and how the panel and its preview card show it. */
export const Inbox = Schema.Struct({
  /** Oldest first. */
  mail: Schema.Array(Mail),
  /** The Mail the panel shows. */
  focus: Schema.NullOr(Schema.Finite),
  /** The Mail whose preview card waits above the Inbox button until the player reads or dismisses it. */
  peek: Schema.NullOr(Schema.Finite),
  /** The last event tick the world wrote Mail for. */
  bucket: Schema.Finite,
  /** The Sandbox's mail generator: the sample the next send uses. */
  sample: Schema.String,
  /** The folder the panel lists. */
  folder: Folder,
  /** The label the chips filter the folder by, or null for every kind. */
  label: Schema.NullOr(MailLabel),
  /** Senders the player muted: their Mail lands read, with no preview card, until the hour is up. */
  mutes: Schema.Array(MailMute),
})
export type Inbox = typeof Inbox.Type

/** The Glossary panel: its open entry, search, category filter, and the panel it closes back to. */
/** The Team panel's transient drag gesture for moving engineers between teams. */
export const ServiceDraft = Schema.Struct({
  /** The name typed for the Service a split makes. */
  name: Schema.String,
  /** The team that will own it. */
  owner: Schema.String,
  /** The Features the split moves. */
  features: Schema.Array(FeatureId),
})
export type ServiceDraft = typeof ServiceDraft.Type

export const Team = Schema.Struct({ drag: DragAndDrop.Model, service: ServiceDraft })
export type Team = typeof Team.Type

/** The research item the Research panel shows in its side pane; null picks one. */
export const Research = Schema.Struct({ focus: Schema.NullOr(ResearchId) })
export type Research = typeof Research.Type

export const Glossary = Schema.Struct({
  focus: Schema.NullOr(Schema.String),
  /** Research when a (?) link opened it. */
  returnTo: Panel,
  query: Schema.String,
  category: Schema.NullOr(Schema.String),
})
export type Glossary = typeof Glossary.Type

/** A board mode: placing one Component, or stamping the Founder's Playbook (by index) or the copied Nodes. */
export const Tool = Schema.Union([
  Schema.TaggedStruct('Placing', { type: ComponentId }),
  Schema.TaggedStruct('Stamping', {
    source: Schema.Union([Schema.Finite, Schema.Literal('clipboard')]),
  }),
])
export type Tool = typeof Tool.Type

/** Progressive disclosure (15): the elements this board shows, triggers that wait their turn, and the one that glows. */
export const Disclosure = Schema.Struct({
  revealed: Schema.Array(Reveal),
  pending: Schema.Array(Reveal),
  cue: Schema.NullOr(RevealCue),
})
export type Disclosure = typeof Disclosure.Type

/** The board's clock: its speed, whether it runs, and when it last saved and sampled. */
export const Clock = Schema.Struct({
  speed: Schema.Finite,
  paused: Schema.Boolean,
  /** The pause came from the window losing focus, so focus resumes it. */
  away: Schema.Boolean,
  /** Steps owed but not run yet: a tick at 1× is 2.5 Steps. */
  carry: Schema.Finite,
  /** Game time of the last save, so the clock saves every few seconds. */
  savedAt: Schema.Finite,
  /** Game time of the last log sample. */
  sampledAt: Schema.Finite,
})
export type Clock = typeof Clock.Type

/**
 * A buy or upgrade control under the pointer that repeats while held (15 "Bulk
 * actions"): the Node it buys for and the wall clock of the last buy.
 */
export const Hold = Schema.Struct({ nodeId: Schema.String, at: Schema.Finite })
export type Hold = typeof Hold.Type

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
  /** What the Company earned when it exited, until the player leaves it. */
  exited: Schema.NullOr(Exited),
  /** What happened while the player was away. */
  away: Schema.NullOr(Away),
  /** The region tab the board shows. */
  region: Region,
  selected: Schema.NullOr(Schema.String),
  /** Nodes picked with shift for a Playbook. */
  selection: Schema.Array(Schema.String),
  /** What a click on the board does, and what follows the pointer. */
  tool: Schema.NullOr(Tool),
  /**
   * The Node a keyboard link starts from (15 "Accessibility"): `L` sets it,
   * arrows move the selection to the other end, and Enter or `L` links them.
   */
  linkFrom: Schema.NullOr(Schema.String),
  /** The Nodes a sale is waiting on, until the player confirms it. */
  confirmSell: Schema.NullOr(Schema.Array(Schema.String)),
  /** The Nodes last copied or cut. */
  clipboard: Schema.NullOr(Playbook),
  /** The open build tray, or null when the dock shows only its group icons. */
  buildGroup: Schema.NullOr(BuildGroupKey),
  /** The buy or upgrade control held down, which repeats while it stays down. */
  hold: Schema.NullOr(Hold),
  team: Team,
  research: Research,
  /** The Insight card's help section is open. */
  insightHelp: Schema.Boolean,
  clock: Clock,
  change: Schema.NullOr(Change),
  delta: Schema.NullOr(Delta),
  /** Ticks left to show "Stable" after a change settles. */
  stableTicks: Schema.Finite,
  tradeoff: Schema.NullOr(Tradeoff),
  disclosure: Disclosure,
  /** Board actions to undo, newest last, at most 50. */
  undo: Schema.Array(Undo),
  /** Undone actions to redo, newest last. A new action clears it. */
  redo: Schema.Array(Undo),
  /** The Bottleneck, searched once per sim second, not on every tick. */
  bottleneck: Schema.NullOr(Schema.String),
  /** The sim second of the last search; minus one searches again on the next tick. */
  bottleneckAt: Schema.Finite,
  /** Recorded traffic and load per Node, at most one calendar day in this session. */
  nodeHistory: Schema.Record(Schema.String, Schema.Array(NodeSample)),
  nodeSample: Schema.NullOr(Schema.Struct({ nodeId: Schema.String, time: Schema.Finite })),
  inbox: Inbox,
  dashboard: Dashboard,
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
export const Model = Schema.Struct({
  /** The screen, parsed from the URL. */
  route: AppRoute,
  /** Where the app is in its boot sequence: the clock-in splash, the title, or a board opening. */
  boot: Boot,
  panel: Panel,
  toast: Schema.NullOr(Toast),
  toastSeq: Schema.Finite,
  board: Board,
  /** The Company's board, kept aside while a Sandbox or Challenge is open. */
  company: Schema.NullOr(Board),
  /** The Companies saved in the browser, and the one Continue opens. */
  saves: SaveIndex,
  /** The single save of the build before Company files exists and can still be recovered. */
  oldSave: Schema.Boolean,
  /** The current Company's Game has been read into the board. */
  loaded: Schema.Boolean,
  /** The founding screen: the name and logo the next Company starts with. */
  draft: Schema.Struct({ name: Schema.String, logo: LogoId }),
  /** The Company file the Companies page shows, or null for the list. */
  saveFocus: Schema.NullOr(Schema.String),
  /** The player asked to delete the focused Company; the next press confirms. */
  saveConfirm: Schema.Boolean,
  /** The player across Companies, kept apart from the Company save. */
  founder: Founder,
  /** Guided Sandboxes the player has passed. */
  passed: Schema.Array(SandboxId),
  /** The free Sandbox as the player left it. */
  freeBoard: Schema.NullOr(Game),
  /** Challenge histograms from the API Worker. */
  histograms: histogramQuery.Model,
  /** Today's UTC date, for the daily drill. */
  today: Schema.String,
  /** The player's settings, kept in the browser apart from saves. */
  prefs: Prefs,
  glossary: Glossary,
  languagePicker: Listbox.Model,
  /** The phone toolbar's More menu. */
  moreMenu: UiMenu.Model,
})
export type Model = typeof Model.Type

/** The Ledger the views show: the flow solve, with the Bottleneck the clock last searched. */
export const ledgerOf = (model: Model): Ledger => ({
  ...solveFlow(model.board.game),
  bottleneck: model.board.bottleneck,
})

/** The Company file Continue opens, or null when the title has no Company. */
export const currentFile = (model: Model) => fileOf(model.saves, model.saves.current)

/** A Company is open: its file exists and its Game is on the board. */
export const hasCompany = (model: Model): boolean => model.loaded && currentFile(model) !== null

/** The board is not the Company: a Sandbox or a Challenge is open. */
export const offCompany = (model: Model): boolean => model.board.session._tag !== 'Company'

/** The most Legacy an Exit pays now, or null while no Exit is on the table. */
export const exitLegacy = (model: Model): number | null => {
  if (offCompany(model) || model.board.exited) return null
  const offers = exitOffers(model.board.game, ledgerOf(model))
  return offers.length === 0 ? null : Math.max(...offers.map((offer) => offer.legacy))
}

/** The game menu, or the Settings it opens, is over the board. */
export const inMenu = (model: Model): boolean =>
  model.panel === 'menu' || model.panel === 'settings'

/** The clock holds still: the player paused it, or the game menu is open. */
export const halted = (model: Model): boolean =>
  model.board.clock.paused || inMenu(model) || model.boot._tag === 'Connecting'

/** The Playbook that follows the pointer, if any. */
export const stampedPlaybook = (model: Model): Playbook | null =>
  model.board.tool?._tag !== 'Stamping'
    ? null
    : model.board.tool.source === 'clipboard'
      ? model.board.clipboard
      : (model.founder.playbooks[model.board.tool.source] ?? null)

/** The Component a click on the board places, if any. */
export const placingOf = (model: Model): typeof ComponentId.Type | null =>
  model.board.tool?._tag === 'Placing' ? model.board.tool.type : null
