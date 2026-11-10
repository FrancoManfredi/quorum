import { COMPONENTS, COMPONENT_IDS, DOCK_OF } from '@quorum/simulation/catalog'
import { CARD_W, CLEARANCE, heightOf, layoutOf, rowMid, type Placed, type Pt } from '../geometry.ts'

/*
 * A copy of the Tidy pipeline that shipped before role columns, with the strategy
 * as a parameter, so variants can be compared on the same boards without any
 * other difference. `defaults` reproduces the old pipeline exactly.
 */

export type LabNode = Placed & Readonly<{ id: string; group: string }>
export type LabLink = Readonly<{ from: string; to: string }>

export type Variant = Readonly<{
  name: string
  /** Shown in the comparison table. */
  note?: string
  /** Column assignment: longest path, pull cards together, or keep the player's columns. */
  layering?: 'longest' | 'tight' | 'preserve'
  /** How a column that grows past the bound makes room: push one step, or fill the next. */
  packing?: 'push' | 'fill'
  /** Bands: global columns stacked, local columns shelf-packed, no bands, or semantic areas. */
  bands?: 'global' | 'local' | 'flat' | 'clusters' | 'clusters-columns'
  /** Order inside a column: median sweeps, or the player's order. */
  order?: 'median' | 'input'
  /** Rows: Brandes–Köpf straightening, or a plain stack. */
  rows?: 'bk' | 'stack'
  /** Height bound: trade height for columns, or keep the plain layered result. */
  bound?: 'aspect' | 'none'
  /** Stop at the first bound that meets the aspect, or keep the smallest board that does. */
  pick?: 'first' | 'minArea'
  /** Width over height the bound loop aims for, and how much it shrinks each step. */
  aspect?: number
  shrink?: number
  /** Space between clusters, in px. */
  clusterGap?: number
  /** Sweeps before the ordering settles, and idle sweeps before it gives up. */
  sweeps?: number
  patience?: number
  /** Initial order inside a column: the player's y, or a graph traversal. */
  initial?: 'input' | 'dfs' | 'bfs' | 'zone' | 'cluster' | 'type'
  /** Cluster names from the catalog, lanes pulled forward by links, or a bridge lane for misplaced edge Nodes. */
  lanes?: 'static' | 'dynamic' | 'bridge'
  /** Neighbour key: the median port row, or the mean. */
  key?: 'median' | 'mean'
}>

export const defaults: Variant = {
  name: 'current',
  layering: 'longest',
  packing: 'push',
  bands: 'global',
  order: 'median',
  rows: 'bk',
  bound: 'aspect',
  pick: 'first',
  sweeps: 24,
  patience: 4,
  initial: 'input',
  key: 'median',
}

const LANE_GAP = CLEARANCE / 2
const PITCH = CARD_W + CLEARANCE * 3
const MAX_SWEEPS = 24
const PATIENCE = 4
const ASPECT = 16 / 9

type Item = Readonly<{ id: string | null; col: number; h: number; start: number }>
type Hop = Readonly<{ a: number; b: number; offA: number; offB: number }>

type Band = Readonly<{ spots: ReadonlyMap<string, Pt>; width: number; height: number }>

export const layout = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
  order: ReadonlyArray<string>,
  variant: Variant = defaults,
): ReadonlyMap<string, Pt> => {
  const options = { ...defaults, ...variant }
  const spots = new Map<string, Pt>()
  if (nodes.length === 0) return spots
  const left = Math.min(...nodes.map((node) => node.x))
  const top = Math.min(...nodes.map((node) => node.y))
  const byId = nodes.toSorted((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const index = new Map(byId.map((node, at) => [node.id, at]))
  const LANE_NAMES = ['edge', 'compute', 'bridge', 'data'] as const
  const BRIDGE_NAMES = ['edge', 'compute', 'bridge', 'data', 'ops'] as const
  const LANE_OF_DOCK = {
    edge: 0,
    compute: 1,
    messaging: 2,
    data: 3,
    managed: 3,
    platform: 1,
    insight: 1,
  } as const
  const edges = links.flatMap((link) => {
    const from = index.get(link.from)
    const to = index.get(link.to)
    return from === undefined || to === undefined || from === to ? [] : [[from, to] as const]
  })

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
  const forward = edges.map(([from, to]) =>
    rank[from]! < rank[to]! ? ([from, to] as const) : ([to, from] as const),
  )

  const parents: Array<Array<number>> = byId.map(() => [])
  const children: Array<Array<number>> = byId.map(() => [])
  for (const [from, to] of forward) {
    parents[to]!.push(from)
    children[from]!.push(to)
  }
  const longest = (): Array<number> => {
    const depth = byId.map(() => 0)
    for (const v of sequence)
      for (const u of parents[v]!) depth[v] = Math.max(depth[v]!, depth[u]! + 1)
    return depth
  }

  /** Network-simplex lite: move each card to the median of its neighbours' ranks when it shortens links. */
  const tighten = (depth: Array<number>): Array<number> => {
    const col = [...depth]
    for (let round = 0; round < 60; round += 1) {
      let moved = false
      for (const v of sequence) {
        const low = parents[v]!.length > 0 ? Math.max(...parents[v]!.map((u) => col[u]! + 1)) : 0
        const high =
          children[v]!.length > 0 ? Math.min(...children[v]!.map((w) => col[w]! - 1)) : Infinity
        const wants = [
          ...parents[v]!.map((u) => col[u]! + 1),
          ...children[v]!.map((w) => col[w]! - 1),
        ].sort((p, q) => p - q)
        if (wants.length === 0) continue
        const mid = wants.length >> 1
        const median = wants.length % 2 === 1 ? wants[mid]! : (wants[mid - 1]! + wants[mid]!) / 2
        const next = Math.max(low, Math.min(high, Math.round(median)))
        if (next !== col[v] && Number.isFinite(next)) {
          col[v] = next
          moved = true
        }
      }
      if (!moved) break
    }
    return col
  }

  /** Keeps the player's columns: cards whose x ranges overlap are one column. */
  const preserve = (): Array<number> => {
    const parent = byId.map((_, at) => at)
    const find = (v: number): number => (parent[v] === v ? v : (parent[v] = find(parent[v]!)))
    for (let i = 0; i < n; i += 1)
      for (let j = i + 1; j < n; j += 1)
        if (Math.abs(byId[i]!.x - byId[j]!.x) < CARD_W / 2) parent[find(i)] = find(j)
    const roots = [...new Set(byId.map((_, at) => find(at)))]
    roots.sort(
      (p, q) =>
        Math.min(...byId.filter((_, at) => find(at) === p).map((node) => node.x)) -
        Math.min(...byId.filter((_, at) => find(at) === q).map((node) => node.x)),
    )
    const col = byId.map((_, at) => roots.indexOf(find(at)))
    // A kept column can still put a link backward; push the target one column right.
    let changed = true
    while (changed) {
      changed = false
      for (const [from, to] of forward)
        if (col[to]! <= col[from]!) {
          col[to] = col[from]! + 1
          changed = true
        }
    }
    return col
  }

  const depth =
    options.layering === 'preserve'
      ? preserve()
      : options.layering === 'tight'
        ? tighten(longest())
        : longest()

  const lane: Array<number> = byId.map(() => 0)
  if (options.lanes === 'bridge') {
    const groupLane = byId.map((node) =>
      COMPONENTS[node.type].group === 'edge'
        ? 0
        : COMPONENTS[node.type].group === 'compute'
          ? 1
          : COMPONENTS[node.type].group === 'data'
            ? 3
            : 4,
    )
    for (const v of sequence) {
      const parentLanes = parents[v]!.map((u) => lane[u]!)
      const maxParent = parentLanes.length > 0 ? Math.max(...parentLanes) : -1
      const childLanes = children[v]!.map((w) => groupLane[w]!)
      const minChild = childLanes.length > 0 ? Math.min(...childLanes) : Number.POSITIVE_INFINITY
      const own = groupLane[v]!
      lane[v] =
        own < maxParent ? (own === 0 && maxParent === 1 && minChild >= 3 ? 2 : maxParent) : own
    }
  }
  if (options.lanes === 'dynamic') {
    const fallback = byId.map((node) => LANE_OF_DOCK[DOCK_OF[node.type]])
    for (const v of sequence) {
      const parentLanes = parents[v]!.map((u) => lane[u]!)
      const childLanes = children[v]!.map((w) => fallback[w]!)
      const maxParent = parentLanes.length > 0 ? Math.max(...parentLanes) : -1
      const minChild = childLanes.length > 0 ? Math.min(...childLanes) : Number.POSITIVE_INFINITY
      let next: number = fallback[v]!
      if (next < maxParent)
        next = Math.min(
          maxParent + 1,
          minChild === Number.POSITIVE_INFINITY ? maxParent + 1 : minChild,
        )
      else if (next > minChild) next = Math.max(minChild - 1, maxParent)
      lane[v] = next
    }
  }
  const clusterName = byId.map((node, at) =>
    options.lanes === 'dynamic'
      ? LANE_NAMES[lane[at]!]!
      : options.lanes === 'bridge'
        ? BRIDGE_NAMES[lane[at]!]!
        : COMPONENTS[node.type].group,
  )
  const clusterOf = (_node: LabNode, at: number) => clusterName[at]!
  const CLUSTERS: ReadonlyArray<string> =
    options.lanes === 'dynamic'
      ? ['edge', 'compute', 'bridge', 'data']
      : options.lanes === 'bridge'
        ? ['edge', 'compute', 'bridge', 'data', 'ops']
        : ['edge', 'compute', 'data', 'ops']

  const discovery = byId.map(() => -1)
  let clock = 0
  const visit = (v: number) => {
    if (discovery[v]! >= 0) return
    discovery[v] = clock
    clock += 1
    for (const w of children[v]!) visit(w)
  }
  for (const v of sequence) if (parents[v]!.length === 0) visit(v)
  for (const v of sequence) visit(v)
  const breadth = byId.map(() => -1)
  let seen = 0
  const queue = sequence.filter((v) => parents[v]!.length === 0)
  while (queue.length > 0) {
    const v = queue.shift()!
    if (breadth[v]! >= 0) continue
    breadth[v] = seen
    seen += 1
    for (const w of children[v]!) if (breadth[w]! < 0) queue.push(w)
  }
  for (const v of sequence) if (breadth[v]! < 0) breadth[v] = seen++
  const zoneRank = byId.map((node) => order.indexOf(node.group))
  const clusterRank = byId.map((node, at) => CLUSTERS.indexOf(clusterOf(node, at)))
  const typeRank = byId.map((node) => COMPONENT_IDS.indexOf(node.type))

  const layoutBand = (
    members: ReadonlyArray<number>,
    col: ReadonlyArray<number>,
    normalize = false,
  ): Band => {
    const columnOf = (() => {
      if (!normalize) return (v: number) => col[v]!
      const used = [...new Set(members.map((v) => col[v]!))].sort((p, q) => p - q)
      const remap = new Map(used.map((column, at) => [column, at]))
      return (v: number) => remap.get(col[v]!)!
    })()
    const items: Array<Item> = []
    const itemOf = new Map<number, number>()
    const initialKey: Array<number> = []
    for (const v of members) {
      const node = byId[v]!
      itemOf.set(v, items.length)
      items.push({ id: node.id, col: columnOf(v), h: heightOf(node.type), start: node.y })
      initialKey.push(
        options.initial === 'bfs'
          ? breadth[v]!
          : options.initial === 'zone'
            ? zoneRank[v]! * (n + 1) + discovery[v]!
            : options.initial === 'cluster'
              ? clusterRank[v]! * (n + 1) + discovery[v]!
              : options.initial === 'type'
                ? typeRank[v]! * (n + 1) + discovery[v]!
                : discovery[v]!,
      )
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
      const span = columnOf(to) - columnOf(from)
      let previous = a
      let previousOff = offA
      for (let step = 1; step < span; step += 1) {
        const point = items.length
        items.push({
          id: null,
          col: columnOf(from) + step,
          h: 0,
          start: startA + ((startB - startA) * step) / span,
        })
        initialKey.push(
          Math.min(initialKey[itemOf.get(from)!] ?? 0, initialKey[itemOf.get(to)!] ?? 0),
        )
        hops.push({ a: previous, b: point, offA: previousOff, offB: 0 })
        previous = point
        previousOff = 0
      }
      hops.push({ a: previous, b, offA: previousOff, offB })
    }

    const columns = Math.max(...items.map((item) => item.col)) + 1
    let layers: Array<Array<number>> = Array.from({ length: columns }, () => [])
    for (const [at, item] of items.entries()) layers[item.col]!.push(at)
    for (const layer of layers)
      layer.sort((p, q) =>
        options.initial === 'input'
          ? items[p]!.start - items[q]!.start
          : initialKey[p]! - initialKey[q]!,
      )
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
      for (let c = 0; c + 1 < columns; c += 1) {
        const pairs = hops
          .filter((hop) => items[hop.a]!.col === c)
          .map((hop) => [slot[hop.a]!, slot[hop.b]!] as const)
          .sort((p, q) => p[0] - q[0] || p[1] - q[1])
        let first = 1
        while (first < current[c + 1]!.length) first *= 2
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
    if (options.order === 'median')
      for (
        let sweep = 0;
        sweep < (options.sweeps ?? MAX_SWEEPS) &&
        idle < (options.patience ?? PATIENCE) &&
        fewest > 0;
        sweep += 1
      ) {
        const rightward = sweep % 2 === 0
        for (let step = 1; step < columns; step += 1) {
          const c = rightward ? step : columns - 1 - step
          const layer = layers[c]!
          const key = new Map<number, number>()
          for (const item of layer) {
            const values = rightward
              ? into[item]!.map((hop) => tops[hop.a]! + hop.offA)
              : outOf[item]!.map((hop) => tops[hop.b]! + hop.offB)
            key.set(
              item,
              values.length === 0
                ? tops[item]! + items[item]!.h / 2
                : options.key === 'mean'
                  ? values.reduce((sum, value) => sum + value, 0) / values.length
                  : median(values),
            )
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

    const slot = items.map(() => 0)
    for (const layer of layers) for (const [k, item] of layer.entries()) slot[item] = k
    const inner = (hop: Hop) => items[hop.a]!.id === null && items[hop.b]!.id === null
    const conflicted = new Set<Hop>()
    for (let c = 0; c + 1 < columns; c += 1) {
      const here = hops.filter((hop) => items[hop.a]!.col === c)
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
      const after = new Map<number, Map<number, number>>()
      for (const layer of ordered.map(cardsOf))
        for (let k = 1; k < layer.length; k += 1) {
          const v = layer[k - 1]!
          const w = layer[k]!
          const weight = rel[v]! + items[v]!.h + CLEARANCE - rel[w]!
          const edgesAfter = after.get(root[v]!) ?? new Map<number, number>()
          edgesAfter.set(root[w]!, Math.max(edgesAfter.get(root[w]!) ?? -Infinity, weight))
          after.set(root[v]!, edgesAfter)
        }
      const roots = [...new Set(root)]
      const indegree = new Map(roots.map((r) => [r, 0]))
      for (const edgesAfter of after.values())
        for (const w of edgesAfter.keys()) indegree.set(w, indegree.get(w)! + 1)
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
      for (const r of topo.toReversed()) {
        const edgesAfter = after.get(r)
        if (!edgesAfter) continue
        const room = Math.min(...[...edgesAfter].map(([w, weight]) => at.get(w)! - weight))
        if (room > at.get(r)!) at.set(r, room)
      }
      return items.map((item, v) => {
        const top = at.get(root[v]!)! + rel[v]!
        return downward ? top : -(top + item.h)
      })
    }

    const cards = cardsOf(items.map((_, v) => v))
    let final: Array<number>
    if (options.rows === 'stack') {
      final = items.map(() => 0)
      for (const layer of layers.map(cardsOf)) {
        let at = 0
        for (const v of layer) {
          final[v] = at
          at += items[v]!.h + CLEARANCE
        }
      }
    } else {
      const runs = [
        assign(true, true),
        assign(true, false),
        assign(false, true),
        assign(false, false),
      ]
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
      final = items.map((_, v) => {
        const values = runs.map((run, at) => run[v]! + shifts[at]!).sort((p, q) => p - q)
        return Math.round((values[1]! + values[2]!) / 2)
      })
      for (const layer of layers.map(cardsOf))
        for (let k = 1; k < layer.length; k += 1) {
          const v = layer[k - 1]!
          const w = layer[k]!
          final[w] = Math.max(final[w]!, final[v]! + items[v]!.h + CLEARANCE)
        }
    }

    const highest = Math.min(...cards.map((v) => final[v]!))
    let lowest = highest
    const band = new Map<string, Pt>()
    let width = 0
    for (const v of cards) {
      const item = items[v]!
      lowest = Math.max(lowest, final[v]! + item.h)
      band.set(item.id!, { x: item.col * PITCH, y: final[v]! - highest })
      width = Math.max(width, item.col * PITCH + CARD_W)
    }
    return { spots: band, width, height: lowest - highest }
  }

  const groups =
    options.bands === 'clusters' || options.bands === 'clusters-columns'
      ? [...CLUSTERS]
      : options.bands === 'flat'
        ? [order.find((group) => byId.some((node) => node.group === group)) ?? order[0]!]
        : order
  const membersOf = (group: string) =>
    byId.flatMap((node, at) =>
      options.bands === 'clusters' || options.bands === 'clusters-columns'
        ? clusterOf(node, at) === group
          ? [at]
          : []
        : options.bands === 'flat' || node.group === group
          ? [at]
          : [],
    )

  /** Lays out every band with the given columns, and measures the result. */
  const place = (col: ReadonlyArray<number>) => {
    const spots = new Map<string, Pt>()
    let y = top
    let right = left
    const bands = groups.flatMap((group) => {
      const members = membersOf(group!)
      return members.length === 0 ? [] : [{ group: group!, members }]
    })
    if (options.bands === 'clusters-columns') {
      const laid = CLUSTERS.flatMap((cluster) => {
        const members = membersOf(cluster)
        if (members.length === 0) return []
        const low = Math.min(...members.map((v) => col[v]!))
        const local = byId.map((_, v) => col[v]! - low)
        return [{ cluster, band: layoutBand(members, local, true) }]
      })
      const columns: ReadonlyArray<ReadonlyArray<string>> =
        options.lanes === 'dynamic'
          ? [['edge'], ['compute'], ['bridge'], ['data']]
          : options.lanes === 'bridge'
            ? [['edge'], ['ops', 'compute'], ['bridge'], ['data']]
            : [['edge'], ['ops', 'compute'], ['data']]
      let x = left
      let tallest = 0
      for (const column of columns) {
        const entries = column.flatMap((cluster) =>
          laid.filter((entry) => entry.cluster === cluster),
        )
        if (entries.length === 0) continue
        let y = top
        let width = 0
        for (const entry of entries) {
          for (const [id, spot] of entry.band.spots) spots.set(id, { x: x + spot.x, y: y + spot.y })
          y += entry.band.height + CLEARANCE * 4
          width = Math.max(width, entry.band.width)
        }
        tallest = Math.max(tallest, y - CLEARANCE * 4 - top)
        x += width + (options.clusterGap ?? CLEARANCE * 6)
      }
      const low = Math.min(...[...spots.values()].map((spot) => spot.y))
      let high = low
      for (const [id, spot] of spots) {
        const node = byId[index.get(id)!]!
        high = Math.max(high, spot.y + heightOf(node.type))
      }
      for (const [id, spot] of spots) spots.set(id, { x: spot.x, y: spot.y - low + top })
      return {
        spots,
        width: x - (options.clusterGap ?? CLEARANCE * 6) - left,
        height: high - low,
      }
    }
    if (options.bands === 'local') {
      const laid = bands.map((band) => {
        const low = Math.min(...band.members.map((v) => col[v]!))
        const local = byId.map((_, v) => col[v]! - low)
        return { ...band, band: layoutBand(band.members, local, true) }
      })
      const total = laid.reduce((sum, entry) => sum + entry.band.width * entry.band.height, 0)
      const shelfWidth = Math.max(
        Math.max(...laid.map((entry) => entry.band.width)),
        Math.ceil(Math.sqrt(total * ASPECT)),
      )
      let x = left
      let shelfTop = top
      let shelfHeight = 0
      for (const entry of laid) {
        if (x > left && x + entry.band.width - left > shelfWidth) {
          shelfTop += shelfHeight + CLEARANCE * 4
          x = left
          shelfHeight = 0
        }
        for (const [id, spot] of entry.band.spots)
          spots.set(id, { x: x + spot.x, y: shelfTop + spot.y })
        x += entry.band.width + CLEARANCE * 4
        shelfHeight = Math.max(shelfHeight, entry.band.height)
        right = Math.max(right, x - CLEARANCE * 4)
      }
      y = shelfTop + shelfHeight + CLEARANCE * 4
      return { spots, width: right - left, height: y - CLEARANCE * 4 - top }
    }
    for (const band of bands) {
      const laid = layoutBand(band.members, col)
      for (const [id, spot] of laid.spots) spots.set(id, { x: left + spot.x, y: y + spot.y })
      right = Math.max(right, left + laid.width)
      y += laid.height + CLEARANCE * 4
    }
    return { spots, width: right - left, height: y - CLEARANCE * 4 - top }
  }

  /**
   * Height-bounded layering. `push` is the shipped rule: a card that overflows its column
   * moves one column right, then every card downstream follows. `fill` walks the graph in
   * topological order and drops each card into the first column at or after its parents
   * that still has room, which packs the spare height of later columns.
   */
  const bounded = (bound: number): Array<number> => {
    if (options.packing === 'fill') {
      const col = byId.map(() => 0)
      const used: Array<Array<number>> = groups.map(() => [])
      const bandOf = new Map<string, number>()
      for (const [at, group] of groups.entries()) bandOf.set(group!, at)
      const heights = byId.map((node) => heightOf(node.type))
      for (const v of sequence) {
        const at =
          options.bands === 'clusters' || options.bands === 'clusters-columns'
            ? (bandOf.get(clusterOf(byId[v]!, v)) ?? 0)
            : (bandOf.get(byId[v]!.group) ?? 0)
        let c = parents[v]!.length > 0 ? Math.max(...parents[v]!.map((u) => col[u]! + 1)) : 0
        const fits = (column: number): boolean => {
          const stack = used[at]!
          return (stack[column] ?? 0) + (stack[column] ? CLEARANCE : 0) + heights[v]! <= bound
        }
        while (!fits(c)) c += 1
        col[v] = c
        const stack = used[at]!
        stack[c] = (stack[c] ?? 0) + (stack[c] ? CLEARANCE : 0) + heights[v]!
      }
      return col
    }
    const col = [...depth]
    for (let at = 0; at <= Math.max(...col); at += 1) {
      for (const group of groups) {
        const stack = byId
          .flatMap((node, v) =>
            (options.bands === 'clusters' || options.bands === 'clusters-columns'
              ? clusterOf(node, at) === group
              : options.bands === 'flat' || node.group === group) && col[v] === at
              ? [v]
              : [],
          )
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

  const candidates = [place(depth)]
  const tallest = Math.max(...byId.map((node) => heightOf(node.type)))
  let bound = candidates[0]!.height
  while (
    options.bound === 'aspect' &&
    candidates.at(-1)!.width < (options.aspect ?? ASPECT) * candidates.at(-1)!.height &&
    bound > tallest
  ) {
    bound = Math.max(tallest, Math.floor(bound * (options.shrink ?? 0.85)))
    candidates.push(place(bounded(bound)))
  }
  const fits = candidates.filter(
    (entry) => entry.width >= (options.aspect ?? ASPECT) * entry.height,
  )
  const best =
    options.pick === 'minArea' && fits.length > 0
      ? fits.reduce((pick, entry) =>
          entry.width * entry.height < pick.width * pick.height ? entry : pick,
        )
      : candidates.at(-1)!
  for (const [id, spot] of best.spots) spots.set(id, spot)
  return spots
}
