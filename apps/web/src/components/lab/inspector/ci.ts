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
  const strategy = DEPLOY_STRATEGIES[node.strategy]
  return section(
    'Deploy strategy',
    [
      picker(
        'deploy-strategy',
        DEPLOY_STRATEGY_IDS.map((id) => [id, DEPLOY_STRATEGIES[id].name] as const),
        node.strategy,
        (chosen) => Message.DeployStrategyChosen({ nodeId: node.id, strategy: chosen }),
        h,
      ),
      caption(
        `Deploys in ${strategy.deployMinutes} min; a bad deploy breaks up to ${percent(strategy.blast)} of requests.`,
        h,
      ),
      caption(`${deploysPerDay(game).toFixed(1)} deploys a day at this build and strategy.`, h),
    ],
    h,
  )
}

export const ciPanel: Panel = {
  stats: ({ game, node, h }) => {
    const strategy = DEPLOY_STRATEGIES[node.strategy]
    return [
      row('Deploys', `${deploysPerDay(game).toFixed(1)}/day`, 'plain', h),
      row('Deploy time', `${strategy.deployMinutes} min`, 'plain', h),
      row(
        'Blast radius',
        `up to ${percent(strategy.blast)}`,
        strategy.blast >= 1 ? 'danger' : strategy.blast <= 0.05 ? 'ok' : 'plain',
        h,
      ),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [pipeline(game, node, h)],
}
