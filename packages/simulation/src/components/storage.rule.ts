import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, StorageClass, StoreVariant } from '../state.ts'
import { LIFECYCLE_DAYS, RESEARCH, STORAGE_CLASSES, R2_FIRST_BYTE_MS } from '../catalog.ts'
import { failSome, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { has, storageBands } from '../lookups.ts'
import { type ComponentRule, terminal } from '../rule-kit.ts'

// Archive-class objects must be restored before they can be read, so a `media` request for one
// fails as `timeout` (07 "Object Storage").
export const storageRule: ComponentRule = {
  // R2 answers a little later than S3 outside its own CDN: a CDN on the board takes the first
  // byte (07 "Object Storage").
  model: (solver, node, arriving) =>
    flatModel(
      Number.POSITIVE_INFINITY,
      arriving,
      {
        fixed:
          40 +
          (node.storeVariant === 'r2' && !solver.game.nodes.some((entry) => entry.type === 'cdn')
            ? R2_FIRST_BYTE_MS
            : 0),
        variable: 5,
      },
      1,
    ),
  // A read of an archived object waits hours for its restore, so it fails as a timeout. Lifecycle
  // rules put the oldest share of the store in Archive, and that share of reads fails with it.
  outcome: (answer, node, kind) => {
    if (kind !== 'blob-get') return through(answer.ownHop(kind))
    const bands = storageBands(answer.game, node)
    const all = bands.reduce((sum, band) => sum + band.gb, 0)
    const archived = bands.reduce((sum, band) => sum + (band.archived ? band.gb : 0), 0)
    const share = all > 0 ? archived / all : STORAGE_CLASSES[node.storageClass].archived ? 1 : 0
    return failSome(through(answer.ownHop(kind)), share, 'timeout')
  },
  ...terminal,
}

/** Picks the product an Object Storage Node is (07 "Object Storage"): S3 or R2. */
export const setStoreVariant = (game: Game, id: string, storeVariant: StoreVariant): Action =>
  withNode(game, id, (node) =>
    node.type !== 'storage'
      ? notAllowed('Only Object Storage has a product.')
      : storeVariant === 'r2' && !has(game, 'egress-optimization')
        ? no(Refusal.Locked({ what: 'R2', research: RESEARCH['egress-optimization'].name }))
        : ok(node.storeVariant === storeVariant ? game : patch(game, id, { storeVariant })),
  )

/** Picks the class Object Storage keeps its objects in (07 "Object Storage"). */
export const setStorageClass = (game: Game, id: string, storageClass: StorageClass): Action =>
  withNode(game, id, (node) =>
    node.type === 'storage'
      ? ok(node.storageClass === storageClass ? game : patch(game, id, { storageClass }))
      : notAllowed('Only Object Storage has a storage class.'),
  )

/**
 * Picks how many calendar days an object stays in its class before Lifecycle rules move it one
 * class cheaper (07 "Object Storage"). Needs Lifecycle rules; 0 turns them off.
 */
export const setLifecycle = (game: Game, id: string, lifecycle: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'storage')
      return notAllowed('Only Object Storage moves objects between classes.')
    if (!(LIFECYCLE_DAYS as ReadonlyArray<number>).includes(lifecycle))
      return notAllowed(`Lifecycle windows are ${LIFECYCLE_DAYS.join(', ')} days.`)
    if (lifecycle > 0 && !has(game, 'lifecycle-rules'))
      return no(
        Refusal.Locked({ what: 'Lifecycle rules', research: RESEARCH['lifecycle-rules'].name }),
      )
    return ok(node.lifecycle === lifecycle ? game : patch(game, id, { lifecycle }))
  })
