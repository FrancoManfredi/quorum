import { describe, expect, test } from 'vitest'
import { supportedLocales } from './index.ts'
import { copyIn } from './messages.ts'

const fr_ = copyIn('fr')

describe('localized presentation', () => {
  test('French is available by its native name', () => {
    expect(supportedLocales).toContainEqual({ value: 'fr', label: 'Français' })
  })

  test('French names the terms the game links to', () => {
    expect(fr_.catalog.glossary['backpressure']!.term).toBe('Contre-pression')
  })
})
