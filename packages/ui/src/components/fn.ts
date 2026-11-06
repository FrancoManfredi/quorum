import { SquareFunction } from 'lucide'
import { money, ms } from '../game/format.ts'
import { RUNTIMES } from '@quorum/simulation/catalog'
import { coldStartMs, serverlessBurnOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const fn: ComponentView = {
  icon: SquareFunction,
  layout: { rows: 5, inRow: 0, outRow: 4, footer: true },
  // A function has no box: it pays for each use, and an environment that went away starts cold.
  rows: ({ game, node, own, inbound, capacity, out }) => {
    const runtime = RUNTIMES[node.runtime]
    return [
      inbound,
      capacity,
      {
        glyph: 'latency',
        name: 'Cold start',
        value: ms(coldStartMs(node)),
        tone: runtime.language === 'java' ? 'warn' : 'plain',
      },
      {
        glyph: 'cost',
        name: 'Uses',
        value: `${money(serverlessBurnOf(game, node, own.inbound - own.dropped, own.latency))}/s`,
      },
      out,
    ]
  },
}
