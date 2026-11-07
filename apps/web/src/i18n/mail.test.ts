import { describe, expect, test } from 'vitest'
import { preseedGame } from '@quorum/simulation/company'
import { SAMPLES } from '../game/mail.ts'
import { writtenIn } from './mail-render.ts'
import { copyIn } from './messages.ts'
import { supportedLocales } from './index.ts'

/** Every language but English, which is the letters' own source. */
const others = supportedLocales.map(({ value }) => value).filter((value) => value !== 'en')

/* ==========================================================================
   Every letter the game can write, in every language: the same letters in the
   same order, and a Mail written again from what it says reads as the English
   it was stored with.
   ========================================================================== */

const game = preseedGame()
const facts = SAMPLES.flatMap((sample) => [1, 2, 3].map((n) => sample.make(game, n * 7)))

describe('Mail copy', () => {
  test.each(others)('%s has every letter, with as many versions', (locale) => {
    const english = copyIn('en').mail.letters
    const own = copyIn(locale).mail.letters
    expect(Object.keys(own).sort()).toEqual(Object.keys(english).sort())
    for (const [id, versions] of Object.entries(english))
      expect(own[id]?.length, id).toBe(versions.length)
  })

  test('English, written again from its data, is the English that was stored', () => {
    for (const fact of facts) {
      expect(fact.message, fact.key).toBeDefined()
      const written = writtenIn(copyIn('en'), fact.message!)
      expect(written, fact.key).toEqual({ subject: fact.subject, body: fact.text })
    }
  })

  test.each(others)('%s letters fill in every value they quote', (locale) => {
    for (const fact of facts) {
      const written = writtenIn(copyIn(locale), fact.message!)!
      expect(written.subject + written.body, fact.key).not.toMatch(/undefined|\[object|⟦/)
      expect(written.subject, fact.key).not.toBe('')
    }
  })
})
