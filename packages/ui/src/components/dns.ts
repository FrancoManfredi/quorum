import { Globe } from 'lucide'
import { type ComponentView } from './shared.ts'

export const dns: ComponentView = {
  icon: Globe,
  layout: { rows: 3, inRow: 0, outRow: 2, footer: false },
  rows: ({ inbound, out }) => {
    return [inbound, { glyph: 'policy', name: 'Policy', value: 'round robin' }, out]
  },
}
