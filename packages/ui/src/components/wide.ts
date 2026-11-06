import { Columns3 } from 'lucide'
import { type ComponentView } from './shared.ts'

export const wide: ComponentView = {
  icon: Columns3,
  layout: { rows: 4, inRow: 0, outRow: null, footer: true },
  spreads: true,
  rows: ({ node, inbound, capacity, latency }) => {
    return [
      inbound,
      capacity,
      {
        glyph: 'policy',
        name: 'Quorum',
        value: `N${node.n} R${node.r} W${node.w}`,
        tone: node.r + node.w > node.n ? 'plain' : 'warn',
      },
      latency,
    ]
  },
}
