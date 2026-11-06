import { DataPattern, IacTool, Region, SyncMode } from '@quorum/simulation/state'
import { MANAGED } from '@quorum/simulation/mirror'
import { Schema } from 'effect'

/** The mirrors Messages, as cases for the root union. */
export const mirrorsCases = {
  IacToolPicked: { tool: IacTool },
  SyncModePicked: { sync: Schema.NullOr(SyncMode) },
  MirrorStarted: { target: Region, source: Region },
  MirrorApplied: { region: Region, destroy: Schema.Boolean },
  MirrorDataPicked: { region: Region, source: Schema.String, pattern: DataPattern },
  MirrorOverrideSet: {
    region: Region,
    nodeId: Schema.String,
    field: Schema.Literals(MANAGED),
    keep: Schema.Boolean,
  },
  MirrorComputedSet: { region: Region, computed: Schema.Boolean },
  MirrorStopped: { region: Region },
  /** Reads live state: `pulumi refresh` or `alchemy drift`. */
  MirrorRefreshed: { region: Region },
  /** Alchemy's `drift --repair`: hand changes go back to the last deploy. */
  MirrorRepaired: { region: Region },
}
