import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { SYNC_MS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, replicaEngine, section } from './shared.ts'

/** A Read Replica runs the primary's engine, and whether every write waits for it (07 "Read Replica"). */
const replica = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    replicaEngine(game, node, h),
    section(
      t.inspectorReplica.replication,
      [
        picker(
          'sync',
          [
            [false, t.inspectorReplica.asynchronous],
            [true, t.inspectorReplica.synchronous],
          ],
          node.sync,
          (sync) => Message.SyncChosen({ nodeId: node.id, sync }),
          h,
          (sync) => !sync || has(game, 'sync-replication'),
        ),
        caption(
          node.sync
            ? t.inspectorReplica.everyWriteWaits(t.units.ms(SYNC_MS))
            : t.inspectorReplica.noWriteCostAndTheReplica,
          h,
        ),
      ],
      h,
    ),
  ]
}

export const replicaPanel: Panel = {
  body: ({ game, node, h }) => [...replica(game, node, h)],
}
