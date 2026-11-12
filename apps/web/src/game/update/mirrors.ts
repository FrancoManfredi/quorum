import { Mirrors } from '../board-actions.ts'
import { Model } from '../model.ts'
import { REGION_INFO, IAC_TOOL_INFO } from '@quorum/simulation/catalog'
import { act, type MessageCases, type UpdateResult } from './shared.ts'
import { copyIn } from '../../i18n/messages.ts'

const said = copyIn('en').changes

type MirrorsTag =
  | 'IacToolPicked'
  | 'SyncModePicked'
  | 'MirrorStarted'
  | 'MirrorApplied'
  | 'MirrorDataPicked'
  | 'MirrorOverrideSet'
  | 'MirrorComputedSet'
  | 'MirrorStopped'
  | 'MirrorRefreshed'
  | 'MirrorRepaired'

export const mirrorsHandlers = (model: Model): MessageCases<UpdateResult, MirrorsTag> => ({
  IacToolPicked: ({ tool }) =>
    act(
      model,
      `IaC tool: ${IAC_TOOL_INFO[tool].name}`,
      Mirrors.pickIacTool(model.board.game, tool),
      { undoable: true },
    ),

  SyncModePicked: ({ sync }) =>
    act(
      model,
      sync === null ? 'GitOps off' : sync === 'all' ? 'GitOps all at once' : 'GitOps staged',
      Mirrors.setSyncMode(model.board.game, sync),
      { undoable: true },
    ),

  MirrorStarted: ({ target, source }) =>
    act(
      model,
      `Mirror of ${REGION_INFO[source].name}`,
      Mirrors.startMirror(model.board.game, target, source),
      { undoable: true, patch: () => ({ region: target, selected: null }) },
    ),

  MirrorApplied: ({ region, destroy }) =>
    act(model, 'Applied the plan', Mirrors.applyMirror(model.board.game, region, destroy), {
      undoable: true,
    }),

  MirrorDataPicked: ({ region, source, pattern }) =>
    act(model, 'Data pattern', Mirrors.setMirrorData(model.board.game, region, source, pattern), {
      undoable: true,
    }),

  MirrorOverrideSet: ({ region, nodeId, field, keep }) =>
    act(
      model,
      keep ? said.toggles.overrideKept : said.toggles.overrideRemoved,
      Mirrors.setOverride(model.board.game, region, nodeId, field, keep),
      { undoable: true },
    ),

  MirrorComputedSet: ({ region, computed }) =>
    act(
      model,
      computed ? said.toggles.computedOn : said.toggles.computedOff,
      Mirrors.setComputed(model.board.game, region, computed),
      { undoable: true },
    ),

  MirrorStopped: ({ region }) =>
    act(model, 'Stopped mirroring', Mirrors.stopMirror(model.board.game, region), {
      undoable: true,
    }),

  MirrorRefreshed: ({ region }) =>
    act(model, 'Read live state', Mirrors.refreshMirror(model.board.game, region)),

  MirrorRepaired: ({ region }) =>
    act(model, 'Repaired drift', Mirrors.repairMirror(model.board.game, region), {
      undoable: true,
    }),
})
