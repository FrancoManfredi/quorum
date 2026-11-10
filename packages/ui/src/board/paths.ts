import { Graphics } from 'pixi.js'
import {
  gap,
  heightOf,
  inPort,
  outPort,
  route,
  type Placed,
  type Pt,
  type Route,
} from './geometry.ts'

/** A path's lengths and headings, measured once: `along[i]` is the length up to point i,
 *  and `ux[i]`, `uy[i]` the unit heading of the segment that ends there. */
type Arc = Readonly<{
  along: ReadonlyArray<number>
  ux: ReadonlyArray<number>
  uy: ReadonlyArray<number>
  total: number
}>

const arcs = new WeakMap<Route, Arc>()

export const arcOf = (path: Route): Arc => {
  const cached = arcs.get(path)
  if (cached) return cached
  const along = [0]
  const ux = [0]
  const uy = [0]
  for (let index = 1; index < path.length; index += 1) {
    const a = path[index - 1] as Pt
    const b = path[index] as Pt
    const span = gap(a, b)
    along.push((along[index - 1] as number) + span)
    ux.push(span > 0 ? (b.x - a.x) / span : 0)
    uy.push(span > 0 ? (b.y - a.y) / span : 0)
  }
  const arc = { along, ux, uy, total: along.at(-1) ?? 0 }
  arcs.set(path, arc)
  return arc
}

export const lengthOf = (path: Route): number => arcOf(path).total

/** The point `t` of the way along a path, by length. */
export const pointOn = (path: Route, t: number, length = lengthOf(path)): Pt => {
  const arc = arcOf(path)
  const left = length * t
  let low = 1
  let high = Math.max(1, path.length - 1)
  while (low < high) {
    const mid = (low + high) >> 1
    if ((arc.along[mid] as number) < left) low = mid + 1
    else high = mid
  }
  const a = path[low - 1]
  const b = path[low]
  if (!a || !b) return path[0] ?? { x: 0, y: 0 }
  const start = arc.along[low - 1] as number
  const span = (arc.along[low] as number) - start
  const k = span > 0 ? Math.max(0, Math.min(1, (left - start) / span)) : 0
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }
}

export const distanceTo = (path: Route, point: Pt): number => {
  let best = Number.POSITIVE_INFINITY
  for (let index = 1; index < path.length; index += 1) {
    const a = path[index - 1]
    const b = path[index]
    if (!a || !b) continue
    const span = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
    const k =
      span === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / span),
          )
    best = Math.min(best, gap({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }, point))
  }
  return best
}

/** The lane a backward link runs along, under both cards. */
export const laneUnder = (from: Placed, toBottom: number): number =>
  Math.max(from.y + heightOf(from.type), toBottom) + 18

export const routeOf = (from: Placed, to: Placed): Route =>
  route(outPort(from), inPort(to), laneUnder(from, to.y + heightOf(to.type)))

/** How far a card may be from where its links were routed before they take the quick route. */
export const SLACK = 32

/** A path with its start moved by `a` and its end by `b`, each shift fading out along its length. */
export const bent = (path: Route, a: Pt, b: Pt): Route => {
  const along = [0]
  for (let index = 1; index < path.length; index += 1)
    along.push((along[index - 1] as number) + gap(path[index - 1] as Pt, path[index] as Pt))
  const total = along.at(-1) || 1
  return path.map((point, index) => {
    const s = (along[index] as number) / total
    return { x: point.x + a.x * (1 - s) + b.x * s, y: point.y + a.y * (1 - s) + b.y * s }
  })
}

/** The first `t` of a path, by length. */
/** The middle of a path, measured once per path. */
const mids = new WeakMap<Route, Pt>()
export const midOf = (path: Route): Pt => {
  let mid = mids.get(path)
  if (!mid) {
    mid = pointOn(path, 0.5)
    mids.set(path, mid)
  }
  return mid
}

export const partOf = (path: Route, t: number): Route => {
  const out: Array<Pt> = []
  let left = lengthOf(path) * Math.max(0, Math.min(1, t))
  for (let index = 0; index < path.length; index += 1) {
    const point = path[index]
    const previous = path[index - 1]
    if (!point) continue
    if (!previous) {
      out.push(point)
      continue
    }
    const span = gap(previous, point)
    if (left >= span) {
      out.push(point)
      left -= span
      continue
    }
    const k = span > 0 ? left / span : 0
    out.push({
      x: previous.x + (point.x - previous.x) * k,
      y: previous.y + (point.y - previous.y) * k,
    })
    break
  }
  return out
}

export const traceOf = (graphics: Graphics, path: Route): Graphics => {
  const [first, ...rest] = path
  if (!first) return graphics
  graphics.moveTo(first.x, first.y)
  for (const point of rest) graphics.lineTo(point.x, point.y)
  return graphics
}

/** A dashed polyline: short segments with gaps, drawn into one Graphics path. */
export const dashed = (graphics: Graphics, path: Route, dash = 9, space = 6): Graphics => {
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index]
    const to = path[index + 1]
    if (!from || !to) continue
    const length = gap(from, to)
    if (length <= 0) continue
    const ux = (to.x - from.x) / length
    const uy = (to.y - from.y) / length
    for (let at = 0; at < length; at += dash + space) {
      const end = Math.min(at + dash, length)
      graphics.moveTo(from.x + ux * at, from.y + uy * at)
      graphics.lineTo(from.x + ux * end, from.y + uy * end)
    }
  }
  return graphics
}
