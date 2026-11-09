import { Schema } from 'effect'

/** The incidents Messages, as cases for the root union. */
export const incidentsCases = {
  LeaderFenced: {},
  DrillRun: {},
  GuidanceChosen: { growth: Schema.Finite, margin: Schema.Finite },
  ReportCancelled: {},
  VolumeExpanded: {},
  CertificateRenewed: {},
  ProviderSwitched: {},
  ProviderChosen: { nodeId: Schema.String, provider: Schema.Literals(['first', 'second']) },
  MessageDeleted: {},
  /** Responses the six hand-written incident kinds need (11 "The six kinds"). */
  SchemaMigrationCancelled: {},
  DependencyPinned: {},
  TableRestored: {},
  ClocksRestarted: {},
  RoutesRolledBack: {},
  ConfigRolledBack: {},
  /** Mirrors (05 "Mirror a region"): the IaC tool, GitOps, and each Mirror's plan. */
  NodeSold: { nodeId: Schema.String },
  Collected: {},
  /** The rules a player has quieted: they stay folded to a count until one of them clears. */
  AlertsAcknowledged: {
    rules: Schema.Array(Schema.Literals(['errors', 'latency', 'saturation', 'queue', 'budget'])),
  },
  /** Hovering an option opens its Tradeoff card; clicking pins it, or applies it once seen. */
}
