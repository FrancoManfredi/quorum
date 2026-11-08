import { Schema } from 'effect'
import { newGame } from '@quorum/simulation/company'
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
  bottleneck: 'database',
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
      bottleneck: string
    }
    expect(company).toMatchObject({ mode: 'company', simSeconds: 30, bottleneck: 'database' })

    const design = JSON.parse(readTool(stored, 'get_design')) as { nodes: unknown[] }
    expect(design.nodes.length).toBeGreaterThan(0)

    const history = JSON.parse(readTool(stored, 'get_history')) as unknown[]
    expect(history).toHaveLength(2)

    const whole = JSON.parse(readTool(stored, 'get_game')) as { history?: unknown }
    expect(whole.history).toBeUndefined()
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
