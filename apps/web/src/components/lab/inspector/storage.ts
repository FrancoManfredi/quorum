import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  STORAGE_CLASSES,
  R2_FIRST_BYTE_MS,
  STORE_VARIANTS,
  LIFECYCLE_DAYS,
} from '@quorum/simulation/catalog'
import { has, agedShareOf } from '@quorum/simulation/lookups'
import type { Game, GameNode, StorageClass, StoreVariant } from '@quorum/simulation/state'

import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** Object Storage's class and lifecycle (07 "Object Storage"): price against retrieval. */
const storage = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    section(
      t.inspectorStorage.product,
      [
        picker(
          'store-variant',
          (Object.keys(STORE_VARIANTS) as ReadonlyArray<StoreVariant>).map(
            (id) => [id, STORE_VARIANTS[id].name] as const,
          ),
          node.storeVariant,
          (storeVariant) => Message.StoreVariantChosen({ nodeId: node.id, storeVariant }),
          h,
          (id) => id === 's3' || has(game, 'egress-optimization'),
        ),
        caption(
          node.storeVariant === 'r2'
            ? `No egress to the internet. A read waits ${R2_FIRST_BYTE_MS} ms more for its first byte unless a CDN is on the board.`
            : t.inspectorStorage.egressToTheInternetBillsPer,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorStorage.storageClass,
      [
        picker(
          'storage-class',
          (Object.keys(STORAGE_CLASSES) as ReadonlyArray<StorageClass>).map(
            (id) => [id, t.catalog.storageClasses[id].name] as const,
          ),
          node.storageClass,
          (storageClass) => Message.StorageClassChosen({ nodeId: node.id, storageClass }),
          h,
          () => true,
          'grid-cols-3',
        ),
        caption(
          STORAGE_CLASSES[node.storageClass].archived
            ? t.inspectorStorage.cheapestToKeepMediaReadsFail
            : STORAGE_CLASSES[node.storageClass].retrieval > 0
              ? t.inspectorStorage.halfTheStoragePriceAndPer(
                  STORAGE_CLASSES[node.storageClass].retrieval,
                )
              : t.inspectorStorage.fullStoragePriceReadsComeBack,
          h,
        ),
      ],
      h,
    ),
    section(
      t.inspectorStorage.lifecycle,
      [
        picker(
          'lifecycle',
          LIFECYCLE_DAYS.map(
            (days) =>
              [days, days === 0 ? t.inspectorStorage.off : t.inspectorStorage.d(days)] as const,
          ),
          node.lifecycle,
          (lifecycle) => Message.LifecycleChosen({ nodeId: node.id, lifecycle }),
          h,
          (days) => days === 0 || has(game, 'lifecycle-rules'),
        ),
        caption(
          node.lifecycle > 0
            ? t.inspectorStorage.ofTheStoreIsOlderThan(
                Math.round(agedShareOf(game, node.lifecycle) * 100),
                node.lifecycle,
              )
            : t.inspectorStorage.everyObjectKeepsTheClassAbove,
          h,
        ),
      ],
      h,
    ),
  ]
}

export const storagePanel: Panel = {
  body: ({ game, node, h }) => [...storage(game, node, h)],
}
