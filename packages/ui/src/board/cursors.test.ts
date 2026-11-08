import { expect, test } from 'vitest'
import { CURSOR_DELAY_MS, CursorTracks, type SeatCursor } from './cursors.ts'

const cursor = (x: number, y = 0): SeatCursor => ({
  seat: 'tab-2',
  name: 'Ada',
  colour: 'red',
  x,
  y,
  region: 'na',
})

test('a cursor waits out the delay, then follows the samples', () => {
  const tracks = new CursorTracks()
  tracks.move(cursor(0), 1_000)
  // The newest sample is not drawn yet: the delay is the room the next one needs.
  expect(tracks.play(1_000 + CURSOR_DELAY_MS)[0]?.x).toBe(0)
  tracks.move(cursor(100), 1_040)
  expect(tracks.play(1_040)[0]?.x).toBe(0)
  expect(tracks.play(1_040 + CURSOR_DELAY_MS)[0]?.x).toBe(100)
  const between = tracks.play(1_020 + CURSOR_DELAY_MS)[0]?.x ?? 0
  expect(between).toBeGreaterThan(0)
  expect(between).toBeLessThan(100)
})

test('a pause is a jump, not a glide across the Board', () => {
  const tracks = new CursorTracks()
  tracks.move(cursor(0), 0)
  tracks.move(cursor(500), 1_000)
  expect(tracks.play(1_000)[0]?.x).toBe(500)
})

test('the other Seats names and colours ride along', () => {
  const tracks = new CursorTracks()
  tracks.move({ ...cursor(10, 20), name: 'Grace', colour: 'blue' }, 0)
  expect(tracks.play(0)[0]).toMatchObject({
    seat: 'tab-2',
    name: 'Grace',
    colour: 'blue',
    x: 10,
    y: 20,
    region: 'na',
  })
})

test('a Seat that leaves takes its cursor with it', () => {
  const tracks = new CursorTracks()
  tracks.move(cursor(10), 0)
  tracks.remove('tab-2')
  expect(tracks.play(0)).toEqual([])
})
