import { Radar } from 'lucide'
import { money } from '../game/format.ts'
import { VEC_INDEXES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import { pct, type ComponentView } from './shared.ts'

export const vec: ComponentView = {
  icon: Radar,
  layout: { rows: 4, inRow: 0, outRow: null, footer: true },
  rows: ({ inbound, game, node, capacity, latency }) => {
    const index = VEC_INDEXES[node.indexType]
    return [
      { ...inbound, name: 'Lookups' },
      capacity,
      {
        glyph: 'hits',
        name: 'Recall',
        value: pct(index.recall),
        tone: index.recall >= 1 ? 'ok' : 'warn',
      },
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
      latency,
    ]
  },
}
