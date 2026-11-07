import { Scaling } from 'lucide'
import { bootingOf } from '@quorum/simulation/lookups'
import { membersOf, pct, type ComponentView } from './shared.ts'

export const autoscaler: ComponentView = {
  icon: Scaling,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ game, node }) => {
    const members = membersOf(game, node)
    const copies = members.reduce((total, member) => total + member.replicas, 0)
    const pending = members.reduce((total, member) => total + bootingOf(member), 0)
    return [
      {
        glyph: 'copies',
        name: 'Copies',
        value: members.length === 0 ? '—' : pending > 0 ? `${copies} +${pending}` : `${copies}`,
        tone: members.length === 0 ? 'muted' : pending > 0 ? 'warn' : 'plain',
      },
      {
        glyph: 'load',
        name: 'Target',
        value: `${node.signal === 'cpu' ? 'CPU' : 'load'} ${pct(node.target)}`,
      },
      {
        glyph: 'policy',
        name: 'Range',
        value: `${node.minCopies}–${node.maxCopies > 0 ? node.maxCopies : '∞'}`,
      },
    ]
  },
}
