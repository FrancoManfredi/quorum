import { Result, Schema } from 'effect'
import * as Actions from './actions.ts'
import { Refusal } from './action-kit.ts'
import { type ComponentId } from './catalog.ts'
import * as Mirrors from './mirror.ts'
import * as Runway from './runway.ts'
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

export const VoteKind = Schema.Literals(['fund', 'decline', 'exit'])
export type VoteKind = typeof VoteKind.Type

/**
 * What a Seat is doing while its pointer is off the Board: the panel it opened.
 * The Room relays the key, so each client writes it in its own language.
 */
export const SeatActivity = Schema.Literals([
  'inspector',
  'research',
  'team',
  'dashboard',
  'playbooks',
  'help',
  'dev',
  'inbox',
  'cost',
  'churn',
  'mirror',
  'settings',
  'menu',
  'room',
  'exit',
  'challenge',
])
export type SeatActivity = typeof SeatActivity.Type

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

/** What a vote does when it passes: raise a round, decline it, or end the session. */
export const VOTE_ACTIONS = { fund: 'raise', decline: 'decline', exit: 'exit' } as const

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

/** A bulk upgrade reports what it skipped beside the Game; a Room keeps the Game. */
const upgradeAll = (game: Game, type: ComponentId, region?: Region) =>
  Result.map(Actions.upgradeAll(game, type, region), (outcome) => outcome.game)

/**
 * A module's exported moves, minus the entries that are not a Seat's to make.
 * A blacklist keeps every new action available without editing this file; a
 * helper that slipped through only fails the Game schema when it is applied.
 */
const seatMoves = <T extends object, Denied extends keyof T>(
  module: T,
  denied: ReadonlyArray<Denied>,
): Omit<T, Denied> =>
  Object.fromEntries(
    Object.entries(module).filter(
      ([name, value]) => typeof value === 'function' && !denied.includes(name as Denied),
    ),
  ) as Omit<T, Denied>

/** The Game's own moves: every one the board calls, bar these. */
const NOT_A_MOVE = [
  'LINK_TIMEOUTS',
  'PHISH_CHURN',
  'Refusal',
  'acknowledge', // The board acknowledges an Incident as the next move.
  'blankNode', // Placement's private constructor.
  'canRaise', // Reads the Game.
  'decline', // Declining a funding round is a vote, as raising it is.
  'describeRefusal', // Formats a refusal's prose.
  'offer', // Reads the Game.
  'raise', // A funding round is a vote.
  'restartable', // Reads a Node.
  'rollRestore', // The restore drill's private roll.
  'shortOfCash', // Reads the Game.
  'upgradeAll', // Added below, wrapped to return the Game it made.
] as const

/** Runway moves: accepting the bridge is the board's, the rest are the tick's. */
const NOT_A_RUNWAY_MOVE = [
  'BRIDGE_AT_DAYS',
  'BRIDGE_DAYS',
  'BRIDGE_DILUTION',
  'RUNWAY_MONTH',
  'SHUTDOWN_AT_DAYS',
  'advanceRunway',
  'runwayOf',
] as const

const PLAYER_ACTIONS = {
  ...seatMoves(Actions, NOT_A_MOVE),
  ...seatMoves(Runway, NOT_A_RUNWAY_MOVE),
  upgradeAll,
}

/** Team work: every move the Team panel can make, bar these. */
const NOT_WORK = [
  'MAX_TEAMS',
  'PLATFORM_STAGE',
  'advanceMorale',
  'advanceTeam',
  'assignments',
  'blockReason',
  'blockRemind',
  'engineCost',
  'featureHoursOf',
  'featureRefusal',
  'itemName',
  'loadBalancersOf',
  'nextFeature',
  'nodesOfService',
  'removeRefusal',
  'runbookKinds',
  'runbookRefusal',
  'rushBugOf',
  'rushDebtOf',
  'serviceOfItem',
  'serviceOfNode',
  'splitCost',
  'splitRefusal',
  'takeable',
  'taskRefusal',
  'worksOn',
] as const

const PLAYER_WORK = seatMoves(Work, NOT_WORK)

/** Mirrors: every move the Mirror panel can make, bar these. */
const NOT_A_MIRROR_MOVE = [
  'Change',
  'MANAGED',
  'advanceMirrors',
  'applyCost',
  'applySeconds',
  'driftOf',
  'mirrorOf',
  'mirrorsOf',
  'overridable',
  'patternsFor',
  'previewApply',
  'refreshesOnPlan',
  'switchLeft',
  'toolOf',
] as const

const PLAYER_MIRRORS = seatMoves(Mirrors, NOT_A_MIRROR_MOVE)

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
   * move: the Room relays it to the other Seats and never stores it. An activity
   * keeps the pointer on the Board while its owner works in a panel.
   */
  Cursor: {
    x: Schema.Finite,
    y: Schema.Finite,
    region: Region,
    activity: Schema.optionalKey(SeatActivity),
  },
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
    /** The panel this Seat is in, so its pointer can say what it is doing. */
    activity: Schema.optionalKey(SeatActivity),
  },
  /** A Seat's pointer left the Board: stop drawing it. */
  CursorGone: { seat: Schema.String },
  Seats: {
    seats: Schema.Array(Seat),
    owner: Schema.String,
    speed: Schema.Finite,
    vote: Schema.NullOr(Vote),
  },
  /** A Seat took a place. The others hear it; the Seat itself gets `Welcome`. */
  Joined: { seat: Seat },
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
