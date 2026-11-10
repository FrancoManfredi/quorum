import { DOCK_OF, type ComponentId, type DockGroup } from '@quorum/simulation/catalog'
import { CARD_W, CLEARANCE, heightOf, type Pt } from '../geometry.ts'
import type { LabLink, LabNode } from './measure.ts'

/*
 * A grouped layout: every Component type is its own block (App Servers, Workers,
 * Queues, Caches, Databases, and so on). Blocks sit in flow lanes. The lane comes
 * from the dock group, then the actual links pull a Node forward or back: a Load
 * Balancer fed by App Servers and feeding Databases moves out of edge and into the
 * bridge lane between compute and data. Blocks in one lane are layered by the links
 * between them, so every block link runs left to right.
 */

const PAD = 16
const HEADER = 28
const BLOCK_GAP = CLEARANCE * 3
const LANE_GAP = CLEARANCE * 6
const PITCH = CARD_W + CLEARANCE * 3

const LANE_OF_DOCK: Record<DockGroup, number> = {
  edge: 0,
  compute: 1,
  messaging: 2,
  data: 3,
  managed: 3,
  platform: 1,
  insight: 1,
}

/** Flow lanes, left to right: edge, compute, bridge, data. */
const FLOW_LANES = [0, 1, 2, 3]

type Group = {
  key: string
  lane: number
  type: ComponentId
  nodes: Array<LabNode>
  depth: number
  spots: Map<string, Pt>
  width: number
  height: number
  x: number
  y: number
  column: number
}

export const groupedLayout = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
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
  const count = byId.length
  const parents: Array<Array<number>> = byId.map(() => [])
  const children: Array<Array<number>> = byId.map(() => [])
  for (const [from, to] of edges) {
    parents[to]!.push(from)
    children[from]!.push(to)
  }

  // Kahn order, with the unresolved tail appended so a cycle still gets a layout.
  const indegree = parents.map((list) => list.length)
  const queue = byId.flatMap((_, at) => (indegree[at] === 0 ? [at] : []))
  const sequence: Array<number> = []
  while (queue.length > 0) {
    const v = queue.shift()!
    sequence.push(v)
    for (const w of children[v]!) {
      indegree[w]! -= 1
      if (indegree[w] === 0) queue.push(w)
    }
  }
  for (let v = 0; v < count; v += 1) if (!sequence.includes(v)) sequence.push(v)

  const depth = byId.map(() => 0)
  for (const v of sequence)
    for (const u of parents[v]!) depth[v] = Math.max(depth[v]!, depth[u]! + 1)

  const defaultLane = byId.map((node) => LANE_OF_DOCK[DOCK_OF[node.type]])
  const lane = [...defaultLane]
  for (const v of sequence) {
    const parentLanes = parents[v]!.map((u) => lane[u]!)
    const childLanes = children[v]!.map((w) => defaultLane[w]!)
    const maxParent = parentLanes.length > 0 ? Math.max(...parentLanes) : -1
    const minChild = childLanes.length > 0 ? Math.min(...childLanes) : Number.POSITIVE_INFINITY
    let next = defaultLane[v]!
    if (next < maxParent)
      next = Math.min(
        maxParent + 1,
        minChild === Number.POSITIVE_INFINITY ? maxParent + 1 : minChild,
      )
    else if (next > minChild) next = Math.max(minChild - 1, maxParent)
    lane[v] = next
  }

  const groupsByKey = new Map<string, Group>()
  for (const [v, node] of byId.entries()) {
    const key = `${lane[v]}:${node.type}`
    const existing = groupsByKey.get(key)
    if (existing) {
      existing.nodes.push(node)
      existing.depth += depth[v]!
      continue
    }
    groupsByKey.set(key, {
      key,
      lane: lane[v]!,
      type: node.type,
      nodes: [node],
      depth: depth[v]!,
      spots: new Map(),
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      column: 0,
    })
  }
  const groups = [...groupsByKey.values()]
  for (const group of groups) {
    group.nodes.sort((p, q) => p.y - q.y || p.x - q.x)
    group.depth /= group.nodes.length
  }

  const groupKeyOf = new Map<number, string>()
  for (const [v, node] of byId.entries()) groupKeyOf.set(v, `${lane[v]}:${node.type}`)

  // Grid each type group as a near-square block. Four cards make a 2 × 2, nine make a 3 × 3.
  for (const group of groups) {
    const columns = Math.max(1, Math.ceil(Math.sqrt(group.nodes.length)))
    const rows = Math.ceil(group.nodes.length / columns)
    const heights = Array.from({ length: columns }, () => 0)
    for (const [at, node] of group.nodes.entries()) {
      const column = Math.floor(at / rows)
      const height = heightOf(node.type)
      group.spots.set(node.id, {
        x: PAD + column * PITCH,
        y: HEADER + (heights[column] ?? 0),
      })
      heights[column] = (heights[column] ?? 0) + height + CLEARANCE
    }
    group.width = PAD * 2 + (columns - 1) * PITCH + CARD_W
    group.height = HEADER + Math.max(...heights) - CLEARANCE + PAD
  }

  // Order groups inside a lane by the links between them, then by flow depth.
  const laneGroups = (flowLane: number): Array<Group> => {
    const members = groups.filter((group) => group.lane === flowLane)
    const at = new Map(members.map((group, position) => [group.key, position]))
    const outgoing = members.map(() => new Set<number>())
    const indegree = members.map(() => 0)
    for (const [from, to] of edges) {
      const a = at.get(groupKeyOf.get(from)!)
      const b = at.get(groupKeyOf.get(to)!)
      if (a === undefined || b === undefined || a === b) continue
      if (!outgoing[a]!.has(b)) {
        outgoing[a]!.add(b)
        indegree[b]! += 1
      }
    }
    const ready = members.flatMap((_, position) => (indegree[position] === 0 ? [position] : []))
    const ordered: Array<Group> = []
    const column = members.map(() => 0)
    while (ready.length > 0) {
      ready.sort(
        (p, q) =>
          members[p]!.depth - members[q]!.depth || members[p]!.key.localeCompare(members[q]!.key),
      )
      const position = ready.shift()!
      ordered.push(members[position]!)
      for (const next of outgoing[position]!) {
        column[next] = Math.max(column[next]!, column[position]! + 1)
        indegree[next]! -= 1
        if (indegree[next] === 0) ready.push(next)
      }
    }
    for (const [position, group] of members.entries()) {
      if (!ordered.includes(group)) ordered.push(group)
      group.column = column[position]!
    }
    return ordered
  }

  /** Packs a cluster's blocks into a near-square grid, so the cluster reads as one place. */
  const pack = (ordered: ReadonlyArray<Group>): { width: number; height: number } => {
    const area = ordered.reduce((sum, group) => sum + group.width * group.height, 0)
    const target = Math.max(2 * PITCH, Math.ceil(Math.sqrt(area * 1.2)))
    let x = 0
    let y = 0
    let rowHeight = 0
    let width = 0
    for (const group of [...ordered].sort((p, q) => p.column - q.column || p.depth - q.depth)) {
      if (x > 0 && x + group.width > target) {
        x = 0
        y += rowHeight + BLOCK_GAP
        rowHeight = 0
      }
      group.x = x
      group.y = y
      x += group.width + BLOCK_GAP
      rowHeight = Math.max(rowHeight, group.height)
      width = Math.max(width, x - BLOCK_GAP)
    }
    return { width, height: y + rowHeight }
  }

  const laneBoxes = new Map<number, { width: number; height: number }>()
  for (const flowLane of FLOW_LANES) {
    const ordered = laneGroups(flowLane)
    if (ordered.length === 0) continue
    laneBoxes.set(flowLane, pack(ordered))
  }

  const place = (groupsToPlace: ReadonlyArray<Group>, x: number, y: number) => {
    for (const group of groupsToPlace)
      for (const [id, spot] of group.spots)
        spots.set(id, { x: x + group.x + spot.x, y: y + group.y + spot.y })
  }

  let x = left
  for (const flowLane of FLOW_LANES) {
    const box = laneBoxes.get(flowLane)
    if (!box) continue
    place(laneGroups(flowLane), x, top)
    x += box.width + LANE_GAP
  }
  return spots
}
