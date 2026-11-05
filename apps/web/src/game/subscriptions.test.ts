import { expect, test } from 'vitest'
import { keyNameOf } from './subscriptions.ts'

test('Shift names the keys that need it without taking redo’s Z', () => {
  expect(keyNameOf('T', true)).toBe('Shift+t')
  expect(keyNameOf('F', true)).toBe('Shift+f')
  // Redo has shipped as Z since the first shortcut list.
  expect(keyNameOf('Z', true)).toBe('Z')
  expect(keyNameOf('ArrowUp', true)).toBe('Shift+ArrowUp')
  // No Shift keeps the plain keys the board already uses.
  expect(keyNameOf('T', false)).toBe('t')
  expect(keyNameOf('F', false)).toBe('f')
  expect(keyNameOf('Enter', false)).toBe('Enter')
  expect(keyNameOf('Escape', false)).toBe('Escape')
})
