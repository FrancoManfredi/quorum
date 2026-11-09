import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from '../src/actions.ts'
import { describeRefusal } from '../src/actions.ts'
import { forceIncident } from '../src/director.ts'
import { freeSandbox } from '../src/sandbox.ts'
import { solveFlow } from '../src/solve.ts'
import { step } from '../src/step.ts'
import type { Game, GameNode } from '../src/state.ts'

/*
 * The mitigations 11 "Mitigation toolbox" promises, played end to end: start the incident on a
 * Design that suffers it, press the action, and read what the board then shows.
 */

const ok = (action: Actions.Action): Game => {
  if (Result.isFailure(action)) throw new Error(describeRefusal(action.failure))
  return action.success
}

const refusal = (action: Actions.Action): string => {
  if (Result.isSuccess(action)) throw new Error('The action was allowed')
  return describeRefusal(action.failure)
}

const run = (game: Game, seconds: number, size = 1): Game => {
  let current = game
  for (let elapsed = 0; elapsed < seconds; elapsed += size) current = step(current, size).game
  return current
}

const errors = (game: Game): number => solveFlow(game).errorShare

const of = (game: Game, type: GameNode['type']): GameNode =>
  game.nodes.find((node) => node.type === type) as GameNode

const strike = (game: Game, kind: Parameters<typeof forceIncident>[2]): Game => {
  const started = forceIncident(game, solveFlow(game), kind)
  if (!started) throw new Error(`${kind} found nothing to hit`)
  return started
}

/** A Realtime Hub on Elixir, taking every realtime message the users send. */
const hubGame = (): Readonly<{ game: Game; hub: string }> => {
  let game: Game = { ...freeSandbox(), stage: 4, seed: 3 }
  game = ok(Actions.place(game, 'ws', 600, 100))
  const hub = game.nodes.at(-1)?.id as string
  game = ok(Actions.setRuntime(game, hub, 'beam'))
  game = Actions.disconnect(game, 'users', 'server')
  game = ok(Actions.connect(game, 'users', hub))
  return { game: run(game, 30, 5), hub }
}

const kept = (game: Game, id: string): GameNode =>
  game.nodes.find((node) => node.id === id) as GameNode
const realtime = (game: Game): number => solveFlow(game).kinds.rt?.success ?? 0

describe('Restart', () => {
  test('a restart rejoins the halves of a split Hub, and the Split brain ends', () => {
    const { game, hub } = hubGame()
    const split = strike(game, 'split-brain')
    expect(realtime(split)).toBeLessThan(0.75)
    const restarted = ok(Actions.restart(split, hub))
    expect(kept(restarted, hub).life._tag).toBe('Restarting')
    // The Hub comes back cold and its clients reconnect, so give it time to warm.
    const after = run(restarted, 120, 5)
    expect(after.incident).toBeNull()
    expect(realtime(after)).toBeGreaterThan(0.99)
  })

  test('a restart clears a PHP server running the old code', () => {
    const game = { ...freeSandbox(), seed: 3 }
    const stale = strike(game, 'stale-opcache')
    const server = of(stale, 'server')
    expect(errors(stale)).toBeGreaterThan(0.05)
    const after = run(ok(Actions.restart(stale, server.id)), 10)
    expect(after.incident).toBeNull()
    expect(errors(after)).toBeLessThan(0.01)
  })

  test('a restart ends a package that does not work on Bun', () => {
    let game: Game = { ...freeSandbox(), stage: 3, seed: 3 }
    game = ok(Actions.setRuntime(game, of(game, 'server').id, 'bun'))
    const broken = strike(run(game, 30, 5), 'bun-compat')
    const after = run(ok(Actions.restart(broken, of(broken, 'server').id)), 10)
    expect(after.incident).toBeNull()
  })

  test('a Database restarts too, and a Stopped Node is replaced instead', () => {
    const game = freeSandbox()
    const database = of(game, 'database')
    const restarted = ok(Actions.restart(game, database.id))
    expect(kept(restarted, database.id).life._tag).toBe('Restarting')
    expect(refusal(Actions.restart(restarted, database.id))).toBe('It is already restarting.')
    const dead = {
      ...game,
      nodes: game.nodes.map((node) =>
        node.id === database.id
          ? { ...node, life: { _tag: 'Stopped' as const, cause: 'failure' as const, warm: 1 } }
          : node,
      ),
    }
    expect(refusal(Actions.restart(dead, database.id))).toBe(
      'Database is down for good. Replace it.',
    )
    expect(kept(ok(Actions.replace(dead, database.id)), database.id).life._tag).toBe('Restarting')
    expect(refusal(Actions.restart(game, of(game, 'users').id))).toContain('no process of yours')
  })
})

describe('Fail over', () => {
  /** App Servers in two zones behind a Load Balancer, and a Database with a standby in zone a. */
  const zoneGame = (seed: number): Game => {
    let game: Game = { ...freeSandbox(), stage: 3, seed }
    const server = of(game, 'server')
    const database = of(game, 'database')
    game = ok(Actions.place(game, 'server', 440, 120))
    const second = game.nodes.at(-1)?.id as string
    game = ok(Actions.connect(game, second, database.id))
    game = ok(Actions.place(game, 'lb', 200, 280))
    const lb = game.nodes.at(-1)?.id as string
    game = Actions.disconnect(game, 'users', server.id)
    game = ok(Actions.connect(game, 'users', lb))
    game = ok(Actions.connect(game, lb, server.id))
    game = ok(Actions.connect(game, lb, second))
    game = ok(Actions.setZone(game, server.id, 'b'))
    game = ok(Actions.setZone(game, second, 'c'))
    game = ok(Actions.setZone(game, database.id, 'a'))
    game = ok(Actions.setStandby(game, database.id, true))
    return run(game, 30, 5)
  }

  test('promoting the standby keeps a Zone outage from failing requests', () => {
    for (let seed = 1; seed < 60; seed++) {
      const calm = zoneGame(seed)
      const started = forceIncident(calm, solveFlow(calm), 'zone')
      if (started?.incident?.zone !== 'a') continue
      const database = of(started, 'database')
      expect(errors(started)).toBeGreaterThan(0.9)
      // Left to itself the standby takes its 20 s.
      expect(errors(run(started, 5))).toBeGreaterThan(0.9)
      const promoted = run(ok(Actions.failOverZone(started)), 1)
      expect(errors(promoted)).toBeLessThanOrEqual(errors(calm) + 1e-6)
      expect(kept(promoted, database.id).standby).toBe(false)
      expect(kept(promoted, database.id).zone).not.toBe('a')
      return
    }
    throw new Error('No seed struck zone a')
  })

  test('a Node with no standby, or one that is serving, has nothing to promote', () => {
    const calm = zoneGame(2)
    expect(refusal(Actions.failOver(calm, of(calm, 'database').id))).toBe(
      'Database is serving: there is nothing to fail over.',
    )
    expect(refusal(Actions.failOver(calm, of(calm, 'server').id))).toContain('keeps no standby')
    expect(refusal(Actions.failOverZone(calm))).toBe('No zone is down.')
    const bare = { ...calm, researched: calm.researched.filter((id) => id !== 'multi-az') }
    expect(refusal(Actions.failOver(bare, of(bare, 'database').id))).toContain('needs')
  })

  /** An App Server in the home region over a store that lives in two regions. */
  const regionGame = (): Game => {
    let game: Game = { ...freeSandbox(), stage: 6, seed: 3 }
    const server = of(game, 'server')
    game = ok(Actions.openRegion(game, 'eu'))
    game = ok(Actions.place(game, 'wide', 760, 120))
    const wide = game.nodes.at(-1)?.id as string
    game = Actions.disconnect(game, server.id, of(game, 'database').id)
    game = ok(Actions.connect(game, server.id, wide))
    game = ok(Actions.setSpread(game, wide, true))
    return run(game, 30, 5)
  }

  test.each(['region', 'dr-drill'] as const)(
    'failing over a %s moves the stateless Nodes to the other region',
    (kind) => {
      const calm = regionGame()
      const server = of(calm, 'server')
      const down = kind === 'region' ? strike(calm, 'region') : ok(Actions.runDrill(calm))
      expect(down.incident?.region).toBe('na')
      expect(errors(down)).toBeGreaterThan(0.9)
      const moved = run(ok(Actions.failOverRegion(down)), 3)
      expect(kept(moved, server.id).region).toBe('eu')
      expect(errors(moved)).toBeLessThanOrEqual(errors(calm) + 1e-6)
    },
  )

  test('a region failover needs a region down and a second region open', () => {
    const calm = regionGame()
    expect(refusal(Actions.failOverRegion(calm))).toBe('No region is down.')
    const lone = freeSandbox()
    const down = strike({ ...lone, stage: 6, seed: 3 }, 'region')
    expect(refusal(Actions.failOverRegion(down))).toContain('second region')
  })
})

describe('Throttle connects', () => {
  test('a throttled Hub refuses no reconnecting client', () => {
    const { game, hub } = hubGame()
    const storm = strike(game, 'reconnect')
    expect(realtime(storm)).toBeLessThan(0.75)
    const throttled = ok(Actions.throttleConnects(storm, hub))
    expect(realtime(throttled)).toBeGreaterThan(0.99)
    expect(refusal(Actions.throttleConnects(throttled, hub))).toBe(
      'Its connects are already throttled.',
    )
  })

  test('it needs a reconnect wave on a Hub', () => {
    const { game, hub } = hubGame()
    expect(refusal(Actions.throttleConnects(game, hub))).toBe(
      'No reconnect wave is hitting this Hub.',
    )
    expect(refusal(Actions.throttleConnects(game, of(game, 'server').id))).toBe(
      'Only a Realtime Hub takes connects.',
    )
  })
})

describe('Move login', () => {
  /** Node and Go App Servers behind an L7 Load Balancer, which a heavy login hash blocks. */
  const loopGame = (go: boolean): Game => {
    let game: Game = { ...freeSandbox(), stage: 2, seed: 3 }
    const first = of(game, 'server')
    const database = of(game, 'database')
    game = ok(Actions.setRuntime(game, first.id, 'node'))
    game = ok(Actions.place(game, 'server', 440, 120))
    const second = game.nodes.at(-1)?.id as string
    game = ok(Actions.setRuntime(game, second, go ? 'go' : 'node'))
    game = ok(Actions.connect(game, second, database.id))
    game = ok(Actions.place(game, 'lb', 200, 280))
    const lb = game.nodes.at(-1)?.id as string
    game = Actions.disconnect(game, 'users', first.id)
    game = ok(Actions.connect(game, 'users', lb))
    game = ok(Actions.connect(game, lb, first.id))
    game = ok(Actions.connect(game, lb, second))
    return run(game, 30, 5)
  }

  test('login leaves the event loop for a Service without one, and the block ends', () => {
    const game = loopGame(true)
    const blocked = strike(game, 'loop')
    const node = game.nodes.find((entry) => entry.runtime === 'node') as GameNode
    expect(solveFlow(blocked).nodes[node.id]?.traffic.login).toBeGreaterThan(0)
    const moved = run(ok(Actions.moveKind(blocked)), 2)
    expect(solveFlow(moved).nodes[node.id]?.traffic.login ?? 0).toBe(0)
    expect(moved.incident).toBeNull()
  })

  test('it is refused when no Service can take login off a loop', () => {
    const blocked = strike(loopGame(false), 'loop')
    expect(refusal(Actions.moveKind(blocked))).toContain('No other Service')
    expect(refusal(Actions.moveKind(loopGame(true)))).toBe('No event loop is blocked.')
  })
})
