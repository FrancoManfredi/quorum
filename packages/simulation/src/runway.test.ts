import { Result, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import { describeRefusal, place, resize, sell, type Action } from './actions.ts'
import { CALENDAR_DAY } from './catalog.ts'
import { preseedGame } from './company.ts'
import save from './fixtures/save-v2-m3.json' with { type: 'json' }
import { hashGame } from './hash.ts'
import { burnOf } from './lookups.ts'
import { acceptBridge, BRIDGE_DILUTION } from './runway.ts'
import { solveFlow } from './solve.ts'
import { Game } from './state.ts'
import { step } from './step.ts'
import { hire } from './work.ts'

/* 09 "Runway and running out of Cash": what a short balance stops, the bridge
 * that turns up when it stays short, the shutdown that follows a declined
 * bridge, and the promise that the Company never ends. */

// No Stripe Billing, so revenue waits in the drawer and Cash moves with Burn alone.
const game = (change: Partial<Game> = {}): Game => ({
  ...preseedGame(1),
  researched: preseedGame(1).researched.filter((id) => id !== 'stripe'),
  ...change,
})

const said = (result: Action): string =>
  Result.isFailure(result) ? describeRefusal(result.failure) : ''

describe('what a short Cash balance stops', () => {
  test('placement, upgrades, and hires stop at zero, and selling keeps working', () => {
    const broke = game({ cash: 0 })
    expect(said(place(broke, 'server', 0, 0))).toContain('Out of Cash')
    expect(said(resize(broke, 'server', 1))).toContain('Out of Cash')
    expect(said(hire(broke))).toContain('Out of Cash')
    // What the design allows: cutting costs and letting Burn bill.
    expect(Result.isSuccess(sell(broke, 'analytics'))).toBe(true)
    expect(step(broke, 1).game.cash).toBeLessThan(broke.cash)
  })

  test('a full balance still buys, and a Sandbox never refuses', () => {
    expect(Result.isSuccess(place(game({ cash: 100_000 }), 'server', 0, 0))).toBe(true)
    const sandbox = { ...game({ cash: 0 }), sandbox: true }
    expect(Result.isSuccess(place(sandbox, 'server', 0, 0))).toBe(true)
  })
})

describe('the bridge offer', () => {
  test('arrives at one calendar day of Burn: three days of Burn for 8%', () => {
    const burn = solveFlow(game()).burn
    const near = game({ cash: -burn * CALENDAR_DAY + 0.001 })
    const after = step(near, 1).game
    expect(after.bridge).not.toBeNull()
    expect(after.bridge?.grant).toBeCloseTo(burn * CALENDAR_DAY * 3, 6)
    expect(after.bridge?.dilution).toBe(BRIDGE_DILUTION)
    expect(after.bridgeUsed).toBe(true)
    // Not before: one dollar above the line leaves no offer.
    expect(step(game({ cash: -burn * CALENDAR_DAY + burn + 1 }), 1).game.bridge).toBeNull()
  })

  test('accepting pays the grant, costs the dilution, and comes once per Company', () => {
    const burn = solveFlow(game()).burn
    const offered = step(game({ cash: -burn * CALENDAR_DAY + 0.001 }), 1).game
    const grant = offered.bridge?.grant ?? 0
    const took = acceptBridge(offered)
    expect(Result.isSuccess(took)).toBe(true)
    if (Result.isFailure(took)) return
    expect(took.success.cash).toBeCloseTo(offered.cash + grant, 6)
    expect(took.success.equity).toBeCloseTo(offered.equity * (1 - BRIDGE_DILUTION), 6)
    expect(took.success.bridge).toBeNull()
    // No second bridge, however far the balance falls.
    const again = step({ ...took.success, cash: -1e12 }, 1).game
    expect(again.bridge).toBeNull()
  })
})

describe('the shutdown that follows a declined bridge', () => {
  // A lean board: revenue does not cover the bill, so net Burn is positive.
  const lean = (): Game => game({ users: 10 })
  const pending = (days: number): Game => {
    const burn = solveFlow(lean()).burn
    return {
      ...lean(),
      cash: -burn * CALENDAR_DAY * days,
      bridge: { grant: 1, dilution: BRIDGE_DILUTION },
      bridgeUsed: true,
    }
  }

  test('waits for three calendar days of Burn', () => {
    const quiet = step(pending(2), 1).game
    expect(quiet.nodes.some((node) => node.shut)).toBe(false)
    expect(quiet.bridge).not.toBeNull()
  })

  test('shuts the dearest Nodes until net Burn is zero, then never fires again', () => {
    const at = pending(3)
    const before = solveFlow(at)
    let dearest: Game['nodes'][number] | null = null
    let cost = 0
    for (const node of at.nodes) {
      const burn = burnOf(at, node)
      if (burn > cost) {
        cost = burn
        dearest = node
      }
    }
    if (!dearest) throw new Error('the board bills nothing')
    const after = step(at, 1).game
    const shut = after.nodes.filter((node) => node.shut)
    expect(shut.length).toBeGreaterThan(0)
    expect(shut[0]?.id).toBe(dearest.id)
    expect(after.bridge).toBeNull()
    const flow = solveFlow(after)
    expect(flow.burn - flow.revenue).toBeLessThanOrEqual(0)
    expect(before.burn).toBeGreaterThan(0)
    // The rule runs once, and the Company goes on: no end, no exit, no reset.
    const more = step(after, 1).game
    expect(more.nodes.filter((node) => node.shut)).toHaveLength(shut.length)
    expect(more.nodes).toHaveLength(at.nodes.length)
    expect(more.cash).toBeLessThan(0)
    expect(more.time).toBeGreaterThan(after.time)
  })
})

describe('an old save', () => {
  test('opens with no bridge and no shut Node, and plays the same', () => {
    const decode = Schema.decodeUnknownSync(Game)
    const encode = Schema.encodeSync(Game)
    const old = decode(save)
    expect(old.bridge).toBeNull()
    expect(old.bridgeUsed).toBe(false)
    expect(old.nodes.every((node) => node.shut === false)).toBe(true)
    // Re-encoding writes the new fields, and the Company still plays the same.
    const again = decode(encode(old))
    expect(hashGame(again)).toBe(hashGame(old))
    expect(hashGame(step(old, 1).game)).toBe(hashGame(step(again, 1).game))
    expect(step(old, 1).game.bridge).toBeNull()
  })
})
