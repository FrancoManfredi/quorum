import { Network } from 'lucide'
import { type ComponentView } from './shared.ts'

export const dsql: ComponentView = {
  icon: Network,
  layout: { rows: 3, inRow: 0, outRow: null, footer: true },
  spreads: true,
  rows: ({ inbound, capacity, latency }) => {
    return [inbound, capacity, latency]
  },
}
