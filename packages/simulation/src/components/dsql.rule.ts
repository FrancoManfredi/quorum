import type { Game, GameNode } from '../state.ts'
import { DSQL_READ_COST, DSQL_TX, SPREAD_REGIONS, rttOf } from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { spreadRegions } from '../regions.ts'
import { through } from '../distribution.ts'
import { type ComponentRule, splitWork, terminal } from '../rule-kit.ts'

/**
 * Ms a consensus write waits for its majority: the ⌈n/2⌉-th smallest round trip
 * from the leader's region, itself counting as 0 (07 "Distributed SQL").
 */
const majorityMs = (game: Game, node: GameNode): number => {
  const regions = spreadRegions(game, node, SPREAD_REGIONS)
  const trips = regions.map((region) => rttOf(node.region, region)).toSorted((a, b) => a - b)
  const majority = Math.floor(trips.length / 2) + 1
  return trips[majority - 1] ?? 0
}

// Consensus: a write waits for a majority of its regions; a read asks the leaseholder.
export const dsqlRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const { reads, writes } = splitWork(arriving)
    const rate = reads + writes
    const work = reads * DSQL_READ_COST + writes
    const capacity = (DSQL_TX * flatScale(node)) / (work > 0 ? work / rate : 1)
    const model = flatModel(capacity, arriving, { fixedMs: 3, variableMs: 1 }, solver.boost(node))
    const majority = majorityMs(solver.game, node)
    const service: Record<string, { fixedMs: number; variableMs: number }> = {}
    for (const kind of Object.keys(arriving)) {
      const base = model.service[kind] ?? { fixedMs: 3, variableMs: 1 }
      service[kind] = kind === 'q-read' ? base : { ...base, fixedMs: base.fixedMs + majority }
    }
    return { ...model, service }
  },
  outcome: (answer, _, kind) => through(answer.ownHop(kind)),
  ...terminal,
  probe: () => ({ 'q-tx': 1 }),
}
