import { zoned } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { CARD_W, gap, heightOf, inPort, outPort, type Placed, type Pt } from '../geometry.ts'
import { routeLinks } from '../routing.ts'

export type LabNode = Placed & Readonly<{ id: string; group: string }>
export type LabLink = Readonly<{ from: string; to: string }>
export type Layout = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
) => ReadonlyMap<string, Pt>

export type Metrics = Readonly<{
  crossings: number
  hops: number
  back: number
  width: number
  height: number
  aspect: number
  straight: number
  wire: number
  detour: number
  overlaps: number
  moved: number
  still: number
}>

export const nodesOf = (game: Game): ReadonlyArray<LabNode> =>
  game.nodes.map((node) => ({ ...node, group: zoned(node) ? node.zone : 'all' }))

const orient = (a: Pt, b: Pt, c: Pt): number =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

const crosses = (a: Pt, b: Pt, c: Pt, d: Pt): boolean => {
  const o1 = orient(a, b, c)
  const o2 = orient(a, b, d)
  const o3 = orient(c, d, a)
  const o4 = orient(c, d, b)
  return o1 * o2 < 0 && o3 * o4 < 0
}

const overlaps = (boxes: ReadonlyArray<{ x: number; y: number; w: number; h: number }>): number => {
  let count = 0
  for (let i = 0; i < boxes.length; i += 1)
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]!
      const b = boxes[j]!
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) count += 1
    }
  return count
}

export const measure = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
  spots: ReadonlyMap<string, Pt>,
): Metrics => {
  const placed = nodes.map((node) => ({
    ...node,
    ...(spots.get(node.id) ?? { x: node.x, y: node.y }),
  }))
  const at = new Map(placed.map((node) => [node.id, node]))
  const edges = links.flatMap((link) => {
    const from = at.get(link.from)
    const to = at.get(link.to)
    return from && to ? [{ from, to, a: outPort(from), b: inPort(to) }] : []
  })
  let crossings = 0
  for (let i = 0; i < edges.length; i += 1)
    for (let j = i + 1; j < edges.length; j += 1) {
      const p = edges[i]!
      const q = edges[j]!
      if (p.from.id === q.from.id || p.to.id === q.to.id) continue
      if (crosses(p.a, p.b, q.a, q.b)) crossings += 1
    }
  const wires = [...routeLinks(placed, links).values()]
  const hops = wires.reduce((sum, wire) => sum + wire.tunnels.length, 0)
  const wire = wires.reduce(
    (sum, wire) =>
      sum +
      wire.path.slice(1).reduce((run, point, index) => run + gap(wire.path[index]!, point), 0),
    0,
  )
  const straight = edges.reduce((sum, edge) => sum + gap(edge.a, edge.b), 0)
  const back = links.filter((link) => {
    const from = at.get(link.from)
    const to = at.get(link.to)
    return from && to && to.x <= from.x
  }).length
  const xs = placed.map((node) => node.x)
  const ys = placed.map((node) => node.y)
  const width = Math.max(...placed.map((node) => node.x + CARD_W)) - Math.min(...xs)
  const height = Math.max(...placed.map((node) => node.y + heightOf(node.type))) - Math.min(...ys)
  return {
    crossings,
    hops,
    back,
    width: Math.round(width),
    height: Math.round(height),
    aspect: Math.round((width / height) * 100) / 100,
    straight: Math.round(straight),
    wire: Math.round(wire),
    detour: Math.round(wire - straight),
    overlaps: overlaps(
      placed.map((node) => ({ x: node.x, y: node.y, w: CARD_W, h: heightOf(node.type) })),
    ),
    moved: Math.round(
      placed.reduce((sum, node) => {
        const before = nodes.find((entry) => entry.id === node.id)!
        return sum + Math.hypot(node.x - before.x, node.y - before.y)
      }, 0) / placed.length,
    ),
    still: Math.round(
      (placed.filter((node) => {
        const before = nodes.find((entry) => entry.id === node.id)!
        return Math.hypot(node.x - before.x, node.y - before.y) < 24
      }).length /
        placed.length) *
        100,
    ),
  }
}
