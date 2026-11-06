import { Shield } from 'lucide'
import { type ComponentView } from './shared.ts'

export const waf: ComponentView = {
  icon: Shield,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  rows: ({ node, inbound, capacity, out }) => {
    return [
      inbound,
      capacity,
      {
        glyph: 'blocked',
        name: 'Paranoia',
        value: node.underAttack ? 'under attack' : `level ${node.paranoia}`,
        tone: node.underAttack ? 'warn' : 'plain',
      },
      out,
    ]
  },
}
