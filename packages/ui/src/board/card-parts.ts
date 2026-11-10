import { Graphics } from 'pixi.js'
import { type BuildGroup, type ComponentId } from '@quorum/simulation/catalog'
import { CARD_W, FOOT, HEAD, layoutOf, rowTop } from './geometry.ts'
import { GROUP_SHAPES } from '../game/icons.ts'
import { type Palette, mix, gradient, gradientX } from './palette.ts'
import { silhouette, badgeShape } from './shapes.ts'

/** The footer button, in the node's own coordinates. */
export const footerRect = (type: ComponentId) => {
  const y = rowTop(layoutOf(type).rows) + 4
  return { x: 8, y, w: CARD_W - 16, h: FOOT - 13 }
}

/** The medallion in a card's header: its centre and the badge's outer radius. It breaks
 *  out of the card's top-left corner. */
export const BADGE_X = 20
export const BADGE_Y = 13
export const BADGE_R = 16
/** Where the title starts, clear of the medallion. */
export const TITLE_X = 48

/** The plate behind a badge, in the build group's shape; a chip's plate is a square. */
const plateShape = (g: Graphics, group: BuildGroup, x: number, y: number, r: number): Graphics =>
  GROUP_SHAPES[group] === 'chip'
    ? g.roundRect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, r * 0.3)
    : badgeShape(g, group, x, y, r)

/** The header's medallion: a card-coloured plate in the group's shape, with the badge on it. */
export const medallion = (g: Graphics, group: BuildGroup, tone: number, colors: Palette): void => {
  const plate = BADGE_R + 5.5
  plateShape(g, group, BADGE_X, BADGE_Y + 1.5, plate + 0.5).fill({
    color: colors.shade,
    alpha: 0.08,
  })
  plateShape(g, group, BADGE_X, BADGE_Y, plate).fill(colors.card)
  plateShape(g, group, BADGE_X, BADGE_Y, plate).stroke({
    color: mix(colors.border, tone, 0.5),
    width: 1.5,
  })
  badgeShape(g, group, BADGE_X, BADGE_Y, BADGE_R).fill(
    gradient(mix(tone, 0xffffff, 0.2), mix(tone, 0x000000, 0.1)),
  )
}

/** The header band: a wash of the group's colour, fading to the right, over a hairline. */
export const headerBand = (g: Graphics, group: BuildGroup, hue: number, colors: Palette): void => {
  silhouette(g, group, 0, 0, CARD_W, HEAD, 0, true).fill(
    gradientX(mix(colors.card, hue, 0.22), mix(colors.card, hue, 0.04)),
  )
  g.moveTo(0, HEAD)
    .lineTo(CARD_W, HEAD)
    .stroke({ color: mix(colors.border, hue, 0.35), width: 1, alpha: 0.8 })
}

export const pipsWidth = (total: number): number => total * (total > 5 ? 5.5 : 7) - 2

/** A Node's size as slanted pips: `filled` of `total` lit, drawn from (x, y). */
export const pips = (
  g: Graphics,
  x: number,
  y: number,
  filled: number,
  total: number,
  on: number,
  off: number,
): void => {
  const w = total > 5 ? 3.5 : 5
  const step = w + 2
  for (let index = 0; index < total; index += 1) {
    const at = x + index * step
    g.poly([at + 2, y, at + w + 2, y, at + w, y + 9, at, y + 9]).fill(index < filled ? on : off)
  }
}
