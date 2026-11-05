import { Option, Result, Schema } from 'effect'
import { decodeText, encodeText } from '@quorum/simulation/codec'
import { Game } from '@quorum/simulation/state'
import { SIM_VERSION } from '@quorum/simulation/version'
import type { History } from './history.ts'
import type { SavedInbox } from './inbox.ts'
import type { Reveal } from './model.ts'

/* ==========================================================================
   A save as text (15 "Save"): the JSON the save slot holds, behind a prefix
   and the Simulation's version, so a string from another build is refused
   before it can replace the Company. `QSV1:` and base64url JSON. Pure.
   ========================================================================== */

/** The Company save: the Game, the elements it has shown, and the client state beside it. */
export type SaveFile = Readonly<{
  game: Game
  revealed: ReadonlyArray<Reveal>
  pending: ReadonlyArray<Reveal>
  dashboard: History
  inbox: SavedInbox
}>

/** The JSON the save slot holds: the Game, the wall clock for offline progress, and the rest. */
export const saveJson = (save: SaveFile, wall: number): Record<string, unknown> => ({
  ...save.game,
  wall,
  disclosure: { revealed: save.revealed, pending: save.pending },
  dashboard: save.dashboard,
  inbox: save.inbox,
})

const PREFIX = 'QSV1:'

const SaveText = Schema.Struct({
  version: Schema.String,
  save: Schema.Record(Schema.String, Schema.Unknown),
})
const decodeSaveText = Schema.decodeUnknownOption(SaveText)
const decodeGame = Schema.decodeUnknownOption(Game)

/** The save as one line of text the player can copy and paste. */
export const encodeSave = (save: SaveFile, wall: number): string =>
  encodeText(PREFIX, { version: SIM_VERSION, save: saveJson(save, wall) })

/**
 * The save's JSON, or why the text is not a save this build can open: another
 * prefix or no JSON, another build's version, or a Game this build cannot read.
 */
export const decodeSave = (text: string): Result.Result<string, string> => {
  const parsed = decodeSaveText(decodeText(PREFIX, text))
  if (Option.isNone(parsed)) return Result.fail('That is not a save.')
  const { version, save } = parsed.value
  if (version !== SIM_VERSION)
    return Result.fail(
      `That save is from another build (${version}; this build is ${SIM_VERSION}).`,
    )
  if (Option.isNone(decodeGame(save))) return Result.fail('That save could not be read.')
  return Result.succeed(JSON.stringify(save))
}
