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
}
