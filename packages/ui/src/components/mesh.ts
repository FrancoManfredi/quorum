import { Waypoints } from 'lucide'
import { money } from '../game/format.ts'
import { MESH_HOP_MS } from '@quorum/simulation/catalog'
import { burnOf, meshMembers } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const mesh: ComponentView = {
  icon: Waypoints,
  layout: { rows: 3, inRow: 0, outRow: null, footer: false },
  // It carries nothing: it puts a sidecar beside every member and watches its Links.
  rows: ({ game, node }) => {
    const members = meshMembers(game, node)
    return [
      {
        glyph: 'copies',
        name: 'Sidecars',
        value: `${members.length}`,
        tone: members.length === 0 ? 'warn' : 'plain',
      },
      { glyph: 'latency', name: 'Per hop', value: `+${MESH_HOP_MS} ms` },
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
    ]
  },
}
