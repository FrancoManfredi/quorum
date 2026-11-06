import { Boxes } from 'lucide'
import { money } from '../game/format.ts'
import { burnOf } from '@quorum/simulation/lookups'
import { quartersBehind } from '@quorum/simulation/team'
import { membersOf, type ComponentView } from './shared.ts'

export const cluster: ComponentView = {
  icon: Boxes,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ game, node }) => {
    const members = membersOf(game, node)
    const behind = quartersBehind(game, node)
    const upgrading = game.incident?.kind === 'cluster-upgrade' && game.incident.nodeId === node.id
    return [
      { glyph: 'copies', name: 'Members', value: `${members.length}` },
      {
        glyph: 'cost',
        name: 'Burn',
        value: `${money(members.reduce((total, member) => total + burnOf(game, member), 0))}/s`,
      },
      {
        glyph: 'version',
        name: 'Version',
        value: upgrading ? 'upgrading' : behind > 0 ? 'unsupported' : 'supported',
        tone: upgrading ? 'danger' : behind > 0 ? 'warn' : 'plain',
      },
    ]
  },
}
