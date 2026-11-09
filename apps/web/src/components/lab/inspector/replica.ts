import { copy, nodeTitle } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { SYNC_MS } from '@quorum/simulation/catalog'
import { databasesOf, has, primaryOf } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { button } from '@quorum/ui/primitives/button'
import { type Panel, caption, nodeLink, picker, replicaEngine, section } from './shared.ts'

/** A Read Replica copies the single primary, whether every write waits for it, and promotion (07 "Read Replica", "Failover"). */
const replica = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  // A Read Replica copies the Database linked into it (07 "Read Replica").
  const primary = primaryOf(game, node)
  const promotable = databasesOf(game).length === 1
  return [
    section(
      t.inspectorReplica.primary,
      primary
        ? [
            nodeLink(game, primary, h),
            caption(t.inspectorReplica.primaryNote(nodeTitle(t, game, primary)), h),
          ]
        : [caption(t.inspectorReplica.noSinglePrimary, h)],
      h,
    ),
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
        ...(promotable
          ? [
              caption(t.inspectorDatabase.promoteNote, h),
              button(
                {
                  onClick: Message.PromoteReplica({ nodeId: node.id }),
                  variant: 'outline',
                  size: 'sm',
                  className: 'self-start',
                  isDisabled: false,
                },
                [t.inspectorDatabase.promote],
                h,
              ),
            ]
          : []),
      ],
      h,
    ),
  ]
}

export const replicaPanel: Panel = {
  body: ({ game, node, h }) => [...replica(game, node, h)],
}
