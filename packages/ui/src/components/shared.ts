import {
  Activity,
  Archive,
  ArrowRightFromLine,
  ArrowRightToLine,
  Banknote,
  Cable,
  Check,
  ChevronsUp,
  Coins,
  Copy,
  Tag,
  Plus,
  Gauge,
  Gem,
  HardDrive,
  Hourglass,
  HandCoins,
  Inbox,
  Layers,
  ListOrdered,
  LogIn,
  RotateCcw,
  ScanLine,
  ShieldBan,
  Shuffle,
  Smile,
  Target,
  Timer,
  Unplug,
  Users,
  Wallet,
  type IconNode,
} from 'lucide'
import type { InsightPool } from '@quorum/simulation/catalog'
import type { Ledger } from '@quorum/simulation/ledger'
import type { Game, GameNode } from '@quorum/simulation/state'
import type { StackLogoId } from '../game/icons.ts'

export type RowTone = 'plain' | 'warn' | 'danger' | 'ok' | 'muted'
/** Row glyphs by key, so the per-frame digest stays a short string. */
export const ROW_ICONS = {
  inbound: ArrowRightToLine,
  load: Gauge,
  latency: Timer,
  out: ArrowRightFromLine,
  stranded: Unplug,
  users: Users,
  apdex: Smile,
  requests: Activity,
  revenue: Banknote,
  drawer: Wallet,
  stripe: Check,
  sampling: ScanLine,
  kept: Archive,
  insight: Gem,
  stack: Layers,
  connections: Cable,
  hits: Target,
  lag: Hourglass,
  policy: Shuffle,
  logins: LogIn,
  cost: Coins,
  depth: ListOrdered,
  stored: HardDrive,
  blocked: ShieldBan,
  copies: Copy,
  version: Tag,
  limit: Gauge,
} as const

export const FOOT_ICONS = {
  collect: HandCoins,
  auto: Check,
  empty: Inbox,
  replace: RotateCcw,
  max: ChevronsUp,
  resize: ChevronsUp,
  more: Plus,
} as const

export type Row = Readonly<{
  glyph: keyof typeof ROW_ICONS
  name: string
  value: string
  tone?: RowTone
  bar?: number
  /** An Insight pool's icon, in its colour, in place of the row glyph. */
  pool?: InsightPool
  /** A brand mark in place of the row glyph. */
  logo?: StackLogoId
  /** A brand mark just before the value. */
  valueLogo?: StackLogoId
  /** Recent values, drawn as a sparkline under the row. */
  trend?: ReadonlyArray<number>
}>
export type Footer = Readonly<{
  glyph: keyof typeof FOOT_ICONS
  text: string
  enabled: boolean
  tone: 'accent' | 'ok' | 'muted' | 'danger'
}>

export const pct = (value: number): string => `${Math.round(value * 100)}%`

export const outRate = (ledger: Ledger, id: string): number =>
  ledger.links.reduce((sum, link) => (link.from === id ? sum + link.rate : sum), 0)

/** The App Servers and Workers linked into a control Node. */
export const membersOf = (game: Game, node: GameNode): ReadonlyArray<GameNode> =>
  game.nodes.filter((entry) =>
    game.links.some((link) => link.from === entry.id && link.to === node.id),
  )

export type Layout = Readonly<{
  rows: number
  inRow: number | null
  outRow: number | null
  footer: boolean
}>

/** What a Component's row builders are handed: the Game, its Node, the Ledger, and the rows most cards share. */
export type RowContext = Readonly<{
  game: Game
  node: GameNode
  ledger: Ledger
  own: Ledger['nodes'][string]
  inbound: Row
  capacity: Row
  latency: Row
  out: Row
}>

/** What is specific to one Component's board appearance. */
export type ComponentView = Readonly<{
  icon: IconNode
  /** Row count and port rows. Fixed per type, so hit tests need no flow. */
  layout: Layout
  /** The card's rows, before the Limit row the profiling Research adds. */
  rows: (context: RowContext) => ReadonlyArray<Row>
  /** The whole footer, in place of the shared Replace and resize buttons. */
  footer?: (game: Game, node: GameNode) => Footer | null
  /** How the resize button reads, given its price label, when it is not the size and its price. */
  resize?: (price: string) => Pick<Footer, 'glyph' | 'text'>
  /** Whether a Node of this type shows `Spread` in its header once it spans regions. */
  spreads?: true
}>
