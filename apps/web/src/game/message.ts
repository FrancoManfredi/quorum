import { Listbox, Menu as UiMenu } from '@foldkit/ui'
import { Schema } from 'effect'
import { defineMessageUnion } from 'foldkit/message'
import { UrlRequest } from 'foldkit/navigation'
import { Url } from 'foldkit/url'
import { EXIT_IDS, FEATURE_IDS, FIXES, PERK_IDS, TASK_IDS } from '@quorum/simulation/catalog'
import {
  Acks,
  CacheEngine,
  Collector,
  ComponentId,
  GpuType,
  FamilyId,
  FrameworkId,
  IncidentId,
  MutatorId,
  VentureId,
  LbPolicy,
  PmMode,
  PoolerMode,
  Pricing,
  RequestKindId,
  ResearchId,
  Retries,
  RuntimeId,
  ScaleSignal,
  Zone,
  Backup,
  Fanout,
  DeployStrategy,
  Region,
  IacTool,
  SyncMode,
  DataPattern,
  DbEngine,
  IopsClass,
  StorageClass,
  DbRetention,
  CacheStrategy,
  VecIndexType,
  CacheKey,
  SearchHeap,
  SearchVariant,
  ShardKey,
  StoreVariant,
} from '@quorum/simulation/state'
import { MANAGED } from '@quorum/simulation/mirror'
import { ChallengeVerdict } from '@quorum/rpc'
import { histogramQuery } from './challenge-query.ts'
import { LogoId } from './logos.ts'
import { DashboardMessage } from './dashboard.ts'
import { GlossaryMessage } from './glossary.ts'
import { InboxMessage } from './inbox.ts'
import { PrefsMessage } from './prefs.ts'
import { ResearchMessage } from './research.ts'
import { TeamMessage } from './team.ts'
import {
  BuildGroupKey,
  Menu,
  Panel,
  PreviewFigures,
  SandboxId,
  Tone,
  TradeoffOption,
} from './model.ts'

/* ==========================================================================
   Every gesture in Quorum becomes one of these.
   ========================================================================== */

export const Message = defineMessageUnion({
  /** The Company index, and the single save of the build before Company files. Null when neither exists. */
  SavesLoaded: {
    index: Schema.NullOr(Schema.String),
    legacy: Schema.NullOr(Schema.String),
    now: Schema.Finite,
  },
  /** One Company's Game, read to continue it or to open it from the Companies page. */
  CompanyLoaded: {
    id: Schema.String,
    open: Schema.Boolean,
    json: Schema.NullOr(Schema.String),
    now: Schema.Finite,
  },
  /** The founding screen's name field. */
  CompanyNameChanged: { name: Schema.String },
  LogoChosen: { logo: LogoId },
  /** The Companies page opens one Company's file. */
  CompanyChosen: { id: Schema.String },
  CompanyClosed: {},
  CompanyOpened: { id: Schema.String },
  CompanyDeleteAsked: {},
  CompanyDeleteCancelled: {},
  CompanyDeleteConfirmed: {},
  CompanyDeleted: { id: Schema.String },
  /** The hidden recovery action: read the single save of the build before Company files. */
  OldSaveImportAsked: {},
  OldSaveLoaded: { json: Schema.NullOr(Schema.String), now: Schema.Finite },
  FounderLoaded: {
    json: Schema.NullOr(Schema.String),
    deviceId: Schema.String,
    today: Schema.String,
  },
  Saved: {},
  /** The title screen's connect sequence ended: the board it was opening shows. */
  Connected: {},
  Continued: {},
  PreseedStarted: {},
  TitleOpened: {},
  /** The badge goes into the reader on the splash; the title follows. */
  ClockedIn: {},
  TitleRevealed: {},
  MenuChosen: { menu: Menu },
  /** URL routing: a link click, a new URL from any source, and a finished navigation. */
  ClickedLink: { request: UrlRequest },
  ChangedUrl: { url: Url },
  Navigated: {},

  /** Guided and free Sandboxes, and the Sandbox store read once at boot. */
  SandboxStoreLoaded: { json: Schema.NullOr(Schema.String) },
  PrefsLoaded: { json: Schema.NullOr(Schema.String) },
  GuidedStarted: { id: SandboxId },
  ChallengeStarted: { id: Schema.String },
  /** Replays the Design from t = 0 and scores it. */
  ChallengeRan: {},
  /** Runs the rest of the run at once. */
  ChallengeFinished: {},
  /** Back to the build board as it was at Run. */
  ChallengeRebuilt: {},
  /** Turns a code fix on or off in a Challenge that pays Dev Hours for it. */
  FixChosen: { fix: Schema.Literals(FIXES), on: Schema.Boolean },
  ChallengeVerified: { verdict: ChallengeVerdict },
  ChallengeUnverified: { message: Schema.String, offline: Schema.Boolean },
  GotHistograms: { message: histogramQuery.Message },
  FreeSandboxStarted: {},
  FreeSandboxReset: {},
  /** Replaces the free Sandbox with a stress board: the link-routing one, or the big one. */
  StressBoardLoaded: { big: Schema.Boolean },
  CompanyCopied: {},
  DemandStepped: { direction: Schema.Literals([1, -1]) },
  MixChosen: { stage: Schema.Finite },

  Ticked: {},
  SpeedCycled: {},
  SpeedChosen: { speed: Schema.Finite },
  PauseToggled: {},
  KeyPressed: { key: Schema.String },
  FullscreenToggled: {},
  BoardFitted: {},
  BoardTidied: {},

  BuildGroupChosen: { group: BuildGroupKey },
  PlacingChosen: { type: Schema.NullOr(ComponentId) },
  NodePlaced: { x: Schema.Finite, y: Schema.Finite },
  NodeTapped: { nodeId: Schema.String },
  /** Reveals a Node from a route row or a mail action: switch region, select, center. */
  RevealNode: { nodeId: Schema.String },
  /** Inspect a recorded component sample, or return to live traffic. */
  NodeSampleChosen: { nodeId: Schema.String, time: Schema.NullOr(Schema.Finite) },
  NodeMoved: { nodeId: Schema.String, x: Schema.Finite, y: Schema.Finite },
  LinkRequested: { from: Schema.String, to: Schema.String },
  LinkCut: { from: Schema.String, to: Schema.String },
  EmptyTapped: {},
  NodeToggled: { nodeId: Schema.String },
  SelectionBoxed: {
    ids: Schema.Array(Schema.String),
    /** Plain shift-drag replaces the selection; with Ctrl it adds, with Alt it takes away. */
    mode: Schema.Literals(['replace', 'add', 'subtract']),
  },
  SelectionCleared: {},
  /** Select every Node on the Board that can be sold. */
  SelectionAll: {},
  NodesCopied: {},
  NodesCut: {},
  /** The copied Nodes follow the pointer until a click places them. */
  NodesPasted: {},
  /** Asks to sell the selection; nothing is sold until it is confirmed. */
  SellAsked: {},
  SellConfirmed: {},
  SellDismissed: {},
  /** Places a copy of the selected Nodes just beside them. */
  NodesDuplicated: {},
  /** Draws a box around the selected Nodes, or takes the box off if they already sit in one. */
  NodesBoxed: {},
  /** Moves the selected Nodes by a few board units. */
  NodesNudged: { dx: Schema.Finite, dy: Schema.Finite },
  /** The button at the bottom of a Node card. */
  FooterPressed: { nodeId: Schema.String },

  ResizeChosen: { nodeId: Schema.String, direction: Schema.Literals([1, -1]) },
  /** Buy several sizes at once: `ten` stops after ten steps or the first refusal, `max` at the top size. */
  BulkResizeChosen: { nodeId: Schema.String, mode: Schema.Literals(['ten', 'max']) },
  /** Buy every Node of a kind once, as one action that skips the ones at their cap. */
  UpgradeAllChosen: { nodeId: Schema.String },
  /** A buy or upgrade control went down: it buys again every REPEAT_MS until it lifts. */
  HoldStarted: { nodeId: Schema.String, now: Schema.Finite },
  /** The held control's clock: `now` one repeat later, ignored while another is in hand. */
  HoldRepeated: { nodeId: Schema.String, now: Schema.Finite },
  /** The held control lifted, so it buys no more. */
  HoldEnded: { nodeId: Schema.String },
  /** Any pointer lift ends the hold: the button under it may have unmounted first. */
  HoldLifted: {},
  FamilyChosen: { nodeId: Schema.String, family: FamilyId },
  PricingChosen: { nodeId: Schema.String, pricing: Pricing },
  RuntimeChosen: { nodeId: Schema.String, runtime: RuntimeId },
  FrameworkChosen: { nodeId: Schema.String, framework: FrameworkId },
  WorkersChosen: { nodeId: Schema.String, workers: Schema.Finite },
  PmChosen: { nodeId: Schema.String, pm: PmMode },
  PoolerModeChosen: { nodeId: Schema.String, mode: PoolerMode },
  CompressionChosen: { nodeId: Schema.String, compress: Schema.Boolean },
  RecycleChosen: { nodeId: Schema.String, recycle: Schema.Boolean },
  PolicyChosen: { nodeId: Schema.String, policy: LbPolicy },
  LbVariantChosen: { nodeId: Schema.String, variant: Schema.Literals(['l7', 'l4']) },
  HealthCheckChosen: {
    nodeId: Schema.String,
    checkEvery: Schema.optional(Schema.Finite),
    deepCheck: Schema.optional(Schema.Boolean),
  },
  AlertRuleChosen: {
    rule: Schema.Literals(['errors', 'latency', 'saturation', 'queue', 'budget']),
    threshold: Schema.Finite,
  },
  TtlChosen: { nodeId: Schema.String, ttl: Schema.Finite },
  CacheEngineChosen: { nodeId: Schema.String, engine: CacheEngine },
  LinkPolicyChosen: {
    from: Schema.String,
    to: Schema.String,
    timeout: Schema.optional(Schema.Finite),
    retries: Schema.optional(Retries),
    breaker: Schema.optional(Schema.Boolean),
    bulkhead: Schema.optional(Schema.Boolean),
    hedge: Schema.optional(Schema.Boolean),
  },
  LinkKindsChosen: {
    from: Schema.String,
    to: Schema.String,
    kinds: Schema.NullOr(Schema.Array(RequestKindId)),
  },
  SampleChosen: { nodeId: Schema.String, sampleRate: Schema.Finite },
  ReplaceBought: { nodeId: Schema.String },
  RestartChosen: { nodeId: Schema.String },
  DrainChosen: { nodeId: Schema.String },
  FailedOver: { nodeId: Schema.String },
  ConnectsThrottled: { nodeId: Schema.String },
  KindMoved: {},
  ZoneFailedOver: {},
  RegionFailedOver: {},
  IndexAdded: { nodeId: Schema.String },
  CacheGuardChosen: {
    nodeId: Schema.String,
    coalesce: Schema.optional(Schema.Boolean),
    warming: Schema.optional(Schema.Boolean),
    earlyExpiry: Schema.optional(Schema.Boolean),
    swr: Schema.optional(Schema.Boolean),
  },
  StickyChosen: { nodeId: Schema.String, sticky: Schema.Boolean },
  SlowStartChosen: { nodeId: Schema.String, slowStart: Schema.Boolean },
  CdnOptionsChosen: {
    nodeId: Schema.String,
    purge: Schema.optional(Schema.Boolean),
    cacheKey: Schema.optional(CacheKey),
  },
  ShardKeyChosen: { nodeId: Schema.String, shardKey: ShardKey },
  SyncChosen: { nodeId: Schema.String, sync: Schema.Boolean },
  SearchOptionsChosen: {
    nodeId: Schema.String,
    searchVariant: Schema.optional(SearchVariant),
    searchShards: Schema.optional(Schema.Finite),
    searchReplicas: Schema.optional(Schema.Finite),
    heap: Schema.optional(SearchHeap),
  },
  StoreVariantChosen: { nodeId: Schema.String, storeVariant: StoreVariant },
  DlqChosen: { nodeId: Schema.String, dlq: Schema.Boolean },
  AttemptsChosen: { nodeId: Schema.String, attempts: Schema.Finite },
  MaxLengthChosen: { nodeId: Schema.String, maxLength: Schema.Finite },
  PrefetchChosen: { nodeId: Schema.String, prefetch: Schema.Finite },
  ParanoiaChosen: { nodeId: Schema.String, paranoia: Schema.Finite },
  UnderAttackChosen: { nodeId: Schema.String, underAttack: Schema.Boolean },
  RateLimitChosen: { nodeId: Schema.String, rateLimit: Schema.Finite },
  GatewayBucketChosen: { nodeId: Schema.String, bucket: Schema.Boolean },
  GatewayOptionsChosen: {
    nodeId: Schema.String,
    authEdge: Schema.optional(Schema.Boolean),
    merge: Schema.optional(Schema.Boolean),
  },
  DbEngineChosen: { nodeId: Schema.String, dbEngine: DbEngine },
  StorageIopsChosen: { nodeId: Schema.String, iops: IopsClass },
  ShardsChosen: { nodeId: Schema.String, shards: Schema.Finite },
  StorageClassChosen: { nodeId: Schema.String, storageClass: StorageClass },
  LifecycleChosen: { nodeId: Schema.String, lifecycle: Schema.Finite },
  DbRetentionChosen: { nodeId: Schema.String, keep: DbRetention },
  MaterializedChosen: { nodeId: Schema.String, materialized: Schema.Boolean },
  ChaosChosen: { chaos: Schema.Boolean },
  CacheStrategyChosen: { nodeId: Schema.String, cacheStrategy: CacheStrategy },
  SearchRefreshChosen: { nodeId: Schema.String, refresh: Schema.Finite },
  RestoreDrilled: { nodeId: Schema.String },
  DeployStrategyChosen: { nodeId: Schema.String, strategy: DeployStrategy },
  HubOptionsChosen: {
    nodeId: Schema.String,
    presence: Schema.optional(Schema.Boolean),
    backoff: Schema.optional(Schema.Boolean),
    clustering: Schema.optional(Schema.Boolean),
  },
  DocOptionsChosen: { nodeId: Schema.String, transactions: Schema.optional(Schema.Boolean) },
  VecIndexChosen: { nodeId: Schema.String, indexType: VecIndexType },
  /** A Feature's rollout, set from its flag (05 "Feature Flags"). */
  RolloutChosen: {
    nodeId: Schema.String,
    feature: Schema.Literals(FEATURE_IDS),
    share: Schema.Finite,
  },
  LogOptionsChosen: {
    nodeId: Schema.String,
    partitions: Schema.optional(Schema.Finite),
    acks: Schema.optional(Acks),
    retain: Schema.optional(Schema.Finite),
    keyed: Schema.optional(Schema.Boolean),
    replicas: Schema.optional(Schema.Finite),
  },
  ZoneChosen: { nodeId: Schema.String, zone: Zone },
  StandbyChosen: { nodeId: Schema.String, standby: Schema.Boolean },
  AutoscalerChosen: {
    nodeId: Schema.String,
    signal: Schema.optional(ScaleSignal),
    target: Schema.optional(Schema.Finite),
    minCopies: Schema.optional(Schema.Finite),
    maxCopies: Schema.optional(Schema.Finite),
    schedule: Schema.optional(Schema.Boolean),
  },
  GpuChosen: { nodeId: Schema.String, gpu: GpuType },
  PrecisionChosen: { nodeId: Schema.String, precision: Schema.Literals(['fp16', 'int8', 'int4']) },
  BatchChosen: { nodeId: Schema.String, batch: Schema.Finite },
  GpuModelChosen: {
    nodeId: Schema.String,
    gpuModel: Schema.Literals(['small', 'medium', 'large']),
  },
  CollectorChosen: { nodeId: Schema.String, collector: Collector },
  GogcChosen: { nodeId: Schema.String, gogc: Schema.Finite },
  ShedChosen: { nodeId: Schema.String, shed: Schema.Boolean },
  DegradeChosen: { nodeId: Schema.String, degrade: Schema.Boolean },
  RywChosen: { nodeId: Schema.String, ryw: Schema.Boolean },
  RuleDisabled: {},
  RegionPicked: { region: Region },
  RegionOpened: { region: Region },
  NodeRegionChosen: { nodeId: Schema.String, region: Region },
  QuorumChosen: { nodeId: Schema.String, n: Schema.Finite, r: Schema.Finite, w: Schema.Finite },
  SpreadChosen: { nodeId: Schema.String, spread: Schema.Boolean },
  BackupChosen: { nodeId: Schema.String, backup: Backup },
  FanoutChosen: { nodeId: Schema.String, fanout: Fanout },
  SplitChosen: { nodeId: Schema.String, split: Schema.Boolean },
  RoutesRolledBack: {},
  ConfigRolledBack: {},
  /** Mirrors (05 "Mirror a region"): the IaC tool, GitOps, and each Mirror's plan. */
  IacToolPicked: { tool: IacTool },
  SyncModePicked: { sync: Schema.NullOr(SyncMode) },
  MirrorStarted: { target: Region, source: Region },
  MirrorApplied: { region: Region, destroy: Schema.Boolean },
  MirrorDataPicked: { region: Region, source: Schema.String, pattern: DataPattern },
  MirrorOverrideSet: {
    region: Region,
    nodeId: Schema.String,
    field: Schema.Literals(MANAGED),
    keep: Schema.Boolean,
  },
  MirrorComputedSet: { region: Region, computed: Schema.Boolean },
  MirrorStopped: { region: Region },
  /** Reads live state: `pulumi refresh` or `alchemy drift`. */
  MirrorRefreshed: { region: Region },
  /** Alchemy's `drift --repair`: hand changes go back to the last deploy. */
  MirrorRepaired: { region: Region },
  LeaderFenced: {},
  DrillRun: {},
  GuidanceChosen: { growth: Schema.Finite, margin: Schema.Finite },
  ReportCancelled: {},
  VolumeExpanded: {},
  CertificateRenewed: {},
  ProviderSwitched: {},
  ProviderChosen: { nodeId: Schema.String, provider: Schema.Literals(['first', 'second']) },
  MessageDeleted: {},
  /** Responses the six hand-written incident kinds need (11 "The six kinds"). */
  SchemaMigrationCancelled: {},
  DependencyPinned: {},
  TableRestored: {},
  ClocksRestarted: {},
  NodeSold: { nodeId: Schema.String },
  Collected: {},
  /** Hovering an option opens its Tradeoff card; clicking pins it, or applies it once seen. */
  OptionPreviewed: { nodeId: Schema.String, option: TradeoffOption },
  OptionLeft: {},
  OptionChosen: { nodeId: Schema.String, option: TradeoffOption },
  OptionConfirmed: {},
  /** The compute worker ran an option's ghost runs. */
  PreviewComputed: { nodeId: Schema.String, option: TradeoffOption, preview: PreviewFigures },
  /** The compute worker searched the Bottleneck for the sim second `at`. */
  BottleneckFound: { bottleneck: Schema.NullOr(Schema.String), at: Schema.Finite },
  TradeoffClosed: {},
  UndoChosen: {},
  RedoChosen: {},

  ResearchChanged: { message: ResearchMessage },
  /** The Team panel: engineers, teams, the backlog, migrations, and deploys. */
  TeamChanged: { message: TeamMessage },
  TaskQueued: { id: Schema.Literals(TASK_IDS) },
  AuthMoveQueued: {},
  /** "Write a runbook" for one incident kind (11 "Runbooks"). */
  RunbookQueued: { kind: IncidentId },
  WorkMoved: { id: Schema.Finite, direction: Schema.Literals([1, -1]) },
  WorkCancelled: { id: Schema.Finite },
  WorkRushed: { id: Schema.Finite },
  WorkPrioritized: { id: Schema.Finite },
  WorkApproved: { id: Schema.Finite },
  WorkDeferred: { id: Schema.Finite },
  WorkPatched: { id: Schema.Finite },
  WorkPatchQueued: { id: Schema.Finite },
  /** A teammate's answer: time off, a raise, or a resignation accepted (18 "Burnout"). */
  EngineerGivenTimeOff: { engineerId: Schema.String },
  EngineerGivenRaise: { engineerId: Schema.String },
  EngineerResigned: { engineerId: Schema.String },
  AutopilotToggled: {},
  PolicyToggled: { policy: Schema.Literals(['research', 'hire', 'upgrade']), on: Schema.Boolean },
  MigrationShifted: {},
  MigrationCancelled: {},
  RolledBack: {},

  /** Exits, the Founder, and the Legacy shop (13). */
  ExitTaken: { exit: Schema.Literals(EXIT_IDS) },
  KeepToggled: { id: ResearchId },
  PerkBought: { id: Schema.Literals(PERK_IDS) },
  VentureChosen: { id: VentureId },
  MutatorToggled: { id: MutatorId },
  CompanyFounded: {},
  AwayClosed: {},

  /** Playbooks. */
  PlaybookSaved: {},
  PlaybookChosen: { index: Schema.Finite },
  PlaybookDeleted: { index: Schema.Finite },
  PlaybookExported: { index: Schema.Finite },
  PlaybookImportAsked: {},
  PlaybookImported: { text: Schema.NullOr(Schema.String) },

  RoundRaised: {},
  RoundDeclined: {},
  /** Takes the investors' bridge while Cash is short (09 "Runway and running out of Cash"). */
  BridgeAccepted: {},
  PostmortemFiled: { id: Schema.Finite, take: Schema.Boolean },

  PanelOpened: { panel: Panel },
  /** A fix in the Churn breakdown: open or show a region, a research item, or a Node. */
  ChurnFixTaken: {
    fix: Schema.Literals(['region', 'research', 'node']),
    target: Schema.String,
  },
  PanelClosed: {},

  /** Settings and the Glossary (15). Each panel is a Submodel with its own Messages. */
  PrefsChanged: { message: PrefsMessage },
  /** The window lost focus. */
  WindowBlurred: {},
  /** The window got focus back. */
  WindowFocused: {},
  LanguagePickerChanged: { message: Listbox.Message },
  MoreMenuChanged: { message: UiMenu.Message },
  InsightHelpToggled: {},
  GlossaryOpened: { id: Schema.NullOr(Schema.String) },
  GlossaryChanged: { message: GlossaryMessage },
  DashboardChanged: { message: DashboardMessage },
  InboxChanged: { message: InboxMessage },

  /** The save as text (15 "Save"): copied out, or asked for and pasted back. */
  SaveExported: {},
  SaveImportAsked: {},
  SaveImported: { text: Schema.NullOr(Schema.String) },

  /** Playtest panel. */
  CheatCash: {},
  CheatInsight: {},
  CheatRound: {},
  CheatLegacy: {},
  IncidentForced: { kind: IncidentId },
  LogExported: {},
  StateCopied: {},
  LogCleared: {},

  ToastRaised: { message: Schema.String, tone: Tone },
  ToastCleared: { id: Schema.Finite },
  /** A Command finished applying something to the DOM. Nothing reads it. */
  Synced: {},
})

export type Message = typeof Message.Type
