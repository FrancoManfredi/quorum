import type { NodeSample } from './node-metrics.ts'
import type { Ack, AgentHead, AgentSnapshot, Upload } from './snapshot.ts'
import { INBOX_KEPT, NODE_SAMPLES_KEPT, SAMPLES_KEPT } from './store.ts'

/* ==========================================================================
   What the browser sends next. The Game and its screen are small enough to
   send whole; the samples are append-only, so they go by cursor. The Inbox is
   bounded, so it goes whole only when its hash changes.
   ========================================================================== */

export type SyncState = Readonly<{
  epoch: string
  rev: number
  acked: Ack | null
  /** The last head sent, to skip an upload that would change nothing. */
  headJson: string | null
}>

const hashOf = (value: unknown): string => {
  const text = JSON.stringify(value)
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const headOf = (snapshot: AgentSnapshot): AgentHead => ({
  game:
    snapshot.mode === 'challenge' || snapshot.game === null
      ? null
      : { ...snapshot.game, history: [] },
  mode: snapshot.mode,
  screen: snapshot.screen,
  paused: snapshot.paused,
  speed: snapshot.speed,
  bottleneck: snapshot.bottleneck,
  whatIfs: snapshot.whatIfs,
  inboxHash: hashOf(snapshot.inbox),
})

/**
 * One upload, or null when there is nothing new. `state.rev` moves only after
 * the server acknowledges, so a retry after a lost response reuses the revision
 * and the server can ignore it.
 */
export const uploadOf = (snapshot: AgentSnapshot, state: SyncState): Upload | null => {
  const head = headOf(snapshot)
  const headJson = JSON.stringify(head)
  const seq =
    snapshot.game === null ? (state.acked?.sampleSeq ?? 0) : Math.floor(snapshot.game.time)
  const from = state.acked?.sampleSeq ?? 0
  const reset = state.acked === null || seq < from

  const count = Math.max(0, seq - from)
  const samples = reset
    ? snapshot.samples.slice(-SAMPLES_KEPT)
    : count === 0
      ? []
      : snapshot.samples.slice(-Math.min(count, snapshot.samples.length))

  const nodeItems: Record<string, NodeSample[]> = {}
  for (const [id, history] of Object.entries(snapshot.nodeSamples)) {
    const items = reset
      ? history.slice(-NODE_SAMPLES_KEPT)
      : history.filter((sample) => sample.time > (state.acked?.nodeTime ?? 0))
    if (items.length > 0) nodeItems[id] = items
  }

  const inbox =
    reset || head.inboxHash !== (state.acked?.inboxHash ?? '')
      ? snapshot.inbox.slice(-INBOX_KEPT)
      : null

  if (
    !reset &&
    headJson === state.headJson &&
    inbox === null &&
    samples.length === 0 &&
    Object.keys(nodeItems).length === 0
  )
    return null

  return {
    v: 1,
    epoch: state.epoch,
    rev: state.rev + 1,
    reset,
    head,
    samples: { from, to: seq, items: samples },
    nodes: { from: state.acked?.nodeTime ?? 0, items: nodeItems },
    inbox,
  }
}
