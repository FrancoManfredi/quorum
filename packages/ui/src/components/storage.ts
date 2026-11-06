import { HardDrive } from 'lucide'
import { compact, money } from '../game/format.ts'
import { STORAGE_CLASSES } from '@quorum/simulation/catalog'
import { burnOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const storage: ComponentView = {
  icon: HardDrive,
  layout: { rows: 4, inRow: 0, outRow: null, footer: false },
  rows: ({ game, node, inbound }) => {
    return [
      inbound,
      { glyph: 'stored', name: 'Stored', value: `${compact(game.stored)} GB` },
      {
        glyph: 'policy',
        name: 'Class',
        value: STORAGE_CLASSES[node.storageClass].name,
        tone: node.storageClass === 'archive' ? 'warn' : 'muted',
      },
      ...(node.lifecycle > 0
        ? [
            {
              glyph: 'policy' as const,
              name: 'Lifecycle',
              value: `${node.lifecycle} d`,
            },
          ]
        : []),
      { glyph: 'cost', name: 'Cost', value: `${money(burnOf(game, node))}/s` },
    ]
  },
}
