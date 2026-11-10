import { CARD_W, CLEARANCE, heightOf, type Pt } from '../geometry.ts'
import type { LabLink, LabNode } from './pipeline.ts'

/*
 * A force-directed control, Fruchterman–Reingold style: every pair of cards pushes
 * apart, every link pulls its ends together, and a cooling schedule settles it.
 * Cards are then pushed out of each other until none overlap. No columns, no ports,
 * no left-to-right rule: this is what "ignore the DAG" looks like on the same board.
 */
export const forceLayout = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
): ReadonlyMap<string, Pt> => {
  const count = nodes.length
  const spots = new Map<string, Pt>()
  if (count === 0) return spots
  const at = new Map(nodes.map((node, index) => [node.id, index]))
  const xs = nodes.map((node) => node.x + CARD_W / 2)
  const ys = nodes.map((node) => node.y + heightOf(node.type) / 2)
  const width = Math.max(...xs) - Math.min(...xs) + CARD_W
  const height = Math.max(...ys) - Math.min(...ys) + CARD_W
  const area = Math.max(width * height, count * CARD_W * 300)
  const k = Math.sqrt(area / count)
  const edges = links.flatMap((link) => {
    const from = at.get(link.from)
    const to = at.get(link.to)
    return from === undefined || to === undefined || from === to ? [] : [[from, to] as const]
  })
  const px = [...xs]
  const py = [...ys]
  const centreX = xs.reduce((sum, value) => sum + value, 0) / count
  const centreY = ys.reduce((sum, value) => sum + value, 0) / count
  const iterations = 300
  for (let step = 0; step < iterations; step += 1) {
    const temperature = (Math.sqrt(area) / 8) * (1 - step / iterations)
    const dx = Array.from({ length: count }, () => 0)
    const dy = Array.from({ length: count }, () => 0)
    for (let i = 0; i < count; i += 1)
      for (let j = i + 1; j < count; j += 1) {
        let ox = px[i]! - px[j]!
        let oy = py[i]! - py[j]!
        let distance = Math.hypot(ox, oy)
        if (distance < 0.01) {
          ox = (i % 7) - 3 + 0.1
          oy = (j % 7) - 3 + 0.1
          distance = Math.hypot(ox, oy)
        }
        const force = (k * k) / distance
        dx[i]! += (ox / distance) * force
        dy[i]! += (oy / distance) * force
        dx[j]! -= (ox / distance) * force
        dy[j]! -= (oy / distance) * force
      }
    for (const [from, to] of edges) {
      let ox = px[from]! - px[to]!
      let oy = py[from]! - py[to]!
      const distance = Math.max(Math.hypot(ox, oy), 0.01)
      const force = (distance * distance) / k
      dx[from]! -= (ox / distance) * force
      dy[from]! -= (oy / distance) * force
      dx[to]! += (ox / distance) * force
      dy[to]! += (oy / distance) * force
    }
    for (let i = 0; i < count; i += 1) {
      dx[i]! += (centreX - px[i]!) * 0.05
      dy[i]! += (centreY - py[i]!) * 0.05
    }
    for (let i = 0; i < count; i += 1) {
      const move = Math.hypot(dx[i]!, dy[i]!) || 1
      px[i]! += (dx[i]! / move) * Math.min(move, temperature)
      py[i]! += (dy[i]! / move) * Math.min(move, temperature)
    }
  }
  // Normalise to a sensible density: force layouts have no natural scale.
  const meanH = nodes.reduce((sum, node) => sum + heightOf(node.type), 0) / count
  const target = 2.5 * count * (CARD_W + 2 * CLEARANCE) * (meanH + 2 * CLEARANCE)
  const spanX = Math.max(...px) - Math.min(...px) + CARD_W
  const spanY = Math.max(...py) - Math.min(...py) + meanH
  const scale = Math.sqrt(target / (spanX * spanY))
  for (let i = 0; i < count; i += 1) {
    px[i] = (px[i]! - centreX) * scale + centreX
    py[i] = (py[i]! - centreY) * scale + centreY
  }
  // Push overlapping cards apart, along the axis that needs the smaller move.
  const boxes = nodes.map((node, index) => ({ h: heightOf(node.type), index, w: CARD_W }))
  for (let step = 0; step < 400; step += 1) {
    let moved = false
    for (let i = 0; i < count; i += 1)
      for (let j = i + 1; j < count; j += 1) {
        const a = boxes[i]!
        const b = boxes[j]!
        const ox = CARD_W + CLEARANCE - Math.abs(px[i]! - px[j]!)
        const oy = (a.h + b.h) / 2 + CLEARANCE - Math.abs(py[i]! - py[j]!)
        if (ox <= 0 || oy <= 0) continue
        moved = true
        if (ox < oy) {
          const push = (ox / 2) * (px[i]! < px[j]! ? -1 : 1)
          px[i]! += push
          px[j]! -= push
        } else {
          const push = (oy / 2) * (py[i]! < py[j]! ? -1 : 1)
          py[i]! += push
          py[j]! -= push
        }
      }
    if (!moved) break
  }
  const minX = Math.min(...px) - CARD_W / 2
  const minY = Math.min(...py.map((value, index) => value - heightOf(nodes[index]!.type) / 2))
  for (const [index, node] of nodes.entries())
    spots.set(node.id, {
      x: Math.round((px[index]! - CARD_W / 2 - minX) / 8) * 8,
      y: Math.round((py[index]! - heightOf(node.type) / 2 - minY) / 8) * 8,
    })
  return spots
}
