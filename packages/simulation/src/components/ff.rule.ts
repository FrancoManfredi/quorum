import { type Action, notAllowed, ok, withNode } from '../action-kit.ts'
import type { FeatureId, Game } from '../state.ts'
import { ROLLOUT_ALL, ROLLOUT_STEPS } from '../catalog.ts'
import { serviceOf, withService } from '../team.ts'
import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// Feature Flags carry nothing either: what they change is how far a bad deploy reaches, which
// `badDeployShare` reads from the Design (05 "Feature Flags", 08 "Rollout").
export const ffRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}

/**
 * Sets a Feature's rollout from its flag (05 "Feature Flags", 08 "Rollout"). One of the design's
 * steps and nothing between them: 5%, 25%, 50%, every user, or off.
 */
export const setRollout = (
  game: Game,
  id: string,
  feature: typeof FeatureId.Type,
  share: number,
): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'ff') return notAllowed('Only Feature Flags roll a Feature out.')
    if (!game.shipped.includes(feature))
      return notAllowed('Ship the Feature before it has a rollout.')
    if (!(ROLLOUT_STEPS as ReadonlyArray<number>).includes(share))
      return notAllowed('A rollout is off, 5%, 25%, 50%, or every user.')
    const rollouts = { ...serviceOf(game).rollouts }
    if (share >= ROLLOUT_ALL) delete rollouts[feature]
    else rollouts[feature] = share
    return ok(withService(game, { rollouts }))
  })
