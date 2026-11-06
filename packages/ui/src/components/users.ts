import { Users } from 'lucide'
import { compact, rate } from '../game/format.ts'
import { eraOf } from '@quorum/simulation/lookups'
import { regionApdexOf, regionUsers, regional } from '@quorum/simulation/regions'
import { type ComponentView } from './shared.ts'

export const users: ComponentView = {
  icon: Users,
  layout: { rows: 3, inRow: null, outRow: 2, footer: false },
  rows: ({ game, node, ledger }) => {
    const target = eraOf(game).apdexTarget
    // From Series C each Users Node shows its own region's users (04 "Users and growth").
    const split = regional(game)
    const users = split ? regionUsers(game)[node.region] : game.users
    const apdex = split ? regionApdexOf(game, node.region) : game.apdex
    const sent = split
      ? Object.values(ledger.regionKinds[node.region] ?? {}).reduce(
          (sum, entry) => sum + (entry?.rate ?? 0),
          0,
        )
      : ledger.demand
    return [
      { glyph: 'users', name: 'Users', value: compact(users) },
      {
        glyph: 'apdex',
        name: 'Apdex',
        value: apdex.toFixed(2),
        tone: apdex >= target ? 'ok' : 'danger',
      },
      { glyph: 'requests', name: 'Requests', value: `${rate(sent)}/s` },
    ]
  },
}
