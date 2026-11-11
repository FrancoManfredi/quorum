import { Option, Result, Schema } from 'effect'
import { decodeText, encodeText } from '@quorum/simulation/codec'
import { Game } from '@quorum/simulation/state'
import type { History } from './history.ts'
import type { SavedInbox } from './inbox.ts'
import type { Reveal } from './model.ts'

/**
 * The Company save format. Bump it only with a migration, never with the build's git hash: a
 * public player's backup must open in a later build. Format 1 is the first public format.
 */
export const SAVE_FORMAT = 1

/** The Company save: the Game, the elements it has shown, and the client state beside it. */
export type SaveFile = Readonly<{
  game: Game
  revealed: ReadonlyArray<Reveal>
  pending: ReadonlyArray<Reveal>
  dashboard: History
  inbox: SavedInbox
}>

/** One Company file, read and ready for the board: its Game, and the raw JSON beside it. */
export type ReadSave = Readonly<{ game: Game; file: Record<string, unknown> }>

/** The JSON the save slot holds: the Game and the client state beside it. */
export const saveJson = (save: SaveFile): Record<string, unknown> => ({
  format: SAVE_FORMAT,
  ...save.game,
  disclosure: { revealed: save.revealed, pending: save.pending },
  dashboard: save.dashboard,
  inbox: save.inbox,
})

const PREFIX = 'QSV1:'

const SaveText = Schema.Struct({
  format: Schema.Finite,
  save: Schema.Record(Schema.String, Schema.Unknown),
})
const decodeSaveText = Schema.decodeUnknownOption(SaveText)
const decodeGame = Schema.decodeUnknownOption(Game)

const objectOf = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const NOT_JSON = 'The save is not JSON.'
const NOT_COMPANY = 'The save is not a Company file.'

/** The save's JSON, or why this build cannot open it. */
export const readSaveFile = (json: string): Result.Result<ReadSave, string> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return Result.fail(NOT_JSON)
  }
  const file = objectOf(parsed)
  if (file === null) return Result.fail(NOT_COMPANY)
  if (file['format'] !== SAVE_FORMAT)
    return Result.fail(
      `That save is version ${String(file['format'])}; this build reads version ${SAVE_FORMAT}.`,
    )
  const game = decodeGame(file)
  if (Option.isNone(game)) return Result.fail('The save could not be read.')
  return Result.succeed({ game: game.value, file })
}

/** The save as one line of text the player can copy and paste. */
export const encodeSave = (save: SaveFile): string =>
  encodeText(PREFIX, { format: SAVE_FORMAT, save: saveJson(save) })

/** The file a downloaded save takes: the Company's name, safe on every file system. */
export const saveFileName = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
  return `quorum-${slug || 'company'}.txt`
}

/**
 * The save's JSON, or why the text is not a save this build can open: another
 * prefix or no JSON, another format, or a Game this build cannot read. A stored
 * Company file is a save too, so a player can move one by hand.
 */
export const decodeSave = (text: string): Result.Result<string, string> => {
  const trimmed = text.trim()
  if (!trimmed.startsWith(PREFIX)) {
    const file = readSaveFile(trimmed)
    if (Result.isFailure(file))
      return Result.fail(
        file.failure === NOT_JSON || file.failure === NOT_COMPANY
          ? 'That is not a save.'
          : file.failure,
      )
    return Result.succeed(JSON.stringify(file.success.file))
  }
  const parsed = decodeSaveText(decodeText(PREFIX, trimmed))
  if (Option.isNone(parsed)) return Result.fail('That is not a save.')
  const { format, save } = parsed.value
  if (format !== SAVE_FORMAT)
    return Result.fail(
      `That save is from another version (${format}; this build reads ${SAVE_FORMAT}).`,
    )
  const read = readSaveFile(JSON.stringify(save))
  if (Result.isFailure(read)) return Result.fail('That save could not be read.')
  return Result.succeed(JSON.stringify(read.success.file))
}
