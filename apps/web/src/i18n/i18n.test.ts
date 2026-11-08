import { PrefsMessage } from '../game/prefs.ts'
import { describe, expect, test } from 'vitest'
import { Option, Schema } from 'effect'
import { Listbox } from '@foldkit/ui'
import { Prefs } from '../game/model.ts'
import { Message } from '../game/message.ts'
import { initialModel, update } from '../game/update.ts'
import { AppRoute } from '../game/route.ts'
import { supportedLocales } from './index.ts'

/** Every language but English: the ones a switch can move to. */
const others = supportedLocales.map(({ value }) => value).filter((value) => value !== 'en')

describe('interface languages', () => {
  test('old preferences still decode without losing sound or motion', () => {
    const prefs = Schema.decodeSync(Prefs)({ muted: true, motion: 'reduce' })
    expect(prefs).toMatchObject({ locale: 'en', muted: true, motion: 'reduce' })
  })

  test.each(others)(
    'switching to %s persists and synchronizes a paused board without changing the game',
    (locale) => {
      const model = {
        ...initialModel(),
        route: AppRoute.Company(),
        board: {
          ...initialModel().board,
          clock: { ...initialModel().board.clock, mode: { _tag: 'PausedByPlayer' } as const },
        },
      }
      const result = update(
        model,
        Message.PrefsChanged({ message: PrefsMessage.LocaleChosen({ locale }) }),
      )
      expect(result.model.prefs.locale).toBe(locale)
      expect(result.model.board.game).toBe(model.board.game)
      expect(result.model.board.clock.mode._tag !== 'Running').toBe(true)
      expect(result.commands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'WritePrefs',
            args: expect.objectContaining({ prefs: expect.objectContaining({ locale }) }),
          }),
          expect.objectContaining({
            name: 'ApplySettings',
            args: expect.objectContaining({ locale }),
          }),
          expect.objectContaining({
            name: 'SyncBoard',
            args: expect.objectContaining({ locale }),
          }),
        ]),
      )
      const restored = update(
        initialModel(),
        Message.PrefsLoaded({
          json: JSON.stringify({ locale, muted: true, motion: 'reduce' }),
        }),
      )
      expect(restored.model.prefs).toMatchObject({ locale, muted: true, motion: 'reduce' })
      expect(
        update(
          result.model,
          Message.PrefsChanged({ message: PrefsMessage.LocaleChosen({ locale: 'en' }) }),
        ).model.board.game,
      ).toBe(model.board.game)
    },
  )

  test.each(others)(
    '%s and existing preferences survive company, sandbox and challenge entry',
    (locale) => {
      const model = {
        ...initialModel(),
        prefs: { ...initialModel().prefs, locale, muted: true, motion: 'reduce' as const },
      }
      for (const message of [
        Message.CompanyFounded(),
        Message.PreseedStarted(),
        Message.FreeSandboxStarted(),
        Message.ChallengeStarted({ id: 'hello-world' }),
      ]) {
        expect(update(model, message).model.prefs).toMatchObject({
          locale,
          muted: true,
          motion: 'reduce',
        })
      }
    },
  )

  test.each(others)(
    'selecting %s closes the listbox, restores focus and persists the locale',
    (locale) => {
      const model = {
        ...initialModel(),
        route: AppRoute.Company(),
        board: {
          ...initialModel().board,
          clock: { ...initialModel().board.clock, mode: { _tag: 'PausedByPlayer' } as const },
        },
      }
      const opened = update(
        model,
        Message.LanguagePickerChanged({
          message: Listbox.Message.Opened({ maybeActiveItemIndex: Option.some(0) }),
        }),
      )
      expect(opened.model.languagePicker.isOpen).toBe(true)
      const selected = update(
        opened.model,
        Message.LanguagePickerChanged({
          message: Listbox.Message.SelectedItem({ item: locale }),
        }),
      )
      expect(selected.model.languagePicker.isOpen).toBe(false)
      expect(selected.model.prefs.locale).toBe(locale)
      expect(selected.model.board.game).toBe(model.board.game)
      expect(selected.model.board.clock.mode._tag !== 'Running').toBe(true)
      expect(selected.commands?.map((command) => command.name)).toEqual(
        expect.arrayContaining(['FocusButton', 'WritePrefs', 'ApplySettings', 'SyncBoard']),
      )
      const closed = update(
        opened.model,
        Message.LanguagePickerChanged({ message: Listbox.Message.Closed() }),
      )
      expect(closed.model.prefs.locale).toBe('en')
      expect(closed.model.languagePicker.isOpen).toBe(false)
      expect(closed.commands?.map((command) => command.name)).not.toContain('WritePrefs')
    },
  )
})
