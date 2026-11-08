import { describe, expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import { inboxPanel, peek } from '../components/lab/inbox.ts'
import { ADVICE } from '../game/copy/index.ts'
import { EMPTY_INBOX, mailed } from '../game/inbox.ts'
import { initialModel, update } from '../game/update.ts'
import { localizeBuilder } from './builder.ts'

describe('Chinese mail views', () => {
  test('a funding letter written from its data shows in both the preview and the inbox without changing stored mail', () => {
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
      prefs: { ...base.prefs, locale: 'zh-CN' as const },
      board: { ...base.board, inbox },
    }
    const original = JSON.stringify(inbox)
    for (const panelView of [peek, inboxPanel]) {
      Scene.scene(
        { update, view: (m, h) => panelView(m, localizeBuilder(m.prefs.locale, h)) },
        Scene.given(model),
        Scene.expect(Scene.text('回复：回复：你的 天使轮（顶一下）')).toExist(),
        Scene.expect(
          Scene.text('嗨！再把这封信顶到收件箱上面，免得它被你凌晨三点的告警埋了。'),
        ).toExist(),
        Scene.expect(Scene.text('Needs action')).not.toExist(),
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
