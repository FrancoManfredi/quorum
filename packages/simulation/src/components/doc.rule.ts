import {
  DOC_JOIN_COST,
  DOC_OPS,
  DOC_OP_MS,
  DOC_PARTIAL,
  DOC_TXN_LATENCY,
  type Kind,
} from '../catalog.ts'
import { failSome, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import {
  type ComponentRule,
  type Rates,
  hotKeyFactor,
  noConnections,
  nothing,
} from '../rule-kit.ts'

/**
 * The work a Document Store's arrivals make, in ops: a read or a write is one document, and a
 * join — a checkout across documents, or a report scanning the collection — is three (07
 * "Document Store": "`report` and `q-tx` across documents cost 3×").
 */
const docWork = (arriving: Rates): Readonly<{ rate: number; ops: number }> => {
  let rate = 0
  let ops = 0
  for (const kind of Object.keys(arriving) as Array<Kind>) {
    const each = arriving[kind] ?? 0
    rate += each
    ops += each * (kind === 'q-tx' || kind === 'q-scan' ? DOC_JOIN_COST : 1)
  }
  return { rate, ops }
}

// It answers reads and writes on documents: one flat rate of ops, a join at three of them, no
// connections to pool, and no schema to migrate (07 "Document Store").
export const docRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const { rate, ops } = docWork(arriving)
    const perOp = rate > 0 ? ops / rate : 1
    const capacity = (DOC_OPS * flatScale(node)) / hotKeyFactor(solver.game, node) / perOp
    const model = flatModel(
      capacity,
      arriving,
      { fixed: 3, variable: DOC_OP_MS },
      solver.boost(node),
    )
    // A join makes the store touch three documents, and a transaction makes the write wait for
    // every one of them: the latency grows with the ops it costs, not only with the queue.
    const wait = (model.service['q-read']?.variable ?? DOC_OP_MS) - DOC_OP_MS
    const service: Record<string, { fixed: number; variable: number }> = {}
    for (const kind of Object.keys(arriving)) {
      const join = kind === 'q-tx' || kind === 'q-scan' ? DOC_JOIN_COST : 1
      const slower =
        node.transactions && (kind === 'q-write' || kind === 'q-tx') ? 1 + DOC_TXN_LATENCY : 1
      service[kind] = { fixed: 3, variable: DOC_OP_MS * join * slower + wait }
    }
    return { ...model, service }
  },
  // It takes every document op and sends nothing on: there is no database behind it.
  serve: nothing,
  outcome: (answer, node, kind) => {
    const reply = through(answer.ownHop(kind))
    // No joins: a checkout spreads over several documents, and without multi-document
    // transactions it can land half-applied, so the retry charges again (07 "Document Store").
    return kind === 'q-tx' && !node.transactions ? failSome(reply, DOC_PARTIAL, 'duplicate') : reply
  },
  // It has no connection limit to exhaust: an App Server opens none it has to pool.
  connections: noConnections,
  probe: () => ({ 'q-read': 1 }),
}
