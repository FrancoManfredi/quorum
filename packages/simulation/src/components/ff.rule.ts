import { type Action, notAllowed, ok, withNode } from '../action-kit.ts'
import type { FeatureId, Game } from '../state.ts'
import { ROLLOUT_STEPS } from '../catalog.ts'
import { isLive, step } from '../feature-machine.ts'
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
    const phase = game.features[feature]
    if (phase === undefined || !isLive(phase))
      return notAllowed('Ship the Feature before it has a rollout.')
    if (!(ROLLOUT_STEPS as ReadonlyArray<number>).includes(share))
      return notAllowed('A rollout is off, 5%, 25%, 50%, or every user.')
    return ok({
      ...game,
      features: { ...game.features, [feature]: step(phase, { _tag: 'RolloutChanged', share }) },
    })
  })
