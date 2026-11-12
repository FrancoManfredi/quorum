import { describe, expect, test } from 'vitest'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Scene } from 'foldkit/test'
import { newGame } from '@quorum/simulation/company'
import { priceOf } from '@quorum/simulation/lookups'
import { money } from '@quorum/ui/game/format'
import { copyIn, loadLocale } from '../i18n/messages.ts'
import { PaletteFocus, commandPalette } from '../components/lab/palette.ts'
import { Message } from './message.ts'
import { EMPTY_PALETTE, halted, type Model } from './model.ts'
import { activeOf, commandsOf, matchesOf, PALETTE_GROUPS } from './palette.ts'
import { AppRoute } from './route.ts'
import { initialModel, update } from './update.ts'
import { AppendLog, PlaySound, SyncBoard, ToggleFullscreen } from './commands.ts'

/** A Company on the board: the palette only opens over a board. */
const inLab = (): Model => {
  const model = initialModel()
  return { ...model, route: AppRoute.Company(), board: { ...model.board, game: newGame() } }
}

const open = (model: Model = inLab()): Model => ({
  ...model,
  palette: { open: true, query: '', active: null },
})

const ids = (model: Model): ReadonlyArray<string> =>
  commandsOf(copyIn(model.prefs.locale), model).map((command) => command.id)

describe('opening and closing', () => {
  test('Cmd+K or Ctrl+K opens the palette over the board and holds the clock', () => {
    const opened = update(inLab(), Message.KeyPressed({ key: 'Mod+k' }))
    expect(opened.model.palette.open).toBe(true)
    expect(halted(opened.model)).toBe(true)
    expect(opened.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'SyncBoard',
          args: expect.objectContaining({ paused: true }),
        }),
      ]),
    )
  })

  test('the same keys and Escape close it, and no other key reaches the board', () => {
    const opened = open()
    expect(update(opened, Message.KeyPressed({ key: 'Mod+k' })).model.palette.open).toBe(false)
    const closed = update(opened, Message.KeyPressed({ key: 'Escape' })).model
    expect(closed.palette).toEqual(EMPTY_PALETTE)
    expect(halted(closed)).toBe(false)
    // A board hotkey typed while the palette is up does nothing behind it.
    expect(update(opened, Message.KeyPressed({ key: 'r' })).model.panel).toBe('none')
  })

  test('a row closes the palette and leaves the next open starting clean', () => {
    const picked = update(
      { ...open(), palette: { open: true, query: 'fit', active: 'fit' } },
      Message.PaletteChosen({ id: 'fit' }),
    ).model
    expect(picked.palette).toEqual(EMPTY_PALETTE)
  })
})

describe('a row runs what its control sends', () => {
  test('placing a part runs the dock row', () => {
    const viaPalette = update(open(), Message.PaletteChosen({ id: 'place:server' })).model
    const viaDock = update(inLab(), Message.PlacingChosen({ type: 'server' })).model
    expect(viaPalette.board.flow).toEqual(viaDock.board.flow)
    expect(viaPalette.board.buildGroup).toBe(viaDock.board.buildGroup)
  })

  test('opening a panel runs the toolbar button', () => {
    const start = inLab()
    const viaPalette = update(open(start), Message.PaletteChosen({ id: 'panel:inbox' })).model
    const viaToolbar = update(start, Message.PanelOpened({ panel: 'inbox' })).model
    expect(viaPalette.panel).toBe('inbox')
    expect(viaPalette).toEqual(viaToolbar)
  })

  test('undo runs the board history the toolbar runs', () => {
    const placing = update(inLab(), Message.PlacingChosen({ type: 'server' })).model
    const placed = update(placing, Message.NodePlaced({ x: 400, y: 300 })).model
    expect(placed.board.undo.length).toBe(1)
    const viaPalette = update(open(placed), Message.PaletteChosen({ id: 'undo' })).model
    const viaToolbar = update(placed, Message.UndoChosen()).model
    expect(viaPalette.board.game).toEqual(viaToolbar.board.game)
  })

  test('zooming sends the board command, and the palette steps out of the way', () => {
    const zoomed = update(open(), Message.PaletteChosen({ id: 'zoom-in' }))
    expect(zoomed.model.palette).toEqual(EMPTY_PALETTE)
    expect(zoomed.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'ZoomBoard', args: { direction: 1 } }),
      ]),
    )
  })
})

describe('the rows and the query', () => {
  test('a part row carries what the dock shows: blurb, price, and its lock', () => {
    const t = copyIn('en')
    const model = inLab()
    const rows = commandsOf(t, model).filter((row) => row.group === 'place')
    const price = priceOf(model.board.game, 'server')
    expect(rows.find((row) => row.id === 'place:server')?.part).toMatchObject({
      group: 'compute',
      blurb: t.catalog.components.server.blurb,
      price: money(price),
      short: model.board.game.cash < price,
      locked: null,
    })
    // The dock's next unlockable part stays in the list, naming the Research that locks it.
    expect(rows.find((row) => row.id === 'place:dns')?.part?.locked).toBe(
      t.catalog.research['dns-rr'].name,
    )
  })

  test('the list keeps its groups in order, with one id per row', () => {
    const rows = commandsOf(copyIn('en'), inLab())
    const order = rows.map((command) => PALETTE_GROUPS.indexOf(command.group))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(new Set(rows.map((command) => command.id)).size).toBe(rows.length)
    expect(rows.some((command) => command.id === 'place:server')).toBe(true)
  })

  test('a row that would do nothing stays out of the list', () => {
    const listed = ids(inLab())
    // Nothing is selected and nothing was undone yet.
    expect(listed).not.toContain('copy')
    expect(listed).not.toContain('sell')
    expect(listed).not.toContain('undo')
    // Easy mode is off, so the clock is not the player's to pause.
    expect(listed).not.toContain('pause')
    // Research and Team arrive with the first Study and the first Feature.
    expect(listed).not.toContain('panel:team')
  })

  test('a query keeps the rows that hold every word, in their group order', () => {
    const rows = commandsOf(copyIn('en'), inLab())
    const fit = matchesOf(rows, copyIn('en'), 'fit')
    expect(fit.map((row) => row.id)).toEqual(['fit'])
    const found = matchesOf(rows, copyIn('en'), 'board')
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((row) => row.group === 'view' || row.label.includes('board'))).toBe(true)
    expect(matchesOf(rows, copyIn('en'), 'nothing here')).toEqual([])
  })

  test('the search folds accents, so a typed word finds a translated row', async () => {
    await loadLocale('fr')
    const t = copyIn('fr')
    const found = matchesOf(commandsOf(t, inLab()), t, 'parametres')
    expect(found.some((row) => row.id === 'panel:settings')).toBe(true)
  })

  test('the arrows move the highlight and wrap, and a new query starts over', () => {
    const rows = commandsOf(copyIn('en'), inLab())
    // A blank palette highlights nothing, so the first arrow picks the first row.
    expect(update(open(), Message.PaletteMoved({ delta: 1 })).model.palette.active).toBe(
      rows[0]?.id,
    )
    const up = update(open(), Message.PaletteMoved({ delta: -1 })).model
    expect(up.palette.active).toBe(rows.at(-1)?.id)
    // A query highlights its first match, so the next arrow moves past it.
    const typed = update(open(), Message.PaletteQueryChanged({ query: 'server' })).model
    const narrowed = matchesOf(commandsOf(copyIn('en'), typed), copyIn('en'), 'server')
    expect(narrowed.length).toBeGreaterThan(1)
    expect(update(typed, Message.PaletteMoved({ delta: 1 })).model.palette.active).toBe(
      narrowed[1]?.id,
    )
  })

  test('Enter on a blank palette runs nothing', () => {
    const t = copyIn('en')
    const rows = commandsOf(t, inLab())
    expect(activeOf(matchesOf(rows, t, ''), '', null)).toBe(null)
    expect(activeOf(matchesOf(rows, t, ''), '', 'fit')?.id).toBe('fit')
    expect(activeOf(matchesOf(rows, t, 'fit'), 'fit', null)?.id).toBe('fit')
  })
})

/** The palette renders nothing when it is shut; the Scene needs a root to render either way. */
const screen = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div([h.Key('screen')], [commandPalette(model, h)])

describe('the palette view', () => {
  test('shows the search field, the grouped rows, and their shortcuts', () => {
    Scene.scene(
      { update, view: screen },
      Scene.given(open()),
      Scene.Mount.resolve(PaletteFocus, Message.Synced()),
      Scene.expect(Scene.role('dialog', { name: 'Commands' })).toExist(),
      Scene.expect(Scene.placeholder('Search actions')).toExist(),
      Scene.expect(Scene.text('Place')).toExist(),
      Scene.expect(Scene.text('App Server')).toExist(),
      Scene.expect(Scene.text(copyIn('en').catalog.components.server.blurb)).toExist(),
      Scene.expect(Scene.text('Fit the board')).toExist(),
      Scene.expect(Scene.text('Shift')).toExist(),
    )
  })

  test('typing narrows the rows, and Enter runs the first match', () => {
    Scene.scene(
      { update, view: screen },
      Scene.given(open()),
      Scene.Mount.resolve(PaletteFocus, Message.Synced()),
      Scene.type(Scene.placeholder('Search actions'), 'fullscreen'),
      Scene.expect(Scene.text('Fullscreen')).toExist(),
      Scene.expect(Scene.text('Fit the board')).toBeAbsent(),
      Scene.keydown(Scene.placeholder('Search actions'), 'Enter'),
      Scene.expectHandled(),
      Scene.Command.resolveAll(
        [ToggleFullscreen, Message.Synced()],
        [SyncBoard, Message.Synced()],
        [PlaySound, Message.Synced()],
        [AppendLog, Message.Synced()],
      ),
      Scene.Mount.expectEnded(PaletteFocus),
      Scene.expect(Scene.role('dialog')).toBeAbsent(),
    )
  })

  test('an arrow moves the highlight, and Escape closes the palette', () => {
    Scene.scene(
      { update, view: screen },
      Scene.given(open()),
      Scene.Mount.resolve(PaletteFocus, Message.Synced()),
      Scene.keydown(Scene.placeholder('Search actions'), 'ArrowDown'),
      Scene.expectHandled(),
      Scene.keydown(Scene.placeholder('Search actions'), 'Escape'),
      Scene.expectHandled(),
      Scene.Command.resolveAll([SyncBoard, Message.Synced()], [AppendLog, Message.Synced()]),
      Scene.Mount.expectEnded(PaletteFocus),
      Scene.expect(Scene.role('dialog')).toBeAbsent(),
    )
  })
})
