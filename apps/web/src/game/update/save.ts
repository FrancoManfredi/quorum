import { Actions } from '../board-actions.ts'
import {
  AskSaveImport,
  ClearBrokenSave,
  CopyText,
  DownloadSave,
  PickSaveFile,
  WriteFounder,
  ClearLog,
  ExportLog,
} from '../commands.ts'
import { Game } from '@quorum/simulation/state'
import { IPO_BURN_SECONDS, PRE_IPO_STAGE } from '@quorum/simulation/ipo'
import { Message } from '../message.ts'
import { Model, currentFile, hasCompany, offCompany, playingId } from '../model.ts'
import { Result } from 'effect'
import { cheatCash, cheatInsight } from '../cheats.ts'
import { decodeSave, encodeSave, readSaveFile, saveFileName } from '../save-file.ts'
import { fileFor, newSaveId, withFile } from '../saves.ts'
import { step } from '../company-machine.ts'
import { eraOf, isFinalEra, nextEra } from '@quorum/simulation/lookups'
import { firstQuarter } from '@quorum/simulation/quarters'
import { forceIncident } from '@quorum/simulation/director'
import {
  freshBoard,
  say,
  saveCommands,
  savePayloadOf,
  toasted,
  withToast,
  act,
  type Dispatch,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { listed } from './companies.ts'
import { afterRound } from './session.ts'
import { reasonIn } from '../../i18n/refusal.ts'
import { refusal, stateJson } from '../agent-tools.ts'
import { agentRoomId } from '../agent-room.ts'
import { solveFlow } from '@quorum/simulation/solve'

type SaveTag =
  | 'SaveExported'
  | 'SaveDownloaded'
  | 'SaveImportAsked'
  | 'SaveFileAsked'
  | 'SaveImported'
  | 'CompanyFileAsked'
  | 'CompanyImported'
  | 'CheatCash'
  | 'CheatInsight'
  | 'CheatLegacy'
  | 'CheatRound'
  | 'IncidentForced'
  | 'LogExported'
  | 'StateCopied'
  | 'AgentRoomCopied'
  | 'LogCleared'

/** A save with no Company open becomes one: a file on the list, opening under its seed's id. */
const adopt = (model: Model, json: string): Model => {
  const read = readSaveFile(json)
  if (Result.isFailure(read)) return model
  const game = read.success.game
  const file = fileFor({
    id: newSaveId(model.saves.companies, game.seed),
    name: say(model).title.importedCompany,
    logo: model.draft.logo,
    founding: game.founding,
    game,
    now: Date.now(),
  })
  return {
    ...model,
    saves: { ...withFile(model.saves, file), current: file.id },
    companyPhase: step(model.companyPhase, { _tag: 'Open', id: file.id }),
  }
}

/**
 * Puts an imported save on the board. `asNew` adds it to the list as a Company of its own; without
 * it the save replaces the open Company, or becomes one when no Company is open.
 */
const applyImport = (
  model: Model,
  route: Dispatch,
  text: string | null,
  asNew: boolean,
): UpdateResult => {
  if (text === null) return { model }
  if (offCompany(model)) return withToast(model, say(model).toasts.noSaveHere, 'warn')
  const decoded = decodeSave(text)
  if (Result.isFailure(decoded))
    return withToast(model, reasonIn(say(model), decoded.failure), 'warn')
  const fresh = asNew || playingId(model) === null
  const started = fresh ? adopt(model, decoded.success) : model
  const id = fresh ? started.saves.current : playingId(model)
  if (id === null) return { model: started }
  // The save loads as it does when the Company opens, on a fresh board: the open Company's
  // undo stack and Inspector history belong to the Company the import replaces.
  const loaded = route(started, Message.CompanyLoaded({ id, open: fresh, json: decoded.success }))
  const board = loaded.model.board
  const [next, clear] = toasted(
    {
      ...loaded.model,
      board: {
        ...freshBoard(board.game),
        disclosure: board.disclosure,
        dashboard: board.dashboard,
        inbox: board.inbox,
        clock: board.clock,
      },
    },
    say(model).toasts.saveImported,
    'ok',
  )
  // The import is the save now, so the copy kept for the last unreadable file is dead weight.
  return {
    ...loaded,
    model: next,
    commands: [...(loaded.commands ?? []), ...saveCommands(next), ClearBrokenSave({}), clear],
  }
}

export const saveHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, SaveTag> => ({
  SaveExported: () => {
    if (offCompany(model)) return withToast(model, say(model).toasts.noSaveHere, 'warn')
    if (!hasCompany(model)) return withToast(model, say(model).toasts.noCompanyToExport, 'warn')
    return {
      model,
      commands: [
        CopyText({
          text: encodeSave(savePayloadOf(model)),
          done: say(model).toasts.copiedSave,
          blocked: say(model).toasts.clipboardBlocked,
        }),
      ],
    }
  },

  SaveDownloaded: () => {
    if (offCompany(model)) return withToast(model, say(model).toasts.noSaveHere, 'warn')
    if (!hasCompany(model)) return withToast(model, say(model).toasts.noCompanyToExport, 'warn')
    return {
      model,
      commands: [
        DownloadSave({
          text: encodeSave(savePayloadOf(model)),
          name: saveFileName(currentFile(model)?.name ?? ''),
        }),
      ],
    }
  },

  SaveImportAsked: () =>
    offCompany(model)
      ? withToast(model, say(model).toasts.noSaveHere, 'warn')
      : { model, commands: [AskSaveImport({})] },

  SaveFileAsked: () =>
    offCompany(model)
      ? withToast(model, say(model).toasts.noSaveHere, 'warn')
      : { model, commands: [PickSaveFile({ as: 'save' })] },

  SaveImported: ({ text }) => applyImport(model, route, text, false),

  CompanyFileAsked: () =>
    offCompany(model)
      ? withToast(model, say(model).toasts.noSaveHere, 'warn')
      : { model, commands: [PickSaveFile({ as: 'company' })] },

  CompanyImported: ({ text }) => applyImport(model, route, text, true),

  CheatCash: () => {
    const next: Model = {
      ...model,
      board: {
        ...model.board,
        game: { ...model.board.game, cash: model.board.game.cash + cheatCash(model.board.game) },
      },
    }
    return { model: next }
  },

  CheatInsight: () => ({
    model: {
      ...model,
      board: {
        ...model.board,
        game: {
          ...model.board.game,
          pools: Object.fromEntries(
            Object.entries(model.board.game.pools).map(([pool, held]) => [
              pool,
              held + cheatInsight(model.board.game),
            ]),
          ) as Game['pools'],
        },
      },
    },
  }),

  CheatLegacy: () => {
    const founder = { ...model.founder, legacy: model.founder.legacy + 20 }
    return withToast({ ...model, founder }, say(model).toasts.legacyCheat, 'plain', [
      WriteFounder({ founder }),
    ])
  },

  CheatRound: () => {
    const next = nextEra(model.board.game)
    if (!next || isFinalEra(model.board.game))
      return withToast(model, say(model).toasts.noRoundToSkip, 'plain')
    const ready = {
      ...model.board.game,
      users: Math.max(model.board.game.users, eraOf(model.board.game).raiseAt),
    }
    // A playtest skips the IPO checklist.
    if (ready.stage === PRE_IPO_STAGE) {
      const ledger = solveFlow(ready)
      const ipo = listed(model, ready)
      const listedGame: Game = {
        ...ipo.game,
        stage: ready.stage + 1,
        equity: ready.equity * (1 - eraOf(ready).dilution),
        cash: ready.cash + ledger.burn * IPO_BURN_SECONDS,
        quarter: firstQuarter(ready, ledger.revenue),
      }
      const next: Model = {
        ...model,
        panel: afterRound(listedGame),
        board: { ...model.board, game: listedGame },
        founder: ipo.founder,
      }
      return { model: next, commands: [WriteFounder({ founder: ipo.founder })] }
    }
    return act(
      { ...model, board: { ...model.board, game: ready } },
      `Skipped to ${next.name}`,
      Actions.raise(ready),
      {
        panel: afterRound,
      },
    )
  },

  IncidentForced: ({ kind }) => {
    if (model.board.game.incident)
      return withToast(
        model,
        say(model).toasts.incidentRunning(
          say(model).catalog.incidents[model.board.game.incident.kind].name,
        ),
        'warn',
      )
    const game = forceIncident(model.board.game, solveFlow(model.board.game), kind)
    if (!game)
      return withToast(
        model,
        say(model).toasts.incidentNoTarget(say(model).catalog.incidents[kind].name),
        'warn',
      )
    const next: Model = {
      ...model,
      panel: 'none',
      board: { ...model.board, game, bottleneckAt: -1 },
    }
    return { model: next }
  },

  LogExported: () => ({ model, commands: [ExportLog({})] }),

  StateCopied: () => {
    const reason = refusal(model)
    return reason
      ? withToast(model, reasonIn(say(model), reason), 'warn')
      : {
          model,
          commands: [
            CopyText({
              text: stateJson(model),
              done: say(model).toasts.copiedState,
              blocked: say(model).toasts.clipboardBlocked,
            }),
          ],
        }
  },

  AgentRoomCopied: () => {
    const company = playingId(model)
    const id = company === null ? null : agentRoomId(company)
    return id === null
      ? withToast(model, say(model).toasts.agentRoomMissing, 'warn')
      : {
          model,
          commands: [
            CopyText({
              text: id,
              done: say(model).toasts.copiedAgentRoom,
              blocked: say(model).toasts.clipboardBlocked,
            }),
          ],
        }
  },

  LogCleared: () => withToast(model, say(model).toasts.logCleared, 'plain', [ClearLog({})]),
})
