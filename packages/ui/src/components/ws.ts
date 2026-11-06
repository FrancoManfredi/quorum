import { RadioTower } from 'lucide'
import { compact, rate } from '../game/format.ts'
import { RT_HOLD_SECONDS, RUNTIMES } from '@quorum/simulation/catalog'
import { distributedErlang, hubConnections } from '@quorum/simulation/rules'
import { type ComponentView } from './shared.ts'

export const ws: ComponentView = {
  icon: RadioTower,
  layout: { rows: 4, inRow: 0, outRow: null, footer: true },
  rows: ({ game, node, own, latency }) => {
    // A Hub's capacity is connections, not requests: a message holds one for the hold time.
    const runtime = RUNTIMES[node.runtime]
    // Distributed Erlang gives a BEAM Hub the cluster backbone itself (06 "Elixir").
    const builtIn = distributedErlang(game, node)
    const max = hubConnections(node, builtIn)
    const held = own.inbound * RT_HOLD_SECONDS
    return [
      {
        glyph: 'connections',
        name: 'Connections',
        value: `${compact(Math.round(held))} / ${compact(Math.round(max))}`,
        tone: max <= 0 || held >= max * 0.9 ? 'danger' : held >= max * 0.7 ? 'warn' : 'plain',
        bar: max > 0 ? Math.min(1, held / max) : 1,
      },
      { glyph: 'load', name: 'Messages', value: `${rate(own.inbound)}/s` },
      {
        glyph: 'stack',
        logo: runtime.language,
        name: runtime.name,
        value: node.clustering || builtIn ? 'Clustered' : 'One box',
      },
      latency,
    ]
  },
}
