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
const storage = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  section(
    'Product',
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
          : 'Egress to the internet bills per GB, unless a CDN serves it.',
        h,
      ),
    ],
    h,
  ),
  section(
    'Storage class',
    [
      picker(
        'storage-class',
        (Object.keys(STORAGE_CLASSES) as ReadonlyArray<StorageClass>).map(
          (id) => [id, STORAGE_CLASSES[id].name] as const,
        ),
        node.storageClass,
        (storageClass) => Message.StorageClassChosen({ nodeId: node.id, storageClass }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        STORAGE_CLASSES[node.storageClass].archived
          ? 'Cheapest to keep. Media reads fail as timeout until the objects are restored.'
          : STORAGE_CLASSES[node.storageClass].retrieval > 0
            ? `Half the storage price, and $${STORAGE_CLASSES[node.storageClass].retrieval} per GB read back.`
            : 'Full storage price. Reads come back at once.',
        h,
      ),
    ],
    h,
  ),
  section(
    'Lifecycle',
    [
      picker(
        'lifecycle',
        LIFECYCLE_DAYS.map((days) => [days, days === 0 ? 'Off' : `${days} d`] as const),
        node.lifecycle,
        (lifecycle) => Message.LifecycleChosen({ nodeId: node.id, lifecycle }),
        h,
        (days) => days === 0 || has(game, 'lifecycle-rules'),
      ),
      caption(
        node.lifecycle > 0
          ? `${Math.round(agedShareOf(game, node.lifecycle) * 100)}% of the store is older than ${node.lifecycle} days and moves one class cheaper. A read of an archived object fails.`
          : 'Every object keeps the class above, however old it is.',
        h,
      ),
    ],
    h,
  ),
]

export const storagePanel: Panel = {
  body: ({ game, node, h }) => [...storage(game, node, h)],
}
