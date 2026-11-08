import { Result, Schema } from 'effect'
import * as Actions from './actions.ts'
import { Refusal } from './action-kit.ts'
import * as Mirrors from './mirror.ts'
import { Game, Region, Sample } from './state.ts'
import * as Work from './work.ts'

/* ==========================================================================
   A Room: one online Company, one authority. A Seat sends an Intent, which is
   a named Simulation action and its arguments. The Room runs the same action
   the single-player board runs, so it refuses what the board refuses
   (docs/adr/0019-anonymous-multiplayer-rooms.md).
   ========================================================================== */

/** Seats a Room holds, the owner included. */
export const ROOM_SEATS = 4

/** The speeds a Room runs at. Time dilation is a Perk, and a Room has no Founder. */
export const ROOM_SPEEDS = [0.5, 1, 3, 10] as const

/** The Dashboard samples a Room keeps, the same window a Company's Game keeps. */
export const ROOM_SAMPLES = 600

/** One player in a Room. The owner is the Seat that took the Company online. */
export const Seat = Schema.Struct({
  id: Schema.String,
  /** What the other Seats see. It lives only while the Room does. */
  name: Schema.String,
  /** An index into the seat palette. */
  colour: Schema.Finite,
  owner: Schema.Boolean,
})
export type Seat = typeof Seat.Type

export const VoteKind = Schema.Literals(['fund', 'exit'])
export type VoteKind = typeof VoteKind.Type

/**
 * One decision the Seats make together. It lives beside the Game, so a vote
 * never changes the save format.
 */
export const Vote = Schema.Struct({
  id: Schema.Finite,
  kind: VoteKind,
  /** The Seat that started it. */
  by: Schema.String,
  yes: Schema.Array(Schema.String),
  no: Schema.Array(Schema.String),
  /** Sim time the vote lapses at. */
  closesAt: Schema.Finite,
})
export type Vote = typeof Vote.Type

/** What a vote does when it passes: raise a round, or end the session. */
export const VOTE_ACTIONS = { fund: 'raise', exit: 'exit' } as const

/** A vote passes when yes is more than half of the connected Seats. A tie fails. */
export const votePasses = (vote: Vote, connected: ReadonlyArray<string>): boolean =>
  connected.length > 0 &&
  vote.yes.filter((id) => connected.includes(id)).length * 2 > connected.length

/* ---------- Intents ---------- */

export const IntentNamespace = Schema.Literals(['actions', 'work', 'mirrors'])
export type IntentNamespace = typeof IntentNamespace.Type

export const Intent = Schema.Struct({
  ns: IntentNamespace,
  name: Schema.String,
  args: Schema.Array(Schema.Unknown),
})
export type Intent = typeof Intent.Type

type Rest<F> = F extends (game: Game, ...rest: infer A) => unknown ? A : never

/**
 * The actions a Seat may take. Every entry is a function the board calls, so a
 * Room and a browser cannot disagree about what a move does. Actions the game
 * runs on its own (a director's incident, a scripted trap) and the two vote
 * decisions stay out.
 */
const PLAYER_ACTIONS = {
  boxNodes: Actions.boxNodes,
  cancelMigration: Actions.cancelMigration,
  cancelReport: Actions.cancelReport,
  cancelStudy: Actions.cancelStudy,
  collect: Actions.collect,
  connect: Actions.connect,
  decline: Actions.decline,
  deleteMessage: Actions.deleteMessage,
  disableRule: Actions.disableRule,
  disconnect: Actions.disconnect,
  drain: Actions.drain,
  expandVolume: Actions.expandVolume,
  failOver: Actions.failOver,
  failOverRegion: Actions.failOverRegion,
  failOverZone: Actions.failOverZone,
  fenceLeader: Actions.fenceLeader,
  filePostmortem: Actions.filePostmortem,
  installBackdoor: Actions.installBackdoor,
  move: Actions.move,
  moveKind: Actions.moveKind,
  moveStudy: Actions.moveStudy,
  moveStudyTo: Actions.moveStudyTo,
  openRegion: Actions.openRegion,
  payFakeInvoice: Actions.payFakeInvoice,
  phished: Actions.phished,
  pinAndRedeploy: Actions.pinAndRedeploy,
  place: Actions.place,
  renewCertificate: Actions.renewCertificate,
  replace: Actions.replace,
  resize: Actions.resize,
  restart: Actions.restart,
  restartClocks: Actions.restartClocks,
  restoreBackup: Actions.restoreBackup,
  rollBackConfig: Actions.rollBackConfig,
  rollBackRoutes: Actions.rollBackRoutes,
  runDrill: Actions.runDrill,
  runRestoreDrill: Actions.runRestoreDrill,
  sell: Actions.sell,
  sellAll: Actions.sellAll,
  setAlertRule: Actions.setAlertRule,
  setAttempts: Actions.setAttempts,
  setAutoscaler: Actions.setAutoscaler,
  setBackup: Actions.setBackup,
  setBatch: Actions.setBatch,
  setCacheEngine: Actions.setCacheEngine,
  setCacheGuard: Actions.setCacheGuard,
  setCacheStrategy: Actions.setCacheStrategy,
  setCdnOptions: Actions.setCdnOptions,
  setChaos: Actions.setChaos,
  setCollector: Actions.setCollector,
  setCompression: Actions.setCompression,
  setDbEngine: Actions.setDbEngine,
  setDbRetention: Actions.setDbRetention,
  setDegrade: Actions.setDegrade,
  setDeployStrategy: Actions.setDeployStrategy,
  setDlq: Actions.setDlq,
  setDocOptions: Actions.setDocOptions,
  setFamily: Actions.setFamily,
  setFanout: Actions.setFanout,
  setGatewayBucket: Actions.setGatewayBucket,
  setGatewayOptions: Actions.setGatewayOptions,
  setGogc: Actions.setGogc,
  setGpuModel: Actions.setGpuModel,
  setGpuType: Actions.setGpuType,
  setGuidance: Actions.setGuidance,
  setHealthCheck: Actions.setHealthCheck,
  setHubOptions: Actions.setHubOptions,
  setLbVariant: Actions.setLbVariant,
  setLifecycle: Actions.setLifecycle,
  setLinkKinds: Actions.setLinkKinds,
  setLinkPolicy: Actions.setLinkPolicy,
  setLogOptions: Actions.setLogOptions,
  setMaterialized: Actions.setMaterialized,
  setMaxLength: Actions.setMaxLength,
  setParanoia: Actions.setParanoia,
  setPm: Actions.setPm,
  setPolicyOn: Actions.setPolicyOn,
  setPoolerMode: Actions.setPoolerMode,
  setPrecision: Actions.setPrecision,
  setPrefetch: Actions.setPrefetch,
  setPricing: Actions.setPricing,
  setProvider: Actions.setProvider,
  setQuorum: Actions.setQuorum,
  setRateLimit: Actions.setRateLimit,
  setRecycle: Actions.setRecycle,
  setRegion: Actions.setRegion,
  setRollout: Actions.setRollout,
  setRyw: Actions.setRyw,
  setSample: Actions.setSample,
  setSearchOptions: Actions.setSearchOptions,
  setSearchRefresh: Actions.setSearchRefresh,
  setShardKey: Actions.setShardKey,
  setShards: Actions.setShards,
  setShed: Actions.setShed,
  setSlowStart: Actions.setSlowStart,
  setSplit: Actions.setSplit,
  setSpread: Actions.setSpread,
  setStandby: Actions.setStandby,
  setSticky: Actions.setSticky,
  setStorageClass: Actions.setStorageClass,
  setStorageIops: Actions.setStorageIops,
  setStoreVariant: Actions.setStoreVariant,
  setSync: Actions.setSync,
  setTtl: Actions.setTtl,
  setUnderAttack: Actions.setUnderAttack,
  setVecIndex: Actions.setVecIndex,
  setWorkers: Actions.setWorkers,
  setZone: Actions.setZone,
  study: Actions.study,
  switchProvider: Actions.switchProvider,
  takeDiscount: Actions.takeDiscount,
  throttleConnects: Actions.throttleConnects,
  unboxNodes: Actions.unboxNodes,
} as const

const PLAYER_WORK = {
  acceptResignation: Work.acceptResignation,
  addIndex: Work.addIndex,
  approveBlock: Work.approveBlock,
  assign: Work.assign,
  assignService: Work.assignService,
  cancelItem: Work.cancelItem,
  cancelMigration: Work.cancelMigration,
  changeStack: Work.changeStack,
  createTeam: Work.createTeam,
  giveTimeOff: Work.giveTimeOff,
  hire: Work.hire,
  laterBlock: Work.laterBlock,
  layoff: Work.layoff,
  moveItem: Work.moveItem,
  moveService: Work.moveService,
  patchNow: Work.patchNow,
  prioritizeItem: Work.prioritizeItem,
  queueAuthMove: Work.queueAuthMove,
  queueEngineChange: Work.queueEngineChange,
  queueFeature: Work.queueFeature,
  queuePatch: Work.queuePatch,
  queueReshard: Work.queueReshard,
  queueRunbook: Work.queueRunbook,
  queueTask: Work.queueTask,
  raiseSalary: Work.raiseSalary,
  removeFeature: Work.removeFeature,
  removeTeam: Work.removeTeam,
  rollback: Work.rollback,
  rushItem: Work.rushItem,
  setAutopilot: Work.setAutopilot,
  setFix: Work.setFix,
  setTeamKind: Work.setTeamKind,
  setTeamPolicy: Work.setTeamPolicy,
  shiftMigration: Work.shiftMigration,
  splitService: Work.splitService,
} as const

const PLAYER_MIRRORS = {
  applyMirror: Mirrors.applyMirror,
  pickIacTool: Mirrors.pickIacTool,
  refreshMirror: Mirrors.refreshMirror,
  repairMirror: Mirrors.repairMirror,
  setComputed: Mirrors.setComputed,
  setMirrorData: Mirrors.setMirrorData,
  setOverride: Mirrors.setOverride,
  setSyncMode: Mirrors.setSyncMode,
  startMirror: Mirrors.startMirror,
  stopMirror: Mirrors.stopMirror,
} as const

const tables: Record<IntentNamespace, Record<string, unknown>> = {
  actions: PLAYER_ACTIONS,
  work: PLAYER_WORK,
  mirrors: PLAYER_MIRRORS,
}

/** A board action, as a Seat sends it. The arguments are typed from the action. */
export const intent = <K extends keyof typeof PLAYER_ACTIONS>(
  name: K,
  ...args: Rest<(typeof PLAYER_ACTIONS)[K]>
): Intent => ({ ns: 'actions', name: name as string, args })

/** A Team action, as a Seat sends it. */
export const workIntent = <K extends keyof typeof PLAYER_WORK>(
  name: K,
  ...args: Rest<(typeof PLAYER_WORK)[K]>
): Intent => ({ ns: 'work', name: name as string, args })

/** A Mirror action, as a Seat sends it. */
export const mirrorIntent = <K extends keyof typeof PLAYER_MIRRORS>(
  name: K,
  ...args: Rest<(typeof PLAYER_MIRRORS)[K]>
): Intent => ({ ns: 'mirrors', name: name as string, args })

/** Whether a value crosses the wire as it is: no functions, no undefined. */
const wireSafe = (value: unknown): boolean => {
  if (value === null) return true
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return true
    case 'number':
      return Number.isFinite(value)
    case 'object':
      return Array.isArray(value)
        ? value.every(wireSafe)
        : Object.values(value as Record<string, unknown>).every(wireSafe)
    default:
      return false
  }
}

/**
 * The Intent a board action stands for, named, when it is one a Seat may take.
 * The browser calls `Actions.*` to apply a move locally; this names the same
 * call so a Room can run it. It returns null for an argument that cannot cross
 * the wire and for an action the Game runs on its own.
 */
export const planOf = (name: string, args: ReadonlyArray<unknown>): Intent | null => {
  if (!wireSafe(args)) return null
  for (const ns of ['actions', 'work', 'mirrors'] as const)
    if (Object.hasOwn(tables[ns], name)) return { ns, name, args: [...args] }
  return null
}

const valid = Schema.is(Game)

/**
 * Runs one Intent against a Game. The Room and the browser both call this, so
 * an Intent means the same thing on each side. A result that the Game schema
 * cannot read is refused rather than broadcast.
 */
export const applyIntent = (game: Game, entry: Intent): Result.Result<Game, Refusal> => {
  const table = tables[entry.ns]
  if (!Object.hasOwn(table, entry.name))
    return Result.fail(Refusal.NotAllowed({ reason: 'That is not a move you can make here.' }))
  const run = table[entry.name] as (game: Game, ...args: ReadonlyArray<unknown>) => unknown
  let outcome: unknown
  try {
    outcome = run(game, ...entry.args)
  } catch {
    return Result.fail(Refusal.NotAllowed({ reason: 'That move did not apply.' }))
  }
  const result = Result.isResult(outcome)
    ? (outcome as Actions.Action)
    : Result.succeed(outcome as Game)
  return Result.match(result, {
    onFailure: (refusal) => Result.fail(refusal),
    onSuccess: (next) =>
      valid(next)
        ? Result.succeed(next)
        : Result.fail(Refusal.NotAllowed({ reason: 'That move did not apply.' })),
  })
}

/** Applies a batch in order, stopping at the first refusal. */
export const applyIntents = (
  game: Game,
  intents: ReadonlyArray<Intent>,
): Result.Result<Game, Refusal> => {
  let current = game
  for (const entry of intents) {
    const applied = applyIntent(current, entry)
    if (Result.isFailure(applied)) return applied
    current = applied.success
  }
  return Result.succeed(current)
}

/* ---------- Wire ---------- */

/** A refusal, as it crosses the wire. The browser turns it back into copy. */
export const RefusalWire = Schema.TaggedUnion({
  Locked: { what: Schema.String, research: Schema.String },
  TooEarly: { what: Schema.String, era: Schema.String },
  Unaffordable: {
    what: Schema.String,
    price: Schema.Finite,
    currency: Schema.Literal('cash'),
  },
  NotAllowed: { reason: Schema.String },
  Missing: {},
})
export type RefusalWire = typeof RefusalWire.Type

export const RoomSnapshot = Schema.Struct({
  revision: Schema.Finite,
  /** Sim time of this snapshot. A client never guesses it. */
  time: Schema.Finite,
  game: Game,
  /** The Dashboard samples added since the previous revision. */
  samples: Schema.Array(Sample),
  seats: Schema.Array(Seat),
  owner: Schema.String,
  speed: Schema.Finite,
  vote: Schema.NullOr(Vote),
})
export type RoomSnapshot = typeof RoomSnapshot.Type

export const ClientMessage = Schema.TaggedUnion({
  /** Claims a Seat. A token that matches the Room's owner claims the owner Seat. */
  Hello: {
    seat: Schema.String,
    name: Schema.String,
    token: Schema.optionalKey(Schema.String),
  },
  /** One or more Intents, applied in order and answered with one snapshot. */
  Intents: { id: Schema.Finite, intents: Schema.Array(Intent) },
  Ballot: { vote: Schema.Finite, yes: Schema.Boolean },
  StartVote: { kind: VoteKind },
  /**
   * Where this Seat's pointer is, in Design coordinates. It is Presence, not a
   * move: the Room relays it to the other Seats and never stores it.
   */
  Cursor: { x: Schema.Finite, y: Schema.Finite, region: Region },
  /** The pointer left the Board, or this tab lost it. */
  HideCursor: {},
  /** The owner takes the Company back to its browser. */
  TakeOffline: {},
  /** The owner sets the Room's speed. */
  Speed: { value: Schema.Literals(ROOM_SPEEDS) },
  /** The owner removes a Seat. */
  Kick: { seat: Schema.String },
  Resync: {},
  Ping: { at: Schema.Finite },
})
export type ClientMessage = typeof ClientMessage.Type

export const ServerMessage = Schema.TaggedUnion({
  Welcome: {
    revision: Schema.Finite,
    simVersion: Schema.String,
    seat: Schema.String,
    game: Game,
    samples: Schema.Array(Sample),
    seats: Schema.Array(Seat),
    owner: Schema.String,
    speed: Schema.Finite,
    vote: Schema.NullOr(Vote),
  },
  Snapshot: {
    revision: Schema.Finite,
    time: Schema.Finite,
    game: Game,
    samples: Schema.Array(Sample),
    seats: Schema.Array(Seat),
    owner: Schema.String,
    speed: Schema.Finite,
    vote: Schema.NullOr(Vote),
  },
  Refused: { id: Schema.Finite, refusal: RefusalWire },
  /**
   * Another Seat's pointer. It carries the name and colour the Cursor panel
   * shows, so a client can draw it without waiting for a snapshot.
   */
  Cursor: {
    seat: Schema.String,
    name: Schema.String,
    colour: Schema.Finite,
    x: Schema.Finite,
    y: Schema.Finite,
    region: Region,
  },
  /** A Seat's pointer left the Board: stop drawing it. */
  CursorGone: { seat: Schema.String },
  Seats: {
    seats: Schema.Array(Seat),
    owner: Schema.String,
    speed: Schema.Finite,
    vote: Schema.NullOr(Vote),
  },
  /** The owner's copy: the whole Company, on the way offline. */
  Final: {
    revision: Schema.Finite,
    game: Game,
    samples: Schema.Array(Sample),
  },
  Ended: {
    reason: Schema.Literals(['offline', 'handover', 'expired', 'stale', 'removed']),
  },
})
export type ServerMessage = typeof ServerMessage.Type
