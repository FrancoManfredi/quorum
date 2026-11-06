import { Microchip } from 'lucide'
import { money } from '../game/format.ts'
import { GPU_TYPES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const gpu: ComponentView = {
  icon: Microchip,
  layout: { rows: 4, inRow: 0, outRow: null, footer: true },
  rows: ({ inbound, game, node, capacity }) => {
    return [
      { ...inbound, name: 'Prompts' },
      capacity,
      { glyph: 'stack', name: 'GPU', value: GPU_TYPES[node.gpu].name },
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
    ]
  },
}
