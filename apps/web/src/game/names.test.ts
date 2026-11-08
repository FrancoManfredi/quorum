import { describe, expect, test } from 'vitest'
import { ROOM_NAME_LENGTH, randomName } from './names.ts'

describe('a Seat name', () => {
  test('joins one adjective to one animal', () => {
    expect(randomName(() => 0)).toBe('MarvelousMonkey')
    expect(randomName(() => 0.999_999)).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+$/)
  })

  test('stays inside the length the Room trims to', () => {
    expect(randomName(() => 0.4).length).toBeLessThanOrEqual(ROOM_NAME_LENGTH)
    expect(randomName(() => 0.99).length).toBeLessThanOrEqual(ROOM_NAME_LENGTH)
  })
})
