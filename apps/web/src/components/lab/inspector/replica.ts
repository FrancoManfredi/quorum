import type { Html, HtmlBuilder } from 'foldkit/html'
import { SYNC_MS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { type Panel, caption, engine, picker, section } from './shared.ts'

/** A Read Replica's engine, and whether every write waits for it (07 "Read Replica"). */
const replica = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  engine(node, h),
  section(
    'Replication',
    [
      picker(
        'sync',
        [
          [false, 'Asynchronous'],
          [true, 'Synchronous'],
        ],
        node.sync,
        (sync) => Message.SyncChosen({ nodeId: node.id, sync }),
        h,
        (sync) => !sync || has(game, 'sync-replication'),
      ),
      caption(
        node.sync
          ? `Every write waits ${SYNC_MS} ms for this replica, more across zones and regions. It serves no stale read, and writes stall while it is down.`
          : 'No write cost, and the replica lags: a read after a write can be stale.',
        h,
      ),
    ],
    h,
  ),
]

export const replicaPanel: Panel = {
  body: ({ game, node, h }) => [...replica(game, node, h)],
}
