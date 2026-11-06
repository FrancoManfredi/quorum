import { BellRing } from 'lucide'
import { money } from '../game/format.ts'
import { MSGP_PRICE } from '@quorum/simulation/catalog'
import { eraOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const msgp: ComponentView = {
  icon: BellRing,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ inbound, game, own, capacity }) => {
    return [
      { ...inbound, name: 'Messages' },
      capacity,
      {
        glyph: 'cost',
        name: 'Cost',
        value: `${money((own.inbound - own.dropped) * MSGP_PRICE * eraOf(game).costIndex)}/s`,
      },
    ]
  },
}
