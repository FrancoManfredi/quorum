import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { DEPLOY_STRATEGIES, DEPLOY_STRATEGY_IDS } from '@quorum/simulation/catalog'
import { deploysPerDay } from '@quorum/simulation/team'
import { burnOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, percent, picker, section } from './shared.ts'

/** A CI/CD Pipeline's deploy strategy (05 "CI/CD Pipeline"): its blast radius and price. */
const pipeline = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const strategy = DEPLOY_STRATEGIES[node.strategy]
  return section(
    t.inspectorCi.deployStrategy,
    [
      picker(
        'deploy-strategy',
        DEPLOY_STRATEGY_IDS.map((id) => [id, t.catalog.deployStrategies[id].name] as const),
        node.strategy,
        (chosen) => Message.DeployStrategyChosen({ nodeId: node.id, strategy: chosen }),
        h,
      ),
      caption(
        t.inspectorCi.deploysInMinABadDeploy(strategy.deployMinutes, percent(strategy.blast)),
        h,
      ),
      caption(t.inspectorCi.deploysADayAtThisBuild(deploysPerDay(game).toFixed(1)), h),
    ],
    h,
  )
}

export const ciPanel: Panel = {
  stats: ({ game, node, h }) => {
    const t = copy(h)

    const strategy = DEPLOY_STRATEGIES[node.strategy]
    return [
      row(t.inspectorCi.deploys, t.inspectorCi.perDay(deploysPerDay(game).toFixed(1)), 'plain', h),
      row(t.inspectorCi.deployTime, t.inspectorCi.min(strategy.deployMinutes), 'plain', h),
      row(
        t.inspectorCi.blastRadius,
        t.inspectorCi.upTo(percent(strategy.blast)),
        strategy.blast >= 1 ? 'danger' : strategy.blast <= 0.05 ? 'ok' : 'plain',
        h,
      ),
      row(t.inspectorCi.burn, t.inspectorCi.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [pipeline(game, node, h)],
}
