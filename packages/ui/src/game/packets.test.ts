import { expect, test } from 'vitest'
import { BACKEND_KINDS, KINDS, REQUEST_KINDS, type Kind } from '@quorum/simulation/catalog'
import { PACKET_SHAPES, PACKET_SHAPE_OF, packetColor, packetShapeOf } from './packets.ts'

const KINDS_IN_ORDER: ReadonlyArray<Kind> = [...REQUEST_KINDS, ...BACKEND_KINDS]

test('every kind has one of the four shapes, and all four are used', () => {
  const used = new Set(KINDS_IN_ORDER.map((kind) => packetShapeOf(kind)))
  for (const kind of KINDS_IN_ORDER) expect(PACKET_SHAPES).toContain(PACKET_SHAPE_OF[kind])
  expect([...used].sort()).toEqual([...PACKET_SHAPES].sort())
})

test('kinds that share a packet colour share a shape', () => {
  const byColour = new Map<number, Set<string>>()
  for (const kind of KINDS_IN_ORDER) {
    const shape = packetShapeOf(kind)
    const seen = byColour.get(KINDS[kind].color) ?? new Set<string>()
    seen.add(shape)
    byColour.set(KINDS[kind].color, seen)
    // The colour itself is untouched: the shape is a second cue, not a replacement.
    expect(packetColor(kind)).toBe(`#${KINDS[kind].color.toString(16).padStart(6, '0')}`)
  }
  for (const [colour, shapes] of byColour)
    expect({ colour, shapes: [...shapes] }).toEqual({ colour, shapes: [[...shapes][0]] })
})

test('the shapes follow the catalog, so a save or a build keeps them', () => {
  // The first four colours in catalog order take the four shapes in order; the fifth repeats.
  expect(packetShapeOf(REQUEST_KINDS[0]!)).toBe('circle')
  expect(packetShapeOf(REQUEST_KINDS[1]!)).toBe('square')
  expect(packetShapeOf(REQUEST_KINDS[2]!)).toBe('triangle')
  expect(packetShapeOf(REQUEST_KINDS[3]!)).toBe('diamond')
  expect(packetShapeOf(REQUEST_KINDS[4]!)).toBe('circle')
})
