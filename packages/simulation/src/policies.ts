import { Result } from 'effect'
import { resize, study } from './actions.ts'
import { RECIPE, RESEARCH, RESEARCH_IDS, type InsightPool } from './catalog.ts'
import {
  AUTOPILOT_HIRES,
  AUTOPILOT_LOAD,
  AUTOPILOT_PAYROLL,
  POLICY_LEVEL,
} from './catalog/legacy.ts'
import { recipeOf } from './studies.ts'
import { perkLevel } from './founding.ts'
import type { Ledger } from './ledger.ts'
import { isDown } from './lookups.ts'
import type { Game, Policies } from './state.ts'
import { languageOfService, salaryOf, signingOf } from './team.ts'
import { hire } from './work.ts'

/* ==========================================================================
   The Autopilot perk's policies (13 "The Legacy shop"): rules the player sets
   once and the Company follows. Level 1 queues the cheapest Study, level 2
   hires while payroll stays a modest share of revenue, and level 3 buys the
   next size for an App Server that runs hot. Each runs only while its switch
   is on, and none spends Cash the Company needs to keep running.
   ========================================================================== */

/** Whether a policy runs: the perk has the level, and the switch is on. */
export const policyOn = (game: Game, policy: keyof Policies): boolean =>
  !game.sandbox && perkLevel(game, 'autopilot') >= POLICY_LEVEL[policy] && game.policies[policy]

/** Sim seconds of Burn a policy leaves in Cash before it spends. */
const RESERVE_SECONDS = 600
/** Sim seconds between upgrades, so a restart finishes before the next size. */
const UPGRADE_GAP = 60

const payable = (game: Game, ledger: Ledger, id: keyof typeof RESEARCH): boolean =>
  (Object.keys(RECIPE[id]) as Array<InsightPool>).every(
    (pool) => ledger.insight[pool] > 0 || game.pools[pool] >= (recipeOf(game, id)[pool] ?? 0),
  )

/** Applies the policies the player switched on, once a Step. */
export const applyPolicies = (game: Game, ledger: Ledger): Game => {
  if (game.sandbox || perkLevel(game, 'autopilot') === 0) return game
  let next = game
  if (policyOn(next, 'research') && next.studies.length === 0) {
    const cheapest = RESEARCH_IDS.filter(
      (id) => payable(next, ledger, id) && Result.isSuccess(study(next, id)),
    ).toSorted((a, b) => RESEARCH[a].cost - RESEARCH[b].cost)[0]
    if (cheapest) next = Result.getOrElse(study(next, cheapest), () => next)
  }
  if (policyOn(next, 'hire') && next.stage >= 1) {
    const language = languageOfService(next)
    const headcount = next.engineers.length + next.hires.length
    if (
      headcount < AUTOPILOT_HIRES &&
      salaryOf(next, language) * (headcount + 1) <= ledger.revenue * AUTOPILOT_PAYROLL &&
      next.cash - signingOf(next, language) >= ledger.burn * RESERVE_SECONDS
    )
      next = Result.getOrElse(hire(next), () => next)
  }
  if (policyOn(next, 'upgrade') && next.time >= next.policyAt) {
    const hot = next.nodes
      .filter(
        (node) =>
          node.type === 'server' &&
          !isDown(node) &&
          (ledger.nodes[node.id]?.utilization ?? 0) > AUTOPILOT_LOAD,
      )
      .toSorted(
        (a, b) => (ledger.nodes[b.id]?.utilization ?? 0) - (ledger.nodes[a.id]?.utilization ?? 0),
      )[0]
    if (hot) {
      const grown = resize(next, hot.id, 1)
      if (Result.isSuccess(grown) && grown.success.cash >= ledger.burn * RESERVE_SECONDS)
        next = { ...grown.success, policyAt: next.time + UPGRADE_GAP }
    }
  }
  return next
}
