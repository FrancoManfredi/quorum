import { measureNaturalWidth, prepareWithSegments } from '@chenglou/pretext'
import { Text } from 'pixi.js'

export const MONO = '"Geist Mono", ui-monospace, monospace'
export const SANS = '"Geist", ui-sans-serif, system-ui, sans-serif'

/** A label's font as a canvas font string: Pretext measures with it, so it must match Pixi's. */
const fontOf = new WeakMap<Text, string>()

const shapes = new WeakMap<
  Text,
  Readonly<{
    text: string
    font: string
    width: number
    segments: readonly string[]
    widths: ArrayLike<number>
  }>
>()

/**
 * The label measured, without asking the renderer: Pixi rebuilds a label's texture whenever its
 * width is read, so a label that has not changed is measured once.
 */
const shapeOf = (view: Text, text: string) => {
  const font = fontOf.get(view) ?? `500 12px ${SANS}`
  const known = shapes.get(view)
  if (known && known.text === text && known.font === font) return known
  const prepared = prepareWithSegments(text, font)
  const shape = {
    text,
    font,
    segments: prepared.segments,
    widths: prepared.widths,
    width: measureNaturalWidth(prepared),
  }
  shapes.set(view, shape)
  return shape
}

const ellipses = new Map<string, number>()

/** The width of an ellipsis in a font, measured once per font. */
const ellipsisIn = (font: string): number => {
  const known = ellipses.get(font)
  if (known !== undefined) return known
  const width = measureNaturalWidth(prepareWithSegments('…', font))
  ellipses.set(font, width)
  return width
}

const fits = new WeakMap<
  Text,
  Readonly<{ text: string; room: number; fit: string; scale: number }>
>()

/** The smallest share of its own size a label takes before it is cut with an ellipsis. */
const MIN_LABEL_SCALE = 0.72

/**
 * Shows `text` in `view` so it is no wider than `room`. The width comes from Pretext, not from the
 * renderer, which would rebuild the label's texture for every guess. A label that does not fit at
 * its own size is drawn a little smaller first, because a whole name reads better than an ellipsis,
 * which a Japanese name needs sooner: a full-width glyph is twice as wide. Only a label that is too
 * wide for the smallest size is cut, at a break opportunity, and ends with an ellipsis.
 */
export const fitText = (view: Text, text: string, room: number): void => {
  const last = fits.get(view)
  if (last?.text === text && last.room === room) {
    view.text = last.fit
    if (view.scale.x !== last.scale) view.scale.set(last.scale)
    return
  }
  const shape = shapeOf(view, text)
  const scale = shape.width > room ? Math.max(MIN_LABEL_SCALE, room / shape.width) : 1
  // The room in the label's own pixels: at `scale` its natural width may reach `room / scale`.
  const budget = room / scale
  let fit = shape.text
  if (shape.width > budget) {
    const tail = ellipsisIn(shape.font)
    let used = 0
    let kept = ''
    for (let index = 0; index < shape.segments.length; index += 1) {
      const width = shape.widths[index] ?? 0
      if (used + width + tail > budget) break
      used += width
      kept += shape.segments[index]
    }
    fit = budget > tail ? `${kept.trimEnd()}…` : ''
  }
  view.text = fit
  view.scale.set(scale)
  fits.set(view, { text, room, fit, scale })
}

export const label = (
  size: number,
  family: string,
  weight: '400' | '500' | '600' | '700' = '500',
) => {
  const view = new Text({
    text: '',
    style: { fontFamily: family, fontSize: size, fontWeight: weight, fill: 0x16233d },
    // The board never renders above 2×, so a third copy of every glyph costs memory, not sharpness.
    resolution: 2,
  })
  fontOf.set(view, `${weight} ${size}px ${family}`)
  return view
}
