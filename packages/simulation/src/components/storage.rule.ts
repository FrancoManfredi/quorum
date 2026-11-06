import { STORAGE_CLASSES, R2_FIRST_BYTE_MS } from '../catalog.ts'
import { failSome, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { storageBands } from '../lookups.ts'
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
