import { Schema } from 'effect'

/** One device's results on one board: Simulation version, Challenge, and device. */
export const EntryId = Schema.String.pipe(Schema.brand('ChallengeEntryId'))
export type EntryId = typeof EntryId.Type

export const entryIdOf = (simVersion: string, challengeId: string, deviceId: string): EntryId =>
  EntryId.make(`${simVersion}:${challengeId}:${deviceId}`)
