import { describe, expect, test } from 'vitest'
import { hop, through } from '../src/distribution.ts'
import { searchRule } from '../src/components/search.rule.ts'
import { CDC_DROP_STALE, CDC_LAG_STALE, DUAL_WRITE_STALE, OUTBOX_STALE } from '../src/catalog.ts'
import { freeSandbox } from '../src/sandbox.ts'
import type { Game, GameNode } from '../src/state.ts'

const ownHop = () => hop({ fixedMs: 1, variableMs: 1, share: 1, tailP: 0, tailMs: 0 })

const answerFor = (game: Game, pass: { at: Map<string, number>; models: Array<unknown> }) =>
  ({
    game,
    pass,
    ownHop,
    downstream: () => through(ownHop()),
    delegates: false,
    runsLocalDb: false,
    offloads: false,
  }) as unknown as Parameters<typeof searchRule.outcome>[0]

const searchNode = (id = 'search'): GameNode =>
  ({
    id,
    type: 'search',
    searchVariant: 'elasticsearch',
    refresh: 1,
    heap: 'half',
    searchShards: 1,
    searchReplicas: 0,
    life: { _tag: 'Running' },
  }) as unknown as GameNode

const cdcNode = (id = 'cdc'): GameNode =>
  ({
    id,
    type: 'cdc',
    service: { _tag: 'InService' },
    life: { _tag: 'Running' },
  }) as unknown as GameNode

const passWithCdc = (cdcId: string, share: number) => ({
  at: new Map([[cdcId, 0]]),
  models: [{ share }],
})

describe('CDC and outbox staleness', () => {
  test('dual writes leave a stale share with no outbox or CDC from Series B', () => {
    const base = freeSandbox()
    const game = {
      ...base,
      stage: 4,
      researched: base.researched.filter((id) => id !== 'outbox'),
      nodes: [],
    } as Game
    const out = searchRule.outcome(
      answerFor(game, { at: new Map(), models: [] }),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBe(DUAL_WRITE_STALE)
  })

  test('an outbox shrinks divergence to a lag window, not zero', () => {
    const game = {
      ...freeSandbox(),
      stage: 4,
      researched: [...freeSandbox().researched, 'outbox'],
    } as Game
    const out = searchRule.outcome(
      answerFor(game, { at: new Map(), models: [] }),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBe(OUTBOX_STALE)
    expect(out.stale).toBeGreaterThan(0)
    expect(out.stale).toBeLessThan(DUAL_WRITE_STALE)
  })

  test('a healthy CDC Connector leaves only its processing lag', () => {
    const game = { ...freeSandbox(), stage: 4, nodes: [cdcNode()] } as Game
    const out = searchRule.outcome(answerFor(game, passWithCdc('cdc', 1)), searchNode(), 'q-search')
    expect(out.stale).toBe(CDC_LAG_STALE)
    expect(out.stale).toBeGreaterThan(0)
  })

  test('an overloaded CDC Connector drops changes and the copies diverge', () => {
    const game = { ...freeSandbox(), stage: 4, nodes: [cdcNode()] } as Game
    const out = searchRule.outcome(
      answerFor(game, passWithCdc('cdc', 0.4)),
      searchNode(),
      'q-search',
    )
    expect(out.stale).toBeCloseTo(CDC_LAG_STALE + 0.6 * CDC_DROP_STALE)
    expect(out.stale).toBeGreaterThan(CDC_LAG_STALE)
  })
})
