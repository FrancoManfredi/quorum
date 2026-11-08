import { causeOf, isDown, warmOf } from '@quorum/simulation/life'
import type { Ledger } from '@quorum/simulation/ledger'
import type { Game } from '@quorum/simulation/state'
import { priceOf, refundOf } from '@quorum/simulation/lookups'
import type { Board, Figures, Undo } from './model.ts'
import type { Delta } from './machine-state.ts'

export { SETTLE_LIMIT, STABLE_TICKS, STEADY_TICKS } from './machine-state.ts'
import { SETTLE_LIMIT, STEADY_TICKS } from './machine-state.ts'

export { figuresOf } from '@quorum/simulation/preview'
import { figuresOf } from '@quorum/simulation/preview'
import { step as changeStep, type ChangeState } from './change-machine.ts'

/** Starts or extends a change. Several quick changes settle as one. */
export const beginChange = (board: Board, label: string, before: Figures): Board => ({
  ...board,
  change: changeStep(board.change, {
    _tag: 'Changed',
    label,
    before,
    startedAt: board.game.time,
  }),
})

const warming = (game: Game): boolean =>
  game.nodes.some((node) => isDown(node.life) || warmOf(node.life) < 1)

/** How far the running change is from settling, from 0 to 1, for the Settling ring. */
export const settleProgress = (board: Board): number => {
  const change = board.change
  if (change._tag !== 'Settling') return 1
  const elapsed = board.game.time - change.change.startedAt
  return Math.min(1, Math.max(change.change.steady / STEADY_TICKS, elapsed / SETTLE_LIMIT))
}

/** Advances the running change; the machine settles it into a delta. */
export const advanceChange = (board: Board, ledger: Ledger, seq: number): ChangeState =>
  changeStep(board.change, {
    _tag: 'Ticked',
    sample: { revenue: ledger.revenue, served: ledger.served, errors: ledger.errorShare },
    after: figuresOf(ledger),
    warming: warming(board.game),
    at: board.game.time,
    seq,
  })

/** Undo is exact for this long after an action; later, money settles at normal prices (16 D17). */
export const UNDO_SECONDS = 30
export const UNDO_LIMIT = 50

/** The Design pieces of a Game, for the undo and redo stacks. */
export const snapshotOf = (label: string, game: Game, cash: number, at: number): Undo => ({
  label,
  nodes: game.nodes,
  links: game.links,
  nextId: game.nextId,
  cash,
  at,
})

/** Records an undoable action: its entry goes on the stack and redo is cleared. */
export const pushUndo = (board: Board, entry: Undo): Pick<Board, 'undo' | 'redo'> => ({
  undo: [...board.undo, entry].slice(-UNDO_LIMIT),
  redo: [],
})

export const undoAvailable = (board: Board): boolean => board.undo.length > 0
export const redoAvailable = (board: Board): boolean => board.redo.length > 0

/** Puts a Design back, keeping what time did to each Node: credits, leaks, and failures. */
const restore = (game: Game, entry: Undo, cash: number): Game => ({
  ...game,
  nodes: entry.nodes.map((node) => {
    const now = game.nodes.find((current) => current.id === node.id)
    if (!now) return node
    const failed = isDown(now.life) && causeOf(now.life) !== 'restart'
    return {
      ...node,
      credits: now.credits,
      leak: now.leak,
      ...(failed ? { life: now.life, downAt: now.downAt } : {}),
    }
  }),
  links: entry.links,
  nextId: Math.max(entry.nextId, game.nextId),
  cash: game.cash + cash,
})

/**
 * Cash an undo moves after the exact window: Nodes it removes refund half, as a
 * sale does; Nodes it brings back cost their place price; resizes move nothing.
 */
const settledCash = (game: Game, entry: Undo): number => {
  const ids = new Set(entry.nodes.map((node) => node.id))
  const current = new Set(game.nodes.map((node) => node.id))
  const removed = game.nodes
    .filter((node) => !ids.has(node.id))
    .reduce((total, node) => total + refundOf(game, node), 0)
  let added = 0
  let counted = game
  for (const node of entry.nodes.filter((entry) => !current.has(entry.id))) {
    added += priceOf(counted, node.type)
    counted = { ...counted, nodes: [...counted.nodes, node] }
  }
  return removed - added
}

export type Reversal = Readonly<{
  game: Game
  label: string
  undo: ReadonlyArray<Undo>
  redo: ReadonlyArray<Undo>
}>

/**
 * Undoes the newest action. Within 30 s it reverses exactly the Cash the action
 * moved, so undoing never gains Cash. Later, money settles at normal prices.
 * Returns a reason when it cannot.
 */
export const undoGame = (board: Board): Reversal | string => {
  const entry = board.undo.at(-1)
  if (!entry) return 'Nothing to undo.'
  const game = board.game
  const cash = game.time - entry.at <= UNDO_SECONDS ? -entry.cash : settledCash(game, entry)
  if (cash < 0 && game.cash + cash < 0) return 'Not enough Cash to undo that.'
  return {
    game: restore(game, entry, cash),
    label: entry.label,
    undo: board.undo.slice(0, -1),
    // Redo puts this Design back and takes back exactly the Cash the undo moved.
    redo: [...board.redo, snapshotOf(entry.label, game, cash, entry.at)],
  }
}

/** Redoes the newest undone action, with the inverse of the Cash its undo moved. */
export const redoGame = (board: Board): Reversal | string => {
  const entry = board.redo.at(-1)
  if (!entry) return 'Nothing to redo.'
  const game = board.game
  const cash = -entry.cash
  if (cash < 0 && game.cash + cash < 0) return 'Not enough Cash to redo that.'
  return {
    game: restore(game, entry, cash),
    label: entry.label,
    undo: [...board.undo, snapshotOf(entry.label, game, cash, game.time)].slice(-UNDO_LIMIT),
    redo: board.redo.slice(0, -1),
  }
}

const signed = (value: number, digits = 2): string =>
  `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(digits)}`

/** "+$1.40/s (+18%) · p99 −120 ms · errors −2.1%" */
export const describeDelta = (delta: Delta, percentiles: boolean): string => {
  const revenue = delta.after.revenue - delta.before.revenue
  const share = delta.before.revenue > 0 ? (revenue / delta.before.revenue) * 100 : 0
  const latency = percentiles
    ? `p99 ${signed(delta.after.p99 - delta.before.p99, 0)} ms`
    : `latency ${signed(delta.after.latency - delta.before.latency, 0)} ms`
  const errors = (delta.after.errors - delta.before.errors) * 100
  return [
    `${revenue >= 0 ? '+' : '−'}$${Math.abs(revenue).toFixed(2)}/s (${signed(share, 0)}%)`,
    latency,
    Math.abs(errors) >= 0.05 ? `errors ${signed(errors, 1)}%` : null,
  ]
    .filter((part) => part !== null)
    .join(' · ')
}
