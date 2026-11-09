import { Database } from 'lucide'
import { DB_ENGINES, DB_RETENTIONS, STORAGE_IOPS } from '@quorum/simulation/catalog'
import { dataGroupOf, leaderOfGroup, topologyOfGroup } from '@quorum/simulation/lookups'
import { type ComponentView } from './shared.ts'

export const database: ComponentView = {
  icon: Database,
  layout: { rows: 6, inRow: 0, outRow: 5, footer: true },
  rows: ({ game, node, own, inbound, capacity, latency }) => {
    const pool = own.connections
    const engine = DB_ENGINES[node.dbEngine]
    // Sharding (07 "Partitioning"): writes divide across the shards, and each is a copy.
    const shards = Math.max(1, Math.floor(node.shards))
    // A Data Group holds its rows one way (07 "Data Groups"), and only a Single primary has one
    // Database that takes every write.
    const topology = topologyOfGroup(game, dataGroupOf(game, node))
    const label =
      topology === 'sharded' ? 'Sharded' : topology === 'multi' ? 'Multi-leader' : 'Single'
    const leader = leaderOfGroup(game, dataGroupOf(game, node))
    const primary = leader?.id === node.id
    return [
      inbound,
      capacity,
      {
        glyph: 'stack',
        name: 'Engine',
        value: `${engine.name} · ${primary ? 'Primary' : label}${shards > 1 ? ` · ${shards} shards` : ''}`,
        tone: primary ? 'plain' : topology === 'single' && shards === 1 ? 'muted' : 'plain',
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
