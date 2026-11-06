import { GitBranch } from 'lucide'
import { DEPLOY_STRATEGIES } from '@quorum/simulation/catalog'
import { deploysPerDay } from '@quorum/simulation/team'
import { pct, type ComponentView } from './shared.ts'

export const ci: ComponentView = {
  icon: GitBranch,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ game, node }) => {
    const strategy = DEPLOY_STRATEGIES[node.strategy]
    return [
      { glyph: 'policy', name: 'Strategy', value: strategy.name },
      { glyph: 'load', name: 'Deploys', value: `${deploysPerDay(game).toFixed(1)}/day` },
      {
        glyph: 'cost',
        name: 'Blast',
        value: pct(strategy.blast),
        tone: strategy.blast >= 1 ? 'danger' : strategy.blast <= 0.05 ? 'ok' : 'plain',
      },
    ]
  },
}
