import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { ERAS } from '@quorum/simulation/catalog'
import { newGame } from '@quorum/simulation/company'
import { intent } from '@quorum/simulation/room'
import {
  advance,
  ALARM_MS,
  apply,
  ballot,
  finalOf,
  join,
  leave,
  MAX_CATCH_UP,
  openRoom,
  startVote,
  type RoomState,
} from './room.ts'

const game = newGame()
const node = game.nodes[0]!

const open = (): RoomState =>
  openRoom({
    name: 'Acme',
    game,
    samples: [],
    token: 'secret',
    simVersion: 'test',
    wall: 0,
  })

const withSeats = (): Readonly<{ state: RoomState; owner: string; guest: string }> => {
  const room = open()
  const owner = join(room, { id: 'tab-1', name: 'Owner', token: 'secret' }, 0)
  if (Result.isFailure(owner)) throw new Error('owner did not join')
  const guest = join(owner.success.state, { id: 'tab-2', name: 'Ada' }, 0)
  if (Result.isFailure(guest)) throw new Error('guest did not join')
  return { state: guest.success.state, owner: owner.success.seat.id, guest: guest.success.seat.id }
}

describe('seats', () => {
  test('the token claims the owner seat', () => {
    const room = open()
    const joined = join(room, { id: 'tab-1', name: 'Owner', token: 'secret' }, 0)
    expect(Result.isSuccess(joined)).toBe(true)
    if (Result.isSuccess(joined)) {
      expect(joined.success.seat.owner).toBe(true)
      expect(joined.success.state.ownerSeat).toBe('tab-1')
      expect(joined.success.state.idleAt).toBeNull()
    }
  })

  test('a guest takes a seat and a colour', () => {
    const { state, guest } = withSeats()
    const seat = state.seats.find((entry) => entry.id === guest)
    expect(seat?.owner).toBe(false)
    expect(new Set(state.seats.map((entry) => entry.colour)).size).toBe(2)
  })

  test('a seat the Room already holds is not new', () => {
    const { state } = withSeats()
    const late = join(state, { id: 'tab-3', name: 'Grace' }, 0)
    expect(late._tag).toBe('Success')
    if (late._tag !== 'Success') return
    expect(late.success.newSeat).toBe(true)

    const again = join(late.success.state, { id: 'tab-3', name: 'Grace Hopper' }, 0)
    expect(again._tag).toBe('Success')
    if (again._tag === 'Success') expect(again.success.newSeat).toBe(false)
  })

  test('a fifth seat is refused', () => {
    const { state } = withSeats()
    let room = state
    for (const id of ['g2', 'g3', 'g4']) {
      const joined = join(room, { id, name: id }, 0)
      if (Result.isSuccess(joined)) room = joined.success.state
      else expect(id).toBe('g4')
    }
    expect(Result.isFailure(join(room, { id: 'g5', name: 'Late' }, 0))).toBe(true)
  })

  test('a reload takes its seat back', () => {
    const { state, guest } = withSeats()
    const again = join(state, { id: guest, name: 'Ada Lovelace' }, 0)
    expect(again._tag).toBe('Success')
    if (again._tag === 'Success') {
      expect(again.success.newSeat).toBe(false)
      expect(again.success.state.seats.length).toBe(2)
      expect(again.success.state.seats.find((entry) => entry.id === guest)?.name).toBe(
        'Ada Lovelace',
      )
    }
  })

  test('leaving empties the Room and dates it', () => {
    const { state, owner, guest } = withSeats()
    const one = leave(state, guest, 10)
    expect(one.seats.length).toBe(1)
    expect(one.idleAt).toBeNull()
    const none = leave(one, owner, 20)
    expect(none.seats.length).toBe(0)
    expect(none.idleAt).toBe(20)
  })
})

describe('the clock', () => {
  test('a wall second is ten Steps', () => {
    const room = open()
    const { state, steps } = advance(room, 1_000)
    expect(steps).toBe(10)
    expect(state.game.time).toBeCloseTo(room.game.time + 1, 6)
  })

  test('a sim second adds one sample and leaves the Game lean', () => {
    const room = open()
    const { state } = advance(room, 4_000)
    expect(state.samples.length).toBeGreaterThan(0)
    expect(state.game.history).toEqual([])
  })

  test('a paused Room does not step', () => {
    const room = { ...open(), open: false }
    expect(advance(room, 10_000).steps).toBe(0)
  })

  // A wake that replays an hour of Steps is what spends a Durable Object's whole CPU
  // budget, so the debt one wake may run is one wake's work.
  test('an hour away runs one wake of Steps, not an hour', () => {
    const { state } = withSeats()
    const { state: next, steps } = advance(state, 60 * 60 * 1_000)
    expect(steps).toBe(MAX_CATCH_UP)
    expect(next.game.time - state.game.time).toBeCloseTo(MAX_CATCH_UP * 0.1, 6)
  })

  test('the Steps a wake drops do not come back on the next one', () => {
    const { state } = withSeats()
    const long = advance(state, 60 * 60 * 1_000)
    const next = advance(long.state, 60 * 60 * 1_000 + ALARM_MS)
    expect(next.steps).toBe(ALARM_MS / 100)
  })

  test('the time a Room spent empty is not owed', () => {
    const { state, owner, guest } = withSeats()
    const empty = leave(leave(state, guest, 10), owner, 20)
    expect(empty.owe).toBe(0)
    const back = join(empty, { id: 'tab-9', name: 'Back' }, 3_600_000)
    if (Result.isFailure(back)) throw new Error('seat did not join')
    const { steps } = advance(back.success.state, 3_600_000)
    expect(steps).toBe(0)
  })
})

describe('intents', () => {
  test('an accepted intent bumps the revision and keeps history out', () => {
    const room = open()
    const applied = apply(room, [intent('move', node.id, 4, 5)])
    expect(applied._tag).toBe('Success')
    if (applied._tag === 'Success') {
      expect(applied.success.revision).toBe(room.revision + 1)
      expect(applied.success.game.history).toEqual([])
    }
  })

  test('a refusal changes nothing', () => {
    const room = open()
    const applied = apply(room, [intent('sell', 'nope')])
    expect(applied._tag).toBe('Failure')
  })
})

describe('votes', () => {
  test('a vote passes when more than half the seats agree', () => {
    const { state, owner, guest } = withSeats()
    const started = startVote(state, owner, 'exit')
    expect(Result.isSuccess(started)).toBe(true)
    if (Result.isFailure(started)) return
    const one = ballot(started.success, guest, true)
    expect(one.passed).toBe('exit')
    expect(one.state.ended).toBe('handover')
  })

  test('a seat that leaves drops its ballot', () => {
    const { state, owner, guest } = withSeats()
    const started = startVote(state, owner, 'exit')
    if (Result.isFailure(started)) throw new Error('no vote')
    const voted = ballot(started.success, owner, true)
    expect(voted.state.vote?.yes).toContain(owner)
    const left = leave(voted.state, guest, 1)
    expect(left.vote?.yes).toContain(owner)
    const after = ballot(left, owner, true)
    expect(after.passed).toBe('exit')
  })

  test('a round is declined only when the vote to decline passes', () => {
    const { state, owner, guest } = withSeats()
    const offered: RoomState = {
      ...state,
      game: { ...game, users: ERAS[0]!.raiseAt, round: { _tag: 'Offered' } },
    }
    const started = startVote(offered, owner, 'decline')
    if (Result.isFailure(started)) throw new Error('no vote')
    // The starter's own yes is half of two Seats, so the round still waits.
    expect(started.success.game.round._tag).toBe('Offered')
    const passed = ballot(started.success, guest, true)
    expect(passed.passed).toBe('decline')
    expect(passed.state.game.round._tag).toBe('Declined')
    expect(passed.state.game.stage).toBe(1)
    expect(passed.state.game.cash).toBe(offered.game.cash)
    expect(passed.state.game.equity).toBe(offered.game.equity)
  })

  test('one vote is open at a time', () => {
    const { state, owner } = withSeats()
    const started = startVote(state, owner, 'exit')
    if (Result.isFailure(started)) throw new Error('no vote')
    expect(startVote(started.success, owner, 'fund')._tag).toBe('Failure')
  })
})

describe('the handover', () => {
  test('the owner gets the samples back inside the Game', () => {
    const room = open()
    const { state } = advance(room, 4_000)
    const final = finalOf(state)
    expect(final.game.history).toEqual([...state.samples])
  })

  test('the owner can take a Company back after the vote', () => {
    const { state, owner, guest } = withSeats()
    const started = startVote(state, owner, 'exit')
    if (Result.isFailure(started)) throw new Error('no vote')
    const passed = ballot(started.success, guest, true)
    expect(passed.passed).toBe('exit')
    if (passed.state.ended === null) throw new Error('not ended')
    expect(Result.isSuccess(apply(passed.state, [intent('move', node.id, 1, 1)]))).toBe(false)
    expect(finalOf(passed.state).game.history.length).toBe(passed.state.samples.length)
  })
})
