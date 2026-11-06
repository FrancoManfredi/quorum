import { describe, expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import { glossaryPanel } from '../components/lab/glossary.ts'
import { initialModel, update } from '../game/update.ts'
import { localizeBuilder } from './builder.ts'
import { copyIn } from './messages.ts'

const fr_ = copyIn('fr')
import { supportedLocales } from './index.ts'

describe('localized presentation', () => {
  test('French is available by its native name', () => {
    expect(supportedLocales).toContainEqual({ value: 'fr', label: 'Français' })
  })

  test('French glossary search respects categories', () => {
    const model = {
      ...initialModel(),
      prefs: { ...initialModel().prefs, locale: 'fr' as const },
      glossary: { ...initialModel().glossary, query: 'contre-pression' },
    }
    Scene.scene(
      { update, view: (m, h) => glossaryPanel(m, localizeBuilder(m.prefs.locale, h)) },
      Scene.given(model),
      Scene.expect(Scene.text(fr_.catalog.glossary['backpressure']!.term)).toExist(),
    )
    Scene.scene(
      { update, view: (m, h) => glossaryPanel(m, localizeBuilder(m.prefs.locale, h)) },
      Scene.given({ ...model, glossary: { ...model.glossary, category: 'security' } }),
      Scene.expect(Scene.text(fr_.glossary.noMatches)).toExist(),
    )
  })

  test('French glossary search accepts unaccented input', () => {
    Scene.scene(
      { update, view: (m, h) => glossaryPanel(m, localizeBuilder(m.prefs.locale, h)) },
      Scene.given({
        ...initialModel(),
        prefs: { ...initialModel().prefs, locale: 'fr' },
        glossary: { ...initialModel().glossary, query: 'repartiteur de charge' },
      }),
      Scene.expect(Scene.text(fr_.catalog.glossary['load-balancer']!.term)).toExist(),
    )
  })
})
