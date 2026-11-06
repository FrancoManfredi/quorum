import { VEC_INDEXES, VEC_QUERIES } from '../catalog.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { through } from '../distribution.ts'
import { type ComponentRule, hotKeyFactor, terminal } from '../rule-kit.ts'

// Nearest-neighbour lookups over the company's embeddings (07 "Vector Index"): the index lives
// in memory, so its type decides how many lookups it answers and how many it gets right.
export const vecRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const index = VEC_INDEXES[node.indexType]
    return flatModel(
      (VEC_QUERIES * flatScale(node) * index.queries) / hotKeyFactor(solver.game, node),
      arriving,
      { fixed: 20, variable: 2 },
      solver.boost(node),
    )
  },
  // An approximate index misses a true neighbour on its recall's shortfall: the search comes
  // back without the document it wanted, which is a stale result.
  outcome: (answer, node, kind) => {
    const miss = 1 - VEC_INDEXES[node.indexType].recall
    return { ...through(answer.ownHop(kind)), stale: kind === 'q-search' ? miss : 0 }
  },
  ...terminal,
  probe: () => ({ 'q-search': 1 }),
}
