import { Schema } from 'effect'
import { newGame } from '@quorum/simulation/company'
import { Sample } from '@quorum/simulation/state'
import { describe, expect, test } from 'vitest'
import { NodeSample } from './node-metrics.ts'
import type { AgentMail, AgentSnapshot } from './snapshot.ts'
import { uploadOf, type SyncState } from './sync.ts'

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

const snap = (overrides: Partial<AgentSnapshot> = {}): AgentSnapshot => {
  const base = newGame()
  return {
    game: { ...base, time: 10, history: [sample(1), sample(2)] },
    mode: 'company',
    screen: { route: 'Board', panel: 'none', region: 'na', selectedNode: null },
    paused: false,
    speed: 1,
    bottleneck: null,
    whatIfs: null,
    samples: [sample(1), sample(2)],
    nodeSamples: { database: [nodeSample(5)] },
    inbox: [mail(1)],
    updatedAt: 0,
    ...overrides,
  }
}

const fresh: SyncState = { epoch: 'e', rev: 0, acked: null, headJson: null }

const settled = (upload: NonNullable<ReturnType<typeof uploadOf>>): SyncState => ({
  epoch: 'e',
  rev: upload.rev,
  acked: {
    epoch: 'e',
    rev: upload.rev,
    sampleSeq: upload.samples.to,
    nodeTime: 5,
    inboxHash: upload.head.inboxHash,
    at: 1,
  },
  headJson: JSON.stringify(upload.head),
})

describe('what the browser uploads', () => {
  test('the first upload is a baseline with the head and both streams', () => {
    const upload = uploadOf(snap(), fresh)
    expect(upload).not.toBeNull()
    expect(upload?.reset).toBe(true)
    expect(upload?.samples.items).toHaveLength(2)
    expect(upload?.nodes.items['database']).toHaveLength(1)
    expect(upload?.inbox).toHaveLength(1)
    expect(upload?.head.game?.history).toEqual([])
  })

  test('an unchanged snapshot makes no upload', () => {
    const upload = uploadOf(snap(), fresh)
    expect(upload).not.toBeNull()
    expect(uploadOf(snap(), settled(upload!))).toBeNull()
  })

  test('new seconds go by cursor, not as the whole history', () => {
    const first = uploadOf(snap(), fresh)!
    const state = settled(first)
    const history = [sample(1), sample(2), sample(3), sample(4)]
    const next = uploadOf(
      snap({ game: { ...snap().game!, time: 12, history }, samples: history }),
      state,
    )
    expect(next?.reset).toBe(false)
    expect(next?.samples).toMatchObject({ from: 10, to: 12 })
    expect(next?.samples.items.map((entry) => entry.users)).toEqual([3, 4])
  })

  test('a rewound game resets the streams', () => {
    const first = uploadOf(snap(), fresh)!
    const state = settled(first)
    const next = uploadOf(
      snap({ game: { ...snap().game!, time: 4, history: [sample(1)] }, samples: [sample(1)] }),
      state,
    )
    expect(next?.reset).toBe(true)
    expect(next?.samples.to).toBe(4)
  })

  test('a changed Inbox is sent whole, and a changed head alone is still a send', () => {
    const first = uploadOf(snap(), fresh)!
    const state = settled(first)
    const inbox = uploadOf(snap({ inbox: [mail(2)] }), state)
    expect(inbox?.reset).toBe(false)
    expect(inbox?.inbox?.map((entry) => entry.id)).toEqual([2])

    const paused = uploadOf(snap({ paused: true }), state)
    expect(paused?.samples.items).toHaveLength(0)
    expect(paused?.inbox).toBeNull()
    expect(paused?.head.paused).toBe(true)
  })

  test('a new node sample is sent by time', () => {
    const first = uploadOf(snap(), fresh)!
    const state = settled(first)
    const next = uploadOf(
      snap({ nodeSamples: { database: [nodeSample(5), nodeSample(6)] } }),
      state,
    )
    expect(next?.nodes.items['database']?.map((entry) => entry.time)).toEqual([6])
  })
})
