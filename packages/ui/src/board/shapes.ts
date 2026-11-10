import { Graphics } from 'pixi.js'
import { type BuildGroup } from '@quorum/simulation/catalog'
import { GROUP_SHAPES } from '../game/icons.ts'

type Corner = Readonly<{ cut: boolean; r: number }>
const round = (r: number): Corner => ({ cut: false, r })
const cut = (r: number): Corner => ({ cut: true, r })

/**
 * Card corners per build group, clockwise from the top left. Edge cards are
 * chamfered like a hexagon, Compute cards are chips, Data cards are soft like a
 * disc, and Ops cards are leaves, with two sharp corners like a diamond.
 */
const CORNERS: Record<BuildGroup, readonly [Corner, Corner, Corner, Corner]> = {
  edge: [cut(9), cut(9), cut(9), cut(9)],
  compute: [round(10), round(10), round(10), round(10)],
  data: [round(18), round(18), round(18), round(18)],
  ops: [round(16), round(4), round(16), round(4)],
}

/**
 * Traces a card's silhouette into `g`, ready to fill or stroke. `grow` offsets
 * it outward, for halos around the card; `head` keeps the bottom corners
 * square, for the header band.
 */
export const silhouette = (
  g: Graphics,
  group: BuildGroup,
  x: number,
  y: number,
  w: number,
  h: number,
  grow = 0,
  head = false,
): Graphics => {
  const [tl, tr, br, bl] = CORNERS[group].map((corner, index) =>
    head && index >= 2
      ? round(0)
      : { cut: corner.cut, r: corner.r + (corner.cut ? grow * 0.41 : grow) },
  ) as [Corner, Corner, Corner, Corner]
  const left = x - grow
  const top = y - grow
  const right = x + w + grow
  const bottom = y + h + (head ? 0 : grow)
  const turn = (
    corner: Corner,
    bx: number,
    by: number,
    cx: number,
    cy: number,
    ax: number,
    ay: number,
  ) => {
    g.lineTo(bx, by)
    if (corner.cut) g.lineTo(ax, ay)
    else if (corner.r > 0) g.arcTo(cx, cy, ax, ay, corner.r)
  }
  g.moveTo(left + tl.r, top)
  turn(tr, right - tr.r, top, right, top, right, top + tr.r)
  turn(br, right, bottom - br.r, right, bottom, right - br.r, bottom)
  turn(bl, left + bl.r, bottom, left, bottom, left, bottom - bl.r)
  turn(tl, left, top + tl.r, left, top, left + tl.r, top)
  return g.closePath()
}

/** A build group's badge shape, centred on (x, y) with outer radius `r`. */
export const badgeShape = (
  g: Graphics,
  group: BuildGroup,
  x: number,
  y: number,
  r: number,
): Graphics => {
  switch (GROUP_SHAPES[group]) {
    case 'hexagon':
      return g.roundPoly(x, y, r * 1.04, 6, r * 0.22)
    case 'diamond':
      return g.roundPoly(x, y, r * 1.12, 4, r * 0.24)
    case 'chip': {
      // A body with three pins on each side.
      const body = r * 0.74
      const pin = r * 0.15
      for (const at of [-0.42, 0, 0.42]) {
        const k = at * r
        g.rect(x - r, y + k - pin / 2, r - body, pin)
        g.rect(x + body, y + k - pin / 2, r - body, pin)
        g.rect(x + k - pin / 2, y - r, pin, r - body)
        g.rect(x + k - pin / 2, y + body, pin, r - body)
      }
      return g.roundRect(x - body, y - body, body * 2, body * 2, r * 0.22)
    }
    case 'disc':
      return g.circle(x, y, r * 0.95)
  }
}

/** Glyph size inside a badge of radius `r`; a diamond has the least room. */
export const badgeGlyph = (group: BuildGroup, r: number): number =>
  Math.round(
    r * (GROUP_SHAPES[group] === 'diamond' ? 0.9 : GROUP_SHAPES[group] === 'chip' ? 0.95 : 1.1),
  )
