import { beforeAll, describe, expect, test } from 'vitest'
import { inertHtml } from 'foldkit/html'
import { CHALLENGES } from '@quorum/simulation/challenges'
import { GLOSSARY, RESEARCH } from '@quorum/simulation/catalog'
import { glossaryUrl } from '../platform/analytics.ts'
import { localizeBuilder } from './builder.ts'
import { copy, copyIn, loadLocale } from './messages.ts'
import { supportedLocales } from './index.ts'

// English ships in the main chunk; the other catalogs are dynamic imports. Load them like a player
// who picked one of those languages would, before the tests read their copy.
beforeAll(async () => {
  await Promise.all(supportedLocales.map(({ value }) => loadLocale(value)))
})

describe('typed copy', () => {
  test('a builder speaks its language, and an untagged builder speaks English', () => {
    expect(copy(localizeBuilder('fr', inertHtml)).hud.cash).toBe(copyIn('fr').hud.cash)
    expect(copy(localizeBuilder('fr', inertHtml)).hud.cash).not.toBe(copyIn('en').hud.cash)
    expect(copy(inertHtml)).toBe(copyIn('en'))
  })

  test('English catalog copy is the Simulation table text, not a second copy', () => {
    const english = copyIn('en').catalog
    expect(english.research.stripe.name).toBe(RESEARCH.stripe.name)
    expect(english.glossary['annotation']!.term).toBe(
      GLOSSARY.find(({ id }) => id === 'annotation')!.term,
    )
  })

  test.each(supportedLocales.map(({ value }) => value))(
    'every Glossary entry and Challenge has %s copy',
    (locale) => {
      const { catalog } = copyIn(locale)
      for (const { id } of GLOSSARY)
        expect(catalog.glossary[id]?.term, `glossary ${id}`).toBeTruthy()
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

describe('wiki links', () => {
  test('a Spanish game opens the Spanish glossary page, and every other language the English one', () => {
    expect(glossaryUrl('apdex', 'es')).toBe('https://wiki.playquorum.dev/es/glossary/apdex')
    expect(glossaryUrl('apdex', 'en')).toBe('https://wiki.playquorum.dev/glossary/apdex')
    expect(glossaryUrl('apdex', 'fr')).toBe('https://wiki.playquorum.dev/glossary/apdex')
    expect(glossaryUrl('apdex')).toBe('https://wiki.playquorum.dev/glossary/apdex')
  })
})
