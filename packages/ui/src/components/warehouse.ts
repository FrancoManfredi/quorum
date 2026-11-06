import { Warehouse } from 'lucide'
import { money } from '../game/format.ts'
import { SCAN_PRICE } from '@quorum/simulation/catalog'
import { eraOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const warehouse: ComponentView = {
  icon: Warehouse,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ inbound, game, own, latency }) => {
    return [
      { ...inbound, name: 'Scans' },
      latency,
      {
        glyph: 'cost',
        name: 'Cost',
        value: `${money((own.inbound - own.dropped) * SCAN_PRICE * eraOf(game).costIndex)}/s`,
      },
    ]
  },
}
