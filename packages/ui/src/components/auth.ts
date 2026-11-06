import { KeyRound } from 'lucide'
import { money, rate } from '../game/format.ts'
import { burnOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const auth: ComponentView = {
  icon: KeyRound,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ game, node, own, latency }) => {
    return [
      { glyph: 'logins', name: 'Logins', value: `${rate(own.inbound)}/s` },
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
      latency,
    ]
  },
}
