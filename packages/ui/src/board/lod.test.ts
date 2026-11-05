import { expect, test } from 'vitest'
import { CHIP_NONE, ROWS_FULL, ROWS_GONE, chipAt, rowsAt } from './lod.ts'

/* ==========================================================================
   15 "The board": zoomed out, a card drops its rows and then becomes a chip
   with its name and its load, so a large Design stays readable when zoomed
   out. Up close the rows are at full strength and there is no chip.
   ========================================================================== */

test('up close, a card shows its rows and no chip', () => {
  expect(rowsAt(1)).toBe(1)
  expect(chipAt(1)).toBe(0)
  expect(rowsAt(ROWS_FULL)).toBe(1)
})

test('rows fade out as the board zooms out, and are gone at the lowest zoom', () => {
  expect(rowsAt(ROWS_FULL)).toBeGreaterThan(rowsAt((ROWS_FULL + ROWS_GONE) / 2))
  expect(rowsAt(ROWS_GONE)).toBe(0)
  expect(rowsAt(0.05)).toBe(0)
})

test('below the chip zoom a card is a chip, and above it a whole card', () => {
  expect(chipAt(CHIP_NONE)).toBe(0)
  expect(chipAt(CHIP_NONE + 0.1)).toBe(0)
  expect(chipAt(CHIP_NONE - 0.03)).toBeCloseTo(0.5)
  expect(chipAt(ROWS_GONE)).toBe(1)
  expect(chipAt(0.1)).toBe(1)
})

test('the chip and the card cross over, never both gone and never both whole', () => {
  for (const zoom of [0.2, 0.28, 0.3, 0.32, 0.36, 0.5, 1]) {
    expect(chipAt(zoom) + (1 - chipAt(zoom))).toBeCloseTo(1)
    expect(chipAt(zoom)).toBeGreaterThanOrEqual(0)
    expect(chipAt(zoom)).toBeLessThanOrEqual(1)
  }
  // A card's rows are gone by the time the chip is whole.
  expect(rowsAt(ROWS_GONE)).toBe(0)
  expect(chipAt(ROWS_GONE)).toBe(1)
})
