import * as Actions from '@quorum/simulation/actions'
import { Model } from '../model.ts'
import { logResponse } from './session.ts'
import { say, withToast, act, nodeName, type MessageCases, type UpdateResult } from './shared.ts'

type IncidentsTag =
  | 'LeaderFenced'
  | 'DrillRun'
  | 'GuidanceChosen'
  | 'ReportCancelled'
  | 'VolumeExpanded'
  | 'CertificateRenewed'
  | 'ProviderSwitched'
  | 'ProviderChosen'
  | 'MessageDeleted'
  | 'SchemaMigrationCancelled'
  | 'DependencyPinned'
  | 'TableRestored'
  | 'ClocksRestarted'
  | 'RoutesRolledBack'
  | 'ConfigRolledBack'
  | 'NodeSold'
  | 'Collected'

export const incidentsHandlers = (model: Model): MessageCases<UpdateResult, IncidentsTag> => ({
  LeaderFenced: () =>
    logResponse(model, 'fence-leader') ??
    act(model, 'Fenced the old leader', Actions.fenceLeader(model.board.game)),

  DrillRun: () => act(model, 'DR drill', Actions.runDrill(model.board.game)),

  GuidanceChosen: ({ growth, margin }) =>
    act(model, 'Guidance', Actions.setGuidance(model.board.game, growth, margin)),

  ReportCancelled: () =>
    logResponse(model, 'cancel-report') ??
    act(model, 'Cancelled the report', Actions.cancelReport(model.board.game)),

  VolumeExpanded: () =>
    logResponse(model, 'expand-volume') ??
    act(model, 'Expanded the volume', Actions.expandVolume(model.board.game)),

  CertificateRenewed: () =>
    logResponse(model, 'renew-certificate') ??
    act(model, 'Renewed the certificate', Actions.renewCertificate(model.board.game)),

  ProviderSwitched: () =>
    logResponse(model, 'switch-provider') ??
    act(model, 'Switched provider', Actions.switchProvider(model.board.game), {
      note: () => [say(model).toasts.providerSwitched, 'ok'],
    }),

  ProviderChosen: ({ provider }) =>
    act(model, 'Switched provider', Actions.setProvider(model.board.game, provider), {
      undoable: true,
    }),

  MessageDeleted: () =>
    logResponse(model, 'delete-message') ??
    act(model, 'Deleted the poison message', Actions.deleteMessage(model.board.game)),

  SchemaMigrationCancelled: () =>
    logResponse(model, 'cancel-migration') ??
    act(model, 'Cancelled the migration', Actions.cancelMigration(model.board.game)),

  DependencyPinned: () =>
    logResponse(model, 'pin-and-redeploy') ??
    act(model, 'Pinned the dependency', Actions.pinAndRedeploy(model.board.game)),

  TableRestored: () =>
    logResponse(model, 'restore-backup') ??
    act(model, 'Restored from backup', Actions.restoreBackup(model.board.game)),

  ClocksRestarted: () =>
    logResponse(model, 'restart-clocks') ??
    act(model, 'Restarted the Nodes', Actions.restartClocks(model.board.game)),

  RoutesRolledBack: () =>
    logResponse(model, 'roll-back-routes') ??
    act(model, 'Rolled back the routes', Actions.rollBackRoutes(model.board.game)),

  ConfigRolledBack: () =>
    logResponse(model, 'roll-back-config') ??
    act(model, 'Rolled back the config', Actions.rollBackConfig(model.board.game)),

  NodeSold: ({ nodeId }) =>
    act(
      model,
      `Sold ${nodeName(model.board.game, nodeId)}`,
      Actions.sell(model.board.game, nodeId),
      {
        undoable: true,
        patch: () => ({ selected: null, flow: { _tag: 'Idle' } }),
      },
    ),

  Collected: () => {
    if (model.board.game.pending <= 0) return { model }
    const amount = model.board.game.pending
    const next: Model = {
      ...model,
      board: { ...model.board, game: Actions.collect(model.board.game) },
    }
    return withToast(
      next,
      say(model).toasts.collected(`$${Math.round(amount).toLocaleString('en-US')}`),
      'ok',
    )
  },
})
