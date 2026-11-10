import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
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
      { fixedMs: 20, variableMs: 2 },
      solver.boost(node),
    )
  },
  // An approximate index misses a true neighbour on its recall's shortfall: the search comes
  // back without the document it wanted, which is a stale result.
  outcome: (answer, node, kind) => {
    const miss = 1 - VEC_INDEXES[node.indexType].recall
    return { ...through(answer.ownHop(kind)), stale: kind === 'q-vector' ? miss : 0 }
  },
  ...terminal,
  probe: () => ({ 'q-vector': 1 }),
}

/** Picks a Vector Index's type (07 "Vector Index"): exact, or approximate HNSW. */
export const setVecIndex = (game: Game, id: string, indexType: GameNode['indexType']): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'vec') return notAllowed('Only a Vector Index has an index type.')
    if ((VEC_INDEXES as Record<string, unknown>)[indexType] === undefined)
      return notAllowed(`Index types are ${Object.keys(VEC_INDEXES).join(', ')}.`)
    return ok(node.indexType === indexType ? game : patch(game, id, { indexType }))
  })
