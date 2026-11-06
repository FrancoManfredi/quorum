import { Result } from 'effect'
import { describe, expect, test } from 'vitest'
import { place } from '../src/actions.ts'
import { preseedGame } from '../src/company.ts'
import {
  capture,
  decodePlaybook,
  duplicate,
  encodePlaybook,
  placePlaybook,
} from '../src/playbook.ts'
import type { Game } from '../src/state.ts'
import { assignService, nodesOfService, serviceOfNode } from '../src/work.ts'

/* Playbooks (13): capture a Design, place it in another Company, share it as text. */

const source = preseedGame(3)
const ids = ['server', 'database']

/** A fresh Company with the fixed Nodes only, and Cash to build. */
const empty = (): Game => ({
  ...preseedGame(9),
  nodes: preseedGame(9).nodes.filter((node) => node.type !== 'server' && node.type !== 'database'),
  links: [],
  cash: 100_000,
})

describe('Playbooks', () => {
  test('capture then place rebuilds the Design: Stacks, sizes and Links', () => {
    const playbook = capture(source, ids, 'Pre-seed')
    expect(playbook?.nodes).toHaveLength(2)
    if (!playbook) return
    const placed = Result.getOrThrow(placePlaybook(empty(), playbook, 440, 280))
    expect(placed.placed).toBe(2)
    expect(placed.ghosts).toEqual([])
    const server = placed.game.nodes.find((node) => node.type === 'server')
    const original = source.nodes.find((node) => node.type === 'server')
    expect(server?.runtime).toBe(original?.runtime)
    expect(server?.size).toBe(original?.size)
    expect(server?.workers).toBe(original?.workers)
    expect(placed.game.links).toHaveLength(source.links.length)
  })

  test('a Node whose research is missing comes back as a ghost, not a refusal', () => {
    const withCache: Game = {
      ...source,
      researched: [...source.researched, 'caching'],
      nodes: [
        ...source.nodes,
        {
          ...(source.nodes[1] as Game['nodes'][number]),
          id: 'c',
          type: 'cache',
          cacheStrategy: 'write-through' as const,
        },
      ],
    }
    const playbook = capture(withCache, [...ids, 'c'], 'Cached')
    if (!playbook) throw new Error('no playbook')
    const placed = Result.getOrThrow(placePlaybook(empty(), playbook, 0, 0))
    expect(placed.placed).toBe(2)
    expect(placed.ghosts.map((ghost) => ghost.type)).toEqual(['cache'])
  })

  test('runs out of Cash part way: refused', () => {
    const playbook = capture(source, ids, 'P')
    if (!playbook) throw new Error('no playbook')
    expect(Result.isFailure(placePlaybook({ ...empty(), cash: 10 }, playbook, 0, 0))).toBe(true)
  })

  test('the text form round-trips, and a bad string is refused', () => {
    const playbook = capture(source, ids, 'Café')
    if (!playbook) throw new Error('no playbook')
    const text = encodePlaybook(playbook)
    expect(text.startsWith('QPB1:')).toBe(true)
    expect(text).toMatch(/^[A-Za-z0-9:_-]+$/)
    expect(Result.getOrThrow(decodePlaybook(text))).toEqual(playbook)
    expect(Result.isFailure(decodePlaybook('QPB1:!!!'))).toBe(true)
    expect(Result.isFailure(decodePlaybook('hello'))).toBe(true)
  })
})

describe('Duplicate', () => {
  // Users → Load Balancer → App Server → Database, with a 12 s Database timeout.
  const balanced = (): Game => {
    const built = Result.getOrThrow(
      place(
        { ...source, cash: 100_000, researched: [...source.researched, 'load-balancing'] },
        'lb',
        200,
        280,
      ),
    )
    const lb = built.nodes.at(-1)!.id
    const link = built.links.find((entry) => entry.from === 'users')!
    return {
      ...built,
      links: [
        { ...link, to: lb },
        { ...link, from: lb, to: 'server' },
        ...built.links
          .filter((entry) => entry.from !== 'users')
          .map((entry) => (entry.to === 'database' ? { ...entry, timeout: 12 } : entry)),
      ],
    }
  }

  test('a duplicated App Server keeps its Links to Nodes outside the selection', () => {
    const game = balanced()
    const lb = game.nodes.find((node) => node.type === 'lb')!.id
    const playbook = capture(game, ['server'], 'Nodes')!
    const copied = Result.getOrThrow(duplicate(game, playbook, 600, 400))
    const copy = copied.ids.get('server')!
    const linked = (from: string, to: string) =>
      copied.game.links.find((entry) => entry.from === from && entry.to === to)
    expect(linked(lb, copy)).toBeDefined()
    expect(linked(copy, 'database')?.timeout).toBe(12)
    expect(linked(copy, 'analytics')).toBeDefined()
    // The original keeps its own Links.
    expect(linked(lb, 'server')).toBeDefined()
  })

  test('a pasted Playbook can land anywhere, so it keeps only its own and shared Links', () => {
    const game = balanced()
    const playbook = capture(game, ['server'], 'Nodes')!
    const pasted = Result.getOrThrow(placePlaybook(game, playbook, 600, 400))
    const copy = pasted.ids.get('server')!
    expect(pasted.game.links.some((entry) => entry.from === copy && entry.to === 'database')).toBe(
      false,
    )
  })
})

test('a Playbook carries the data tier options, and a placed Cache keeps its strategy', () => {
  const hosted: Game = {
    ...source,
    researched: [...source.researched, 'retention', 'caching', 'cache-strategies'],
    nodes: [
      ...source.nodes.map((node) =>
        node.id === 'database' ? { ...node, keep: 'archive' as const } : node,
      ),
      {
        ...(source.nodes[1] as Game['nodes'][number]),
        id: 'c',
        type: 'cache',
        cacheStrategy: 'write-through' as const,
      },
    ],
  }
  const playbook = capture(hosted, [...ids, 'c'], 'Retained')
  if (!playbook) throw new Error('no playbook')
  const placed = Result.getOrThrow(placePlaybook(hosted, playbook, 440, 280))
  const database = placed.game.nodes.at(-2)
  const cache = placed.game.nodes.at(-1)
  expect(database?.keep).toBe('archive')
  expect(cache?.cacheStrategy).toBe('write-through')
})

describe('Service ownership', () => {
  test('a Node moves to a Service, shows up in its lists, and a duplicate keeps the owner', () => {
    const game = { ...preseedGame(3), cash: 100_000 }
    const split = {
      ...game,
      services: [...game.services, { ...game.services[0]!, id: 'billing', name: 'Billing' }],
    }
    const billing = split.services.find((service) => service.name === 'Billing')!
    const server = split.nodes.find((node) => node.type === 'server')!
    expect(serviceOfNode(split, server).id).toBe(split.services[0]!.id)
    const moved = Result.getOrThrow(assignService(split, server.id, billing.id))
    expect(nodesOfService(moved, billing.id).map((node) => node.id)).toEqual([server.id])
    expect(nodesOfService(moved, split.services[0]!.id)).not.toContain(
      moved.nodes.find((node) => node.id === server.id),
    )
    expect(Result.isFailure(assignService(moved, 'users', billing.id))).toBe(true)
    const copy = Result.getOrThrow(duplicate(moved, capture(moved, [server.id], 'x')!, 400, 400))
    const added = copy.game.nodes.filter((node) => !moved.nodes.some((n) => n.id === node.id))
    expect(added.every((node) => node.serviceId === billing.id)).toBe(true)
  })
})
