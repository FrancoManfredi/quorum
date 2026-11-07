import { Flag } from 'lucide'
import { money } from '../game/format.ts'
import { burnOf } from '@quorum/simulation/lookups'
import { badDeployShare, rolloutOf } from '@quorum/simulation/team'
import { pct, type ComponentView } from './shared.ts'

export const ff: ComponentView = {
  icon: Flag,
  layout: { rows: 3, inRow: null, outRow: null, footer: false },
  rows: ({ game, node }) => {
    const service = game.services[0]
    const batch = service?.lastDeploy ?? []
    const rolled = batch.filter((feature) => rolloutOf(game, feature) < 1)
    return [
      {
        glyph: 'policy',
        name: 'Flags',
        value: `${rolled.length} of ${batch.length}`,
        tone: rolled.length > 0 ? 'ok' : 'plain',
      },
      {
        glyph: 'apdex',
        name: 'Blast',
        value: `up to ${pct(badDeployShare(game))}`,
        tone: badDeployShare(game) <= 0.1 ? 'ok' : badDeployShare(game) >= 0.4 ? 'warn' : 'plain',
      },
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
    ]
  },
}
