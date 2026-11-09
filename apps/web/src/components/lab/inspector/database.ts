import { copy, type Messages } from '@/i18n/messages.ts'
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
import {
  dataGroupOf,
  databasesOfGroup,
  has,
  leaderOfGroup,
  primaryOf,
  replicasOfGroup,
  shardingOf,
} from '@quorum/simulation/lookups'
import type {
  Game,
  GameNode,
  IopsClass,
  ShardKey,
  DbRetention,
  DbTopology,
} from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { button } from '@quorum/ui/primitives/button'
import { type Panel, caption, engine, nodeLink, picker, section } from './shared.ts'

/** What a shard key does to the load, in one line. */
const shardKeyNote = (t: Messages, node: GameNode): string => {
  const sharding = shardingOf(node)
  const hot = Math.round(sharding.hot * 100)
  const cross = Math.round(sharding.cross * 100)
  const far =
    sharding.farMs > 0
      ? ` ${t.inspectorDatabase.usersInOtherRegionsWait(t.units.ms(Math.round(sharding.farMs)))}`
      : ''
  return `${t.inspectorDatabase.theBusiestShardTakes(
    hot,
    cross,
    Math.round((sharding.scatter - 1) * 100),
    t.units.ms(sharding.scatterMs),
  )}${far}`
}

/** A Database's topology, engine, volume, and its shards (07 "Topologies", "Variants", "Capacity"). */
const database = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const volume = STORAGE_IOPS[node.iops]
  const iops = `${volume.iops / 1_000}k`
  const shards = Math.max(1, Math.floor(node.shards))
  // A Data Group holds its rows one way, and one Database takes every write in it (07 "Data Groups").
  const group = dataGroupOf(game, node)
  const databases = databasesOfGroup(game, group)
  const leader = leaderOfGroup(game, group)
  const replicas = game.nodes.filter(
    (entry) => entry.type === 'replica' && primaryOf(game, entry)?.id === node.id,
  )
  const others = databases.filter((database) => database.id !== node.id)
  return [
    section(
      t.inspectorDatabase.topology,
      [
        picker(
          'topology',
          [
            ['single', t.inspectorDatabase.singlePrimary],
            ['sharded', t.inspectorDatabase.sharded],
            ['multi', t.inspectorDatabase.multiLeader],
          ] as ReadonlyArray<readonly [DbTopology, string]>,
          node.topology,
          (chosen) => Message.DbTopologyChosen({ nodeId: node.id, topology: chosen }),
          h,
          () => true,
          'grid-cols-3',
        ),
        caption(
          node.topology === 'sharded'
            ? t.inspectorDatabase.topologySharded
            : node.topology === 'multi'
              ? t.inspectorDatabase.topologyMulti
              : t.inspectorDatabase.topologySingle,
          h,
        ),
        ...(leader && leader.id === node.id && node.topology === 'single'
          ? [
              h.div(
                [h.Class('flex items-baseline justify-between gap-2')],
                [
                  h.span(
                    [
                      h.Class(
                        'text-[calc(12px*var(--type-scale))] font-medium text-muted-foreground',
                      ),
                    ],
                    [t.inspectorDatabase.leader],
                  ),
                  nodeLink(game, leader, h),
                ],
              ),
            ]
          : []),
        ...(others.length > 0
          ? [
              h.div(
                [h.Class('flex items-baseline justify-between gap-2')],
                [
                  h.span(
                    [
                      h.Class(
                        'text-[calc(12px*var(--type-scale))] font-medium text-muted-foreground',
                      ),
                    ],
                    [t.inspectorDatabase.dataGroup],
                  ),
                  h.div(
                    [h.Class('flex flex-wrap justify-end gap-x-2 gap-y-1')],
                    others.map((database) => nodeLink(game, database, h)),
                  ),
                ],
              ),
            ]
          : [caption(t.inspectorDatabase.secondDatabaseFollows, h)]),
      ],
      h,
    ),
    section(
      t.inspectorDatabase.readReplicas,
      replicas.length > 0
        ? replicas.map((replica) => nodeLink(game, replica, h))
        : [caption(t.inspectorDatabase.noReadReplicas, h)],
      h,
    ),
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
            ? t.inspectorDatabase.writesDivideAcross(shards, RESHARD_DH)
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
              caption(shardKeyNote(t, node), h),
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
