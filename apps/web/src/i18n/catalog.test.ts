import { beforeAll, describe, expect, test } from 'vitest'
import { inertHtml } from 'foldkit/html'
import { CHALLENGES } from '@quorum/simulation/challenges'
import { GLOSSARY, RESEARCH } from '@quorum/simulation/catalog'
import { glossaryUrl } from '../platform/analytics.ts'
import { localizeBuilder } from './builder.ts'
import { copy, copyIn, loadLocale } from './messages.ts'
import { changeIn } from './refusal.ts'
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

describe('Design change labels', () => {
  const english = copyIn('en').changes

  test('a stored English label reads in Spanish and French, with its names translated', () => {
    const lever = english.leverRaised(copyIn('en').catalog.kinds.search.label)
    expect(changeIn(copyIn('es'), lever)).toBe(
      `Subiste la palanca ${copyIn('es').catalog.kinds.search.label}`,
    )
    expect(changeIn(copyIn('fr'), lever)).toBe(
      `Levier ${copyIn('fr').catalog.kinds.search.label} augmenté`,
    )
    expect(changeIn(copyIn('es'), english.policyCleared(english.policies.hire))).toBe(
      'Desactivaste la política contratación',
    )
    expect(
      changeIn(copyIn('es'), english.topology(copyIn('en').inspectorDatabase.singlePrimary)),
    ).toBe('Topología: Primario único')
    expect(changeIn(copyIn('es'), english.toggles.stickyOn)).toBe('Sesiones sticky activadas')
    expect(changeIn(copyIn('fr'), english.toggles.stickyOn)).toBe('Sessions persistantes activées')
  })

  test('English, and a label the table does not know, stay as written', () => {
    expect(changeIn(copyIn('en'), english.toggles.gzipOn)).toBe('Gzip on')
    expect(changeIn(copyIn('es'), 'Reordered the backlog')).toBe('Reordered the backlog')
  })

  test.each(supportedLocales.map(({ value }) => value))(
    'every toggle label has %s copy',
    (locale) => {
      const t = copyIn(locale)
      for (const [id, text] of Object.entries(english.toggles)) {
        const shown = changeIn(t, text)
        expect(shown, id).toBe((t.changes.toggles as Record<string, string>)[id])
        if (locale !== 'en') expect(shown, id).not.toBe(text)
      }
    },
  )
})

describe('wiki links', () => {
  test('a Spanish game opens the Spanish glossary page, and every other language the English one', () => {
    expect(glossaryUrl('apdex', 'es')).toBe('https://wiki.playquorum.dev/es/glossary/apdex')
    expect(glossaryUrl('apdex', 'en')).toBe('https://wiki.playquorum.dev/glossary/apdex')
    expect(glossaryUrl('apdex', 'fr')).toBe('https://wiki.playquorum.dev/glossary/apdex')
    expect(glossaryUrl('apdex')).toBe('https://wiki.playquorum.dev/glossary/apdex')
  })
})
