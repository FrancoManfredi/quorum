import { zoned } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { expect, test } from 'vitest'
import { boxOf, crowds, inPort, outPort } from './geometry.ts'
import type { RoutedLink } from './routing.ts'
import { BIG_LINKS, STRESS_LINKS, bigBoard, stressBoard } from './stress.ts'
import { tidy } from './tidy.ts'

const ORDER = ['all', 'a', 'b', 'c'] as const
const card = (id: string, type: 'cdn' | 'lb' | 'server', y: number) =>
  ({ id, type, x: 0, y, group: 'all' }) as const

const tidied = (game: Game, links: ReadonlyArray<RoutedLink>) => {
  const nodes = game.nodes.map((node) => ({ ...node, group: zoned(node) ? node.zone : 'all' }))
  const spots = tidy(nodes, links, ORDER)
  return new Map(nodes.map((node) => [node.id, { ...node, ...spots.get(node.id)! }]))
}

test('tidy reorders a column to remove a crossing the player left', () => {
  // The chain after b1 makes the board wider than 16:9, so no column is split.
  const tail = ['c', 'd', 'e', 'f']
  const nodes = [
    card('a1', 'server', 0),
    card('a2', 'server', 300),
    card('b1', 'server', 0),
    card('b2', 'server', 300),
    ...tail.map((id) => card(id, 'server', 0)),
  ]
  const spots = tidy(
    nodes,
    [
      { from: 'a1', to: 'b2' },
      { from: 'a2', to: 'b1' },
      ...['b1', ...tail].slice(0, -1).map((from, at) => ({ from, to: tail[at]! })),
    ],
    ['all'],
  )
  const y = (id: string) => spots.get(id)!.y
  const x = (id: string) => spots.get(id)!.x
  expect(x('a1')).toBe(x('a2'))
  expect(x('b1')).toBe(x('b2'))
  expect(y('a1') < y('a2')).toBe(y('b2') < y('b1'))
})

test('tidy spreads a tall fan-out over more columns, until the board is 16:9 or wider', () => {
  const fans = Array.from({ length: 8 }, (_, at) => `app${at}`)
  const nodes = [card('balancer', 'lb', 0), ...fans.map((id, at) => card(id, 'server', at * 240))]
  const links = fans.map((to) => ({ from: 'balancer', to }))
  const spots = tidy(nodes, links, ['all'])
  const boxes = nodes.map((node) => ({ ...node, ...spots.get(node.id)! })).map(boxOf)
  const width =
    Math.max(...boxes.map((box) => box.x + box.w)) - Math.min(...boxes.map((box) => box.x))
  const height =
    Math.max(...boxes.map((box) => box.y + box.h)) - Math.min(...boxes.map((box) => box.y))
  expect(width / height).toBeGreaterThanOrEqual(16 / 9)
  for (const to of fans) expect(spots.get(to)!.x).toBeGreaterThan(spots.get('balancer')!.x)
})

test('tidy lines up the ports of a chain, so each link runs straight', () => {
  const nodes = [card('edge', 'cdn', 400), card('balancer', 'lb', 0), card('app', 'server', 200)]
  const links = [
    { from: 'edge', to: 'balancer' },
    { from: 'balancer', to: 'app' },
  ]
  const spots = tidy(nodes, links, ['all'])
  const at = (id: string) => ({ ...nodes.find((node) => node.id === id)!, ...spots.get(id)! })
  for (const link of links) expect(outPort(at(link.from)).y).toBe(inPort(at(link.to)).y)
})

test('every stress board link runs left to right after tidy, across zone bands too', () => {
  const at = tidied(stressBoard(), STRESS_LINKS)
  for (const link of STRESS_LINKS) expect(at.get(link.to)!.x).toBeGreaterThan(at.get(link.from)!.x)
})

test('tidy keeps every card of the big board clear of the others', () => {
  const boxes = [...tidied(bigBoard(), BIG_LINKS).values()].map(boxOf)
  for (const [index, box] of boxes.entries())
    for (const other of boxes.slice(index + 1)) expect(crowds(box, other)).toBe(false)
})
