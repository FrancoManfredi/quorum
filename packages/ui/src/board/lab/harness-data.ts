import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { COMPONENTS } from '@quorum/simulation/catalog'
import { zoned } from '@quorum/simulation/lookups'
import { heightOf, layoutOf, rowMid } from '../geometry.ts'
import { STRESS_LINKS, stressBoard } from '../stress.ts'
import { groupedLayout } from './groups.ts'
import { layout } from './pipeline.ts'
import { roleLayout } from './roles.ts'

const board = stressBoard()
const nodes = board.nodes.map((node) => ({
  ...node,
  group: zoned(node) ? node.zone : 'all',
}))
const spots = (layout: ReadonlyMap<string, { x: number; y: number }>) =>
  Object.fromEntries(
    [...layout].map(([id, spot]) => [id, { x: Math.round(spot.x), y: Math.round(spot.y) }]),
  )
const current = layout(nodes, STRESS_LINKS, ['all', 'a', 'b', 'c'], { name: 'current' })
const grouped = groupedLayout(nodes, STRESS_LINKS)
const roles = roleLayout(nodes, STRESS_LINKS)
const saved = existsSync('.amp/in/artifacts/tidy/user-layout.json')
  ? (JSON.parse(readFileSync('.amp/in/artifacts/tidy/user-layout.json', 'utf8'))
      .positions as Record<string, { x: number; y: number }>)
  : null
const data = {
  nodes: nodes.map((node) => ({
    id: node.id,
    type: node.type,
    name: COMPONENTS[node.type].name,
    group: COMPONENTS[node.type].group,
    zone: node.zone,
    width: 216,
    height: heightOf(node.type),
    outY: layoutOf(node.type).outRow === null ? null : rowMid(layoutOf(node.type).outRow ?? 0),
    inY: layoutOf(node.type).inRow === null ? null : rowMid(layoutOf(node.type).inRow ?? 0),
  })),
  links: STRESS_LINKS,
  layouts: {
    bot: spots(new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y }]))),
    current: spots(current),
    grouped: spots(grouped),
    roles: spots(roles),
    ...(saved ? { user: saved } : {}),
  },
}
writeFileSync('apps/web/public/harness/board.json', `${JSON.stringify(data, null, 2)}\n`)
console.log('nodes', data.nodes.length, 'links', data.links.length)
