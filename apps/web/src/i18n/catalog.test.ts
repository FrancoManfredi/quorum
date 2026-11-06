import { describe, expect, test } from 'vitest'
import { inertHtml } from 'foldkit/html'
import { CHALLENGES } from '@quorum/simulation/challenges'
import { GLOSSARY, RESEARCH } from '@quorum/simulation/catalog'
import { localizeBuilder } from './builder.ts'
import { copy, copyIn } from './messages.ts'
import { supportedLocales } from './index.ts'

/* ==========================================================================
   The typed copy: the compiler checks every language has the same shape, and
   tables keyed by a plain string id are checked here. English is read from the
   Simulation's tables, so it is the tables' own text.
   ========================================================================== */

describe('typed copy', () => {
  test('a builder speaks its language, and an untagged builder speaks English', () => {
    expect(copy(localizeBuilder('fr', inertHtml)).hud.cash).toBe(copyIn('fr').hud.cash)
    expect(copy(localizeBuilder('fr', inertHtml)).hud.cash).not.toBe(copyIn('en').hud.cash)
    expect(copy(inertHtml)).toBe(copyIn('en'))
  })

  test('English catalog copy is the Simulation table text, not a second copy', () => {
    const english = copyIn('en').catalog
    expect(english.research.stripe.name).toBe(RESEARCH.stripe.name)
    expect(english.glossary['annotation']!.definition).toBe(
      GLOSSARY.find(({ id }) => id === 'annotation')!.definition,
    )
  })

  test.each(supportedLocales.map(({ value }) => value))(
    'every Glossary entry and Challenge has %s copy',
    (locale) => {
      const { catalog } = copyIn(locale)
      for (const { id } of GLOSSARY) {
        expect(catalog.glossary[id]?.term, `glossary ${id}`).toBeTruthy()
        expect(catalog.glossary[id]?.definition, `glossary ${id}`).toBeTruthy()
      }
      for (const { id } of CHALLENGES)
        expect(catalog.challenges[id]?.name, `challenge ${id}`).toBeTruthy()
    },
  )

  test('a parameterised message fills its values in each language', () => {
    expect(copyIn('en').hud.roundAtUsers('Seed', '5.00k')).toBe('Seed round at 5.00k users')
    expect(copyIn('fr').hud.roundAtUsers('Seed', '5.00k')).toContain('5.00k')
    expect(copyIn('zh-CN').hud.roundAtUsers('Seed', '5.00k')).toContain('5.00k')
  })
})
