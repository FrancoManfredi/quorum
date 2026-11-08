import { Schema } from 'effect'
import { Sample } from '@quorum/simulation/state'
import { describe, expect, test } from 'vitest'
import { NodeSample } from './node-metrics.ts'
import type { AgentHead, AgentMail, Upload } from './snapshot.ts'
import {
  NODE_SAMPLES_KEPT,
  SAMPLES_KEPT,
  applyUpload,
  emptyStore,
  snapshotOfStore,
  statusOfStore,
} from './store.ts'

const sample = (users: number): Sample =>
  Schema.decodeSync(Sample)({
    users,
    demand: 1,
    served: 1,
    revenue: 0,
    burn: 0,
    latency: 1,
    p99: 1,
    apdex: 1,
    errors: 0,
  })

const nodeSample = (time: number): NodeSample =>
  Schema.decodeSync(NodeSample)({
    time,
    inbound: 1,
    capacity: 2,
    utilization: 0.5,
    traffic: {},
    sources: [],
    limit: 'none',
    dropped: 0,
    refused: 0,
    down: false,
    disk: false,
    swapping: false,
    throttled: false,
    hitRatio: null,
    queue: null,
  })

const mail = (id: number): AgentMail => ({
  id,
  sender: 'mentor',
  subject: 'Read this',
  time: 1,
  read: false,
  trashed: false,
  spam: false,
  phase: { _tag: 'Active' },
  actions: ['Reply'],
  entries: [],
})

const head = (inboxHash = 'a'): AgentHead => ({
  game: null,
  mode: 'company',
  screen: { route: 'Board', panel: 'none', region: 'na', selectedNode: null },
  paused: false,
  speed: 1,
  bottleneck: null,
  whatIfs: null,
  inboxHash,
})

const upload = (overrides: Partial<Upload> = {}): Upload => ({
  v: 1,
  epoch: 'e1',
  rev: 1,
  reset: true,
  head: head(),
  samples: { from: 0, to: 2, items: [sample(1), sample(2)] },
  nodes: { from: 0, items: { database: [nodeSample(1)] } },
  inbox: [],
  ...overrides,
})

describe('the agent Room store', () => {
  test('a reset replaces the streams and records the ack', () => {
    const { store, ack } = applyUpload(emptyStore(), upload(), 100)
    expect(store.samples.map((entry) => entry.users)).toEqual([1, 2])
    expect(store.nodes['database']?.map((entry) => entry.time)).toEqual([1])
    expect(ack).toMatchObject({ epoch: 'e1', rev: 1, sampleSeq: 2, nodeTime: 1, at: 100 })
  })

  test('an incremental upload appends only what it carries', () => {
    const first = applyUpload(emptyStore(), upload(), 100).store
    const { store } = applyUpload(
      first,
      upload({
        rev: 2,
        reset: false,
        samples: { from: 2, to: 3, items: [sample(3)] },
        nodes: { from: 1, items: { database: [nodeSample(2)] } },
        inbox: null,
      }),
      200,
    )
    expect(store.samples.map((entry) => entry.users)).toEqual([1, 2, 3])
    expect(store.nodes['database']?.map((entry) => entry.time)).toEqual([1, 2])
    expect(store.meta.at).toBe(200)
  })

  test('a revision the server already has is ignored', () => {
    const first = applyUpload(emptyStore(), upload(), 100).store
    const { store } = applyUpload(
      first,
      upload({
        rev: 1,
        reset: false,
        samples: { from: 2, to: 3, items: [sample(3)] },
      }),
      200,
    )
    expect(store.samples).toHaveLength(2)
    expect(store.meta.at).toBe(100)
  })

  test('a new epoch starts over', () => {
    const first = applyUpload(emptyStore(), upload(), 100).store
    const { store } = applyUpload(
      first,
      upload({
        epoch: 'e2',
        rev: 1,
        reset: false,
        samples: { from: 0, to: 1, items: [sample(9)] },
        nodes: { from: 0, items: {} },
        inbox: [],
      }),
      200,
    )
    expect(store.samples.map((entry) => entry.users)).toEqual([9])
    expect(store.nodes).toEqual({})
  })

  test('the streams keep their bounds', () => {
    const many = Array.from({ length: SAMPLES_KEPT + 5 }, (_, index) => sample(index))
    const nodes = Array.from({ length: NODE_SAMPLES_KEPT + 5 }, (_, index) => nodeSample(index))
    const { store } = applyUpload(
      emptyStore(),
      upload({
        samples: { from: 0, to: many.length, items: many },
        nodes: { from: 0, items: { database: nodes } },
      }),
      100,
    )
    expect(store.samples).toHaveLength(SAMPLES_KEPT)
    expect(store.nodes['database']).toHaveLength(NODE_SAMPLES_KEPT)
  })

  test('the Inbox is replaced only when its hash changes', () => {
    const first = applyUpload(emptyStore(), upload({ inbox: [mail(1)] }), 100).store
    const kept = applyUpload(
      first,
      upload({ rev: 2, reset: false, head: head('a'), inbox: null }),
      200,
    ).store
    expect(kept.inbox.map((entry) => entry.id)).toEqual([1])

    const replaced = applyUpload(
      kept,
      upload({ rev: 3, reset: false, head: head('b'), inbox: [mail(2)] }),
      300,
    ).store
    expect(replaced.inbox.map((entry) => entry.id)).toEqual([2])
  })

  test('a stored head answers the view and the status', () => {
    const store = applyUpload(emptyStore(), upload(), 100).store
    expect(snapshotOfStore(store)).toMatchObject({ mode: 'company', updatedAt: 100 })
    expect(statusOfStore(store)).toMatchObject({ mode: 'company', samples: 2, nodes: 1 })
    expect(snapshotOfStore(emptyStore())).toBeNull()
    expect(statusOfStore(emptyStore())).toBeNull()
  })
})
