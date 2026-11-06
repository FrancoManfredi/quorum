import { describe, expect, test } from 'vitest'
import { Schema } from 'effect'
import { Scene } from 'foldkit/test'
import { Prefs, type Model } from './model.ts'
import { PrefsMessage } from './prefs.ts'
import { applySettings } from './commands.ts'
import { initialModel, update } from './update.ts'
import { Message } from './message.ts'
import { settingsPanel } from '../components/lab/panels.ts'

/* ==========================================================================
   15 "Accessibility": Text at 150%. The setting is a pref like Mute and Reduce
   motion, it is applied to the root as `data-text`, and styles.css scales the
   type through `--type-scale` while the boxes keep their size.
   ========================================================================== */

type Named = Readonly<{ name: string; args: Record<string, unknown> }>

const named = (model: Model, message: Message): ReadonlyArray<Named> =>
  ((update(model, message) as { commands?: ReadonlyArray<unknown> }).commands ??
    []) as ReadonlyArray<Named>

/** A stand-in for the document's root: applySettings only touches `dataset`, `lang`, and `classList`. */
const rootOf = (): HTMLElement => {
  const classes = new Set<string>()
  return {
    dataset: {},
    lang: '',
    classList: {
      contains: (name: string) => classes.has(name),
      toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name), on),
    },
  } as unknown as HTMLElement
}

const baseSettings = {
  muted: false,
  motion: 'system' as const,
  locale: 'en' as const,
  agentAccess: false,
  analytics: true,
  text: 'normal' as const,
  theme: 'light' as const,
}

describe('text at 150%', () => {
  test('the switch sets the pref, which is saved and applied like motion', () => {
    const start = initialModel()
    const large = update(start, Message.PrefsChanged({ message: PrefsMessage.TextToggled() }))
    expect(large.model.prefs.text).toBe('large')
    expect(large.model.board.game).toBe(start.board.game)
    const write = named(start, Message.PrefsChanged({ message: PrefsMessage.TextToggled() })).find(
      (command) => command.name === 'WritePrefs',
    )
    expect(write?.args['prefs']).toMatchObject({ text: 'large' })
    const apply = named(start, Message.PrefsChanged({ message: PrefsMessage.TextToggled() })).find(
      (command) => command.name === 'ApplySettings',
    )
    expect(apply?.args).toMatchObject({ text: 'large' })
    // Turning it off leaves the pref at its own size again.
    expect(
      update(large.model, Message.PrefsChanged({ message: PrefsMessage.TextToggled() })).model.prefs
        .text,
    ).toBe('normal')
  })

  test('applying it marks the root, and clears the mark when it is off', () => {
    const root = rootOf()
    const settings = baseSettings
    applySettings(root, { ...settings, text: 'large' })
    expect(root.dataset['text']).toBe('150')
    applySettings(root, { ...settings, text: 'normal' })
    expect(root.dataset['text']).toBeUndefined()
    // Motion and language still apply from the same call.
    applySettings(root, { ...settings, motion: 'reduce', locale: 'fr', text: 'large' })
    expect(root.dataset['motion']).toBe('reduce')
    expect(root.lang).toBe('fr')
  })

  test('preferences saved before it existed read at their own size', () => {
    expect(Schema.decodeSync(Prefs)({ muted: true, motion: 'reduce' })).toMatchObject({
      text: 'normal',
    })
    const restored = update(
      initialModel(),
      Message.PrefsLoaded({ json: JSON.stringify({ muted: true, motion: 'reduce' }) }),
    )
    expect(restored.model.prefs.text).toBe('normal')
  })

  test('the Settings panel shows it on, beside Reduce motion', () => {
    const model: Model = { ...initialModel(), prefs: { ...initialModel().prefs, text: 'large' } }
    Scene.scene(
      { update, view: settingsPanel },
      Scene.given(model),
      Scene.expect(Scene.role('switch', { name: 'Text at 150%' })).toBeChecked(),
      Scene.expect(Scene.text('Text at 150%')).toExist(),
    )
  })
})

describe('dark mode', () => {
  test('the switch flips the theme, which is saved and applied', () => {
    const start = initialModel()
    expect(start.prefs.theme).toBe('light')
    const result = update(start, Message.PrefsChanged({ message: PrefsMessage.ThemeToggled() }))
    expect(result.model.prefs.theme).toBe('dark')
    const commands = (result.commands ?? []) as ReadonlyArray<Named>
    expect(commands.find((command) => command.name === 'WritePrefs')?.args['prefs']).toMatchObject({
      theme: 'dark',
    })
    expect(commands.find((command) => command.name === 'ApplySettings')?.args).toMatchObject({
      theme: 'dark',
    })
    expect(
      update(result.model, Message.PrefsChanged({ message: PrefsMessage.ThemeToggled() })).model
        .prefs.theme,
    ).toBe('light')
  })

  test('applying it puts `.dark` on the root, and takes it off for light', () => {
    const root = rootOf()
    applySettings(root, { ...baseSettings, theme: 'dark' })
    expect(root.classList.contains('dark')).toBe(true)
    applySettings(root, { ...baseSettings, theme: 'light' })
    expect(root.classList.contains('dark')).toBe(false)
  })

  test('preferences saved before it existed read as light', () => {
    expect(Schema.decodeSync(Prefs)({ muted: true }).theme).toBe('light')
  })
})
