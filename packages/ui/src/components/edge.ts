import { Cloud } from 'lucide'
import { money } from '../game/format.ts'
import { EDGE_CPU_MS } from '@quorum/simulation/catalog'
import { edgeBurnOf, hasEdge } from '@quorum/simulation/lookups'
import { edgeRuns } from '@quorum/simulation/rules'
import { type ComponentView } from './shared.ts'

export const edge: ComponentView = {
  icon: Cloud,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  // It answers at the edge with no box either, and it is CPU it runs out of, not capacity.
  rows: ({ game, node, own, inbound }) => {
    return [
      inbound,
      {
        glyph: 'latency',
        name: 'CPU ceiling',
        value: `${EDGE_CPU_MS} ms`,
        tone: edgeRuns(node) ? 'plain' : 'danger',
      },
      {
        glyph: 'hits',
        name: 'Cache',
        value: hasEdge(game) ? 'read 30%' : 'off',
        tone: 'muted',
      },
      {
        glyph: 'cost',
        name: 'Uses',
        value: `${money(edgeBurnOf(game, node, own.inbound - own.dropped))}/s`,
      },
    ]
  },
}
