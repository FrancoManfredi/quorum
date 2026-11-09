import { Schema } from 'effect'
import { newGame, preseedGame } from '@quorum/simulation/company'
import { Sample } from '@quorum/simulation/state'
import { describe, expect, test } from 'vitest'
import type { AgentHead, AgentSnapshot, Upload } from './snapshot.ts'
import { applyUpload, emptyStore, snapshotOfStore } from './store.ts'
import { readTool } from './view.ts'

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

const game = { ...newGame(), time: 30, history: [sample(1), sample(2)] }

const snapshot = (overrides: Partial<AgentSnapshot> = {}): AgentSnapshot => ({
  game,
  mode: 'company',
  screen: { route: 'Board', panel: 'none', region: 'na', selectedNode: 'database' },
  paused: false,
  speed: 1,
  bottleneck: null,
  whatIfs: null,
  samples: game.history,
  nodeSamples: {},
  inbox: [],
  updatedAt: 0,
  ...overrides,
})

const head = (value: AgentSnapshot): AgentHead => ({
  game: value.game,
  mode: value.mode,
  screen: value.screen,
  paused: value.paused,
  speed: value.speed,
  bottleneck: value.bottleneck,
  whatIfs: value.whatIfs,
  inboxHash: 'a',
})

const upload = (value: AgentSnapshot): Upload => ({
  v: 1,
  epoch: 'e',
  rev: 1,
  reset: true,
  head: head(value),
  samples: { from: 0, to: 30, items: value.samples },
  nodes: { from: 0, items: {} },
  inbox: value.inbox,
})

describe('an upload becomes a tool answer', () => {
  test('the stored snapshot answers company, design, history, and game', () => {
    const value = snapshot()
    const store = applyUpload(emptyStore(), upload(value), 100).store
    const stored = snapshotOfStore(store)
    expect(stored).not.toBeNull()

    const company = JSON.parse(readTool(stored, 'get_company')) as {
      mode: string
      simSeconds: number
      bottleneck: string | null
    }
    expect(company).toMatchObject({ mode: 'company', simSeconds: 30, bottleneck: null })

    const design = JSON.parse(readTool(stored, 'get_design')) as { nodes: unknown[] }
    expect(design.nodes.length).toBeGreaterThan(0)

    const history = JSON.parse(readTool(stored, 'get_history')) as unknown[]
    expect(history).toHaveLength(2)

    const whole = JSON.parse(readTool(stored, 'get_game')) as { history?: unknown }
    expect(whole.history).toBeUndefined()
  })

  test('get_design lists the Links into and out of each Node with the rate they carry', () => {
    const busy = { ...preseedGame(), users: 4_000 }
    const store = applyUpload(
      emptyStore(),
      upload(snapshot({ game: busy, samples: [] })),
      100,
    ).store
    type Side = { label: string; rate: number }
    const design = JSON.parse(readTool(snapshotOfStore(store), 'get_design')) as {
      nodes: Array<{
        id: string
        inbound: Array<Side & { from: string }>
        outbound: Array<Side & { to: string }>
      }>
    }
    const node = (id: string) => design.nodes.find((entry) => entry.id === id)!

    expect(node('users').inbound).toEqual([])
    expect(node('users').outbound.map((link) => link.to)).toEqual(['server'])
    expect(node('server').inbound.map((link) => link.from)).toEqual(['users'])
    expect(node('server').outbound.map((link) => [link.to, link.label])).toEqual([
      ['database', 'Database'],
      ['analytics', 'Analytics'],
    ])
    expect(node('database').outbound).toEqual([])
    // The rate on the Database's one inbound Link is what the App Server sends it.
    expect(node('database').inbound[0]!.rate).toBeGreaterThan(0)
    expect(node('database').inbound[0]!.rate).toBe(
      node('server').outbound.find((link) => link.to === 'database')!.rate,
    )
  })

  test('a Challenge snapshot still refuses', () => {
    const store = applyUpload(
      emptyStore(),
      upload(snapshot({ mode: 'challenge', game: null })),
      100,
    ).store
    const stored = snapshotOfStore(store)
    expect(() => readTool(stored, 'get_company')).toThrow('Challenges are scored')
  })
})
