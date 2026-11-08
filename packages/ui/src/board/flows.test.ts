import { expect, test } from 'vitest'
import { company, node } from '@quorum/simulation/company'
import type { ComponentId, RegionId } from '@quorum/simulation/catalog'
import type { Game, GameNode } from '@quorum/simulation/state'
import { flowLabel, flowMarks, placeLabel } from './flows.ts'

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

/* 15 "The board": a belt between regions says what its round trip costs. */

const world = (): Game => ({ ...company(1), nodes: [], links: [] })
const at = (id: string, type: ComponentId, region: RegionId): GameNode =>
  node(id, type, 0, 0, { region })

test('a link inside one region says nothing about distance', () => {
  expect(placeLabel(world(), at('a', 'server', 'na'), at('b', 'database', 'na'))).toBeNull()
})

test('a link between two regions shows the round trip the Simulation charges', () => {
  expect(placeLabel(world(), at('a', 'server', 'na'), at('b', 'database', 'eu'))).toBe('75 ms')
  expect(placeLabel(world(), at('a', 'server', 'eu'), at('b', 'database', 'apac'))).toBe('160 ms')
  // A Users Node pays a user's two round trips, not a Node's one.
  expect(placeLabel(world(), at('u', 'users', 'na'), at('b', 'lb', 'eu'))).toBe('150 ms')
})

test('a global Node pays no place, so its link shows no round trip', () => {
  expect(placeLabel(world(), at('a', 'server', 'na'), at('p', 'psp', 'eu'))).toBeNull()
})
