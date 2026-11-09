import { type Action, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { Game, GameNode } from '../state.ts'
import {
  QUORUM_N,
  WIDE_OPS,
  WIDE_SPREAD_LAG_STALE,
  WIDE_STALE,
  WIDE_TX_DUPLICATE,
  WIDE_TX_STALE,
} from '../catalog.ts'
import { failSome, failed, kthFastest, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, spreadCount } from '../lookups.ts'
import {
  type ComponentRule,
  type Rates,
  hotKeyFactor,
  slotOf,
  splitWork,
  terminal,
} from '../rule-kit.ts'

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
    const model = flatModel(capacity, arriving, { fixedMs: 1, variableMs: 0 }, solver.boost(node))
    const wait = model.service['q-read']?.variableMs ?? 0
    const service: Record<string, { fixedMs: number; variableMs: number }> = {}
    for (const kind of Object.keys(arriving))
      service[kind] = {
        fixedMs: 1,
        variableMs:
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
    const arriving = answer.pass.arriving[slotOf(answer.pass, node)] ?? {}
    const quorumStale = wideStale(arriving, node)
    // LOCAL_QUORUM keeps client latency local, but cross-region replication lags (07 "Wide-column Store").
    let spreadStale = 0
    if (node.spread) {
      const regions = spreadCount(answer.game)
      if (regions > 1) {
        const { reads, writes } = splitWork(arriving)
        const writeShare = reads + writes > 0 ? writes / (reads + writes) : 0
        spreadStale = WIDE_SPREAD_LAG_STALE * (1 - 1 / regions) * writeShare
      }
    }
    return { ...reply, stale: Math.min(1, quorumStale + spreadStale) }
  },
  ...terminal,
  probe: () => ({ 'q-read': 1 }),
}

/** Sets a Wide-column Store's N, R and W (07 "Wide-column Store"). */
export const setQuorum = (game: Game, id: string, n: number, r: number, w: number): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'wide') return notAllowed('Only a Wide-column Store has quorums.')
    if (!QUORUM_N.some((entry) => entry === n) || r < 1 || w < 1 || r > n || w > n)
      return notAllowed('R and W are between 1 and N; N is 1 to 5.')
    return ok(patch(game, id, { n, r, w }))
  })
