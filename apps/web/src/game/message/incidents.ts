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
  /** Hovering an option opens its Tradeoff card; clicking pins it, or applies it once seen. */
}
