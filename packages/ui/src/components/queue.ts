import { ListOrdered } from 'lucide'
import { compact, queueWait } from '../game/format.ts'
import { type ComponentView } from './shared.ts'

export const queue: ComponentView = {
  icon: ListOrdered,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  rows: ({ node, own, inbound, capacity, out }) => {
    return [
      inbound,
      {
        glyph: 'depth',
        name: 'Depth',
        // How long a new task waits behind the backlog: past 40 s, an upload's result is late.
        value: node.depth < 1 ? '0' : `${compact(Math.round(node.depth))} · ${queueWait(own.age)}`,
        tone:
          (own.age ?? 0) >= 40
            ? 'danger'
            : (own.age ?? 0) >= 10 || node.depth >= 100
              ? 'warn'
              : 'plain',
      },
      capacity,
      out,
    ]
  },
}
