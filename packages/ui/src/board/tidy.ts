import { CARD_W, CLEARANCE, heightOf, layoutOf, rowMid, type Placed, type Pt } from './geometry.ts'

/*
 * Tidy by zone, in the layered style of Sugiyama, Tagawa and Toda (1981):
 *
 * 1. Cycles. The greedy order of Eades, Lin and Smyth (1993) decides which
 *    links of a loop count as backward. Ties go by Node id, so the order of
 *    the Node list never changes the result.
 * 2. Columns. A card's column is the longest Link chain that reaches it. Every
 *    band uses the same columns, so a link between bands still runs left to right.
 * 3. Order. Inside each band, median sweeps (Eades and Wormald, 1994) on the
 *    port rows reorder each column. A link that skips columns gets a point in
 *    each column it passes. Crossings are counted with the accumulator tree of
 *    Barth, Mutzel and Jünger (2004). A sweep must remove a crossing to win, so
 *    a tie keeps the player's order.
 * 4. Rows. Each card lines up its port with its median neighbour's, so the
 *    link between them runs straight (Brandes and Köpf, 2001), in four
 *    directions that are then balanced. Blocks are packed by longest path on
 *    the block graph, as dagre does, not by the class shifts that the 2020
 *    erratum corrects.
 *
 * Bands stack top to bottom in `order`. The result stays anchored at the
 * top-left corner of the cards it replaces.
 */

/** Space between two link points in one column. */
const LANE_GAP = CLEARANCE / 2
/** Column pitch: a card and the channel beside it. */
const PITCH = CARD_W + CLEARANCE * 3
const MAX_SWEEPS = 24
const PATIENCE = 4
/** The narrowest board, width over height, before Tidy trades height for columns. */
const ASPECT = 16 / 9

/** A card, or the point where a link that skips columns crosses one. */
type Item = Readonly<{ id: string | null; col: number; h: number; start: number }>
/** One hop of a link between neighbouring columns, with each end's port row. */
type Hop = Readonly<{ a: number; b: number; offA: number; offB: number }>

export const tidy = <K extends string | number>(
  nodes: ReadonlyArray<Placed & Readonly<{ id: string; group: K }>>,
  links: ReadonlyArray<Readonly<{ from: string; to: string }>>,
  order: ReadonlyArray<K>,
): ReadonlyMap<string, Pt> => {
  const spots = new Map<string, Pt>()
  if (nodes.length === 0) return spots
  const left = Math.min(...nodes.map((node) => node.x))
  const top = Math.min(...nodes.map((node) => node.y))
  const byId = nodes.toSorted((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const index = new Map(byId.map((node, at) => [node.id, at]))
  const edges = links.flatMap((link) => {
    const from = index.get(link.from)
    const to = index.get(link.to)
    return from === undefined || to === undefined || from === to ? [] : [[from, to] as const]
  })

  /* ---------- 1. cycles ---------- */

  const n = byId.length
  const outs: Array<Array<number>> = byId.map(() => [])
  const ins: Array<Array<number>> = byId.map(() => [])
  for (const [from, to] of edges) {
    outs[from]!.push(to)
    ins[to]!.push(from)
  }
  const outDeg = outs.map((list) => list.length)
  const inDeg = ins.map((list) => list.length)
  const alive = byId.map(() => true)
  const head: Array<number> = []
  const tail: Array<number> = []
  const remove = (v: number) => {
    alive[v] = false
    for (const w of outs[v]!) inDeg[w]! -= 1
    for (const u of ins[v]!) outDeg[u]! -= 1
  }
  let remaining = n
  while (remaining > 0) {
    let changed = true
    while (changed) {
      changed = false
      for (let v = 0; v < n; v += 1)
        if (alive[v] && outDeg[v] === 0) {
          remove(v)
          tail.unshift(v)
          remaining -= 1
          changed = true
        }
      for (let v = 0; v < n; v += 1)
        if (alive[v] && inDeg[v] === 0) {
          remove(v)
          head.push(v)
          remaining -= 1
          changed = true
        }
    }
    if (remaining === 0) break
    let best = -1
    for (let v = 0; v < n; v += 1)
      if (alive[v] && (best < 0 || outDeg[v]! - inDeg[v]! > outDeg[best]! - inDeg[best]!)) best = v
    remove(best)
    head.push(best)
    remaining -= 1
  }
  const sequence = [...head, ...tail]
  const rank = byId.map(() => 0)
  for (const [at, v] of sequence.entries()) rank[v] = at
  /** Every link as [left end, right end]: a backward link is turned around. */
  const forward = edges.map(([from, to]) =>
    rank[from]! < rank[to]! ? ([from, to] as const) : ([to, from] as const),
  )

  /* ---------- 2. columns ---------- */

  const depth = byId.map(() => 0)
  const parents: Array<Array<number>> = byId.map(() => [])
  for (const [from, to] of forward) parents[to]!.push(from)
  for (const v of sequence)
    for (const u of parents[v]!) depth[v] = Math.max(depth[v]!, depth[u]! + 1)

  /* ---------- 3 and 4, band by band ---------- */

  /** Lays out every band with the given columns, and measures the result. */
  const place = (col: ReadonlyArray<number>) => {
    const spots = new Map<string, Pt>()
    let y = top
    let right = left
    for (const group of order) {
      const members = byId.flatMap((node, at) => (node.group === group ? [at] : []))
      if (members.length === 0) continue
      const items: Array<Item> = []
      const itemOf = new Map<number, number>()
      for (const v of members) {
        const node = byId[v]!
        itemOf.set(v, items.length)
        items.push({ id: node.id, col: col[v]!, h: heightOf(node.type), start: node.y })
      }
      const hops: Array<Hop> = []
      for (const [from, to] of forward) {
        const a = itemOf.get(from)
        const b = itemOf.get(to)
        if (a === undefined || b === undefined) continue
        const offA = rowMid(layoutOf(byId[from]!.type).outRow ?? 0)
        const offB = rowMid(layoutOf(byId[to]!.type).inRow ?? 0)
        const startA = byId[from]!.y + offA
        const startB = byId[to]!.y + offB
        const span = col[to]! - col[from]!
        let previous = a
        let previousOff = offA
        for (let step = 1; step < span; step += 1) {
          const point = items.length
          items.push({
            id: null,
            col: col[from]! + step,
            h: 0,
            start: startA + ((startB - startA) * step) / span,
          })
          hops.push({ a: previous, b: point, offA: previousOff, offB: 0 })
          previous = point
          previousOff = 0
        }
        hops.push({ a: previous, b, offA: previousOff, offB })
      }

      const columns = Math.max(...items.map((item) => item.col)) + 1
      let layers: Array<Array<number>> = Array.from({ length: columns }, () => [])
      for (const [at, item] of items.entries()) layers[item.col]!.push(at)
      for (const layer of layers) layer.sort((p, q) => items[p]!.start - items[q]!.start)
      const into: Array<Array<Hop>> = items.map(() => [])
      const outOf: Array<Array<Hop>> = items.map(() => [])
      for (const hop of hops) {
        outOf[hop.a]!.push(hop)
        into[hop.b]!.push(hop)
      }
      const cardsOf = (layer: ReadonlyArray<number>) =>
        layer.filter((item) => items[item]!.id !== null)
      const gapOf = (p: number, q: number) =>
        items[p]!.id === null && items[q]!.id === null ? LANE_GAP : CLEARANCE

      /* ----- 3. order ----- */

      const stacked = (layer: ReadonlyArray<number>, tops: Array<number>) => {
        let at = 0
        for (const [k, item] of layer.entries()) {
          if (k > 0) at += gapOf(layer[k - 1]!, item)
          tops[item] = at
          at += items[item]!.h
        }
      }
      const crossings = (current: ReadonlyArray<ReadonlyArray<number>>): number => {
        const slot = items.map(() => 0)
        for (const layer of current) for (const [k, item] of layer.entries()) slot[item] = k
        let total = 0
        for (let col = 0; col + 1 < columns; col += 1) {
          const pairs = hops
            .filter((hop) => items[hop.a]!.col === col)
            .map((hop) => [slot[hop.a]!, slot[hop.b]!] as const)
            .sort((p, q) => p[0] - q[0] || p[1] - q[1])
          let first = 1
          while (first < current[col + 1]!.length) first *= 2
          const tree = Array.from({ length: 2 * first - 1 }, () => 0)
          first -= 1
          for (const [, south] of pairs) {
            let at = south + first
            tree[at]! += 1
            while (at > 0) {
              if (at % 2 === 1) total += tree[at + 1]!
              at = (at - 1) >> 1
              tree[at]! += 1
            }
          }
        }
        return total
      }
      const median = (values: Array<number>): number => {
        values.sort((p, q) => p - q)
        const mid = values.length >> 1
        return values.length % 2 === 1 ? values[mid]! : (values[mid - 1]! + values[mid]!) / 2
      }
      const tops = items.map(() => 0)
      for (const layer of layers) stacked(layer, tops)
      let best = layers.map((layer) => [...layer])
      let fewest = crossings(layers)
      let idle = 0
      for (let sweep = 0; sweep < MAX_SWEEPS && idle < PATIENCE && fewest > 0; sweep += 1) {
        const rightward = sweep % 2 === 0
        for (let step = 1; step < columns; step += 1) {
          const col = rightward ? step : columns - 1 - step
          const layer = layers[col]!
          const key = new Map<number, number>()
          for (const item of layer) {
            const values = rightward
              ? into[item]!.map((hop) => tops[hop.a]! + hop.offA)
              : outOf[item]!.map((hop) => tops[hop.b]! + hop.offB)
            key.set(item, values.length > 0 ? median(values) : tops[item]! + items[item]!.h / 2)
          }
          layer.sort((p, q) => key.get(p)! - key.get(q)!)
          stacked(layer, tops)
        }
        const count = crossings(layers)
        if (count < fewest) {
          fewest = count
          best = layers.map((layer) => [...layer])
          idle = 0
        } else idle += 1
      }
      layers = best

      /* ----- 4. rows ----- */

      const slot = items.map(() => 0)
      for (const layer of layers) for (const [k, item] of layer.entries()) slot[item] = k
      const inner = (hop: Hop) => items[hop.a]!.id === null && items[hop.b]!.id === null
      const conflicted = new Set<Hop>()
      for (let col = 0; col + 1 < columns; col += 1) {
        const here = hops.filter((hop) => items[hop.a]!.col === col)
        for (const hop of here)
          if (!inner(hop))
            for (const other of here)
              if (
                inner(other) &&
                (slot[hop.a]! - slot[other.a]!) * (slot[hop.b]! - slot[other.b]!) < 0
              )
                conflicted.add(hop)
      }

      const assign = (rightward: boolean, downward: boolean): Array<number> => {
        const flip = (item: number, off: number) => (downward ? off : items[item]!.h - off)
        const seq = rightward ? layers : layers.toReversed()
        const ordered = seq.map((layer) => (downward ? layer : layer.toReversed()))
        const pos = items.map(() => 0)
        for (const layer of ordered) for (const [k, item] of layer.entries()) pos[item] = k
        const root = items.map((_, at) => at)
        const rel = items.map(() => 0)
        const taken = items.map(() => false)
        for (const layer of ordered.slice(1)) {
          let reach = -1
          for (const v of layer) {
            const near = (rightward ? into[v]! : outOf[v]!)
              .map((hop) =>
                rightward
                  ? { u: hop.a, offU: flip(hop.a, hop.offA), offV: flip(v, hop.offB), hop }
                  : { u: hop.b, offU: flip(hop.b, hop.offB), offV: flip(v, hop.offA), hop },
              )
              .sort((p, q) => pos[p.u]! - pos[q.u]!)
            if (near.length === 0) continue
            const mid = (near.length - 1) >> 1
            const picks = near.length % 2 === 1 ? [near[mid]!] : [near[mid]!, near[mid + 1]!]
            for (const pick of picks) {
              if (root[v] !== v || taken[pick.u] || conflicted.has(pick.hop)) continue
              if (pos[pick.u]! <= reach) continue
              taken[pick.u] = true
              root[v] = root[pick.u]!
              rel[v] = rel[pick.u]! + pick.offU - pick.offV
              reach = pos[pick.u]!
            }
          }
        }
        // Block graph: the card below must clear the one above it in every column. Link
        // points only steer the alignment and hold no space: the router finds the links a
        // way between the cards, and a link that skips columns would otherwise push each
        // column it passes down a step.
        const after = new Map<number, Map<number, number>>()
        for (const layer of ordered.map(cardsOf))
          for (let k = 1; k < layer.length; k += 1) {
            const v = layer[k - 1]!
            const w = layer[k]!
            const weight = rel[v]! + items[v]!.h + CLEARANCE - rel[w]!
            const edges = after.get(root[v]!) ?? new Map<number, number>()
            edges.set(root[w]!, Math.max(edges.get(root[w]!) ?? -Infinity, weight))
            after.set(root[v]!, edges)
          }
        const roots = [...new Set(root)]
        const indegree = new Map(roots.map((r) => [r, 0]))
        for (const edges of after.values())
          for (const w of edges.keys()) indegree.set(w, indegree.get(w)! + 1)
        const queue = roots.filter((r) => indegree.get(r) === 0)
        const topo: Array<number> = []
        while (queue.length > 0) {
          const r = queue.shift()!
          topo.push(r)
          for (const w of after.get(r)?.keys() ?? []) {
            indegree.set(w, indegree.get(w)! - 1)
            if (indegree.get(w) === 0) queue.push(w)
          }
        }
        const at = new Map(roots.map((r) => [r, 0]))
        for (const r of topo)
          for (const [w, weight] of after.get(r) ?? [])
            at.set(w, Math.max(at.get(w)!, at.get(r)! + weight))
        // Pull each block toward the blocks below it, closing gaps longest path leaves.
        for (const r of topo.toReversed()) {
          const edges = after.get(r)
          if (!edges) continue
          const room = Math.min(...[...edges].map(([w, weight]) => at.get(w)! - weight))
          if (room > at.get(r)!) at.set(r, room)
        }
        return items.map((item, v) => {
          const top = at.get(root[v]!)! + rel[v]!
          return downward ? top : -(top + item.h)
        })
      }

      const runs = [
        assign(true, true),
        assign(true, false),
        assign(false, true),
        assign(false, false),
      ]
      const cards = cardsOf(items.map((_, v) => v))
      const spans = runs.map((run) => ({
        min: Math.min(...cards.map((v) => run[v]!)),
        max: Math.max(...cards.map((v) => run[v]! + items[v]!.h)),
      }))
      const tightest = spans.reduce(
        (pick, span, at) => (span.max - span.min < spans[pick]!.max - spans[pick]!.min ? at : pick),
        0,
      )
      const shifts = spans.map((span, at) =>
        at % 2 === 0 ? spans[tightest]!.min - span.min : spans[tightest]!.max - span.max,
      )
      const final = items.map((_, v) => {
        const values = runs.map((run, at) => run[v]! + shifts[at]!).sort((p, q) => p - q)
        return Math.round((values[1]! + values[2]!) / 2)
      })
      for (const layer of layers.map(cardsOf))
        for (let k = 1; k < layer.length; k += 1) {
          const v = layer[k - 1]!
          const w = layer[k]!
          final[w] = Math.max(final[w]!, final[v]! + items[v]!.h + CLEARANCE)
        }

      const highest = Math.min(...cards.map((v) => final[v]!))
      let lowest = highest
      for (const v of cards) {
        const item = items[v]!
        lowest = Math.max(lowest, final[v]! + item.h)
        spots.set(item.id!, { x: left + item.col * PITCH, y: y + final[v]! - highest })
        right = Math.max(right, left + item.col * PITCH + CARD_W)
      }
      y += lowest - highest + CLEARANCE * 4
    }
    return { spots, width: right - left, height: y - CLEARANCE * 4 - top }
  }

  /* ---------- 5. height bound ---------- */

  const children: Array<Array<number>> = byId.map(() => [])
  for (const [from, to] of forward) children[from]!.push(to)
  /**
   * Width-bounded layering in the manner of Healy and Nikolov (2001), bounded by height: in
   * each band, a column that would grow past `bound` sends its overflow one column right, and
   * every card downstream moves along so its links still run forward. Cards that feed others
   * stay first, so a move pushes as few cards as it can.
   */
  const bounded = (bound: number): Array<number> => {
    const col = [...depth]
    for (let at = 0; at <= Math.max(...col); at += 1) {
      for (const group of order) {
        const stack = byId
          .flatMap((node, v) => (node.group === group && col[v] === at ? [v] : []))
          .sort(
            (p, q) =>
              Number(children[q]!.length > 0) - Number(children[p]!.length > 0) ||
              byId[p]!.y - byId[q]!.y,
          )
        let used = 0
        for (const v of stack) {
          const h = heightOf(byId[v]!.type)
          if (used > 0 && used + CLEARANCE + h > bound) col[v] = at + 1
          else used += (used > 0 ? CLEARANCE : 0) + h
        }
      }
      for (const v of sequence) for (const u of parents[v]!) col[v] = Math.max(col[v]!, col[u]! + 1)
    }
    return col
  }

  // Lower the bound until the board is at least as wide as a 16:9 screen, or a column holds
  // one card. Each step costs one layout, a few milliseconds on the big board.
  let best = place(depth)
  const tallest = Math.max(...byId.map((node) => heightOf(node.type)))
  let bound = best.height
  while (best.width < ASPECT * best.height && bound > tallest) {
    bound = Math.max(tallest, Math.floor(bound * 0.85))
    best = place(bounded(bound))
  }
  for (const [id, spot] of best.spots) spots.set(id, spot)
  return spots
}
