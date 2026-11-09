import { Database } from 'lucide'
import { DB_ENGINES, DB_RETENTIONS, STORAGE_IOPS } from '@quorum/simulation/catalog'
import { type ComponentView } from './shared.ts'

export const database: ComponentView = {
  icon: Database,
  layout: { rows: 6, inRow: 0, outRow: 5, footer: true },
  rows: ({ node, own, inbound, capacity, latency }) => {
    const pool = own.connections
    const engine = DB_ENGINES[node.dbEngine]
    // Sharding (07 "Partitioning"): writes divide across the shards, and each is a copy.
    const shards = Math.max(1, Math.floor(node.shards))
    const topology =
      node.topology === 'sharded'
        ? 'Sharded'
        : node.topology === 'multi'
          ? 'Multi-leader'
          : 'Single'
    return [
      inbound,
      capacity,
      {
        glyph: 'stack',
        name: 'Engine',
        value: `${engine.name} · ${topology}${shards > 1 ? ` · ${shards} shards` : ''}`,
        tone: node.topology === 'single' && shards === 1 ? 'muted' : 'plain',
      },
      {
        glyph: 'stored',
        name: 'Volume',
        value: STORAGE_IOPS[node.iops].name,
        tone: node.iops === 'provisioned' ? 'plain' : 'muted',
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
      ...(node.keep === 'keep'
        ? []
        : [
            {
              glyph: 'stored' as const,
              name: 'Retention',
              value: DB_RETENTIONS[node.keep].name,
            },
          ]),
      ...(node.backup === 'none'
        ? []
        : [
            {
              glyph: 'policy' as const,
              name: 'Restore',
              value: node.restore === 'failed' ? 'failed' : 'drilled',
              tone: node.restore === 'failed' ? ('danger' as const) : ('muted' as const),
            },
          ]),
      latency,
    ]
  },
}
