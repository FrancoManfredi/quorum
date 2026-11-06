import { Split } from 'lucide'
import { LB_POLICIES } from '@quorum/simulation/catalog'
import { type ComponentView } from './shared.ts'

export const lb: ComponentView = {
  icon: Split,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: false },
  rows: ({ node, inbound, capacity, out }) => {
    return [
      inbound,
      capacity,
      { glyph: 'policy', name: 'Policy', value: LB_POLICIES[node.policy].label },
      out,
    ]
  },
}
