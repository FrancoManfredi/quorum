import { leftOf, RUNNING } from './life.ts'
import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import {
  connect,
  decline,
  place,
  raise,
  resize,
  sell,
  setPricing,
  study,
  upgradeAll,
  type Action,
} from './actions.ts'
import { RESERVED_SECONDS, SIZES } from './catalog.ts'
import { newGame, node as makeNode, preseedGame } from './company.ts'
import { burnOf, refundOf, resizePrice, sizeName } from './lookups.ts'
import { solve } from './solve.ts'
import type { Game } from './state.ts'

const ok = (action: Action): Game => {
  if (Result.isFailure(action)) throw new Error(JSON.stringify(action.failure))
  return action.success
}

const refusal = (action: Action): string =>
  Result.isFailure(action) ? action.failure._tag : 'accepted'

describe('links', () => {
  test('Users cannot reach a Database directly', () => {
    const game = ok(place({ ...newGame(), cash: 1e6 }, 'database', 760, 280))
    expect(refusal(connect(game, 'users', game.nodes.at(-1)?.id ?? ''))).toBe('NotAllowed')
  })

  test('linking the first box to a Database moves Postgres off it', () => {
    let game = ok(place({ ...newGame(), cash: 1e6 }, 'database', 760, 280))
    game = ok(connect(game, 'server', game.nodes.at(-1)?.id ?? ''))
    expect(game.nodes.find((node) => node.id === 'server')?.localDb).toBe(false)
  })
})

describe('money and research', () => {
  test('a resize spends Cash and restarts the Node, or says what it costs', () => {
    expect(refusal(resize({ ...newGame(), cash: 10 }, 'server', 1))).toBe('Unaffordable')
    const game = ok(resize(newGame(), 'server', 1))
    const box = game.nodes.find((node) => node.id === 'server')
    expect(game.cash).toBe(newGame().cash - 240)
    expect(box?.size).toBe(2)
    expect(leftOf(box?.life ?? RUNNING)).toBeGreaterThan(0)
  })

  test('selling refunds half of what that copy cost to place', () => {
    let game = ok(place({ ...newGame(), cash: 1e6 }, 'database', 760, 280))
    game = ok(place(game, 'database', 760, 120))
    // The second Database cost 90 × 1.25; selling it refunds half of that.
    const sold = ok(sell(game, game.nodes.at(-1)?.id ?? ''))
    expect(sold.cash - game.cash).toBe(Math.round(Math.round(90 * 1.25) * 0.5))
  })

  test('Pre-seed research waits for Pre-seed', () => {
    expect(refusal(study({ ...newGame(), insight: 1e6 }, 'caching'))).toBe('TooEarly')
  })

  test('raising trades Equity for a grant; declining keeps both and slows growth', () => {
    const ready = { ...newGame(), users: 1_000 }
    const raised = ok(raise(ready))
    const declined = ok(decline(ready))
    expect(raised.stage).toBe(1)
    expect(raised.cash).toBe(ready.cash + 2_500)
    expect(raised.equity).toBeCloseTo(0.9)
    expect(declined.stage).toBe(1)
    expect(declined.cash).toBe(ready.cash)
    expect(declined.equity).toBe(1)
    expect(declined.declined).toBe(true)
  })
})

describe('sizes', () => {
  test('a Load Balancer resize doubles its capacity and its Burn', () => {
    let game = ok(place({ ...preseedGame(), cash: 1e6 }, 'lb', 280, 200))
    const lb = game.nodes.at(-1)?.id ?? ''
    game = ok(connect({ ...game, links: [] }, 'users', lb))
    const before = solve(game).nodes[lb]?.capacity ?? 0
    const burn = burnOf(game, game.nodes.at(-1) as Game['nodes'][number])
    const bigger = ok(resize(game, lb, 1))
    const node = bigger.nodes.find((entry) => entry.id === lb)
    expect(node?.size).toBe(2)
    expect(solve(bigger).nodes[lb]?.capacity).toBeCloseTo(before * 2)
    expect(burnOf(bigger, node as Game['nodes'][number])).toBeCloseTo(burn * 2)
  })

  test('a flat Component stops at its last size', () => {
    let game = ok(place({ ...preseedGame(), cash: 1e9 }, 'lb', 280, 200))
    const lb = game.nodes.at(-1)?.id ?? ''
    for (let size = 1; size < 6; size += 1) game = ok(resize(game, lb, 1))
    expect(refusal(resize(game, lb, 1))).toBe('NotAllowed')
  })

  test('an App Server grows to metal (96 vCPU) and no further', () => {
    let game: Game = { ...newGame(), cash: 1e9 }
    while (
      sizeName(game.nodes.find((node) => node.id === 'server') as Game['nodes'][number]) !== 'metal'
    )
      game = ok(resize(game, 'server', 1))
    expect(refusal(resize(game, 'server', 1))).toBe('NotAllowed')
  })
})

describe('upgrade all of a type', () => {
  /** Two App Servers beside the one the Garage start already has, all at size 1. */
  const threeServers = (): Game => {
    let game: Game = { ...newGame(), cash: 1e9 }
    game = ok(place(game, 'server', 440, 440))
    game = ok(place(game, 'server', 440, 620))
    return game
  }
  const servers = (game: Game): ReadonlyArray<Game['nodes'][number]> =>
    game.nodes.filter((node) => node.type === 'server')
  const outcome = (result: ReturnType<typeof upgradeAll>) => {
    if (Result.isFailure(result)) throw new Error(JSON.stringify(result.failure))
    return result.success
  }
  const refused = (result: ReturnType<typeof upgradeAll>): string =>
    Result.isFailure(result) ? result.failure._tag : 'accepted'

  test('it pays the same price as one click each, and every App Server grows one size', () => {
    const game = threeServers()
    const steps = servers(game).reduce((sum, node) => sum + (resizePrice(game, node) ?? 0), 0)
    const bought = outcome(upgradeAll(game, 'server'))
    expect(bought.upgraded).toBe(3)
    expect(bought.skipped).toBe(0)
    expect(bought.short).toBe(false)
    expect(game.cash - bought.game.cash).toBe(steps)
    for (const node of servers(bought.game)) expect(node.size).toBe(2)
  })

  test('it skips an App Server already at its largest size, and leaves it there', () => {
    const game = threeServers()
    const capped = servers(game)[1]?.id ?? ''
    const cap = (entry: Game) =>
      entry.nodes.find((node) => node.id === capped) as Game['nodes'][number]
    let grown = game
    while (resizePrice(grown, cap(grown)) !== null) grown = ok(resize(grown, capped, 1))
    const bought = outcome(upgradeAll(grown, 'server'))
    expect(bought.upgraded).toBe(2)
    expect(bought.skipped).toBe(1)
    expect(bought.short).toBe(false)
    expect(cap(bought.game).size).toBe(SIZES.length - 1)
    for (const node of servers(bought.game).filter((entry) => entry.id !== capped))
      expect(node.size).toBe(2)
  })

  test('it stops when Cash runs out, so no App Server is left half paid for', () => {
    const game = threeServers()
    const first = servers(game)[0] as Game['nodes'][number]
    const price = resizePrice(game, first) ?? 0
    const bought = outcome(upgradeAll({ ...game, cash: price }, 'server'))
    expect(bought.upgraded).toBe(1)
    expect(bought.skipped).toBe(0)
    expect(bought.short).toBe(true)
    expect(bought.game.cash).toBe(0)
    expect(servers(bought.game).map((node) => node.size)).toEqual([2, 1, 1])
  })

  test('it refuses with nothing bought: every server at the cap, or Cash short of one', () => {
    const game = threeServers()
    const poor = upgradeAll({ ...game, cash: 10 }, 'server')
    expect(refused(poor)).toBe('Unaffordable')
    expect(Result.isFailure(poor) ? poor.failure : null).toMatchObject({ what: 'An upgrade' })
    // Seven steps take size 1 to metal, the last size there is.
    let capped = game
    for (let step = 0; step < SIZES.length - 2; step += 1)
      capped = outcome(upgradeAll(capped, 'server')).game
    expect(servers(capped).map((node) => node.size)).toEqual([
      SIZES.length - 1,
      SIZES.length - 1,
      SIZES.length - 1,
    ])
    const done = upgradeAll(capped, 'server')
    expect(refused(done)).toBe('NotAllowed')
    expect(Result.isFailure(done) ? done.failure : null).toMatchObject({
      reason: 'Every App Server is at its largest size.',
    })
    expect(refused(upgradeAll(game, 'cache'))).toBe('Missing')
  })
})

describe('pricing models', () => {
  const seriesA = (): Game => ({
    ...preseedGame(7),
    stage: 3,
    // The two pricing models are Cost-track research (10 "Track: Cost").
    researched: [...preseedGame(7).researched, 'reserved-instances', 'spot-instances'],
  })
  const nodeOf = (game: Game, id: string): Game['nodes'][number] =>
    game.nodes.find((node) => node.id === id) as Game['nodes'][number]

  test('a pricing model waits for Series A, and only a sized compute Node has one', () => {
    expect(refusal(setPricing(preseedGame(7), 'server', 'spot'))).toBe('TooEarly')
    const game: Game = {
      ...seriesA(),
      nodes: [
        ...seriesA().nodes,
        makeNode('lb', 'lb', 280, 200),
        makeNode('queue', 'queue', 280, 400),
      ],
    }
    // A Database is sized but data; a Load Balancer is edge; a Queue has no instance type.
    expect(refusal(setPricing(game, 'database', 'reserved'))).toBe('NotAllowed')
    expect(refusal(setPricing(game, 'lb', 'reserved'))).toBe('NotAllowed')
    expect(refusal(setPricing(game, 'queue', 'reserved'))).toBe('NotAllowed')
    expect(refusal(setPricing(game, 'server', 'reserved'))).toBe('accepted')
  })

  test('each model waits for its research', () => {
    const game: Game = { ...preseedGame(7), stage: 3 }
    expect(refusal(setPricing(game, 'server', 'reserved'))).toBe('NotAllowed')
    expect(refusal(setPricing(game, 'server', 'spot'))).toBe('NotAllowed')
    const reserved = { ...game, researched: [...game.researched, 'reserved-instances' as const] }
    expect(refusal(setPricing(reserved, 'server', 'reserved'))).toBe('accepted')
    expect(refusal(setPricing(reserved, 'server', 'spot'))).toBe('NotAllowed')
  })

  test('reserved bills 0.6× and spot 0.3× of the box, before copies and standbys', () => {
    const game = seriesA()
    // Three copies: the discount is on the box price, so it scales with the copies too.
    const copied: Game = {
      ...game,
      nodes: game.nodes.map((node) => (node.id === 'server' ? { ...node, replicas: 3 } : node)),
    }
    const onDemand = burnOf(copied, nodeOf(copied, 'server'))
    const reserved = ok(setPricing(copied, 'server', 'reserved'))
    expect(burnOf(reserved, nodeOf(reserved, 'server'))).toBeCloseTo(onDemand * 0.6, 12)
    const spot = ok(setPricing(copied, 'server', 'spot'))
    expect(burnOf(spot, nodeOf(spot, 'server'))).toBeCloseTo(onDemand * 0.3, 12)
    // A reserved term runs out: the Node bills on-demand again until it reserves once more.
    const ended = { ...reserved, time: (nodeOf(reserved, 'server').pricingUntil ?? 0) + 1 }
    expect(burnOf(ended, nodeOf(ended, 'server'))).toBeCloseTo(onDemand, 12)
    expect(refusal(setPricing(reserved, 'server', 'spot'))).toBe('NotAllowed')
    expect(refusal(setPricing(ended, 'server', 'spot'))).toBe('accepted')
  })

  test('selling a reserved Node early charges the Burn its term still owes', () => {
    const game = { ...seriesA(), time: 600 }
    const box = nodeOf(game, 'server')
    // On-demand owes nothing beyond the sale: the refund, and the Burn stops.
    const plain = ok(sell(game, 'server'))
    expect(plain.cash).toBe(game.cash + refundOf(game, box))

    const reserved = ok(setPricing(game, 'server', 'reserved'))
    const term = nodeOf(reserved, 'server')
    expect(term.pricingUntil).toBe(game.time + RESERVED_SECONDS)
    const owed = burnOf(reserved, term) * RESERVED_SECONDS
    const sold = ok(sell(reserved, 'server'))
    expect(sold.cash).toBeCloseTo(reserved.cash + refundOf(reserved, term) - owed, 6)
  })
})
