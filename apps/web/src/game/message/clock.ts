import { Schema } from 'effect'

/** The clock Messages, as cases for the root union. */
export const clockCases = {
  Ticked: {},
  SpeedCycled: {},
  SpeedChosen: { speed: Schema.Finite },
  PauseToggled: {},
  FullscreenToggled: {},
  BoardFitted: {},
  BoardTidied: {},
}
