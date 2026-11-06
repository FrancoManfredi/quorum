import { CreditCard } from 'lucide'
import { money } from '../game/format.ts'
import { drawerSize, has } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const payments: ComponentView = {
  icon: CreditCard,
  layout: { rows: 2, inRow: null, outRow: null, footer: true },
  footer: (game) => {
    if (has(game, 'stripe'))
      return { glyph: 'auto', text: 'Collected automatically', enabled: false, tone: 'muted' }
    return game.pending >= 0.01
      ? { glyph: 'collect', text: `Collect  ${money(game.pending)}`, enabled: true, tone: 'ok' }
      : { glyph: 'empty', text: 'Drawer empty', enabled: false, tone: 'muted' }
  },
  rows: ({ game, ledger }) => {
    const size = drawerSize(game, ledger.revenue)
    return [
      { glyph: 'revenue', name: 'Revenue', value: `${money(ledger.revenue)}/s`, tone: 'ok' },
      {
        glyph: has(game, 'stripe') ? 'stripe' : 'drawer',
        name: has(game, 'stripe') ? 'Stripe' : 'Drawer',
        value: has(game, 'stripe') ? 'auto' : `${money(game.pending)} / ${money(size)}`,
        tone: game.pending >= size * 0.98 ? 'warn' : 'plain',
        bar: has(game, 'stripe') ? 0 : game.pending / size,
      },
    ]
  },
}
