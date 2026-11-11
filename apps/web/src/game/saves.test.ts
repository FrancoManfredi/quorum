import { savedInbox } from './inbox.ts'
import { describe, expect, test } from 'vitest'
import { Effect } from 'effect'
import { newGame, preseedGame } from '@quorum/simulation/company'
import {
  ClearBrokenSave,
  DeleteCompany,
  KeepBrokenSave,
  LoadSaves,
  PruneSaves,
  WriteCompany,
} from './commands.ts'
import { Message } from './message.ts'
import { currentFile, hasCompany, type Model } from './model.ts'
import { AppRoute } from './route.ts'
import { SAVE_FORMAT } from './save-file.ts'
import { BROKEN_SAVE_KEY, SAVE_PREFIX, pruneCompanyFiles, sweepLegacyStorage } from './storage.ts'
import { TICK_MS, initialModel, update } from './update.ts'
import {
  EMPTY_SAVE_INDEX,
  MAX_COMPANY_NAME,
  fileFor,
  nameOr,
  newSaveId,
  refreshedIndex,
  type CompanyFile,
  type SaveIndex,
} from './saves.ts'

const send = (model: Model, ...messages: ReadonlyArray<Message>): Model =>
  messages.reduce((current, message) => update(current, message).model, model)

const commandsOf = (model: Model, ...messages: ReadonlyArray<Message>) => {
  let result = update(model, messages[0]!)
  for (const message of messages.slice(1)) result = update(result.model, message)
  return (result.commands ?? []).map((command) => command.name)
}

const tick = (model: Model, times = 1): Model => {
  let current = model
  for (let index = 0; index < times; index += 1)
    current = update(current, Message.Ticked({ elapsedMs: TICK_MS })).model
  return current
}

const fileIn = (index: SaveIndex, id: string): CompanyFile => {
  const file = index.companies.find((entry) => entry.id === id)
  if (!file) throw new Error(`no file ${id}`)
  return file
}

/** The browser storage the commands read and write. Every write is observable. */
type Storage = Readonly<{
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
  clear: () => void
  key: (index: number) => string | null
  length: number
}>

const fakeStorage = (seed: Record<string, string>): Storage => {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size
    },
  }
}

/** Runs commands against a fake `window.localStorage`, then puts the global back. */
const withStorage = <A>(storage: Storage, run: () => A): A => {
  const scope = globalThis as unknown as { window: { localStorage: Storage } | undefined }
  const prior = scope.window
  scope.window = { localStorage: storage }
  try {
    return run()
  } finally {
    scope.window = prior
  }
}

const runCommand = <A>(command: { effect: Effect.Effect<A, never, never> }): A =>
  Effect.runSync(command.effect)

/** A Company file as `SavesLoaded` reads it from storage. */
const indexOf = (files: ReadonlyArray<CompanyFile>, current: string | null): SaveIndex => ({
  current,
  companies: [...files],
})

/** One stored Company. */
const stored = (): Readonly<{
  index: SaveIndex
  game: ReturnType<typeof preseedGame>
  save: string
}> => {
  const game = { ...preseedGame() }
  const file = fileFor({
    id: 'c-one',
    name: 'Stored Co',
    logo: 'signal',
    founding: game.founding,
    game,
    now: 1_000,
  })
  return { index: indexOf([file], file.id), game, save: saveOf(game) }
}

/** A stored Company file, as this build writes it. */
const saveOf = (game: object, extra: Record<string, unknown> = {}): string =>
  JSON.stringify({ format: SAVE_FORMAT, ...game, ...extra })

describe('naming a Company', () => {
  test('a typed name is trimmed and cut to the field length; an empty one gets a fallback', () => {
    expect(nameOr('  Acme  ')).toBe('Acme')
    expect(nameOr('')).toBe('Untitled company')
    expect(nameOr('x'.repeat(MAX_COMPANY_NAME + 10))).toHaveLength(MAX_COMPANY_NAME)
  })

  test('the founding screen keeps the draft name and logo, and the Company takes them', () => {
    const typed = send(
      initialModel(),
      Message.CompanyNameChanged({ name: '  Night Shift  ' }),
      Message.LogoChosen({ logo: 'bolt' }),
      Message.CompanyFounded(),
    )
    const file = currentFile(typed)
    expect(file).toMatchObject({ name: 'Night Shift', logo: 'bolt', venture: 'b2b-saas' })
    expect(hasCompany(typed)).toBe(true)
    expect(typed.route).toEqual(AppRoute.Company())
    expect(commandsOf(initialModel(), Message.CompanyFounded())).toContain('WriteCompany')
  })

  test('the name field never grows past its limit while the player types', () => {
    const model = send(
      initialModel(),
      Message.CompanyNameChanged({ name: 'x'.repeat(MAX_COMPANY_NAME) }),
      Message.CompanyNameChanged({ name: `${'x'.repeat(MAX_COMPANY_NAME)}y` }),
    )
    expect(model.draft.name).toHaveLength(MAX_COMPANY_NAME)
  })

  test('a second Company becomes its own file, and the first one stays', () => {
    const first = send(initialModel(), Message.CompanyFounded())
    const firstId = first.saves.current
    const second = send(
      { ...first, draft: { name: 'Second Co', logo: 'cube' } },
      Message.CompanyFounded(),
    )
    expect(second.saves.companies).toHaveLength(2)
    expect(second.saves.current).not.toBe(firstId)
    expect(fileIn(second.saves, firstId!)).toMatchObject({ name: 'Untitled company' })
    expect(currentFile(second)).toMatchObject({ name: 'Second Co', logo: 'cube' })
  })

  test('a save id is unique even when two Companies share a seed', () => {
    const game = newGame(7920)
    const template = fileFor({
      id: newSaveId([], game.seed),
      name: 'One',
      logo: 'orbit',
      founding: game.founding,
      game,
      now: 1,
    })
    expect(newSaveId([template], game.seed)).not.toBe(template.id)
  })
})

describe('the Companies page', () => {
  test('an index loads its current Company in the background, without leaving the title', () => {
    const { index } = stored()
    const loaded = update(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(index), now: 2_000 }),
    )
    expect(loaded.model.saves).toEqual(index)
    expect(loaded.model.companyPhase).toEqual({ _tag: 'Opening', id: 'c-one' })
    expect(loaded.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'LoadCompany',
          args: expect.objectContaining({ id: 'c-one', open: false }),
        }),
      ]),
    )
  })

  test('a file that answers for another Company does not land', () => {
    const { index, game } = stored()
    const other = { ...preseedGame(4242) }
    const two = indexOf(
      [
        ...index.companies,
        fileFor({
          id: 'c-two',
          name: 'Two',
          logo: 'wave',
          founding: other.founding,
          game: other,
          now: 2,
        }),
      ],
      'c-one',
    )
    const waiting = send(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(two), now: 0 }),
      Message.CompanyLoaded({ id: 'c-one', open: true, json: saveOf(game) }),
      Message.CompanyChosen({ id: 'c-two' }),
      Message.CompanyOpened({ id: 'c-two' }),
      // The first file answers late: it belongs to the Company the player left.
      Message.CompanyLoaded({ id: 'c-one', open: true, json: saveOf(game) }),
    )
    expect(waiting.companyPhase).toEqual({ _tag: 'Opening', id: 'c-two' })
    expect(waiting.saves.current).toBe('c-one')
    const landed = send(
      waiting,
      Message.CompanyLoaded({ id: 'c-two', open: true, json: saveOf(other) }),
    )
    expect(landed.companyPhase).toEqual({ _tag: 'Open', id: 'c-two' })
    expect(landed.saves.current).toBe('c-two')
    expect(landed.board.game.seed).toBe(other.seed)
  })

  test('opening a file reads its Game, its disclosure, and its dashboard', () => {
    const { index, game } = stored()
    const json = JSON.stringify({
      format: SAVE_FORMAT,
      ...game,
      disclosure: { revealed: ['undo'], pending: [] },
      dashboard: { blocks: {} },
    })
    const opened = send(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(index), now: 0 }),
      Message.CompanyLoaded({ id: 'c-one', open: true, json }),
    )
    expect(hasCompany(opened)).toBe(true)
    expect(opened.route).toEqual(AppRoute.Company())
    expect(opened.saves.current).toBe('c-one')
    expect(opened.board.game.seed).toBe(game.seed)
    expect(opened.board.disclosure.revealed).toEqual(['undo'])
  })

  test('deleting the current Company drops its file and leaves no Company open', () => {
    const { index, game } = stored()
    const opened = send(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(index), now: 0 }),
      Message.CompanyLoaded({ id: 'c-one', open: true, json: saveOf(game) }),
    )
    const asked = send(opened, Message.CompanyChosen({ id: 'c-one' }), Message.CompanyDeleteAsked())
    expect(asked.saveConfirm).toEqual({ _tag: 'Confirming', id: 'c-one' })
    const result = update(asked, Message.CompanyDeleteConfirmed())
    expect(result.model.saves).toEqual(EMPTY_SAVE_INDEX)
    expect(result.model.companyPhase).toEqual({ _tag: 'None' })
    expect(result.model.saves.current).toBeNull()
    expect(result.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'DeleteCompany',
          args: expect.objectContaining({ id: 'c-one' }),
        }),
      ]),
    )
  })

  test('deleting another Company keeps the current one open', () => {
    const game = { ...preseedGame() }
    const first = fileFor({
      id: 'c-one',
      name: 'One',
      logo: 'orbit',
      founding: game.founding,
      game,
      now: 1,
    })
    const second: CompanyFile = {
      ...first,
      id: 'c-two',
      name: 'Two',
      logo: 'wave',
      updatedAt: 2,
    }
    const index = indexOf([first, second], 'c-one')
    const opened = send(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(index), now: 0 }),
      Message.CompanyLoaded({ id: 'c-one', open: true, json: saveOf(game) }),
      Message.CompanyChosen({ id: 'c-two' }),
      Message.CompanyDeleteAsked(),
      Message.CompanyDeleteConfirmed(),
    )
    expect(opened.saves.current).toBe('c-one')
    expect(opened.saves.companies.map((file) => file.id)).toEqual(['c-one'])
    expect(hasCompany(opened)).toBe(true)
  })

  test('a broken list is kept aside, and no Company opens', () => {
    const result = update(initialModel(), Message.SavesLoaded({ index: '{not json', now: 0 }))
    expect(result.model.companyPhase).toEqual({ _tag: 'None' })
    expect(result.commands).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'KeepBrokenSave' })]),
    )
  })
})

describe('autosave and migration', () => {
  test('the autosave writes the open Company file', () => {
    const founded = send(initialModel(), Message.CompanyFounded())
    const id = founded.saves.current
    const saved = tick(founded, 20)
    expect(saved.board.clock.savedAt).toBeGreaterThan(founded.board.clock.savedAt)
    const result = update(tick(founded, 19), Message.Ticked({ elapsedMs: TICK_MS }))
    expect(result.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'WriteCompany',
          args: expect.objectContaining({ id }),
        }),
      ]),
    )
  })

  test('leaving the board brings the Company file up to date for the title list', () => {
    const founded = send(initialModel(), Message.CompanyFounded())
    const id = founded.saves.current
    const played: Model = {
      ...founded,
      board: {
        ...founded.board,
        game: { ...founded.board.game, users: 999, time: 123 },
      },
    }
    const left = send(played, Message.TitleOpened())
    expect(left.route).toEqual(AppRoute.Title())
    expect(left.saves.current).toBe(id)
    expect(currentFile(left)).toMatchObject({ users: 999, time: 123 })
    expect(commandsOf(played, Message.TitleOpened())).toContain('WriteCompany')
  })

  test('the autosave writes the save format beside the Game', () => {
    const storage = fakeStorage({})
    withStorage(storage, () => {
      const founded = send(initialModel(), Message.CompanyFounded())
      const id = founded.saves.current
      expect(id).not.toBeNull()
      const board = founded.board
      runCommand(
        WriteCompany({
          id: id!,
          index: refreshedIndex(founded.saves, board.game),
          game: board.game,
          revealed: board.disclosure.revealed,
          pending:
            board.disclosure._tag === 'Queued' || board.disclosure._tag === 'Cueing'
              ? board.disclosure.pending
              : [],
          dashboard: board.dashboard.history,
          inbox: savedInbox(board.inbox),
        }),
      )
      const saved = JSON.parse(storage.getItem(`${SAVE_PREFIX}${id}`) ?? '{}') as Record<
        string,
        unknown
      >
      expect(saved['format']).toBe(SAVE_FORMAT)
      expect(saved['seed']).toBe(board.game.seed)
    })
  })

  test('a Company file without this format keeps a copy and leaves the list', () => {
    const { index, game } = stored()
    const json = JSON.stringify(game)
    const loaded = update(
      initialModel(),
      Message.SavesLoaded({ index: JSON.stringify(index), now: 0 }),
    )
    const broken = update(loaded.model, Message.CompanyLoaded({ id: 'c-one', open: true, json }))
    expect(broken.model.companyPhase).toEqual({ _tag: 'None' })
    expect(broken.model.toast?.tone).toBe('warn')
    // A row that can never open does not stay, or it would warn on every load.
    expect(broken.model.saves).toEqual({ current: null, companies: [] })
    expect((broken.commands ?? []).map((command) => command.name)).toEqual(
      expect.arrayContaining(['KeepBrokenSave', 'DeleteCompany']),
    )
  })

  test('the kept copy is written and the Company file it came from is removed', () => {
    const json = '{"nodes":[]}'
    const storage = fakeStorage({ [`${SAVE_PREFIX}c-one`]: json })
    withStorage(storage, () => {
      runCommand(KeepBrokenSave({ json, reason: 'The save is not JSON.' }))
      runCommand(DeleteCompany({ id: 'c-one', index: EMPTY_SAVE_INDEX }))
    })
    expect(storage.getItem(BROKEN_SAVE_KEY)).toBe(json)
    expect(storage.getItem(`${SAVE_PREFIX}c-one`)).toBeNull()
    expect(JSON.parse(storage.getItem('quorum.saves.v1') ?? '{}')).toEqual(EMPTY_SAVE_INDEX)
  })

  test('the kept copy leaves once an import puts a save in the Company', () => {
    const storage = fakeStorage({ [BROKEN_SAVE_KEY]: '{"nodes":[]}' })
    withStorage(storage, () => runCommand(ClearBrokenSave({})))
    expect(storage.getItem(BROKEN_SAVE_KEY)).toBeNull()
  })

  test('the index figures follow the Company they name', () => {
    const game = preseedGame()
    const file = fileFor({
      id: 'c-one',
      name: 'One',
      logo: 'orbit',
      founding: game.founding,
      game,
      now: 1,
    })
    const index = indexOf([file], 'c-one')
    const refreshed = refreshedIndex(index, { ...game, stage: 4, users: 42, time: 99 })
    expect(refreshed.companies[0]).toMatchObject({
      id: 'c-one',
      name: 'One',
      stage: 4,
      users: 42,
      time: 99,
    })
  })
})

describe('browser storage', () => {
  test('the boot sweep removes the pre-public single saves and leaves settings alone', () => {
    const storage = fakeStorage({
      'quorum.save.v1': '{}',
      'quorum.save.v2': '{}',
      'quorum.saves.v1': '{}',
      'quorum.prefs.v1': '{"locale":"fr"}',
    })
    withStorage(storage, () => sweepLegacyStorage())
    expect(storage.getItem('quorum.save.v1')).toBeNull()
    expect(storage.getItem('quorum.save.v2')).toBeNull()
    expect(storage.getItem('quorum.saves.v1')).toBe('{}')
    expect(storage.getItem('quorum.prefs.v1')).toBe('{"locale":"fr"}')
  })

  test('pruning removes Company files the list does not name', () => {
    const { index } = stored()
    const storage = fakeStorage({
      [`${SAVE_PREFIX}c-one`]: '{}',
      [`${SAVE_PREFIX}orphan`]: '{}',
      'quorum.saves.v1': JSON.stringify(index),
    })
    withStorage(storage, () => pruneCompanyFiles(index))
    expect(storage.getItem(`${SAVE_PREFIX}c-one`)).toBe('{}')
    expect(storage.getItem(`${SAVE_PREFIX}orphan`)).toBeNull()
    expect(storage.getItem('quorum.saves.v1')).not.toBeNull()
  })

  test('pruning also drops Agent Room records for Companies the list does not name', () => {
    const { index } = stored()
    const kept = { writeKey: 'w', roomId: 'r', epoch: 'e' }
    const storage = fakeStorage({
      'quorum.agent.rooms': JSON.stringify({
        'c-one': kept,
        orphan: { writeKey: 'w2', roomId: 'r2', epoch: 'e2' },
      }),
    })
    withStorage(storage, () => runCommand(PruneSaves({ index })))
    expect(JSON.parse(storage.getItem('quorum.agent.rooms') ?? '{}')).toEqual({ 'c-one': kept })
  })

  test('the boot load returns the list only, and the page prunes it', () => {
    const { index } = stored()
    const storage = fakeStorage({ 'quorum.saves.v1': JSON.stringify(index) })
    withStorage(storage, () => {
      const loaded = runCommand(LoadSaves({}))
      expect(loaded).toMatchObject({ index: JSON.stringify(index) })
      const result = update(initialModel(), loaded)
      expect(result.commands).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'PruneSaves' })]),
      )
    })
  })

  test('a broken list is kept aside and no file is pruned', () => {
    const storage = fakeStorage({
      'quorum.saves.v1': '{not json',
      [`${SAVE_PREFIX}orphan`]: '{}',
    })
    withStorage(storage, () => {
      const result = update(initialModel(), runCommand(LoadSaves({})))
      expect(result.model.toast?.tone).toBe('warn')
      expect(result.commands).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'KeepBrokenSave' })]),
      )
      expect(result.commands ?? []).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'PruneSaves' })]),
      )
      expect(storage.getItem(`${SAVE_PREFIX}orphan`)).toBe('{}')
    })
  })
})
