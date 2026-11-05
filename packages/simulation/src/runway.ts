import { Result } from 'effect'
import { Refusal, type Action } from './actions.ts'
import { CALENDAR_DAY, COMPONENTS } from './catalog.ts'
import type { Ledger } from './ledger.ts'
import { stopped, warmOf } from './life.ts'
import { burnOf } from './lookups.ts'
import { solveFlow } from './solve.ts'
import type { Game, GameNode } from './state.ts'

/* ==========================================================================
   Runway (09 "Runway and running out of Cash"). Cash below zero stops spending;
   at one calendar day of Burn the investors offer a bridge; at three, if the
   bridge was left on the table, Nodes shut down most expensive first until the
   net Burn is zero. The Company never ends: running out of money is a setback,
   not a game over (01 "Pillar 5").
   ========================================================================== */

/** Calendar days of Burn at which the investors offer the bridge. */
export const BRIDGE_AT_DAYS = 1
/** Calendar days of Burn the bridge's grant covers. */
export const BRIDGE_DAYS = 3
/** Equity the bridge costs. */
export const BRIDGE_DILUTION = 0.08
/** Calendar days of Burn at which an unanswered bridge means Nodes shut down. */
export const SHUTDOWN_AT_DAYS = 3

/** Calendar days in the month a runway figure reads in (09 and 15 say 30 days). */
export const RUNWAY_MONTH = 30 * CALENDAR_DAY

/** Runway in sim seconds: Cash divided by net Burn, or null while revenue covers the bill. */
export const runwayOf = (game: Game, ledger: Ledger): number | null => {
  const net = ledger.burn - ledger.revenue
  return net > 0 ? Math.max(0, game.cash) / net : null
}

/** This Step's bridge offer's grant, in Cash. */
const bridgeGrantOf = (burn: number): number => burn * CALENDAR_DAY * BRIDGE_DAYS

/**
 * One Step's worth of the runway rule. The thresholds read the gross Burn, which
 * 09 calls Burn, and the shutdown reads the net Burn, which 09 calls net Burn.
 */
export const advanceRunway = (game: Game, ledger: Ledger): Game => {
  if (game.sandbox) return game
  const burn = ledger.burn
  if (burn <= 0) return game
  let next = game
  // At −1 calendar day of Burn the investors offer a bridge, once per Company.
  if (!next.bridge && !next.bridgeUsed && next.cash <= -burn * CALENDAR_DAY * BRIDGE_AT_DAYS) {
    next = {
      ...next,
      bridge: { grant: bridgeGrantOf(burn), dilution: BRIDGE_DILUTION },
      bridgeUsed: true,
    }
  }
  // Left unanswered, at −3 calendar days of Burn the Nodes shut down to stop the bleeding.
  if (next.bridge && next.cash <= -burn * CALENDAR_DAY * SHUTDOWN_AT_DAYS)
    return { ...shutdown(next), bridge: null }
  return next
}

/** Takes the bridge: the grant goes into Cash, and the dilution comes out of Equity. */
export const acceptBridge = (game: Game): Action => {
  const bridge = game.bridge
  if (!bridge) return Result.fail(Refusal.NotAllowed({ reason: 'No bridge is on the table.' }))
  return Result.succeed({
    ...game,
    cash: game.cash + bridge.grant,
    equity: game.equity * (1 - bridge.dilution),
    bridge: null,
  })
}

/** The Node that bills the most right now, among those that still bill. */
const dearest = (game: Game): GameNode | null => {
  let worst: GameNode | null = null
  let cost = 0
  for (const node of game.nodes) {
    if (node.shut || COMPONENTS[node.type].fixed) continue
    const burn = burnOf(game, node)
    if (burn > cost) {
      cost = burn
      worst = node
    }
  }
  return worst
}

const shutdownNode = (game: Game, node: GameNode): Game => ({
  ...game,
  nodes: game.nodes.map((entry) =>
    entry.id === node.id
      ? { ...entry, shut: true, life: stopped('failure', warmOf(entry.life)), downAt: game.time }
      : entry,
  ),
})

/** Shuts Nodes down, most expensive first, until net Burn is zero or nothing bills. */
const shutdown = (game: Game): Game => {
  let current = game
  for (;;) {
    const flow = solveFlow(current)
    if (flow.burn - flow.revenue <= 0) break
    const node = dearest(current)
    if (!node) break
    current = shutdownNode(current, node)
  }
  return current
}
