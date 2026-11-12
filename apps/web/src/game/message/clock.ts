import { Schema } from 'effect'

/** The clock Messages, as cases for the root union. */
export const clockCases = {
  /** One clock tick: `elapsedMs` of wall time passed since the previous one. */
  Ticked: { elapsedMs: Schema.Finite },
  SpeedCycled: {},
  SpeedChosen: { speed: Schema.Finite },
  PauseToggled: {},
  FullscreenToggled: {},
  ScreenshotToggled: {},
  BoardFitted: {},
  BoardTidied: {},
  /** Zooms the board in or out, about the middle of the room the chrome leaves free. */
  ZoomChosen: { direction: Schema.Literals([1, -1]) },
}
