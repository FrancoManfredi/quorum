import * as Actions from '@quorum/simulation/actions'
import * as Runway from '@quorum/simulation/runway'
import {
  AskPlaybook,
  DeleteCompany,
  CopyText,
  WriteFounder,
  AppendLog,
  SubmitSurvey,
} from '../commands.ts'
import { EXITS, RESEARCH } from '@quorum/simulation/catalog'
import { Model, currentFile, EMPTY_SURVEY } from '../model.ts'
import { PRE_IPO_STAGE } from '@quorum/simulation/ipo'
import { Result } from 'effect'
import { afterRound } from './session.ts'
import {
  buyPerk,
  recordExit,
  removePlaybook,
  savePlaybook,
  toggleKeep,
  toggleMutator,
  unlockVenture,
} from '@quorum/simulation/founder'
import { capture, decodePlaybook, encodePlaybook } from '@quorum/simulation/playbook'
import { changeFounder, listed } from './companies.ts'
import { everyVenture } from '@quorum/simulation/achievements'
import { line } from '../telemetry.ts'
import { money } from '@quorum/ui/game/format'
import { refusalIn } from '../../i18n/refusal.ts'
import { say, withToast, act, achieve, type MessageCases, type UpdateResult } from './shared.ts'
import { solveFlow } from '@quorum/simulation/solve'
import { takeExit } from '@quorum/simulation/exit'
import { withoutFile } from '../saves.ts'

type ExitTag =
  | 'ExitTaken'
  | 'KeepToggled'
  | 'PerkBought'
  | 'VentureChosen'
  | 'MutatorToggled'
  | 'PlaybookSaved'
  | 'PlaybookChosen'
  | 'PlaybookDeleted'
  | 'PlaybookExported'
  | 'PlaybookImportAsked'
  | 'PlaybookImported'
  | 'RoundRaised'
  | 'RoundDeclined'
  | 'BridgeAccepted'
  | 'PostmortemFiled'
  | 'AwayClosed'
  | 'SurveySubmitted'
  | 'SurveySkipped'
  | 'SurveySent'
  | 'SurveyFailed'

/** Sends the Exit survey. Only a Company that just ended has an Exit to report on. */
const submitSurvey = (model: Model): UpdateResult => {
  if (model.survey.status !== 'open' && model.survey.status !== 'failed') return { model }
  const exited = model.board.exited
  if (!exited) return withToast(model, say(model).survey.noExit, 'warn')
  const issues = model.survey.issues.trim()
  const likes = model.survey.likes.trim()
  if (issues.length === 0 && likes.length === 0)
    return withToast(model, say(model).survey.empty, 'warn')
  const row = exited.row
  return {
    model: { ...model, survey: { ...model.survey, status: 'sending', note: null } },
    commands: [
      SubmitSurvey({
        submission: {
          deviceId: model.founder.deviceId,
          locale: model.prefs.locale,
          exit: {
            exit: row.exit,
            stage: row.stage,
            time: row.time,
            peak: row.peak,
            payout: row.payout,
            legacy: row.legacy,
            venture: row.founding.venture,
            mutators: [...row.founding.mutators],
            perks: row.founding.perks,
          },
          issues,
          likes,
        },
      }),
    ],
  }
}

export const exitHandlers = (model: Model): MessageCases<UpdateResult, ExitTag> => ({
  ExitTaken: ({ exit }) =>
    Result.match(
      takeExit(model.board.game, solveFlow(model.board.game), exit, currentFile(model)?.name ?? ''),
      {
        onFailure: (refusal) => withToast(model, refusalIn(say(model), refusal), 'warn'),
        onSuccess: (result) => {
          const exited = recordExit(model.founder, result)
          const [earned, earnedCommands] = achieve(
            { ...model, founder: exited },
            everyVenture(exited.history.map((row) => row.founding.venture))
              ? ['serial-founder']
              : [],
          )
          const founder = earned.founder
          const removed = earned.saves.current
          const saves = removed === null ? earned.saves : withoutFile(earned.saves, removed)
          const next: Model = {
            ...earned,
            founder,
            survey: EMPTY_SURVEY,
            panel: 'exited',
            loaded: false,
            saves,
            board: {
              ...earned.board,
              selected: null,
              selection: [],
              tool: null,
              exited: { row: result.row, researched: model.board.game.researched },
              clock: { ...earned.board.clock, paused: true },
            },
          }
          return {
            model: next,
            commands: [
              ...earnedCommands,
              WriteFounder({ founder }),
              ...(removed === null ? [] : [DeleteCompany({ id: removed, index: saves })]),
              AppendLog({
                entries: [
                  line(model.board.game.time, 'Exited', {
                    exit: EXITS[exit].name,
                    payout: result.row.payout,
                    legacy: result.legacy,
                    era: model.board.game.stage,
                  }),
                ],
              }),
            ],
          }
        },
      },
    ),

  KeepToggled: ({ id }) => changeFounder(model, toggleKeep(model.founder, id)),

  PerkBought: ({ id }) =>
    changeFounder(
      model,
      buyPerk(model.founder, id),
      say(model).toasts.perkBought(say(model).catalog.perks[id].name),
    ),

  VentureChosen: ({ id }) => changeFounder(model, unlockVenture(model.founder, id)),

  MutatorToggled: ({ id }) => changeFounder(model, toggleMutator(model.founder, id)),

  PlaybookSaved: () => {
    const playbook = capture(
      model.board.game,
      model.board.selection,
      `Playbook ${model.founder.playbooks.length + 1}`,
    )
    if (!playbook) return withToast(model, say(model).toasts.selectToSave, 'plain')
    const saved = changeFounder(
      { ...model, board: { ...model.board, selection: [] } },
      savePlaybook(model.founder, playbook),
      say(model).toasts.playbookSaved(playbook.name, playbook.nodes.length),
    )
    return saved
  },

  PlaybookChosen: ({ index }) => {
    if (!model.founder.playbooks[index]) return { model }
    const next: Model = {
      ...model,
      panel: 'none',
      board: { ...model.board, tool: { _tag: 'Stamping', source: index }, selected: null },
    }
    return { model: next }
  },

  PlaybookDeleted: ({ index }) => {
    const founder = removePlaybook(model.founder, index)
    return { model: { ...model, founder }, commands: [WriteFounder({ founder })] }
  },

  PlaybookExported: ({ index }) => {
    const playbook = model.founder.playbooks[index]
    if (!playbook) return { model }
    return {
      model,
      commands: [
        CopyText({
          text: encodePlaybook(playbook),
          done: say(model).toasts.copiedPlaybook(playbook.name),
          blocked: say(model).toasts.clipboardBlocked,
        }),
      ],
    }
  },

  PlaybookImportAsked: () => ({ model, commands: [AskPlaybook({})] }),

  PlaybookImported: ({ text }) =>
    text === null
      ? { model }
      : changeFounder(
          model,
          Result.flatMap(decodePlaybook(text), (playbook) => savePlaybook(model.founder, playbook)),
          say(model).toasts.playbookImported,
        ),

  RoundRaised: () => {
    if (model.board.game.stage !== PRE_IPO_STAGE || !Actions.canRaise(model.board.game))
      return act(model, 'Raised a round', Actions.raise(model.board.game), { panel: afterRound })
    const ipo = listed(model, model.board.game)
    const result = act({ ...model, founder: ipo.founder }, 'Listed', Actions.raise(ipo.game), {
      panel: afterRound,
      note: (game) => [say(model).toasts.listed(game.banked), 'primary'],
    })
    return result.model.board.game === model.board.game
      ? withToast(model, say(model).toasts.ipoFailed, 'warn')
      : {
          ...result,
          commands: [...(result.commands ?? []), WriteFounder({ founder: ipo.founder })],
        }
  },

  RoundDeclined: () =>
    act(model, 'Declined a round', Actions.decline(model.board.game), { panel: afterRound }),

  BridgeAccepted: () => {
    const bridge = model.board.game.bridge
    if (!bridge) return withToast(model, say(model).toasts.noBridge, 'warn')
    const took = act(model, 'Accepted the bridge', Runway.acceptBridge(model.board.game))
    if (took.model.board.game === model.board.game) return took
    return withToast(
      took.model,
      say(model).toasts.bridgeTaken(money(bridge.grant), Math.round(bridge.dilution * 100)),
      'primary',
      took.commands,
    )
  },

  PostmortemFiled: ({ id, take }) => {
    const action = model.board.game.postmortems.find((entry) => entry.id === id)?.action
    return act(model, 'Postmortem', Actions.filePostmortem(model.board.game, id, take), {
      note: () => (take && action ? [`Study queued: ${RESEARCH[action].name}.`, 'primary'] : null),
    })
  },

  AwayClosed: () => ({
    model: { ...model, panel: 'none', board: { ...model.board, away: null } },
  }),

  SurveySubmitted: () => submitSurvey(model),
  SurveySkipped: () => ({
    model: { ...model, survey: { ...model.survey, status: 'skipped', note: null } },
  }),
  // An answer that lands after the player left the exited Company, or skipped, changes nothing.
  SurveySent: () =>
    model.board.exited && model.survey.status === 'sending'
      ? { model: { ...model, survey: { ...model.survey, status: 'sent', note: null } } }
      : { model },
  SurveyFailed: ({ message, offline }) =>
    model.board.exited && model.survey.status === 'sending'
      ? {
          model: {
            ...model,
            survey: {
              ...model.survey,
              status: 'failed',
              note: offline ? say(model).survey.offline : message,
            },
          },
        }
      : { model },
})
