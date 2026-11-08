import type { Sample } from '@quorum/simulation/state'
import type { NodeSample } from './node-metrics.ts'
import type { Ack, AgentHead, AgentMail, AgentSnapshot, Status, Upload } from './snapshot.ts'

/* ==========================================================================
   The Room's stored copy: a head and three bounded streams. The browser sends
   only what the server does not have. Everything here is plain data, so the
   Durable Object stores it and the view reads it.
   ========================================================================== */

export const SAMPLES_KEPT = 600
export const NODE_SAMPLES_KEPT = 24
export const INBOX_KEPT = 40

export type AgentMeta = Readonly<{
  epoch: string
  rev: number
  /** The last sim second the server has, as an absolute sequence. */
  sampleSeq: number
  nodeTime: number
  inboxHash: string
  at: number
}>

export type AgentStore = Readonly<{
  meta: AgentMeta
  head: AgentHead | null
  samples: ReadonlyArray<Sample>
  nodes: Readonly<Record<string, ReadonlyArray<NodeSample>>>
  inbox: ReadonlyArray<AgentMail>
}>

export const EMPTY_META: AgentMeta = {
  epoch: '',
  rev: 0,
  sampleSeq: 0,
  nodeTime: 0,
  inboxHash: '',
  at: 0,
}

export const emptyStore = (): AgentStore => ({
  meta: EMPTY_META,
  head: null,
  samples: [],
  nodes: {},
  inbox: [],
})

const lastNodeTime = (nodes: Readonly<Record<string, ReadonlyArray<NodeSample>>>): number => {
  let latest = 0
  for (const samples of Object.values(nodes)) {
    const last = samples[samples.length - 1]
    if (last && last.time > latest) latest = last.time
  }
  return latest
}

const appendSamples = (
  existing: ReadonlyArray<Sample>,
  items: ReadonlyArray<Sample>,
): ReadonlyArray<Sample> =>
  (items.length === 0 ? existing : [...existing, ...items]).slice(-SAMPLES_KEPT)

const appendNodeSamples = (
  existing: ReadonlyArray<NodeSample>,
  items: ReadonlyArray<NodeSample>,
): ReadonlyArray<NodeSample> => {
  const last = existing[existing.length - 1]?.time ?? Number.NEGATIVE_INFINITY
  const fresh = items.filter((sample) => sample.time > last)
  if (fresh.length === 0) return existing
  return [...existing, ...fresh].slice(-NODE_SAMPLES_KEPT)
}

export const ackOf = (store: AgentStore): Ack => ({
  epoch: store.meta.epoch,
  rev: store.meta.rev,
  sampleSeq: store.meta.sampleSeq,
  nodeTime: store.meta.nodeTime,
  inboxHash: store.meta.inboxHash,
  at: store.meta.at,
})

/**
 * Folds one upload into the store. A new epoch, an explicit reset, or the first
 * write replaces the streams. A revision the server already has is ignored, so
 * a retry after a lost response cannot append the same samples twice.
 */
export const applyUpload = (
  store: AgentStore,
  upload: Upload,
  now: number,
): Readonly<{ store: AgentStore; ack: Ack }> => {
  const reset = upload.reset || upload.epoch !== store.meta.epoch
  const base = reset ? emptyStore() : store
  if (!reset && upload.rev <= base.meta.rev) return { store: base, ack: ackOf(base) }

  const samples = appendSamples(base.samples, upload.samples.items)
  const nodes: Record<string, ReadonlyArray<NodeSample>> = reset ? {} : { ...base.nodes }
  for (const [id, items] of Object.entries(upload.nodes.items)) {
    const existing = nodes[id] ?? []
    const merged = appendNodeSamples(existing, items)
    if (merged.length > 0) nodes[id] = merged
  }

  const inbox = upload.inbox === null ? (reset ? [] : base.inbox) : upload.inbox.slice(-INBOX_KEPT)

  const meta: AgentMeta = {
    epoch: upload.epoch,
    rev: upload.rev,
    sampleSeq: reset ? upload.samples.to : Math.max(base.meta.sampleSeq, upload.samples.to),
    nodeTime: reset ? lastNodeTime(nodes) : Math.max(base.meta.nodeTime, lastNodeTime(nodes)),
    inboxHash: upload.head.inboxHash,
    at: now,
  }

  const next: AgentStore = { meta, head: upload.head, samples, nodes, inbox }
  return { store: next, ack: ackOf(next) }
}

export const snapshotOfStore = (store: AgentStore): AgentSnapshot | null => {
  const head = store.head
  if (head === null) return null
  return {
    game: head.game,
    mode: head.mode,
    screen: head.screen,
    paused: head.paused,
    speed: head.speed,
    bottleneck: head.bottleneck,
    whatIfs: head.whatIfs,
    samples: store.samples,
    nodeSamples: store.nodes,
    inbox: store.inbox,
    updatedAt: store.meta.at,
  }
}

export const statusOfStore = (store: AgentStore): Status | null => {
  if (store.head === null) return null
  return {
    mode: store.head.mode,
    updatedAt: store.meta.at,
    sampleSeq: store.meta.sampleSeq,
    nodeTime: store.meta.nodeTime,
    samples: store.samples.length,
    nodes: Object.keys(store.nodes).length,
    inbox: store.inbox.length,
    epoch: store.meta.epoch,
    rev: store.meta.rev,
  }
}
