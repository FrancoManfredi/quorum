import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import * as Actions from './actions.ts'
import { preseedGame } from './company.ts'
import { hashGame } from './hash.ts'
import { nodeLabel, nodeLabelOf, nodeOrdinals, normalizeOrdinals } from './labels.ts'
import type { Game } from './state.ts'

/* Node labels: stable, unique, and never part of the replay hash. */

const servers = (game: Game) => game.nodes.filter((node) => node.type === 'server')

describe('Node labels', () => {
  test('a lone Node keeps the Component name', () => {
    const game = preseedGame()
    const server = servers(game)[0]!
    expect(nodeLabel(game, server)).toBe('App Server')
    expect(nodeLabelOf(game, server).ordinal).toBe(0)
  })

  test('a second Node adds stable ordinals, and selling the first does not renumber the second', () => {
    const first = preseedGame()
    const placed = Result.getOrThrow(Actions.place(first, 'server', 0, 0))
    const [one, two] = servers(placed)
    expect(one && two).toBeTruthy()
    expect(nodeLabel(placed, one!)).toBe('App Server 1')
    expect(nodeLabel(placed, two!)).toBe('App Server 2')
    expect(nodeOrdinals(placed)[one!.id]).toBe(1)
    expect(nodeOrdinals(placed)[two!.id]).toBe(2)

    const sold = Result.getOrThrow(Actions.sell(placed, one!.id))
    const remaining = servers(sold)[0]!
    expect(remaining.id).toBe(two!.id)
    expect(nodeLabel(sold, remaining)).toBe('App Server 2')
  })

  test('old saves normalize ordinals once, by Component in saved order', () => {
    const game = preseedGame()
    const stripped: Game = {
      ...game,
      nodes: game.nodes.map((node) => ({ ...node, ordinal: 0 })),
    }
    const normalized = normalizeOrdinals(stripped)
    expect(normalized.nodes.every((node) => node.ordinal > 0)).toBe(true)
    expect(normalized.nodes.map((node) => node.ordinal)).toEqual([1, 1, 1, 1, 1])
    expect(normalizeOrdinals(normalized)).toBe(normalized)
  })

  test('fixed Nodes are never numbered', () => {
    const game = preseedGame()
    const users = game.nodes.find((node) => node.type === 'users')!
    expect(nodeLabel(game, users)).toBe('Users')
    expect(nodeLabelOf(game, users).ordinal).toBe(0)
  })

  test('ordinals are display metadata and do not change the replay hash', () => {
    const game = preseedGame()
    const shifted: Game = {
      ...game,
      nodes: game.nodes.map((node) => ({ ...node, ordinal: node.ordinal + 5 })),
    }
    expect(hashGame(shifted)).toBe(hashGame(game))
  })
})
