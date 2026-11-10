import { COMPONENTS, type ComponentId } from '@quorum/simulation/catalog'
import { CARD_W, CLEARANCE, heightOf, type Placed, type Pt } from './geometry.ts'

/*
 * Tidy by role column.
 *
 * The board is five columns, left to right:
 *
 *   0. entry and external providers: Users, edge, LLM, PSP, Search
 *   1. compute and its watchers: App Servers, Analytics, Payments, Autoscalers
 *   2. queue and middle data: Queue, Pooler, Storage, the Replicas that fill it
 *   3. workers and cache: Worker, Cache, the Replicas that fill it, the Worker's Autoscaler
 *   4. database and warehouse: Database, Warehouse, the Replicas that fill it
 *
 * A Node's column comes from its role. Entry follows the inbound path, top to
 * bottom: Users, DNS, CDN, WAF, API Gateway, Load Balancer. External providers
 * follow in name order. A Replica fills the shortest data column. An Autoscaler
 * sits with the Node it scales. An external provider stays in column 0 even when
 * compute calls it, which is why some of its links run backward.
 *
 * After the columns are placed, Tidy pulls each card toward the Nodes it talks
 * to, without changing the column order. A hub counts once per neighbor, so
 * Analytics does not drag the whole board. This is what aligns the Queue with
 * its Workers and the Pooler with its Database.
 *
 * A column taller than MAX_HEIGHT wraps into sub-columns, so a late board with
 * many App Servers or Databases stays compact instead of running off screen.
 */

type Role =
  | 'entry'
  | 'external'
  | 'observability'
  | 'control'
  | 'compute'
  | 'queue'
  | 'middle'
  | 'worker'
  | 'cache'
  | 'replica'
  | 'database'
  | 'warehouse'

const ROLE: Record<ComponentId, Role> = {
  users: 'entry',
  dns: 'entry',
  lb: 'entry',
  cdn: 'entry',
  waf: 'entry',
  gw: 'entry',
  server: 'compute',
  worker: 'worker',
  fn: 'compute',
  cluster: 'compute',
  gpu: 'compute',
  edge: 'compute',
  database: 'database',
  pooler: 'middle',
  cache: 'cache',
  replica: 'replica',
  search: 'external',
  storage: 'middle',
  doc: 'middle',
  warehouse: 'warehouse',
  vec: 'database',
  wide: 'database',
  dsql: 'database',
  queue: 'queue',
  log: 'queue',
  cdc: 'queue',
  ws: 'queue',
  autoscaler: 'control',
  ci: 'control',
  mesh: 'control',
  ff: 'control',
  pki: 'control',
  analytics: 'observability',
  payments: 'observability',
  auth: 'external',
  psp: 'external',
  llm: 'external',
  msgp: 'external',
}

const COLUMN: Record<Role, number> = {
  entry: 0,
  external: 0,
  observability: 1,
  control: 1,
  compute: 1,
  queue: 2,
  middle: 2,
  worker: 3,
  cache: 3,
  replica: 4,
  database: 4,
  warehouse: 4,
}

/** The vertical order inside each column. */
const RANK: ReadonlyArray<Partial<Record<Role, number>>> = [
  { entry: 0, external: 1 },
  { observability: 0, control: 1, compute: 2 },
  { queue: 0, replica: 1, middle: 2 },
  { control: 0, worker: 1, replica: 2, cache: 3 },
  { replica: 0, database: 1, warehouse: 2 },
]

/** The inbound path, top to bottom. External providers follow it in name order. */
const ENTRY_ORDER: ReadonlyArray<ComponentId> = ['users', 'dns', 'cdn', 'waf', 'gw', 'lb']

/** The tallest a column may get before it wraps into another sub-column. */
const MAX_HEIGHT = 3000

export type TidyOptions = Readonly<{
  /** Space between two cards in a column. */
  clearance?: number
  /** The height at which a column wraps. */
  maxHeight?: number
}>

type TidyNode<K extends string | number> = Placed & Readonly<{ id: string; group: K }>
type TidyLink = Readonly<{ from: string; to: string }>

/** The closest nondecreasing sequence to `targets`, given the minimum gap at each step. */
const pava = (
  targets: ReadonlyArray<number>,
  gaps: ReadonlyArray<number>,
): ReadonlyArray<number> => {
  const offset = [0]
  for (let index = 1; index < targets.length; index += 1)
    offset.push(offset[index - 1]! + gaps[index]!)
  const values = targets.map((target, index) => target - offset[index]!)
  const blocks: Array<{ sum: number; count: number }> = []
  for (const value of values) {
    blocks.push({ sum: value, count: 1 })
    while (blocks.length > 1) {
      const last = blocks[blocks.length - 1]!
      const before = blocks[blocks.length - 2]!
      if (before.sum / before.count <= last.sum / last.count) break
      blocks.splice(-2, 2, {
        sum: before.sum + last.sum,
        count: before.count + last.count,
      })
    }
  }
  const fitted: Array<number> = []
  for (const block of blocks)
    for (let index = 0; index < block.count; index += 1) fitted.push(block.sum / block.count)
  return fitted.map((value, index) => value + offset[index]!)
}

/*
 * Pull each card toward the Nodes it talks to, without changing column order.
 * A hub counts once per neighbor, so Analytics does not drag the whole board.
 */
const alignColumns = <K extends string | number>(
  nodes: ReadonlyArray<TidyNode<K>>,
  links: ReadonlyArray<TidyLink>,
  spots: ReadonlyMap<string, Pt>,
  clearance: number,
): ReadonlyMap<string, Pt> => {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const columns = new Map<number, Array<string>>()
  for (const node of nodes) {
    const x = spots.get(node.id)!.x
    columns.set(x, [...(columns.get(x) ?? []), node.id])
  }
  for (const ids of columns.values()) ids.sort((p, q) => spots.get(p)!.y - spots.get(q)!.y)
  const positions = new Map([...spots].map(([id, point]) => [id, { ...point }]))
  const centerOf = (id: string) => positions.get(id)!.y + heightOf(byId.get(id)!.type) / 2
  const neighbours = new Map<string, Array<string>>()
  for (const link of links) {
    neighbours.set(link.from, [...(neighbours.get(link.from) ?? []), link.to])
    neighbours.set(link.to, [...(neighbours.get(link.to) ?? []), link.from])
  }
  const degree = (id: string) => neighbours.get(id)?.length ?? 1
  const mean = () => nodes.reduce((sum, node) => sum + centerOf(node.id), 0) / nodes.length
  const initialMean = mean()
  for (let iteration = 0; iteration < 5; iteration += 1) {
    for (const ids of columns.values()) {
      const targets = ids.map((id) => {
        const near = neighbours.get(id) ?? []
        if (near.length === 0) return centerOf(id)
        let sum = 0
        let weight = 0
        for (const other of near) {
          const share = 1 / degree(other)
          sum += centerOf(other) * share
          weight += share
        }
        return centerOf(id) + (sum / weight - centerOf(id)) * 0.3
      })
      const gaps = ids.map((id, index) =>
        index === 0
          ? 0
          : (heightOf(byId.get(ids[index - 1]!)!.type) + heightOf(byId.get(id)!.type)) / 2 +
            clearance,
      )
      const centers = pava(targets, gaps)
      ids.forEach((id, index) => {
        positions.get(id)!.y = centers[index]! - heightOf(byId.get(id)!.type) / 2
      })
    }
    const shift = initialMean - mean()
    for (const point of positions.values()) point.y += shift
  }
  return positions
}

export const tidy = <K extends string | number>(
  nodes: ReadonlyArray<TidyNode<K>>,
  links: ReadonlyArray<TidyLink>,
  order: ReadonlyArray<K>,
  options: TidyOptions = {},
): ReadonlyMap<string, Pt> => {
  const spots = new Map<string, Pt>()
  if (nodes.length === 0) return spots
  const clearance = options.clearance ?? CLEARANCE
  const maxHeight = options.maxHeight ?? MAX_HEIGHT
  const pitch = CARD_W + clearance * 6
  const left = Math.min(...nodes.map((node) => node.x))
  const top = Math.min(...nodes.map((node) => node.y))
  const byId = nodes.toSorted((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const index = new Map(byId.map((node, at) => [node.id, at]))
  const parents: Array<Array<number>> = byId.map(() => [])
  const children: Array<Array<number>> = byId.map(() => [])
  for (const link of links) {
    const from = index.get(link.from)
    const to = index.get(link.to)
    if (from === undefined || to === undefined || from === to) continue
    parents[to]!.push(from)
    children[from]!.push(to)
  }

  const columnOf = byId.map((node) => COLUMN[ROLE[node.type]])
  const roleOf = byId.map((node) => ROLE[node.type])
  const zoneRank = new Map(order.map((group, at) => [group, at]))

  // A Replica fills the shortest data column. When a link names a data parent,
  // it sits with that parent instead.
  const dataColumns = [2, 3, 4]
  const heights = new Map(dataColumns.map((column) => [column, 0]))
  for (const [at, node] of byId.entries())
    if (ROLE[node.type] !== 'replica') {
      const column = columnOf[at]!
      if (heights.has(column))
        heights.set(column, heights.get(column)! + heightOf(node.type) + clearance)
    }
  const replicas = byId
    .flatMap((node, at) => (ROLE[node.type] === 'replica' ? [at] : []))
    .sort((p, q) => byId[p]!.y - byId[q]!.y || byId[p]!.id.localeCompare(byId[q]!.id))
  for (const at of replicas) {
    const parent = parents[at]!.map((indexAt) => byId[indexAt]!)
    const source =
      parent.find((entry) => ['database', 'wide', 'dsql', 'vec'].includes(entry.type)) ??
      parent.find((entry) => entry.type === 'cache') ??
      parent.find((entry) => ['pooler', 'storage', 'doc'].includes(entry.type))
    const preferred = source ? COLUMN[ROLE[source.type]] : null
    const column =
      preferred !== null && heights.has(preferred)
        ? preferred
        : [...heights.entries()].sort((p, q) => p[1] - q[1] || p[0] - q[0])[0]![0]
    columnOf[at] = column
    heights.set(column, heights.get(column)! + heightOf(byId[at]!.type) + clearance)
  }

  // An Autoscaler sits with the Node it scales.
  for (const [at, node] of byId.entries()) {
    if (ROLE[node.type] !== 'control' || node.type !== 'autoscaler') continue
    const near = [...parents[at]!, ...children[at]!]
      .map((indexAt) => byId[indexAt]!)
      .find((entry) => ['server', 'worker', 'cluster', 'gpu'].includes(entry.type))
    if (near) {
      columnOf[at] = COLUMN[ROLE[near.type]]
      roleOf[at] = 'control'
    }
  }

  const columns = new Map<number, Array<number>>()
  for (const [at] of byId.entries()) {
    const column = columnOf[at]!
    const members = columns.get(column) ?? []
    members.push(at)
    columns.set(column, members)
  }

  let columnX = left
  for (const [column, members] of [...columns].sort((p, q) => p[0] - q[0])) {
    members.sort((p, q) => {
      const rankP = RANK[column]?.[roleOf[p]!] ?? 5
      const rankQ = RANK[column]?.[roleOf[q]!] ?? 5
      if (rankP !== rankQ) return rankP - rankQ
      if (column === 0 && roleOf[p] === 'entry' && roleOf[q] === 'entry')
        return ENTRY_ORDER.indexOf(byId[p]!.type) - ENTRY_ORDER.indexOf(byId[q]!.type)
      if (column === 0 && roleOf[p] === 'external' && roleOf[q] === 'external')
        return COMPONENTS[byId[p]!.type].name.localeCompare(COMPONENTS[byId[q]!.type].name)
      return (
        byId[p]!.y - byId[q]!.y ||
        byId[p]!.x - byId[q]!.x ||
        (zoneRank.get(byId[p]!.group) ?? order.length) -
          (zoneRank.get(byId[q]!.group) ?? order.length)
      )
    })
    // A column taller than the cap wraps into sub-columns, so a late board with
    // many App Servers or Databases stays compact instead of running off screen.
    const subColumns: Array<Array<number>> = []
    let current: Array<number> = []
    let height = 0
    for (const at of members) {
      const card = heightOf(byId[at]!.type)
      const needed = height + (current.length === 0 ? 0 : clearance) + card
      if (current.length > 0 && needed > maxHeight) {
        subColumns.push(current)
        current = []
        height = 0
      }
      height += (current.length === 0 ? 0 : clearance) + card
      current.push(at)
    }
    if (current.length > 0) subColumns.push(current)
    subColumns.forEach((subColumn, subIndex) => {
      let y = top
      for (const at of subColumn) {
        const node = byId[at]!
        spots.set(node.id, { x: columnX + subIndex * pitch, y })
        y += heightOf(node.type) + clearance
      }
    })
    columnX += subColumns.length * pitch
  }
  const aligned = alignColumns(nodes, links, spots, clearance)
  return new Map(
    [...aligned].map(([id, point]) => [id, { x: Math.round(point.x), y: Math.round(point.y) }]),
  )
}
