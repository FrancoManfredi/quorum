import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { DeployStrategy, Game } from '../state.ts'
import { DEPLOY_STRATEGIES, DEPLOY_STRATEGY_IDS, RESEARCH, STRATEGY_RESEARCH } from '../catalog.ts'
import { failed } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { has } from '../lookups.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// The Pipeline ships deploys and carries no traffic: nothing routes into it.
export const ciRule: ComponentRule = {
  model: () => flatModel(Number.POSITIVE_INFINITY, {}, { fixed: 0, variable: 0 }, 1),
  outcome: () => failed('stranded'),
  ...terminal,
}

/** Sets how a CI/CD Pipeline ships: Recreate, Rolling, Blue-green or Canary (05 "CI/CD Pipeline"). */
export const setDeployStrategy = (game: Game, id: string, strategy: DeployStrategy): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'ci') return notAllowed('Only a CI/CD Pipeline ships deploys.')
    if (!(DEPLOY_STRATEGY_IDS as ReadonlyArray<string>).includes(strategy))
      return notAllowed(`Deploy strategies are ${DEPLOY_STRATEGY_IDS.join(', ')}.`)
    // Recreate and Rolling come with the Pipeline; Blue-green and Canary have their own research.
    const research = STRATEGY_RESEARCH[strategy]
    if (research && !has(game, research))
      return no(
        Refusal.Locked({
          what: DEPLOY_STRATEGIES[strategy].name,
          research: RESEARCH[research].name,
        }),
      )
    return ok(node.strategy === strategy ? game : patch(game, id, { strategy }))
  })
