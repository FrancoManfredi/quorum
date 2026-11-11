import { Combine } from 'lucide'
import type { GameNode } from '@quorum/simulation/state'
import { type ComponentView } from './shared.ts'

/** A Connection Pooler's mode, as its card names it. */
export const POOLER_MODES: Readonly<Record<GameNode['mode'], string>> = {
  session: 'Session',
  transaction: 'Transaction',
  statement: 'Statement',
}

export const pooler: ComponentView = {
  icon: Combine,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  rows: ({ node, inbound, capacity, latency, out }) => {
    return [
      inbound,
      capacity,
      { glyph: 'policy', name: 'Pooling', value: POOLER_MODES[node.mode] },
      latency,
      out,
    ]
  },
}
