import { FillGradient } from 'pixi.js'
import { type BuildGroup } from '@quorum/simulation/catalog'

let pixel: CanvasRenderingContext2D | null | undefined

/** A colour as 0xRRGGBB, laid over `under` first so a translucent token keeps its strength. */
const toInt = (value: string, under: string): number => {
  if (pixel === undefined) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    pixel = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!pixel) return 0
  pixel.clearRect(0, 0, 1, 1)
  pixel.fillStyle = '#ffffff'
  pixel.fillStyle = under
  pixel.fillRect(0, 0, 1, 1)
  pixel.fillStyle = '#000000'
  pixel.fillStyle = value
  pixel.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0] = pixel.getImageData(0, 0, 1, 1).data
  return (r << 16) | (g << 8) | b
}

const colors = new Map<string, number>()
let probe: HTMLSpanElement | null = null

const token = (name: string, fallback: string): number => {
  const cached = colors.get(name)
  if (cached !== undefined) return cached
  probe ??= document.createElement('span')
  probe.style.display = 'none'
  if (!probe.isConnected) document.body.append(probe)
  // Every colour lands on a card, so translucent tokens (the dark theme's borders) blend with it.
  probe.style.color = 'var(--card, #ffffff)'
  const card = getComputedStyle(probe).color
  probe.style.color = `var(${name}, ${fallback})`
  const value = toInt(getComputedStyle(probe).color, card)
  colors.set(name, value)
  return value
}

/** A plain number the theme sets, such as how far wires sink into the canvas. */
const amount = (name: string, fallback: number): number => {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

const resolvePalette = () => ({
  canvas: token('--canvas', '#f1f4f9'),
  card: token('--card', '#ffffff'),
  well: token('--well', '#eeeef0'),
  border: token('--input', '#d5ddea'),
  edge: token('--edge-solid', '#9aa8bf'),
  accent: token('--primary-strong', '#4f7fe0'),
  fillTop: token('--board-action-top', '#4a4a50'),
  fillBottom: token('--board-action-bottom', '#2a2a2e'),
  onFill: token('--on-board-action', '#ffffff'),
  ink: token('--foreground', '#16233d'),
  shade: token('--board-shade', '#16233d'),
  wireMute: amount('--board-wire-mute', 0),
  muted: token('--muted-foreground', '#5c6b85'),
  track: token('--muted', '#eef2f8'),
  ok: token('--ok', '#1a8a51'),
  warn: token('--warn', '#cd7d09'),
  danger: token('--danger', '#c72e2b'),
  groups: {
    edge: token('--group-edge', '#3a9ad9'),
    compute: token('--group-compute', '#6c4fe0'),
    data: token('--group-data', '#1fa59a'),
    ops: token('--group-ops', '#d43d93'),
  } satisfies Record<BuildGroup, number>,
})

export type Palette = ReturnType<typeof resolvePalette>

let resolved: Palette | null = null

/** Every token is resolved once and kept, so the palette is too. */
export const palette = (): Palette => (resolved ??= resolvePalette())

/** The theme changed: the next `palette()` resolves every token again. */
export const resetPalette = (): void => {
  colors.clear()
  resolved = null
}

/** Blends two 0xRRGGBB colours; `t` is the share of `b`. */
export const mix = (a: number, b: number, t: number): number => {
  const channel = (shift: number) =>
    Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t) << shift
  return channel(16) | channel(8) | channel(0)
}

const gradients = new Map<string, FillGradient>()

/** A cached top-to-bottom gradient, so redraws do not allocate textures. */
export const gradient = (top: number, bottom: number, across = false): FillGradient => {
  const key = `${top}:${bottom}:${across}`
  const cached = gradients.get(key)
  if (cached) return cached
  const made = new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: across ? { x: 1, y: 0 } : { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: top },
      { offset: 1, color: bottom },
    ],
    textureSpace: 'local',
  })
  gradients.set(key, made)
  return made
}

export const gradientX = (left: number, right: number): FillGradient => gradient(left, right, true)
