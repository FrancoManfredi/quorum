import { Zap } from 'lucide'
import { CACHE_STRATEGIES } from '@quorum/simulation/catalog'
import { pct, type ComponentView } from './shared.ts'

export const cache: ComponentView = {
  icon: Zap,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: false },
  rows: ({ node, own, inbound, latency, out }) => {
    return [
      inbound,
      { glyph: 'hits', name: 'Hit ratio', value: pct(own.hitRatio ?? 0), bar: own.hitRatio ?? 0 },
      ...(node.cacheStrategy === 'aside'
        ? []
        : [
            {
              glyph: 'policy' as const,
              name: 'Strategy',
              value: CACHE_STRATEGIES[node.cacheStrategy].name,
            },
          ]),
      latency,
      out,
    ]
  },
}
