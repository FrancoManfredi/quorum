import { Earth } from 'lucide'
import { pct, type ComponentView } from './shared.ts'

export const cdn: ComponentView = {
  icon: Earth,
  layout: { rows: 3, inRow: 0, outRow: 2, footer: false },
  rows: ({ own, inbound, out }) => {
    return [
      inbound,
      { glyph: 'hits', name: 'Hit ratio', value: pct(own.hitRatio ?? 0), bar: own.hitRatio ?? 0 },
      out,
    ]
  },
}
