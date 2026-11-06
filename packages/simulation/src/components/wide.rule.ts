import type { GameNode } from '../state.ts'
import { WIDE_OPS, WIDE_STALE, WIDE_TX_DUPLICATE, WIDE_TX_STALE } from '../catalog.ts'
import { failSome, failed, kthFastest, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import {
  type ComponentRule,
  type Rates,
  hotKeyFactor,
  slotOf,
  splitWork,
  terminal,
} from '../rule-kit.ts'

/* ---------- quorums, consensus and hot keys ---------- */

/** Mean ms one Wide-column replica takes to answer.  */
const WIDE_REPLICA_MS = 2

const quorumN = (node: GameNode): number => Math.max(1, Math.min(5, node.n))

const quorumR = (node: GameNode): number => Math.max(1, Math.min(quorumN(node), node.r))

const quorumW = (node: GameNode): number => Math.max(1, Math.min(quorumN(node), node.w))

/** R + W > N: every read asks a replica that took the latest write (07 "Wide-column Store"). */
const strongQuorum = (node: GameNode): boolean => quorumR(node) + quorumW(node) > quorumN(node)

/** Share of a weak quorum's reads that miss the latest write: more writes, fewer replicas asked. */
const wideStale = (arriving: Rates, node: GameNode): number => {
  if (strongQuorum(node)) return 0
  const { reads, writes } = splitWork(arriving)
  const writeShare = reads + writes > 0 ? writes / (reads + writes) : 0
  const missed = (quorumN(node) - quorumW(node)) / quorumN(node)
  return Math.min(0.5, WIDE_STALE * writeShare * missed * (2 / (quorumR(node) + 1)) + 0.05 * missed)
}

// Leaderless quorums: a read waits for R replies, a write for W, of N replicas.
export const wideRule: ComponentRule = {
  model: (solver, node, arriving) => {
    const { reads, writes } = splitWork(arriving)
    const ops = reads * quorumR(node) + writes * quorumN(node)
    const rate = reads + writes
    const capacity =
      (WIDE_OPS * flatScale(node)) / hotKeyFactor(solver.game, node) / (ops > 0 ? ops / rate : 1)
    const model = flatModel(capacity, arriving, { fixed: 1, variable: 0 }, solver.boost(node))
    const wait = model.service['q-read']?.variable ?? 0
    const service: Record<string, { fixed: number; variable: number }> = {}
    for (const kind of Object.keys(arriving))
      service[kind] = {
        fixed: 1,
        variable:
          wait +
          WIDE_REPLICA_MS *
            kthFastest(kind === 'q-read' ? quorumR(node) : quorumW(node), quorumN(node)),
      }
    return { ...model, service }
  },
  outcome: (answer, node, kind) => {
    const n = quorumN(node)
    // One replica lost: a quorum that needs every replica cannot form.
    const short = node.lost > 0 ? 1 : 0
    const needed = kind === 'q-read' ? quorumR(node) : quorumW(node)
    if (needed > n - short) return failed('refused')
    const reply = through(answer.ownHop(kind))
    // Overlap is not linearizability: a checkout on a quorum store still goes wrong now and then.
    if (kind === 'q-tx')
      return failSome({ ...reply, stale: WIDE_TX_STALE }, WIDE_TX_DUPLICATE, 'duplicate')
    if (kind !== 'q-read') return reply
    return {
      ...reply,
      stale: wideStale(answer.pass.arriving[slotOf(answer.pass, node)] ?? {}, node),
    }
  },
  ...terminal,
  probe: () => ({ 'q-read': 1 }),
}
