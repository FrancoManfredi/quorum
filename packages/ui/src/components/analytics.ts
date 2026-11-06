import { ChartLine } from 'lucide'
import { rate } from '../game/format.ts'
import { POOL_ORDER } from '../game/pools.ts'
import { POOLS } from '@quorum/simulation/catalog'
import { type ComponentView, type Row } from './shared.ts'

export const analytics: ComponentView = {
  icon: ChartLine,
  layout: { rows: 5, inRow: 0, outRow: null, footer: true },
  resize: (price) => ({ glyph: 'more', text: `Samples  ${price}`.trim() }),
  rows: ({ ledger, own }) => {
    const sampled = Math.min(own.inbound, own.capacity)
    return [
      { glyph: 'sampling', name: 'Sampling', value: `${rate(own.inbound)}/s` },
      {
        glyph: 'kept',
        name: 'Kept',
        value: `${rate(sampled)} / ${rate(own.capacity)}`,
        tone: own.inbound > own.capacity ? 'warn' : 'plain',
        bar: own.capacity > 0 ? Math.min(1, own.inbound / own.capacity) : 0,
      },
      // The three pools it earns most, each with its own icon.
      ...POOL_ORDER.filter((pool) => ledger.insight[pool] > 0)
        .toSorted((a, b) => ledger.insight[b] - ledger.insight[a])
        .slice(0, 3)
        .map((pool): Row => ({
          glyph: 'insight',
          pool,
          name: POOLS[pool].label,
          value: `+${ledger.insight[pool].toFixed(1)}/s`,
          tone: 'ok',
        })),
    ]
  },
}
