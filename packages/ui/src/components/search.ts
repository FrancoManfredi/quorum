import { Search } from 'lucide'
import { type ComponentView } from './shared.ts'

export const search: ComponentView = {
  icon: Search,
  layout: { rows: 3, inRow: 0, outRow: null, footer: true },
  rows: ({ node, inbound, capacity, latency }) => {
    return [
      inbound,
      capacity,
      { glyph: 'policy', name: 'Refresh', value: `${node.refresh} s` },
      latency,
    ]
  },
}
