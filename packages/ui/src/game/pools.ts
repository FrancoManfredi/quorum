import {
  Bell,
  BookOpen,
  Bot,
  ChartColumn,
  Clapperboard,
  FileText,
  Flame,
  Gavel,
  type IconNode,
  KeyRound,
  Package,
  PenLine,
  Radio,
  Rss,
  Search,
  ShoppingCart,
  Sparkles,
  Upload,
  Webhook,
} from 'lucide'
import {
  FEATURES,
  INSIGHT_POOLS,
  POOLS,
  RECIPE,
  VENDOR_DISCOUNT,
  type InsightPool,
  type ResearchId,
  type StudyShapeKind,
} from '@quorum/simulation/catalog'
import { StudyStall } from '@quorum/simulation/studies'

/*
 * Insight pools as the player sees them (15 "Insight pools"): each has its own
 * shape, so pools differ without colour, and its request kind's particle colour.
 */

export const POOL_ICONS: Record<InsightPool, IconNode> = {
  page: FileText,
  read: BookOpen,
  write: PenLine,
  login: KeyRound,
  search: Search,
  upload: Upload,
  bot: Bot,
  media: Clapperboard,
  rt: Radio,
  buy: ShoppingCart,
  job: Package,
  report: ChartColumn,
  ai: Sparkles,
  feed: Rss,
  hook: Webhook,
  push: Bell,
  bid: Gavel,
  failure: Flame,
}

export const poolColor = (pool: InsightPool): string =>
  `#${POOLS[pool].color.toString(16).padStart(6, '0')}`

/** The pool's accessible name, such as "Checkout Insight". */
export const poolName = (pool: InsightPool): string => `${POOLS[pool].label} Insight`

/** Pools in catalog order, for stable rows. */
export const POOL_ORDER: ReadonlyArray<InsightPool> = INSIGHT_POOLS

/** An item's cost, by pool, in pool order. */
export const recipeOf = (
  id: ResearchId,
  discounts: ReadonlyArray<ResearchId> = [],
): ReadonlyArray<readonly [InsightPool, number]> =>
  POOL_ORDER.flatMap((pool) => {
    const cost = RECIPE[id][pool]
    return cost
      ? [[pool, discounts.includes(id) ? cost * (1 - VENDOR_DISCOUNT) : cost] as const]
      : []
  })

/** Why a Study stalls, in one sentence (10 "Studies"). */
export const stallReason = (stall: StudyStall): string =>
  StudyStall.match(stall, {
    Breadth: ({ types }) =>
      `Stalled: Analytics must sample its request kinds at ${types} Component types.`,
    Pool: ({ pool, feature }) =>
      feature
        ? `Stalled: nothing earns ${poolName(pool)}. Ship ${FEATURES[feature].name} to earn it.`
        : pool === 'failure'
          ? 'Stalled: nothing earns Failure Insight. Failed requests earn it.'
          : `Stalled: nothing earns ${poolName(pool)} yet.`,
    Shape: ({ shape, value }) => `Stalled: ${shapeReason(shape, value)}.`,
  })

/** The behaviour a shape asks the Design to show, in one clause. */
export const shapeReason = (shape: StudyShapeKind, value: number): string => {
  const pct = `${Math.round(value * 100)}%`
  switch (shape) {
    case 'connections':
      return `a Database must use ${pct} of its connections`
    case 'read-share':
      return `a Database must spend ${pct} of its work on reads`
    case 'cache-hit':
      return `a Cache must hit on ${pct} of its reads`
    case 'backlog':
      return `a Queue must hold a backlog of ${value} s or more`
    case 'report-share':
      return `a Database must spend ${pct} of its work on reports`
    case 'saturation':
      return `a Node must run at ${pct} of its capacity`
    case 'replica':
      return 'a Read Replica must serve reads'
  }
}
