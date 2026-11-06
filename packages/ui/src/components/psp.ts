import { Landmark } from 'lucide'
import { money } from '../game/format.ts'
import { type ComponentView } from './shared.ts'

export const psp: ComponentView = {
  icon: Landmark,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  rows: ({ inbound, ledger, latency }) => {
    return [
      { ...inbound, name: 'Checkouts' },
      latency,
      { glyph: 'cost', name: 'Fees', value: `${money(ledger.fees)}/s` },
    ]
  },
}
