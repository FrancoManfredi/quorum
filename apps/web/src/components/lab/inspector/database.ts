import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  BACKUPS,
  SHARD_COUNTS,
  STORAGE_IOPS,
  DB_RETENTIONS,
  RESHARD_DH,
  SHARD_KEYS,
  RESTORE_DRILL_DH,
} from '@quorum/simulation/catalog'
import { has, shardingOf } from '@quorum/simulation/lookups'
import type { Game, GameNode, IopsClass, ShardKey, DbRetention } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { button } from '@quorum/ui/primitives/button'
import { type Panel, caption, engine, picker, section } from './shared.ts'

/** What a shard key does to the load, in one line. */
const shardKeyNote = (node: GameNode): string => {
  const sharding = shardingOf(node)
  const hot = Math.round(sharding.hot * 100)
  const cross = Math.round(sharding.cross * 100)
  return `The busiest shard takes ${hot}% of the writes. ${cross}% of transactions span shards, so they cost up to 3× and can fail on any shard. Reports and searches touch every shard: +${Math.round((sharding.scatter - 1) * 100)}% CPU and +${sharding.scatterMs} ms.${sharding.farMs > 0 ? ` Users in other regions wait ${Math.round(sharding.farMs)} ms more.` : ''}`
}

/** A Database's engine, its volume, and its shards (07 "Variants", "Capacity", "Partitioning"). */
const database = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const volume = STORAGE_IOPS[node.iops]
  const iops = `${volume.iops / 1_000}k`
  const shards = Math.max(1, Math.floor(node.shards))
  return [
    engine(node, h),
    section(
      t.inspectorDatabase.volume,
      [
        picker(
          'volume',
          (Object.keys(STORAGE_IOPS) as ReadonlyArray<IopsClass>).map(
            (id) => [id, t.catalog.storageIops[id].name] as const,
          ),
          node.iops,
          (chosen) => Message.StorageIopsChosen({ nodeId: node.id, iops: chosen }),
          h,
          () => true,
          'grid-cols-2',
        ),
        caption(t.inspectorDatabase.iOPSAtTheBoxSBurn(iops, volume.burn), h),
      ],
      h,
    ),
    section(
      t.inspectorDatabase.shards,
      [
        picker(
          'shards',
          SHARD_COUNTS.map((count) => [count, `${count}`] as const),
          shards,
          (chosen) => Message.ShardsChosen({ nodeId: node.id, shards: chosen }),
          h,
          (count) => count === 1 || has(game, 'sharding'),
          'grid-cols-4',
        ),
        caption(
          shards > 1
            ? `Writes divide across ${shards} shards, and each one bills. Changing the count or the key takes ${RESHARD_DH} Dev Hours and a copy of the data that halves the volume's IOPS.`
            : t.inspectorDatabase.onePrimaryAReadReplicaIs,
          h,
        ),
      ],
      h,
    ),
    ...(shards > 1
      ? [
          section(
            t.inspectorDatabase.shardKey,
            [
              picker(
                'shard-key',
                (Object.keys(SHARD_KEYS) as ReadonlyArray<ShardKey>).map(
                  (id) => [id, t.catalog.shardKeys[id].name] as const,
                ),
                node.shardKey,
                (shardKey) => Message.ShardKeyChosen({ nodeId: node.id, shardKey }),
                h,
                () => true,
                'grid-cols-2',
              ),
              caption(shardKeyNote(node), h),
            ],
            h,
          ),
        ]
      : []),
    section(
      t.inspectorDatabase.reports,
      [
        picker(
          'materialized',
          [
            [false, t.inspectorDatabase.scanTheTable],
            [true, t.inspectorDatabase.materializedView],
          ],
          node.materialized,
          (materialized) => Message.MaterializedChosen({ nodeId: node.id, materialized }),
          h,
          (materialized) => !materialized || has(game, 'precompute'),
        ),
        caption(
          node.materialized
            ? t.inspectorDatabase.halfTheScanCPUAndThe
            : t.inspectorDatabase.everyReportScansTheTableItself,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorDatabase.retention,
      [
        picker(
          'retention-policy',
          (Object.keys(DB_RETENTIONS) as ReadonlyArray<DbRetention>).map(
            (id) => [id, t.catalog.dbRetentions[id].name] as const,
          ),
          node.keep,
          (keep) => Message.DbRetentionChosen({ nodeId: node.id, keep }),
          h,
          (id) => id === 'keep' || has(game, 'retention'),
          'grid-cols-3',
        ),
        caption(
          node.keep === 'archive'
            ? t.inspectorDatabase.oldRowsMoveToCheapStorage
            : node.keep === 'delete'
              ? t.inspectorDatabase.oldRowsAreGoneTheBill
              : t.inspectorDatabase.everyRowStaysOnTheFast,
          h,
        ),
      ],
      h,
    ),
  ]
}

const backups = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorDatabase.backups,
    [
      picker(
        'backup',
        (Object.keys(BACKUPS) as ReadonlyArray<keyof typeof BACKUPS>).map(
          (id) => [id, t.catalog.backups[id].name] as const,
        ),
        node.backup,
        (backup) => Message.BackupChosen({ nodeId: node.id, backup }),
        h,
      ),
      caption(
        node.backup === 'none'
          ? t.inspectorDatabase.noBackupALostTableIs
          : node.restore === 'failed'
            ? t.inspectorDatabase.aRestoreFailedThisBackupWould
            : t.inspectorDatabase.thisBackupRestoresDrillItAgain,
        h,
      ),
      ...(node.backup === 'none'
        ? []
        : [
            button(
              {
                onClick: Message.RestoreDrilled({ nodeId: node.id }),
                variant: 'outline',
                size: 'sm',
                className: 'self-start',
                isDisabled: game.devHours < RESTORE_DRILL_DH,
              },
              [t.inspectorDatabase.restoreDrillDH(RESTORE_DRILL_DH)],
              h,
            ),
          ]),
    ],
    h,
  )
}

export const databasePanel: Panel = {
  body: ({ game, node, h }) => [...database(game, node, h)],
  late: ({ game, node, h }) => (has(game, 'pitr') ? [backups(game, node, h)] : []),
}
