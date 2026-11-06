import { Route } from 'lucide'
import { rate } from '../game/format.ts'
import { type ComponentView } from './shared.ts'

export const gw: ComponentView = {
  icon: Route,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: false },
  rows: ({ node, own, inbound, capacity, out }) => {
    return [
      inbound,
      capacity,
      {
        glyph: 'policy',
        name: 'Rate limit',
        value: node.rateLimit > 0 ? `${rate(node.rateLimit)}/s` : 'Off',
        tone: node.rateLimit > 0 && own.inbound > node.rateLimit ? 'warn' : 'plain',
      },
      out,
    ]
  },
}
