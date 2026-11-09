import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from '../src/actions.ts'
import { newGame, preseedGame } from '../src/company.ts'
import {
  applyIntent,
  applyIntents,
  intent,
  mirrorIntent,
  planOf,
  RefusalWire,
  RoomSnapshot,
  ServerMessage,
  votePasses,
  workIntent,
  type Vote,
} from '../src/room.ts'
import { ERAS } from '../src/catalog.ts'
import { Game } from '../src/state.ts'

const game = newGame()
const node = game.nodes[0]!

describe('plans', () => {
  test('a board action is named with its namespace and arguments', () => {
    expect(planOf('move', [node.id, 45, 60])).toEqual({
      ns: 'actions',
      name: 'move',
      args: [node.id, 45, 60],
    })
    expect(planOf('hire', ['platform'])).toEqual({ ns: 'work', name: 'hire', args: ['platform'] })
  })

  test('an action only a vote may take has no plan', () => {
    expect(planOf('raise', [])).toBeNull()
    expect(planOf('decline', [])).toBeNull()
    expect(planOf('acknowledge', [])).toBeNull()
  })

  test('every board control a Seat can use has a plan', () => {
    expect(planOf('setPolicy', ['lb', 'round-robin'])).toEqual({
      ns: 'actions',
      name: 'setPolicy',
      args: ['lb', 'round-robin'],
    })
    expect(planOf('upgradeAll', ['server', 'na'])).toEqual({
      ns: 'actions',
      name: 'upgradeAll',
      args: ['server', 'na'],
    })
    expect(planOf('acceptBridge', [])).toEqual({ ns: 'actions', name: 'acceptBridge', args: [] })
    expect(planOf('queueSpike', [])).toEqual({ ns: 'work', name: 'queueSpike', args: [] })
  })

  test('a move the blacklist does not name is a Seat’s to make', () => {
    // These were never added by hand, so the modules' exports are the source.
    expect(planOf('setRetention', ['analytics', 30])).not.toBeNull()
    expect(planOf('setRuntime', ['server', 'node'])).not.toBeNull()
    expect(planOf('setFramework', ['server', 'next'])).not.toBeNull()
    // Reads and helpers stay out.
    expect(planOf('canRaise', [])).toBeNull()
    expect(planOf('itemName', ['x'])).toBeNull()
    expect(planOf('driftOf', [])).toBeNull()
  })

  test('an argument that cannot cross the wire has no plan', () => {
    expect(planOf('move', [node.id, () => 1])).toBeNull()
    expect(planOf('move', [node.id, Number.NaN, 2])).toBeNull()
  })
})

describe('intents', () => {
  test('an action intent runs the same action the board runs', () => {
    const applied = applyIntent(game, intent('move', node.id, 45, 60))
    const direct = Actions.move(game, node.id, 45, 60)
    expect(Result.isSuccess(applied)).toBe(true)
    if (Result.isSuccess(applied)) expect(applied.success).toEqual(direct)
  })

  test('an action that returns a Game is accepted', () => {
    const applied = applyIntent(game, intent('move', node.id, 12, 34))
    expect(Result.isSuccess(applied)).toBe(true)
    if (Result.isSuccess(applied))
      expect(applied.success.nodes.find((entry) => entry.id === node.id)?.x).toBe(12)
  })

  test('the same refusal the board gives comes back', () => {
    const applied = applyIntent(game, intent('sell', 'nope'))
    expect(Result.isFailure(applied)).toBe(true)
    if (Result.isFailure(applied)) expect(applied.failure._tag).toBe('Missing')
  })

  test('a name outside the registry is refused', () => {
    const applied = applyIntent(game, { ns: 'actions', name: 'raise', args: [] })
    expect(Result.isFailure(applied)).toBe(true)
  })

  test('a Seat cannot decline a round on its own', () => {
    const offered = { ...game, users: ERAS[0]!.raiseAt, round: { _tag: 'Offered' } as const }
    const applied = applyIntent(offered, { ns: 'actions', name: 'decline', args: [] })
    expect(Result.isFailure(applied)).toBe(true)
  })

  test('a Load Balancer policy change runs in the Room', () => {
    const placed = Actions.place(preseedGame(), 'lb', 120, 120)
    expect(Result.isSuccess(placed)).toBe(true)
    if (Result.isFailure(placed)) return
    const lb = placed.success.nodes.find((entry) => entry.type === 'lb')
    if (!lb) throw new Error('no Load Balancer')
    const applied = applyIntent(placed.success, intent('setPolicy', lb.id, 'round-robin'))
    expect(Result.isSuccess(applied)).toBe(true)
    if (Result.isSuccess(applied))
      expect(applied.success.nodes.find((entry) => entry.id === lb.id)?.policy).toBe('round-robin')
  })

  test('a batch stops at the first refusal', () => {
    const applied = applyIntents(game, [
      intent('move', node.id, 1, 1),
      intent('sell', 'nope'),
      intent('move', node.id, 2, 2),
    ])
    expect(Result.isFailure(applied)).toBe(true)
  })

  test('the work and mirror tables are separate', () => {
    expect(Result.isFailure(applyIntent(game, workIntent('removeTeam', 'nope')))).toBe(true)
    expect(Result.isFailure(applyIntent(game, mirrorIntent('refreshMirror', 'eu')))).toBe(true)
    // A name from one table is not a name in another.
    expect(Result.isFailure(applyIntent(game, { ns: 'work', name: 'move', args: [] }))).toBe(true)
  })

  test('a malformed result never leaves the Room', () => {
    const broken = { ...game, users: Number.NaN }
    expect(Schema.is(Game)(broken)).toBe(false)
  })
})

describe('votes', () => {
  const vote = (yes: ReadonlyArray<string>): Vote => ({
    id: 1,
    kind: 'fund',
    by: 'a',
    yes: [...yes],
    no: [],
    closesAt: 60,
  })

  test('more than half of the connected seats passes', () => {
    expect(votePasses(vote(['a']), ['a'])).toBe(true)
    expect(votePasses(vote(['a']), ['a', 'b'])).toBe(false)
    expect(votePasses(vote(['a', 'b']), ['a', 'b', 'c'])).toBe(true)
    expect(votePasses(vote(['a', 'b']), ['a', 'b', 'c', 'd'])).toBe(false)
  })

  test('a seat that left does not count', () => {
    expect(votePasses(vote(['a']), ['b'])).toBe(false)
  })
})

describe('the wire', () => {
  test('a snapshot round-trips', () => {
    const snapshot = {
      revision: 3,
      time: 12.5,
      game: { ...game, history: [] },
      samples: [],
      seats: [{ id: 'a', name: 'Ada', colour: 0, owner: true }],
      owner: 'a',
      speed: 1,
      vote: null,
    }
    const encoded = Schema.encodeSync(RoomSnapshot)(snapshot)
    const decoded = Schema.decodeUnknownSync(RoomSnapshot)(JSON.parse(JSON.stringify(encoded)))
    expect(decoded).toEqual(snapshot)
  })

  test('every server message has a tag', () => {
    const encoded = Schema.encodeSync(ServerMessage)({ _tag: 'Ended', reason: 'offline' })
    expect(encoded).toEqual({ _tag: 'Ended', reason: 'offline' })
  })

  test('a join notice carries the Seat that arrived', () => {
    const seat = { id: 'b', name: 'Ada', colour: 1, owner: false }
    const encoded = Schema.encodeSync(ServerMessage)({ _tag: 'Joined', seat })
    expect(encoded).toEqual({ _tag: 'Joined', seat })
  })

  test('a refusal crosses as a tag and its fields', () => {
    const encoded = Schema.encodeSync(RefusalWire)({ _tag: 'NotAllowed', reason: 'Nope.' })
    expect(encoded).toEqual({ _tag: 'NotAllowed', reason: 'Nope.' })
  })
})
