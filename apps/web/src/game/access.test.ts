import { describe, expect, test } from 'vitest'
import { Scene } from 'foldkit/test'
import { preseedGame } from '@quorum/simulation/company'
import { canPlayOnline, keyNote, parseAccess } from './access.ts'
import { EMPTY_ACCESS, type Model } from './model.ts'
import { AppRoute } from './route.ts'
import { fileFor } from './saves.ts'
import { initialModel, update } from './update.ts'
import { Message } from './message.ts'
import { PanelFocus, settingsPanel } from '../components/lab/panels.ts'
import { copyIn } from '../i18n/messages.ts'

type Named = Readonly<{ name: string; args: Record<string, unknown> }>

/** The panel opens with focus inside it, which a scene resolves by hand. */
const focused = () => Scene.Mount.resolve(PanelFocus, Message.Synced())

const named = (model: Model, message: Message): ReadonlyArray<Named> =>
  ((update(model, message) as { commands?: ReadonlyArray<unknown> }).commands ??
    []) as ReadonlyArray<Named>

/** A Company the browser is playing, so its file can go online. */
const playing = (): Model => {
  const game = preseedGame()
  const file = fileFor({
    id: 'c-one',
    name: 'Stored Co',
    logo: 'signal',
    founding: game.founding,
    game,
    now: 1_000,
  })
  return {
    ...initialModel(),
    route: AppRoute.Company(),
    companyPhase: { _tag: 'Open', id: file.id },
    saves: { current: file.id, companies: [file] },
    board: { ...initialModel().board, game },
  }
}

const KEY = 'K7QM-3XPA-9RTF-2WHD'

/** The key an accepted check hands back, as the API Worker normalizes it. */
const accepted = (key = KEY) =>
  Message.KeyAccepted({ key, features: ['multiplayer'], expiresAt: null })

describe('the feature key', () => {
  test('submitting the field asks the API Worker for the key it holds', () => {
    const typed = update(initialModel(), Message.KeyTyped({ value: ` ${KEY} ` })).model
    const sent = update(typed, Message.KeySubmitted())
    expect(sent.model.keyPhase).toEqual({ _tag: 'Checking' })
    expect(sent.commands?.map((command) => command.name)).toContain('CheckFeatureKey')
    const check = named(typed, Message.KeySubmitted()).find(
      (command) => command.name === 'CheckFeatureKey',
    )
    expect(check?.args['key']).toBe(KEY)
  })

  test('an empty field asks nothing, and a second press does not ask twice', () => {
    const asks = (model: Model) =>
      named(model, Message.KeySubmitted()).filter((command) => command.name === 'CheckFeatureKey')
    expect(asks(initialModel())).toEqual([])
    const checking = update(
      update(initialModel(), Message.KeyTyped({ value: KEY })).model,
      Message.KeySubmitted(),
    ).model
    expect(asks(checking)).toEqual([])
  })

  test('an accepted key is kept beside the settings and unlocks Online Rooms', () => {
    const start = update(initialModel(), Message.KeyTyped({ value: KEY })).model
    const active = update(start, accepted())
    expect(active.model.access).toEqual({
      key: KEY,
      features: ['multiplayer'],
      expiresAt: null,
    })
    expect(canPlayOnline(active.model)).toBe(true)
    expect(active.model.keyPhase).toEqual({ _tag: 'Idle' })
    // The next load reads the key back from the browser.
    expect(
      named(start, accepted()).find((command) => command.name === 'WriteAccess')?.args['access'],
    ).toEqual({ key: KEY, features: ['multiplayer'], expiresAt: null })
  })

  test('a refused key is not kept, and says why', () => {
    const typed = update(initialModel(), Message.KeyTyped({ value: 'NOPE' })).model
    const start = update(typed, Message.KeySubmitted()).model
    const refused = update(start, Message.KeyRefused({ note: 'That feature key is not valid.' }))
    expect(refused.model.access).toEqual(EMPTY_ACCESS)
    expect(refused.model.keyPhase).toEqual({
      _tag: 'Refused',
      note: 'That feature key is not valid.',
    })
    expect((refused.commands ?? []).some((command) => command.name === 'WriteAccess')).toBe(false)
    expect(keyNote(refused.model, copyIn('en')).text).toBe('That feature key is not valid.')
  })

  test('a stored key comes back with the settings, and a broken one is ignored', () => {
    const stored = JSON.stringify({ key: KEY, features: ['multiplayer'], expiresAt: null })
    const loaded = update(initialModel(), Message.AccessLoaded({ json: stored })).model
    expect(loaded.access.key).toBe(KEY)
    expect(loaded.keyDraft).toBe(KEY)
    expect(canPlayOnline(loaded)).toBe(true)

    for (const json of [null, '{not json', JSON.stringify({ key: 1 })]) {
      const broken = update(initialModel(), Message.AccessLoaded({ json })).model
      expect(broken.access).toEqual(EMPTY_ACCESS)
    }
    expect(parseAccess(stored)).toMatchObject({ value: { key: KEY } })
  })

  test('removing the key locks Online Rooms again and forgets it in the browser', () => {
    const start = update(initialModel(), accepted()).model
    const removed = update(start, Message.KeyCleared())
    expect(removed.model.access).toEqual(EMPTY_ACCESS)
    expect(removed.model.keyDraft).toBe('')
    expect(canPlayOnline(removed.model)).toBe(false)
    expect(
      named(start, Message.KeyCleared()).find((command) => command.name === 'WriteAccess')?.args[
        'access'
      ],
    ).toEqual(EMPTY_ACCESS)
  })
})

describe('Online Rooms behind the key', () => {
  test('a Company without a key cannot go online, and nothing is sent', () => {
    const asked = update(playing(), Message.RoomPublishAsked())
    expect((asked.commands ?? []).some((command) => command.name === 'PublishRoom')).toBe(false)
    expect(asked.model.toast?.message).toBe(copyIn('en').room.needsKey)
    expect(asked.model.toast?.tone).toBe('warn')
  })

  test('a Company with a key sends the key with the publish', () => {
    const allowed = update(playing(), accepted()).model
    const asked = update(allowed, Message.RoomPublishAsked())
    const publish = (asked.commands ?? []).find((command) => command.name === 'PublishRoom') as
      | Named
      | undefined
    expect(publish?.args['key']).toBe(KEY)
  })
})

describe('the Settings section', () => {
  const section = (model: Model): Model => ({ ...model, settingsSection: 'access' })

  test('says what is locked before a key is entered', () => {
    Scene.scene(
      { update, view: settingsPanel },
      Scene.given(section(initialModel())),
      focused(),
      Scene.expect(Scene.text('Feature key')).toExist(),
      Scene.expect(Scene.text('Online Rooms need a feature key.')).toExist(),
    )
  })

  test('says what is unlocked once the key works, and offers to remove it', () => {
    Scene.scene(
      { update, view: settingsPanel },
      Scene.given(section(update(initialModel(), accepted()).model)),
      focused(),
      Scene.expect(Scene.text('Online Rooms unlocked.')).toExist(),
      Scene.expect(Scene.text('Remove key')).toExist(),
    )
  })

  test('a locked Room leads straight to the key field', () => {
    const opened = update(playing(), Message.FeatureKeyAsked())
    expect(opened.model.panel).toBe('settings')
    expect(opened.model.settingsSection).toBe('access')
  })
})
