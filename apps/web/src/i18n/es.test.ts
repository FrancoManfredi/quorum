import { describe, expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import { inboxPanel, peek } from '../components/lab/inbox.ts'
import { ADVICE } from '../game/copy/index.ts'
import { EMPTY_INBOX, mailed } from '../game/inbox.ts'
import { initialModel, update } from '../game/update.ts'
import { localizeBuilder } from './builder.ts'
import { supportedLocales } from './index.ts'
import { copyIn } from './messages.ts'

const es_ = copyIn('es')

describe('Spanish copy', () => {
  test('Spanish is available by its native name', () => {
    expect(supportedLocales).toContainEqual({ value: 'es', label: 'Español' })
  })

  test('Spanish names the terms the game links to', () => {
    expect(es_.catalog.glossary['backpressure']!.term).toBe('Contrapresión')
  })

  test('a letter written before the switch reads in Spanish and keeps its stored English', () => {
    const letter = ADVICE.round[4]!({ from: 'Sequel Capital', round: 'Pre-seed' })
    const inbox = mailed(
      EMPTY_INBOX,
      {
        key: 'round',
        sender: 'investor-sequel',
        subject: letter.subject,
        text: letter.body,
        actions: [{ id: 'raise', label: 'Raise' }],
        spam: false,
        message: {
          letter: {
            id: 'advice.round',
            variant: 4,
            vars: { from: 'Sequel Capital', round: 'Pre-seed' },
          },
          before: [],
          after: [],
        },
      },
      397,
      false,
    )
    const base = initialModel()
    const model = {
      ...base,
      prefs: { ...base.prefs, locale: 'es' as const },
      board: { ...base.board, inbox },
    }
    const original = JSON.stringify(inbox)
    for (const panelView of [peek, inboxPanel]) {
      Scene.scene(
        { update, view: (m, h) => panelView(m, localizeBuilder(m.prefs.locale, h)) },
        Scene.given(model),
        Scene.expect(Scene.text(/ronda/i)).toExist(),
        Scene.expect(Scene.text(letter.subject)).not.toExist(),
      )
    }
    Scene.scene(
      { update, view: (m, h) => inboxPanel(m, localizeBuilder('en', h)) },
      Scene.given(model),
      Scene.expect(Scene.text(letter.subject)).toExist(),
    )
    expect(JSON.stringify(inbox)).toBe(original)
  })
})
