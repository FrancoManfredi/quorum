import { Rows3 } from 'lucide'
import { compact } from '../game/format.ts'
import { type ComponentView } from './shared.ts'

export const log: ComponentView = {
  icon: Rows3,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  // A log, not a queue: its depth is how far its consumers are behind, and it keeps it.
  rows: ({ node, inbound, capacity, out }) => {
    return [
      inbound,
      {
        glyph: 'depth',
        name: 'Lag',
        // Past its retention window the oldest events expire, and the work they carried is gone.
        value: node.depth < 1 ? '0' : compact(Math.round(node.depth)),
        tone: node.depth > 0 ? 'warn' : 'plain',
      },
      capacity,
      out,
    ]
  },
}
