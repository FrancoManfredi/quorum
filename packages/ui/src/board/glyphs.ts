import { type IconNode } from 'lucide'
import { Sprite, Texture } from 'pixi.js'
import { STACK_LOGOS, type StackLogoId } from '../game/icons.ts'

const glyphs = new Map<IconNode, Texture>()
const GLYPH_PX = 96

/**
 * A lucide icon drawn once in white onto a canvas, then tinted per use.
 * Canvas `Path2D` reads every SVG path form lucide uses.
 */
const glyphOf = (node: IconNode): Texture => {
  const cached = glyphs.get(node)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = GLYPH_PX
  canvas.height = GLYPH_PX
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(GLYPH_PX / 24, GLYPH_PX / 24)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const num = (value: unknown) => Number(value ?? 0)
    for (const [tag, attrs] of node) {
      const a = attrs as Record<string, unknown>
      ctx.beginPath()
      switch (tag) {
        case 'path':
          ctx.stroke(new Path2D(String(a['d'])))
          continue
        case 'circle':
          ctx.arc(num(a['cx']), num(a['cy']), num(a['r']), 0, Math.PI * 2)
          break
        case 'ellipse':
          ctx.ellipse(num(a['cx']), num(a['cy']), num(a['rx']), num(a['ry']), 0, 0, Math.PI * 2)
          break
        case 'rect':
          ctx.roundRect(num(a['x']), num(a['y']), num(a['width']), num(a['height']), num(a['rx']))
          break
        case 'line':
          ctx.moveTo(num(a['x1']), num(a['y1']))
          ctx.lineTo(num(a['x2']), num(a['y2']))
          break
        case 'polyline':
        case 'polygon': {
          const points = String(a['points'])
            .trim()
            .split(/[\s,]+/)
            .map(Number)
          for (let index = 0; index + 1 < points.length; index += 2)
            ctx.lineTo(points[index] ?? 0, points[index + 1] ?? 0)
          if (tag === 'polygon') ctx.closePath()
          break
        }
      }
      ctx.stroke()
    }
  }
  const made = Texture.from(canvas)
  glyphs.set(node, made)
  return made
}

/** A sprite for one glyph at `size` pixels; set its texture and tint per update. */
export const glyph = (size: number): Sprite => {
  const view = new Sprite(Texture.EMPTY)
  view.setSize(size)
  return view
}

/** Points a glyph sprite at an icon and colour. */
export const paint = (view: Sprite, node: IconNode, color: number): void => {
  const size = view.width
  view.texture = glyphOf(node)
  view.setSize(size)
  view.tint = color
}

const logos = new Map<string, Texture>()

/** A brand mark filled once in white, then tinted to its brand colour per use. */
const logoOf = (path: string): Texture => {
  const cached = logos.get(path)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = GLYPH_PX
  canvas.height = GLYPH_PX
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(GLYPH_PX / 24, GLYPH_PX / 24)
    ctx.fillStyle = '#ffffff'
    ctx.fill(new Path2D(path))
  }
  const made = Texture.from(canvas)
  logos.set(path, made)
  return made
}

/** Points a sprite at a language or framework mark; black marks take `ink`. */
export const paintLogo = (view: Sprite, id: StackLogoId, ink: number): void => {
  const size = view.width
  const logo = STACK_LOGOS[id]
  view.texture = logoOf(logo.path)
  view.setSize(size)
  view.tint = logo.color ? Number.parseInt(logo.color.slice(1), 16) : ink
}
