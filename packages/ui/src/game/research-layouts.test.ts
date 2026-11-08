import { expect, test } from 'vitest'
import { NODE_SIZE, nodeSize, researchLayout } from './research-layouts.ts'

test('a Node box is its base size at the interface’s own scale', () => {
  expect(nodeSize(1)).toEqual(NODE_SIZE)
})

test('at 150% every box, and the room around it, grows by half', () => {
  expect(nodeSize(1.5)).toEqual({ w: NODE_SIZE.w * 1.5, h: NODE_SIZE.h * 1.5 })
  const plain = researchLayout(1)
  const large = researchLayout(1.5)
  expect(large.width).toBeCloseTo(plain.width * 1.5)
  expect(large.height).toBeCloseTo(plain.height * 1.5)
  for (const [id, place] of plain.placed) {
    const grown = large.placed.get(id)
    expect(grown?.x).toBeCloseTo(place.x * 1.5)
    expect(grown?.y).toBeCloseTo(place.y * 1.5)
  }
})

test('no two Node boxes touch at either scale', () => {
  for (const scale of [1, 1.5]) {
    const { w, h } = nodeSize(scale)
    const places = [...researchLayout(scale).placed.values()]
    for (const [index, a] of places.entries())
      for (const b of places.slice(index + 1)) {
        const apart = a.x + w <= b.x || b.x + w <= a.x || a.y + h <= b.y || b.y + h <= a.y
        expect(apart, `${a.entry.id} overlaps ${b.entry.id} at ${scale}`).toBe(true)
      }
  }
})
