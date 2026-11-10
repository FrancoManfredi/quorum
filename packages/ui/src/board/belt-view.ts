import { Graphics } from 'pixi.js'
import { type Box, type Pt, type Route } from './geometry.ts'
import { traceOf } from './paths.ts'

/**
 * One link's belt, in three layers so belts stack as they always have: a later belt
 * covers an earlier one's chevrons where they share a trunk. The body and the mouths
 * are redrawn only when their path or colours change; the chevrons only while they move.
 */
/** How far a card or belt off the focused path fades. */
export const DIM = 0.3
/** How far the belts other than the lit one fade, so one lane reads out of a crowded channel. */
export const QUIET = 0.12
/** Below this zoom the belts' chevrons are left out: they are a few pixels apart. */
export const CHEVRON_SCALE = 0.5
/** How far under a belt its region's round-trip plate sits. */
export const PLACE_LIFT = 24

export class BeltView {
  readonly body = new Graphics()
  readonly mouths = new Graphics()
  /**
   * How far the belt's items have travelled, in world pixels. Each belt keeps its
   * own total, so a change in its flow rate never moves items already on it.
   */
  travel = 0
  private bodyFor: unknown = null
  private bodyKey = ''
  /** The box round the belt's pieces, for culling its chevrons and packets off screen. */
  private boxFor: unknown = null
  private box = { x0: 0, y0: 0, x1: 0, y1: 0 }

  constructor() {
    // Pixi batches only small Graphics by itself, and a belt is long: unbatched, every
    // belt costs a draw call in each layer.
    this.body.context.batchMode = 'batch'
    this.mouths.context.batchMode = 'batch'
  }

  /** Shows or hides the belt and dims it. */
  show(visible: boolean, alpha: number): void {
    for (const part of [this.body, this.mouths]) {
      part.visible = visible
      part.alpha = alpha
    }
  }

  destroy(): void {
    this.body.destroy()
    this.mouths.destroy()
  }

  /** Whether any piece of the belt is inside `view`, in world coordinates. */
  onScreen(pieces: ReadonlyArray<Route>, view: Box): boolean {
    if (pieces !== this.boxFor) {
      this.boxFor = pieces
      const box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
      for (const piece of pieces)
        for (const point of piece) {
          box.x0 = Math.min(box.x0, point.x)
          box.y0 = Math.min(box.y0, point.y)
          box.x1 = Math.max(box.x1, point.x)
          box.y1 = Math.max(box.y1, point.y)
        }
      this.box = box
    }
    const box = this.box
    return (
      box.x1 >= view.x && box.x0 <= view.x + view.w && box.y1 >= view.y && box.y0 <= view.y + view.h
    )
  }

  /** The body between its rails. The board draws the tunnel portals. */
  draw(
    pieces: ReadonlyArray<Route>,
    rail: number,
    body: number,
    width: number,
    zone: number | null,
  ): void {
    const key = `${rail}:${body}:${width}:${zone}`
    if (pieces === this.bodyFor && key === this.bodyKey) return
    this.bodyFor = pieces
    this.bodyKey = key
    this.body.clear()
    for (const piece of pieces) traceOf(this.body, piece)
    this.body.stroke({ color: rail, width: width + 2, join: 'round', alpha: 0.9 })
    for (const piece of pieces) traceOf(this.body, piece)
    this.body.stroke({ color: body, width, join: 'round' })
    this.mouths.clear()
    // The cross-zone tick, a little before the port the call arrives on.
    const end = pieces.at(-1)?.at(-1)
    if (zone !== null && end) this.mouths.roundRect(end.x - 14, end.y - 6, 3, 12, 1.5).fill(zone)
  }
}

/** A tunnel mouth: where a belt dives or surfaces, and the belt's width there. */
export type Mouth = Readonly<{ x: number; y: number; across: boolean; width: number; off: boolean }>

/** Where a belt's pieces dive and surface. A mouth on a bend snaps to the nearest axis. */
export const mouthsOf = (
  pieces: ReadonlyArray<Route>,
  width: number,
  off: boolean,
  out: Array<Mouth>,
): void => {
  const add = (at: Pt | undefined, along: Pt | undefined): void => {
    if (!at || !along) return
    // A belt running up or down has a portal across it, and the other way round.
    const across = Math.abs(at.y - along.y) > Math.abs(at.x - along.x)
    out.push({ x: at.x, y: at.y, across, width, off })
  }
  pieces.forEach((piece, index) => {
    if (index > 0) add(piece[0], piece[1])
    if (index < pieces.length - 1) add(piece.at(-1), piece.at(-2))
  })
}

/** Mouths closer than this along one row share one portal. */
const PORTAL_JOIN = 7
const PORTAL_DEPTH = 2.5

/**
 * The tunnel portals: one thin bar per row of mouths side by side, so belts that
 * dive under the same crossing go in through one entrance, as on a Factorio bus.
 */
export const portalsOf = (
  mouths: ReadonlyArray<Mouth>,
): ReadonlyArray<Readonly<{ x0: number; y0: number; x1: number; y1: number; off: boolean }>> => {
  const rows = new Map<string, Array<Mouth>>()
  for (const mouth of mouths) {
    const key = mouth.across ? `h${Math.round(mouth.y)}` : `v${Math.round(mouth.x)}`
    const row = rows.get(key) ?? []
    row.push(mouth)
    rows.set(key, row)
  }
  const out: Array<{ x0: number; y0: number; x1: number; y1: number; off: boolean }> = []
  for (const row of rows.values()) {
    const across = (row[0] as Mouth).across
    const along = (mouth: Mouth): number => (across ? mouth.x : mouth.y)
    row.sort((a, b) => along(a) - along(b))
    let run: { start: number; end: number; at: number; off: boolean } | null = null
    const flush = (): void => {
      if (!run) return
      const half = PORTAL_DEPTH / 2
      out.push(
        across
          ? { x0: run.start, y0: run.at - half, x1: run.end, y1: run.at + half, off: run.off }
          : { x0: run.at - half, y0: run.start, x1: run.at + half, y1: run.end, off: run.off },
      )
    }
    for (const mouth of row) {
      const start = along(mouth) - mouth.width / 2 - 1
      const end = along(mouth) + mouth.width / 2 + 1
      if (run && start - run.end < PORTAL_JOIN) {
        run.end = Math.max(run.end, end)
        run.off &&= mouth.off
        continue
      }
      flush()
      run = { start, end, at: across ? mouth.y : mouth.x, off: mouth.off }
    }
    flush()
  }
  return out
}
