import { EXIT_IDS, PERK_IDS } from '@quorum/simulation/catalog'
import { MutatorId, ResearchId, VentureId } from '@quorum/simulation/state'
import { Schema } from 'effect'

/** The exit Messages, as cases for the root union. */
export const exitCases = {
  ExitTaken: { exit: Schema.Literals(EXIT_IDS) },
  KeepToggled: { id: ResearchId },
  PerkBought: { id: Schema.Literals(PERK_IDS) },
  VentureChosen: { id: VentureId },
  MutatorToggled: { id: MutatorId },
  PlaybookSaved: {},
  PlaybookChosen: { index: Schema.Finite },
  PlaybookDeleted: { index: Schema.Finite },
  PlaybookExported: { index: Schema.Finite },
  PlaybookImportAsked: {},
  PlaybookImported: { text: Schema.NullOr(Schema.String) },
  RoundRaised: {},
  RoundDeclined: {},
  /** Takes the investors' bridge while Cash is short (09 "Runway and running out of Cash"). */
  BridgeAccepted: {},
  PostmortemFiled: { id: Schema.Finite, take: Schema.Boolean },
  AwayClosed: {},

  /** The Exit survey: Send, Skip, and the server's answer. */
  SurveySubmitted: {},
  SurveySkipped: {},
  SurveySent: {},
  SurveyFailed: { message: Schema.String, offline: Schema.Boolean },

  /** Playbooks. */
}
