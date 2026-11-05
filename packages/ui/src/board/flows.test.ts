import { expect, test } from 'vitest'
import { flowLabel, flowMarks } from './flows.ts'

/* ==========================================================================
   15 "Accessibility", reduced motion: the moving packets stop and become
   still arrows that carry the rate they stand for, so a still board still
   says how much traffic a belt moves.
   ========================================================================== */

test('with motion, items ride the belt and no label is drawn', () => {
  const marks = flowMarks(false, 420, 600)
  expect(marks.packets).toBeGreaterThan(0)
  expect(marks.arrows).toEqual([])
  expect(marks.label).toBeNull()
})

test('reduced motion replaces the items with still arrows and the rate they carry', () => {
  const marks = flowMarks(true, 420, 600)
  expect(marks.packets).toBe(0)
  expect(marks.arrows.length).toBeGreaterThan(0)
  expect(marks.label).toBe('420/s')
  // Evenly spaced, clear of both ports.
  for (const at of marks.arrows) {
    expect(at).toBeGreaterThan(0)
    expect(at).toBeLessThan(1)
  }
  expect([...marks.arrows]).toEqual([...marks.arrows].sort((left, right) => left - right))
})

test('a short belt gets at least one arrow, and a long one no more than four', () => {
  expect(flowMarks(true, 12, 30).arrows).toHaveLength(1)
  expect(flowMarks(true, 12, 2_000).arrows).toHaveLength(4)
})

test('the label is the rate in the interface figures', () => {
  expect(flowLabel(42)).toBe('42.0/s')
  expect(flowLabel(4_200)).toBe('4.20k/s')
})
