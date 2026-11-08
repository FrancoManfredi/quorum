import { Result } from 'effect'
import { Refusal } from '@quorum/simulation/action-kit'
import * as Actions from '@quorum/simulation/actions'
import {
  applyIntents,
  ROOM_SAMPLES,
  ROOM_SEATS,
  votePasses,
  type Intent,
  type Seat,
  type Vote,
  type VoteKind,
} from '@quorum/simulation/room'
import { step } from '@quorum/simulation/step'
import type { Game, Sample } from '@quorum/simulation/state'

/* ==========================================================================
   A Room's state and the rules that move it. Nothing here knows Cloudflare:
   the Durable Object adapter owns storage, sockets, and alarms.
   ========================================================================== */

/** One Step, and the alarm that pays for it. */
export const STEP_SECONDS = 0.1
export const ALARM_MS = 500

/** The most Steps one wake may run, so a stalled Room catches up without spiralling. */
export const MAX_CATCH_UP = 600

/** How long an empty Room keeps the Company before the owner has to reclaim it. */
export const ROOM_IDLE_MS = 24 * 60 * 60 * 1000

/** A vote lapses after a minute of sim time. */
export const VOTE_SECONDS = 60

export type RoomState = Readonly<{
  name: string
  game: Game
  /** Dashboard samples, oldest first, at most `ROOM_SAMPLES`. */
  samples: ReadonlyArray<Sample>
  seats: ReadonlyArray<Seat>
  ownerSeat: string
  /** Claims the owner seat. It lives in the owner's Company file. */
  token: string
  speed: number
  revision: number
  vote: Vote | null
  voteSeq: number
  simVersion: string
  /** The session still accepts Seats and Intents. */
  open: boolean
  /** Set when the Seats voted to end the session. The owner still collects the Company. */
  ended: 'handover' | null
  startedAt: number
  /** Wall time the last Seat left, or null while one is connected. */
  idleAt: number | null
  /** Wall time of the last advance. */
  lastStepAt: number
  /** Sim milliseconds not yet stepped. */
  owe: number
}>

export type SeatFault = 'closed' | 'full' | 'stale' | 'missing' | 'not-owner' | 'vote-open'

export type Joining = Readonly<{ id: string; name: string; token?: string }>

const trim = (name: string): string => {
  const clean = name.trim().slice(0, 24)
  return clean.length > 0 ? clean : 'Guest'
}

/** The lowest palette index no Seat holds, so two Seats never share a colour. */
const colourFor = (seats: ReadonlyArray<Seat>): number => {
  const used = new Set(seats.map((seat) => seat.colour))
  for (let index = 0; index < ROOM_SEATS; index += 1) if (!used.has(index)) return index
  return seats.length % ROOM_SEATS
}

export const openRoom = (input: {
  name: string
  game: Game
  samples: ReadonlyArray<Sample>
  token: string
  simVersion: string
  wall: number
}): RoomState => ({
  name: input.name,
  game: { ...input.game, history: [] },
  samples: input.samples.slice(-ROOM_SAMPLES),
  seats: [],
  ownerSeat: '',
  token: input.token,
  speed: 1,
  revision: 1,
  vote: null,
  voteSeq: 1,
  simVersion: input.simVersion,
  open: true,
  ended: null,
  startedAt: input.wall,
  idleAt: input.wall,
  lastStepAt: input.wall,
  owe: 0,
})

/** Whether an empty Room has outlived the Company it holds. */
export const expired = (state: RoomState, now: number): boolean =>
  state.idleAt !== null && now - state.idleAt > ROOM_IDLE_MS

const sameSeat = (seat: Seat, id: string): boolean => seat.id === id

/** The Seats a vote counts: every Seat is connected while it holds one. */
export const connected = (state: RoomState): ReadonlyArray<string> =>
  state.seats.map((seat) => seat.id)

/**
 * Puts a player in the Room. A token that matches the Room's claims the owner
 * Seat, whatever id the browser sent, so a reload returns to the same Seat.
 */
export const join = (
  state: RoomState,
  entering: Joining,
  now: number,
): Result.Result<Readonly<{ state: RoomState; seat: Seat; newSeat: boolean }>, SeatFault> => {
  if (!state.open) return Result.fail('closed')
  if (expired(state, now)) return Result.fail('stale')

  const owner = entering.token !== undefined && entering.token === state.token
  if (owner) {
    const existing = state.seats.find((seat) => seat.owner)
    const seat: Seat = {
      id: existing?.id ?? (state.ownerSeat || entering.id),
      name: trim(entering.name),
      colour: existing?.colour ?? colourFor(state.seats),
      owner: true,
    }
    const seats = existing
      ? state.seats.map((entry) => (sameSeat(entry, seat.id) ? seat : entry))
      : [...state.seats, seat]
    return Result.succeed({
      state: { ...state, seats, ownerSeat: seat.id, idleAt: null },
      seat,
      newSeat: existing === undefined,
    })
  }

  const existing = state.seats.find((seat) => seat.id === entering.id && !seat.owner)
  if (existing) {
    const seat: Seat = { ...existing, name: trim(entering.name) }
    return Result.succeed({
      state: {
        ...state,
        seats: state.seats.map((entry) => (sameSeat(entry, seat.id) ? seat : entry)),
        idleAt: null,
      },
      seat,
      newSeat: false,
    })
  }
  if (state.seats.length >= ROOM_SEATS) return Result.fail('full')
  const seat: Seat = {
    id: entering.id,
    name: trim(entering.name),
    colour: colourFor(state.seats),
    owner: false,
  }
  return Result.succeed({
    state: { ...state, seats: [...state.seats, seat], idleAt: null },
    seat,
    newSeat: true,
  })
}

/** Takes a Seat out. A Seat that leaves drops its ballot. */
export const leave = (state: RoomState, id: string, now: number): RoomState => {
  const seats = state.seats.filter((seat) => !sameSeat(seat, id))
  if (seats.length === state.seats.length) return state
  const dropped = state.vote && {
    ...state.vote,
    yes: state.vote.yes.filter((entry) => entry !== id),
    no: state.vote.no.filter((entry) => entry !== id),
  }
  // A departure drops a ballot but never decides a vote on its own; the next
  // ballot or the lapse does that, so an action always has an actor.
  return {
    ...state,
    seats,
    vote: dropped,
    idleAt: seats.length === 0 ? now : null,
  }
}

/** Advances to now, in whole Steps, and moves the samples a Step produced out of the Game. */
export const advance = (
  state: RoomState,
  now: number,
  wall: number = now,
): Readonly<{ state: RoomState; steps: number }> => {
  if (!state.open || state.ended !== null) return { state, steps: 0 }
  const owed = state.owe + Math.max(0, now - state.lastStepAt) * state.speed
  const steps = Math.min(MAX_CATCH_UP, Math.floor(owed / (STEP_SECONDS * 1_000)))
  const base: RoomState = {
    ...state,
    lastStepAt: wall,
    owe: owed - steps * (STEP_SECONDS * 1_000),
  }
  if (steps === 0) return { state: base, steps: 0 }

  let game = state.game
  let samples = state.samples
  for (let index = 0; index < steps; index += 1) {
    const result = step(game, STEP_SECONDS)
    game = result.game
    if (game.history.length > 0) {
      samples = [...samples, ...game.history].slice(-ROOM_SAMPLES)
      game = { ...game, history: [] }
    }
  }
  const lapsed = base.vote !== null && game.time >= base.vote.closesAt ? null : base.vote
  return { state: { ...base, game, samples, vote: lapsed }, steps }
}

/** Applies a Seat's Intents in order. A refusal changes nothing. */
export const apply = (
  state: RoomState,
  intents: ReadonlyArray<Intent>,
): Result.Result<RoomState, Refusal> => {
  if (!state.open || state.ended !== null)
    return Result.fail(Refusal.NotAllowed({ reason: 'The session has ended.' }))
  return Result.match(applyIntents(state.game, intents), {
    onFailure: (refusal) => Result.fail(refusal),
    onSuccess: (game) =>
      Result.succeed({ ...state, game: { ...game, history: [] }, revision: state.revision + 1 }),
  })
}

/** Starts a vote. One vote is open at a time, and its starter votes yes. */
export const startVote = (
  state: RoomState,
  by: string,
  kind: VoteKind,
): Result.Result<RoomState, SeatFault> => {
  if (state.vote !== null) return Result.fail('vote-open')
  if (!state.seats.some((seat) => seat.id === by)) return Result.fail('missing')
  const vote: Vote = {
    id: state.voteSeq,
    kind,
    by,
    yes: [by],
    no: [],
    closesAt: state.game.time + VOTE_SECONDS,
  }
  return Result.succeed({ ...state, vote, voteSeq: state.voteSeq + 1 })
}

export type BallotOutcome = Readonly<{
  state: RoomState
  passed: VoteKind | null
}>

/**
 * Records a ballot. A vote passes when yes is more than half the connected
 * Seats. `fund` raises a round; `exit` ends the session and keeps the Company
 * for the owner, who takes the Exit offline.
 */
export const ballot = (state: RoomState, seat: string, yes: boolean): BallotOutcome => {
  const vote = state.vote
  if (vote === null) return { state, passed: null }
  if (!state.seats.some((entry) => entry.id === seat)) return { state, passed: null }
  if (state.game.time >= vote.closesAt) return { state: { ...state, vote: null }, passed: null }

  const next: Vote = {
    ...vote,
    yes: [...vote.yes.filter((id) => id !== seat), ...(yes ? [seat] : [])],
    no: [...vote.no.filter((id) => id !== seat), ...(yes ? [] : [seat])],
  }
  if (!votePasses(next, connected(state))) return { state: { ...state, vote: next }, passed: null }

  if (next.kind === 'exit')
    return {
      state: { ...state, vote: null, ended: 'handover', idleAt: null },
      passed: 'exit',
    }

  const raised = Actions.raise(state.game)
  if (Result.isFailure(raised)) return { state: { ...state, vote: null }, passed: null }
  return {
    state: {
      ...state,
      game: { ...raised.success, history: [] },
      revision: state.revision + 1,
      vote: null,
    },
    passed: 'fund',
  }
}

export const setSpeed = (state: RoomState, value: number): RoomState => ({
  ...state,
  speed: value,
})

export const kick = (state: RoomState, seat: string, now: number): RoomState =>
  state.seats.some((entry) => entry.id === seat && !entry.owner) ? leave(state, seat, now) : state

/** The owner's copy when the Company goes offline. */
export const finalOf = (
  state: RoomState,
): Readonly<{ game: Game; samples: ReadonlyArray<Sample> }> => ({
  game: { ...state.game, history: [...state.samples] },
  samples: state.samples,
})

/** What a Seat renders. `from` is how many samples the Seat already has. */
export const snapshotOf = (
  state: RoomState,
  from = 0,
): Readonly<{
  revision: number
  time: number
  game: Game
  samples: ReadonlyArray<Sample>
  seats: ReadonlyArray<Seat>
  owner: string
  speed: number
  vote: Vote | null
}> => ({
  revision: state.revision,
  time: state.game.time,
  game: state.game,
  samples: state.samples.slice(from),
  seats: state.seats,
  owner: state.ownerSeat,
  speed: state.speed,
  vote: state.vote,
})
