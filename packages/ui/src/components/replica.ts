import { DatabaseBackup } from 'lucide'
import { ms } from '../game/format.ts'
import { DB_ENGINES } from '@quorum/simulation/catalog'
import { engineOf } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const replica: ComponentView = {
  icon: DatabaseBackup,
  layout: { rows: 6, inRow: 0, outRow: null, footer: true },
  rows: ({ game, node, own, inbound, capacity, latency }) => {
    const pool = own.connections
    return [
      inbound,
      capacity,
      {
        glyph: 'stack',
        name: 'Engine',
        value: DB_ENGINES[engineOf(game, node)].name,
        tone: 'muted',
      },
      {
        glyph: 'connections',
        name: 'Connections',
        value: pool ? `${Math.round(pool.used)} / ${pool.max}` : '—',
        tone:
          pool && pool.used > pool.max
            ? 'danger'
            : pool && pool.used > pool.max * 0.8
              ? 'warn'
              : 'plain',
      },
      latency,
      ...(own.lagMs === null ? [] : [{ glyph: 'lag', name: 'Lag', value: ms(own.lagMs) } as const]),
    ]
  },
}
