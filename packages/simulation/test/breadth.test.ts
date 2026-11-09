import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { connect, place, setTopology } from '../src/actions.ts'
import { COMPONENT_IDS, COMPONENTS, INCIDENT_IDS } from '../src/catalog.ts'
import { forceIncident } from '../src/director.ts'
import { hashGame } from '../src/hash.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import { Game } from '../src/state.ts'
import { step } from '../src/step.ts'

/*
 * The Simulation end to end, across the whole catalog. Every Component is built, every incident
 * is started, and the Company runs: nothing throws, nothing goes non-finite, the save survives a
 * round trip, and the same Game always ends in the same place. These tests assert no number.
 */

const roundTrip = (game: Game): Game => Schema.decodeSync(Game)(Schema.encodeSync(Game)(game))

const run = (game: Game, seconds: number): Game => {
  let current = game
  for (let elapsed = 0; elapsed < seconds; elapsed += 5) current = step(current, 5).game
  return current
}

/** The free Sandbox with every Component built and linked behind the App Server. */
const everything = (): Game => {
  let game = freeSandbox()
  COMPONENT_IDS.filter((id) => !COMPONENTS[id].fixed).forEach((type, index) => {
    // The free Sandbox already holds a Database, and a second one needs a topology first.
    if (type === 'database') {
      const picked = setTopology(game, 'database', 'sharded')
      if (Result.isFailure(picked)) throw new Error('topology could not be picked')
      game = picked.success
    }
    const placed = place(game, type, 100 + (index % 8) * 160, 500 + Math.floor(index / 8) * 120)
    if (Result.isFailure(placed)) throw new Error(`${type} could not be built`)
    game = placed.success
    const id = game.nodes.at(-1)!.id
    const linked = connect(game, 'server', id)
    if (Result.isSuccess(linked)) game = linked.success
  })
  return game
}

const finite = (game: Game) => {
  expect(Number.isFinite(game.cash)).toBe(true)
  expect(Number.isFinite(game.users)).toBe(true)
  expect(roundTrip(game)).toEqual(game)
}

describe('the whole catalog', { timeout: 120_000 }, () => {
  test('a Design with every Component runs for an hour, and its save round-trips', () => {
    const game = everything()
    expect(game.nodes.length).toBeGreaterThan(COMPONENT_IDS.length / 2)
    finite(run(game, 3_600))
  })

  test.each(INCIDENT_IDS)('the %s incident starts and plays out', (kind) => {
    const game = everything()
    const started = forceIncident(game, solveFlow(game), kind)
    // A kind that finds nothing to hit on this Design has nothing to play out.
    if (started === null) return
    expect(started.incident?.kind).toBe(kind)
    const over = run(started, 600)
    finite(over)
  })

  test('the same Game ends in the same place, and a save mid-run changes nothing', () => {
    const start = everything()
    const straight = run(start, 600)
    expect(hashGame(run(start, 600))).toBe(hashGame(straight))
    const resumed = run(roundTrip(run(start, 300)), 300)
    expect(hashGame(resumed)).toBe(hashGame(straight))
  })
})
