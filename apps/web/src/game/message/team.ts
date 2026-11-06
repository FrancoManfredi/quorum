import { IncidentId } from '@quorum/simulation/state'
import { ResearchMessage } from '../research.ts'
import { Schema } from 'effect'
import { TASK_IDS } from '@quorum/simulation/catalog'
import { TeamMessage } from '../team.ts'

/** The team Messages, as cases for the root union. */
export const teamCases = {
  ResearchChanged: { message: ResearchMessage },
  /** The Team panel: engineers, teams, the backlog, migrations, and deploys. */
  TeamChanged: { message: TeamMessage },
  TaskQueued: { id: Schema.Literals(TASK_IDS) },
  AuthMoveQueued: {},
  /** "Write a runbook" for one incident kind (11 "Runbooks"). */
  RunbookQueued: { kind: IncidentId },
  PolicyToggled: { policy: Schema.Literals(['research', 'hire', 'upgrade']), on: Schema.Boolean },
  WorkMoved: { id: Schema.Finite, direction: Schema.Literals([1, -1]) },
  WorkCancelled: { id: Schema.Finite },
  WorkApproved: { id: Schema.Finite },
  WorkDeferred: { id: Schema.Finite },
  WorkPatched: { id: Schema.Finite },
  WorkPatchQueued: { id: Schema.Finite },
  /** A teammate's answer: time off, a raise, or a resignation accepted (18 "Burnout"). */
  EngineerGivenTimeOff: { engineerId: Schema.String },
  EngineerGivenRaise: { engineerId: Schema.String },
  EngineerResigned: { engineerId: Schema.String },
  WorkPrioritized: { id: Schema.Finite },
  WorkRushed: { id: Schema.Finite },
  AutopilotToggled: {},
  MigrationShifted: {},
  MigrationCancelled: {},
  RolledBack: {},

  /** Exits, the Founder, and the Legacy shop (13). */
}
