import { mkdirSync, writeFileSync } from 'node:fs'
import { COMPONENTS } from '@quorum/simulation/catalog'
import { CARD_W, heightOf, inPort, outPort } from '../geometry.ts'
import { BIG_LINKS, STRESS_LINKS, bigBoard, stressBoard } from '../stress.ts'
import { forceLayout } from './force.ts'
import { groupedLayout } from './groups.ts'
import { roleLayout } from './roles.ts'
import { measure, nodesOf, type Layout, type Metrics } from './measure.ts'
import { layout, type Variant } from './pipeline.ts'

const ORDER = ['all', 'a', 'b', 'c']
const OUT = new URL('./out/', import.meta.url)

type Entry = Readonly<{
  name: string
  note: string
  run: Layout
  mode?: 'cluster' | 'group' | 'both' | 'role' | undefined
}>

const variant = (options: Variant): Entry => ({
  name: options.name,
  note: options.note ?? '',
  run: (nodes, links) => layout(nodes, links, ORDER, options),
  mode:
    options.bands === 'clusters' || options.bands === 'clusters-columns' ? 'cluster' : undefined,
})

const entries: ReadonlyArray<Entry> = [
  {
    name: 'current',
    note: 'Tidy before role columns',
    run: (nodes, links) => layout(nodes, links, ORDER, { name: 'current' }),
  },
  variant({ name: 'unbounded', bound: 'none' }),
  variant({ name: 'local', bands: 'local' }),
  variant({ name: 'flat', bands: 'flat' }),
  variant({ name: 'flat-dfs', bands: 'flat', initial: 'dfs' }),
  variant({ name: 'flat-zone', bands: 'flat', initial: 'zone' }),
  variant({ name: 'clusters', bands: 'clusters' }),
  { ...variant({ name: 'clusters-columns', bands: 'clusters-columns' }), mode: 'both' },
  variant({ name: 'flat-cluster', bands: 'flat', initial: 'cluster' }),
  variant({ name: 'preserve', bands: 'flat', layering: 'preserve', order: 'input', bound: 'none' }),
  { name: 'grouped', note: 'type groups, dynamic lanes', run: groupedLayout, mode: 'group' },
  { name: 'roles', note: 'learned role columns', run: roleLayout, mode: 'role' },
  { name: 'force', note: 'Fruchterman–Reingold control', run: forceLayout },
]

const boards = [
  { name: 'stress', board: stressBoard(), links: STRESS_LINKS },
  { name: 'big', board: bigBoard(), links: BIG_LINKS },
] as const

const colours: Record<string, string> = { all: '#94a3b8', a: '#3b82f6', b: '#10b981', c: '#f59e0b' }
const clusterColours: Record<string, string> = {
  edge: '#64748b',
  compute: '#3b82f6',
  data: '#10b981',
  ops: '#f59e0b',
}

const svg = (
  title: string,
  nodes: ReadonlyArray<ReturnType<typeof nodesOf>[number]>,
  links: ReadonlyArray<{ from: string; to: string }>,
  spots: ReadonlyMap<string, { x: number; y: number }>,
  mode?: 'cluster' | 'group' | 'both' | 'role',
): string => {
  const placed = nodes.map((node) => ({ ...node, ...spots.get(node.id)! }))
  const at = new Map(placed.map((node) => [node.id, node]))
  const minX = Math.min(...placed.map((node) => node.x)) - 40
  const minY = Math.min(...placed.map((node) => node.y)) - 72
  const maxX = Math.max(...placed.map((node) => node.x + CARD_W)) + 32
  const maxY = Math.max(...placed.map((node) => node.y + heightOf(node.type))) + 32
  const wires = links.flatMap((link) => {
    const from = at.get(link.from)
    const to = at.get(link.to)
    if (!from || !to) return []
    const a = outPort(from)
    const b = inPort(to)
    const back = to.x <= from.x
    return [
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${back ? '#dc2626' : '#0f172a'}" stroke-opacity="${back ? 0.5 : 0.16}" stroke-width="1.5"/>`,
    ]
  })
  const backgrounds: Array<string> = []
  if (mode === 'group' || mode === 'both') {
    const byType = new Map<string, typeof placed>()
    for (const node of placed) {
      const members = byType.get(node.type) ?? []
      members.push(node)
      byType.set(node.type, members)
    }
    for (const [type, members] of byType) {
      const x0 = Math.min(...members.map((node) => node.x)) - 12
      const y0 = Math.min(...members.map((node) => node.y)) - 30
      const x1 = Math.max(...members.map((node) => node.x + CARD_W)) + 12
      const y1 = Math.max(...members.map((node) => node.y + heightOf(node.type))) + 12
      const colour = clusterColours[COMPONENTS[type as keyof typeof COMPONENTS].group] ?? '#94a3b8'
      backgrounds.push(
        `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="10" fill="${colour}" fill-opacity="0.05" stroke="${colour}" stroke-opacity="0.4" stroke-width="1.5"/><text x="${x0 + 8}" y="${y0 + 18}" font-family="ui-sans-serif,system-ui" font-size="12" font-weight="500" fill="${colour}">${COMPONENTS[type as keyof typeof COMPONENTS].name}</text>`,
      )
    }
  }
  if (mode === 'cluster' || mode === 'both') {
    for (const area of Object.keys(clusterColours)) {
      const members = placed.filter((node) => COMPONENTS[node.type].group === area)
      if (members.length === 0) continue
      const x0 = Math.min(...members.map((node) => node.x)) - 16
      const y0 = Math.min(...members.map((node) => node.y)) - 48
      const x1 = Math.max(...members.map((node) => node.x + CARD_W)) + 16
      const y1 = Math.max(...members.map((node) => node.y + heightOf(node.type))) + 16
      backgrounds.push(
        `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="16" fill="${clusterColours[area]}" fill-opacity="0.06" stroke="${clusterColours[area]}" stroke-opacity="0.25" stroke-width="1.5"/><text x="${x0 + 14}" y="${y0 + 28}" font-family="ui-sans-serif,system-ui" font-size="16" font-weight="500" fill="${clusterColours[area]}">${area}</text>`,
      )
    }
  }
  const cards = placed.map((node) => {
    const h = heightOf(node.type)
    const colour =
      mode === 'cluster' || mode === 'group' || mode === 'both' || mode === 'role'
        ? (clusterColours[COMPONENTS[node.type].group] ?? '#94a3b8')
        : (colours[node.group] ?? '#94a3b8')
    return `<g><rect x="${node.x}" y="${node.y}" width="${CARD_W}" height="${h}" rx="8" fill="${colour}" fill-opacity="0.22" stroke="${colour}" stroke-width="1.5"/><text x="${node.x + 10}" y="${node.y + 20}" font-family="ui-sans-serif,system-ui" font-size="13" fill="#0f172a">${node.id}</text><text x="${node.x + 10}" y="${node.y + 36}" font-family="ui-sans-serif,system-ui" font-size="11" fill="#475569">${node.type}</text></g>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}" role="img" aria-label="${title}">
<title>${title}</title>
<rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="#ffffff"/>
${backgrounds.join('\n')}
${wires.join('\n')}
${cards.join('\n')}
</svg>`
}

mkdirSync(OUT, { recursive: true })
const results: Array<{
  board: string
  algorithm: string
  note: string
  metrics: Metrics
  ms: number
}> = []

for (const { name: boardName, board, links } of boards) {
  const nodes = nodesOf(board)
  for (const entry of entries) {
    const spots = entry.run(nodes, links)
    const metrics = measure(nodes, links, spots)
    const samples = entry.name === 'force' ? 1 : 5
    const start = performance.now()
    for (let index = 0; index < samples; index += 1) entry.run(nodes, links)
    const ms = Math.round(((performance.now() - start) / samples) * 10) / 10
    results.push({ board: boardName, algorithm: entry.name, note: entry.note, metrics, ms })
    writeFileSync(
      new URL(`${boardName}-${entry.name}.svg`, OUT),
      svg(`${boardName} — ${entry.name}`, nodes, links, spots, entry.mode),
    )
    console.log(
      `${boardName.padEnd(7)} ${entry.name.padEnd(15)} crossings ${String(metrics.crossings).padStart(5)}  hops ${String(metrics.hops).padStart(5)}  back ${String(metrics.back).padStart(3)}  ${metrics.width}×${metrics.height} (${metrics.aspect})  detour ${metrics.detour}  moved ${metrics.moved} (${metrics.still}% still)  ${ms} ms`,
    )
  }
}

writeFileSync(new URL('metrics.json', OUT), `${JSON.stringify(results, null, 2)}\n`)
