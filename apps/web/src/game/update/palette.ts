import { EMPTY_PALETTE, type Model } from '../model.ts'
import { activeOf, commandsOf, matchesOf } from '../palette.ts'
import { say, type Dispatch, type MessageCases, type UpdateResult } from './shared.ts'

/** The Model with the palette shut, and its query forgotten: the next open starts clean. */
export const paletteClosed = (model: Model): Model => ({ ...model, palette: EMPTY_PALETTE })

type PaletteTag =
  | 'PaletteOpened'
  | 'PaletteClosed'
  | 'PaletteQueryChanged'
  | 'PaletteMoved'
  | 'PaletteHighlighted'
  | 'PaletteChosen'

export const paletteHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, PaletteTag> => ({
  PaletteOpened: () => ({
    model: { ...model, palette: { open: true, query: '', active: null } },
  }),

  PaletteClosed: () => ({ model: paletteClosed(model) }),

  // The first match takes the highlight again, so Enter always runs what the player sees.
  PaletteQueryChanged: ({ query }) => ({
    model: { ...model, palette: { ...model.palette, query, active: null } },
  }),

  PaletteMoved: ({ delta }) => {
    if (!model.palette.open) return { model }
    const t = say(model)
    const visible = matchesOf(commandsOf(t, model), t, model.palette.query)
    if (visible.length === 0) return { model }
    // A query already highlights its first match, so the arrows start from there; an empty
    // palette highlights nothing, so the first arrow picks the first row.
    const highlighted = activeOf(visible, model.palette.query, model.palette.active)
    const current = highlighted === null ? -1 : visible.indexOf(highlighted)
    const from = current < 0 ? (delta > 0 ? -1 : 0) : current
    const next = visible[(from + delta + visible.length) % visible.length]
    return next === undefined
      ? { model }
      : { model: { ...model, palette: { ...model.palette, active: next.id } } }
  },

  PaletteHighlighted: ({ id }) =>
    model.palette.active === id
      ? { model }
      : { model: { ...model, palette: { ...model.palette, active: id } } },

  // A row runs the Message its control sends, through the same handler a click reaches.
  PaletteChosen: ({ id }) => {
    const command = commandsOf(say(model), model).find((entry) => entry.id === id)
    if (command === undefined) return { model }
    return route(paletteClosed(model), command.message)
  },
})
