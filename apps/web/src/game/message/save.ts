import { IncidentId } from '@quorum/simulation/state'
import { Schema } from 'effect'

/** The save Messages, as cases for the root union. */
export const saveCases = {
  SaveExported: {},
  SaveImportAsked: {},
  SaveImported: { text: Schema.NullOr(Schema.String) },

  CheatCash: {},
  CheatInsight: {},
  CheatLegacy: {},
  CheatRound: {},
  IncidentForced: { kind: IncidentId },
  LogExported: {},
  StateCopied: {},
  LogCleared: {},
}
