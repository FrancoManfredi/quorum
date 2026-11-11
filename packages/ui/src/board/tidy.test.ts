import { zoned } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { expect, test } from 'vitest'
import { boxOf, crowds, heightOf } from './geometry.ts'
import type { RoutedLink } from './routing.ts'
import { BIG_LINKS, STRESS_LINKS, bigBoard, stressBoard } from './stress.ts'
import { tidy } from './tidy.ts'

const ORDER = ['all', 'a', 'b', 'c'] as const
const card = (
  id: string,
  type: 'cdn' | 'lb' | 'server' | 'queue' | 'worker' | 'pooler' | 'database' | 'ci',
  y: number,
  group = 'all',
) => ({ id, type, x: 0, y, group }) as const

const tidied = (game: Game, links: ReadonlyArray<RoutedLink>) => {
  const nodes = game.nodes.map((node) => ({ ...node, group: zoned(node) ? node.zone : 'all' }))
  const spots = tidy(nodes, links, ORDER)
  return new Map(nodes.map((node) => [node.id, { ...node, ...spots.get(node.id)! }]))
}

test('tidy puts entry left of compute and keeps one role in one column', () => {
  const nodes = [card('lb', 'lb', 0), card('a', 'server', 0), card('b', 'server', 300)]
  const spots = tidy(nodes, [], ['all'])
  const at = (id: string) => spots.get(id)!
  expect(at('lb').x).toBeLessThan(at('a').x)
  expect(at('a').x).toBe(at('b').x)
  expect(at('a').y).toBeLessThan(at('b').y)
})

test('tidy puts a Load Balancer by where its traffic goes', () => {
  const nodes = [
    card('front', 'lb', 0),
    card('s', 'server', 0),
    card('back', 'lb', 0),
    card('p', 'pooler', 0),
    card('d', 'database', 0),
  ]
  const links = [
    { from: 'front', to: 's' },
    { from: 's', to: 'back' },
    { from: 'back', to: 'p' },
    { from: 'p', to: 'd' },
  ]
  const spots = tidy(nodes, links, ['all'])
  const x = (id: string) => spots.get(id)!.x
  expect(x('front')).toBeLessThan(x('s'))
  expect(x('s')).toBeLessThan(x('back'))
  expect(x('back')).toBeLessThan(x('p'))
})

test('tidy puts a Node with no place in the flow in a strip below', () => {
  const nodes = [card('s', 'server', 0), card('w', 'worker', 0), card('ci', 'ci', 0)]
  const spots = tidy(nodes, [{ from: 's', to: 'w' }], ['all'])
  expect(spots.get('ci')!.y).toBeGreaterThan(spots.get('s')!.y + heightOf('server'))
})

test('tidy keeps Nodes from different zones in the same role column', () => {
  const nodes = [card('a', 'server', 0, 'a'), card('b', 'server', 300, 'b')]
  const spots = tidy(nodes, [], ORDER)
  expect(spots.get('a')!.x).toBe(spots.get('b')!.x)
})

test('tidy aligns a Queue with its Worker', () => {
  const nodes = [
    card('lb', 'lb', 0),
    card('s1', 'server', 0),
    card('s2', 'server', 300),
    card('q', 'queue', 0),
    card('w', 'worker', 0),
  ]
  const spots = tidy(
    nodes,
    [
      { from: 'lb', to: 's1' },
      { from: 's1', to: 'q' },
      { from: 'q', to: 'w' },
    ],
    ['all'],
  )
  const center = (id: string) => {
    const node = nodes.find((entry) => entry.id === id)!
    return spots.get(id)!.y + heightOf(node.type) / 2
  }
  expect(spots.get('q')!.x).toBeLessThan(spots.get('w')!.x)
  // Each spot rounds on its own, so the centres can differ by a pixel.
  expect(Math.abs(center('q') - center('w'))).toBeLessThanOrEqual(1)
})

test('tidy wraps a tall role column into sub-columns without overlaps', () => {
  const nodes = Array.from({ length: 30 }, (_, at) => card(`s${at}`, 'server', at * 200))
  const spots = tidy(nodes, [], ['all'])
  const xs = new Set([...spots.values()].map((spot) => spot.x))
  expect(xs.size).toBeGreaterThan(1)
  const boxes = nodes.map((node) => boxOf({ ...node, ...spots.get(node.id)! }))
  for (const [index, box] of boxes.entries())
    for (const other of boxes.slice(index + 1)) expect(crowds(box, other)).toBe(false)
})

test('tidy lays the stress board out in role columns', () => {
  const at = tidied(stressBoard(), STRESS_LINKS)
  expect(at.get('users')!.x).toBeLessThan(at.get('server')!.x)
  expect(at.get('server')!.x).toBeLessThan(at.get('n2')!.x)
  expect(at.get('n2')!.x).toBeLessThan(at.get('n12')!.x)
  expect(at.get('n12')!.x).toBeLessThan(at.get('n1')!.x)
  expect(at.get('n5')!.x).toBe(at.get('users')!.x)
  // Providers and Analytics sit right of the data, so no call runs backward.
  expect(at.get('n21')!.x).toBeGreaterThan(at.get('n1')!.x)
  expect(at.get('analytics')!.x).toBeGreaterThan(at.get('n21')!.x)
})

test('tidy keeps every card of the big board clear of the others', () => {
  const boxes = [...tidied(bigBoard(), BIG_LINKS).values()].map(boxOf)
  for (const [index, box] of boxes.entries())
    for (const other of boxes.slice(index + 1)) expect(crowds(box, other)).toBe(false)
})
