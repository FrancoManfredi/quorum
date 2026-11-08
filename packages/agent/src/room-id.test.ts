import { describe, expect, test } from 'vitest'
import { isRoomId, isWriteKey, newWriteKey, roomIdOf } from './room-id.ts'

describe('agent room ids', () => {
  test('a write key makes a stable public id', async () => {
    const key = newWriteKey()
    const id = await roomIdOf(key)
    expect(isWriteKey(key)).toBe(true)
    expect(isRoomId(id)).toBe(true)
    expect(await roomIdOf(key)).toBe(id)
    expect(await roomIdOf(newWriteKey())).not.toBe(id)
  })

  test('malformed ids and keys are refused', () => {
    expect(isRoomId('too-short')).toBe(false)
    expect(isRoomId(`${'a'.repeat(21)}/`)).toBe(false)
    expect(isWriteKey('short')).toBe(false)
  })
})
