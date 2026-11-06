import { COMPONENTS, SIZES, ZONES, REGION_INFO, rttOf } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import { has, replacePrice, resizePrice, sizeLabel, zoned } from '@quorum/simulation/lookups'
import { isGlobal } from '@quorum/simulation/regions'
import type { Game, GameNode, Region } from '@quorum/simulation/state'
import { COMPONENT_VIEWS } from '../components/index.ts'
import { ms, priceLabel, rate } from '../game/format.ts'
import { layoutOf } from './geometry.ts'
import { POOLER_MODES } from '../components/pooler.ts'
import {
  FOOT_ICONS,
  ROW_ICONS,
  membersOf,
  outRate,
  pct,
  type Footer,
  type Row,
  type RowTone,
} from '../components/shared.ts'

export { FOOT_ICONS, POOLER_MODES, ROW_ICONS, membersOf, outRate, pct }
export type { Footer, Row, RowTone }

/* ==========================================================================
   What a Node card says: its rows, its header level, and its footer button,
   as plain data from the Game and the Ledger. The board paints them with
   Pixi; the wiki prints the same card as HTML. No renderer imports here.
   ========================================================================== */

/** What limits a Node, in the words a card has room for (15 "Node cards"). */
const limitText = (own: Ledger['nodes'][string]): string => {
  const { cpu, ram, slots, network } = own.resources
  const share = (gauge: { used: number; total: number } | null): string =>
    gauge !== null && gauge.total > 0 ? pct(gauge.used / gauge.total) : ''
  switch (own.limit) {
    case 'cpu':
      return `CPU ${share(cpu)}`
    case 'memory':
      return `RAM ${share(ram)}`
    case 'workers':
      return slots ? `Workers ${Math.round(slots.used)}/${Math.round(slots.total)}` : 'Workers'
    case 'network':
      return `Network ${share(network)}`
    case 'credits':
      return 'CPU credits'
    case 'connections':
      return own.connections
        ? `Connections ${own.connections.used}/${own.connections.max}`
        : 'Connections'
    case 'disk':
      return 'Disk IOPS'
    case 'throughput':
      return 'Throughput'
    default:
      return 'Nothing tight'
  }
}

/**
 * A Node's card rows. With `profiling`, a Limit row follows the Load row and names the resource
 * that limits the Node, such as `Workers 20/20` or `CPU 22%`.
 */
export const rowsOf = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  history: ReadonlyArray<number> = [],
): ReadonlyArray<Row> => {
  const rows = baseRowsOf(game, node, ledger, history)
  const own = ledger.nodes[node.id]
  if (!own || !has(game, 'profiling') || own.inbound <= 0 || own.limit === 'none') return rows
  const at = rows.findIndex((row) => row.glyph === 'load')
  if (at < 0) return rows
  const limit: Row = {
    glyph: 'limit',
    name: 'Limit',
    value: limitText(own),
    tone: own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
  }
  return [...rows.slice(0, at + 1), limit, ...rows.slice(at + 1)]
}

const baseRowsOf = (
  game: Game,
  node: GameNode,
  ledger: Ledger,
  history: ReadonlyArray<number> = [],
): ReadonlyArray<Row> => {
  const own = ledger.nodes[node.id]
  if (!own) return []
  const inbound: Row = {
    glyph: 'inbound',
    name: 'Inbound',
    value: `${rate(own.inbound)}/s`,
    tone: own.dropped > 0.05 ? 'danger' : 'plain',
  }
  const capacity: Row = {
    glyph: 'load',
    name: 'Load',
    value:
      own.inbound > 0
        ? `${pct(Math.min(own.utilization, 9.99))} of ${rate(own.capacity)}/s`
        : 'idle',
    tone: own.utilization >= 0.9 ? 'danger' : own.utilization >= 0.7 ? 'warn' : 'plain',
    bar: Math.min(own.utilization, 1),
    ...(has(game, 'metrics') && history.length > 1 ? { trend: history } : {}),
  }
  const latency: Row = {
    glyph: 'latency',
    name: 'Latency',
    value: has(game, 'percentiles') ? `${ms(own.latency)} · p99 ${ms(own.p99)}` : ms(own.latency),
  }
  const out: Row = {
    glyph: own.stranded > 0.01 ? 'stranded' : 'out',
    name: own.stranded > 0.01 ? 'Stranded' : 'Out',
    value: own.stranded > 0.01 ? `${rate(own.stranded)}/s` : `${rate(outRate(ledger, node.id))}/s`,
    tone: own.stranded > 0.01 ? 'danger' : 'plain',
  }
  return COMPONENT_VIEWS[node.type].rows({
    game,
    node,
    ledger,
    own,
    inbound,
    capacity,
    latency,
    out,
  })
}

/** A Node's size as pips: the current size of all sizes, or null for a Component without sizes. */
export const sizePips = (node: GameNode): Readonly<{ filled: number; total: number }> | null => {
  const def = COMPONENTS[node.type]
  if (def.sized) return { filled: node.size + 1, total: SIZES.length }
  return def.steps > 1 ? { filled: node.size, total: def.steps } : null
}

/** The header's right label, before the size pips: the copies, and the zone once zones are researched. */
export const levelOf = (game: Game, node: GameNode, region: Region | null = null): string => {
  const copies =
    `${node.replicas > 1 ? `×${node.replicas}` : ''}${node.pending > 0 ? ` +${node.pending}` : ''}`.trim()
  // A standby sits in the next zone over.
  const standby = ZONES[(ZONES.indexOf(node.zone) + 1) % ZONES.length] ?? ''
  const zone =
    has(game, 'multi-az') && zoned(node)
      ? `${node.zone.toUpperCase()}${node.standby ? `+${standby.toUpperCase()}` : ''}`
      : ''
  // A Node from another region shows where it is and the round trip to reach it.
  const remote =
    region !== null && node.region !== region && !isGlobal(node) && !node.spread
      ? `${REGION_INFO[node.region].short} ${rttOf(region, node.region)} ms`
      : node.spread && (node.type === 'wide' || node.type === 'dsql')
        ? 'Spread'
        : ''
  return [remote, zone, copies].filter(Boolean).join(' · ')
}

export const footerOf = (game: Game, node: GameNode): Footer | null => {
  if (!layoutOf(node.type).footer) return null
  const own = COMPONENT_VIEWS[node.type].footer
  if (own) return own(game, node)
  if (node.life._tag === 'Stopped') {
    const price = replacePrice(game, node)
    return {
      glyph: 'replace',
      text: `Replace  ${priceLabel(game.sandbox, price)}`.trim(),
      enabled: game.cash >= price,
      tone: 'danger',
    }
  }
  const price = resizePrice(game, node)
  if (price === null) return { glyph: 'max', text: 'Largest size', enabled: false, tone: 'muted' }
  const resize = COMPONENT_VIEWS[node.type].resize
  const label = priceLabel(game.sandbox, price)
  return {
    ...(resize
      ? resize(label)
      : { glyph: 'resize' as const, text: `${sizeLabel(node, node.size + 1)}  ${label}`.trim() }),
    enabled: game.cash >= price,
    tone: game.cash >= price ? 'accent' : 'muted',
  }
}
