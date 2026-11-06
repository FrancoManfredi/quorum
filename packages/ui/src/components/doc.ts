import { Files } from 'lucide'
import { type ComponentView } from './shared.ts'

export const doc: ComponentView = {
  icon: Files,
  layout: { rows: 4, inRow: 0, outRow: null, footer: true },
  rows: ({ node, inbound, capacity, latency }) => {
    return [
      inbound,
      capacity,
      {
        glyph: 'policy',
        name: 'Access',
        value: node.transactions ? 'Multi-document' : 'One document',
        // No joins: a checkout that spreads over documents lands half-applied without them.
        tone: node.transactions ? 'plain' : 'warn',
      },
      latency,
    ]
  },
}
