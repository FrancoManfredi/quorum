import { Schema } from 'effect'

/** The command palette Messages, as cases for the root union. */
export const paletteCases = {
  /** Cmd+K on macOS, Ctrl+K elsewhere: the palette opens over the board. */
  PaletteOpened: {},
  PaletteClosed: {},
  /** What the search field holds. A new query starts the highlight over at the first match. */
  PaletteQueryChanged: { query: Schema.String },
  /** The arrows move the highlight by one row, wrapping at either end. */
  PaletteMoved: { delta: Schema.Literals([1, -1]) },
  /** The row under the pointer takes the highlight, as an arrow would give it. */
  PaletteHighlighted: { id: Schema.String },
  /** Runs a row: the palette closes, and the Message its click sends runs. */
  PaletteChosen: { id: Schema.String },
}
