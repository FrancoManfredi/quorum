import { ChallengeVerdict } from '@quorum/rpc'
import { FIXES } from '@quorum/simulation/catalog'
import { SandboxId } from '../model.ts'
import { Schema } from 'effect'
import { histogramQuery } from '../challenge-query.ts'

/** The session Messages, as cases for the root union. */
export const sessionCases = {
  SandboxStoreLoaded: { json: Schema.NullOr(Schema.String) },
  ChallengeStarted: { id: Schema.String },
  /** Replays the Design from t = 0 and scores it. */
  ChallengeRan: {},
  /** Runs the rest of the run at once. */
  ChallengeFinished: {},
  /** Back to the build board as it was at Run. */
  ChallengeRebuilt: {},
  /** Turns a code fix on or off in a Challenge that pays Dev Hours for it. */
  FixChosen: { fix: Schema.Literals(FIXES), on: Schema.Boolean },
  ChallengeVerified: { verdict: ChallengeVerdict },
  ChallengeUnverified: { message: Schema.String, offline: Schema.Boolean },
  GotHistograms: { message: histogramQuery.Message },
  GuidedStarted: { id: SandboxId },
  FreeSandboxStarted: {},
  FreeSandboxReset: {},
  /** Replaces the free Sandbox with a stress board: the link-routing one, or the big one. */
  StressBoardLoaded: { big: Schema.Boolean },
  CompanyCopied: {},
  DemandStepped: { direction: Schema.Literals([1, -1]) },
  MixChosen: { stage: Schema.Finite },
}
