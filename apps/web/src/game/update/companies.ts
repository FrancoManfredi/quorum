import * as Actions from '@quorum/simulation/actions'
import { AppRoute, routeOfMenu, urlOf } from '../route.ts'
import { Cause, Exit, Option, Result, Schema } from 'effect'
import { DEFAULT_LOGO } from '../logos.ts'
import {
  DeleteCompany,
  LoadCompany,
  KeepBrokenSave,
  ReadOldSave,
  WriteFounder,
  AppendLog,
  FitBoard,
  ReplaceUrl,
} from '../commands.ts'
import { Founder, founded, foundingOf, recordExit } from '@quorum/simulation/founder'
import { Game } from '@quorum/simulation/state'
import {
  MAX_COMPANY_NAME,
  fileFor,
  fileOf,
  hasRecovered,
  nameOr,
  newSaveId,
  refreshedIndex,
  withFile,
  withoutFile,
  SaveIndex,
  type CompanyFile,
} from '../saves.ts'
import { OFFLINE_MIN, simulateAway } from '@quorum/simulation/offline'
import { awayFacts } from '../mail.ts'
import { foundCompany } from '@quorum/simulation/founding'
import {
  freshBoard,
  say,
  saveCommands,
  withToast,
  type AnyCommand,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { historyOfSave } from '../history.ts'
import { inboxOfSave, mailed } from '../inbox.ts'
import { migrateSaveFile } from '../save-migration.ts'
import { ipoExit } from '@quorum/simulation/exit'
import {
  ledgerOf,
  Model,
  currentFile,
  EMPTY_SURVEY,
  offCompany,
  type Board,
  type Menu,
} from '../model.ts'
import { companyIdOf, isOpen, isPlaying, opened, step } from '../company-machine.ts'
import { line } from '../telemetry.ts'
import { newGame, preseedGame } from '@quorum/simulation/company'
import { normalizeOrdinals } from '@quorum/simulation/labels'
import { challengeById, challengeOpen } from '@quorum/simulation/challenges'
import { continued, enterChallenge } from './session.ts'
import { step as confirmDeleteStep } from '../confirm-delete-machine.ts'
import { refusalIn } from '../../i18n/refusal.ts'
import { disclosureOfSave, revealAtStart } from '../reveal.ts'
import { solveFlow } from '@quorum/simulation/solve'
import { traced } from '../../platform/sentry.ts'

export const parseJson = Schema.decodeUnknownOption(Schema.fromJsonString(Schema.Unknown))

export const decodeGame = Schema.decodeUnknownExit(Game)

export const startCompany = (
  model: Model,
  game: Game,
  panel: Model['panel'],
  file: CompanyFile,
): UpdateResult => {
  const fresh: Model = {
    ...model,
    route: AppRoute.Company(),
    companyPhase: opened(model.companyPhase, file.id),
    toast: null,
    panel,
    company: null,
    saves: { current: file.id, companies: withFile(model.saves, file).companies },
    draft: { name: '', logo: model.draft.logo },
    saveFocus: null,
    saveConfirm: { _tag: 'List' },
    board: freshBoard(game),
  }
  const next = revealAtStart(fresh, ledgerOf(fresh))
  return {
    model: next,
    commands: [
      ...saveCommands(next),
      FitBoard({}),
      AppendLog({
        entries: [
          line(game.time, 'CompanyStarted', {
            stage: game.stage,
            seed: game.seed,
            venture: game.founding.venture,
            mutators: game.founding.mutators,
            first: model.saves.companies.length === 0,
            viewport:
              typeof window === 'undefined' ? null : [window.innerWidth, window.innerHeight],
            agent: typeof navigator === 'undefined' ? null : navigator.userAgent,
          }),
        ],
      }),
    ],
  }
}

export const parseFounder = Schema.decodeUnknownOption(Schema.fromJsonString(Founder))

export const parseIndex = Schema.decodeUnknownOption(Schema.fromJsonString(SaveIndex))

/** A Company that cannot open puts the title back where its URL named the board. */
const titleIfBoard = (model: Model): UpdateResult =>
  model.route._tag === 'Company'
    ? {
        model: { ...model, route: AppRoute.Title() },
        commands: [ReplaceUrl({ url: urlOf(AppRoute.Title()) })],
      }
    : { model }

/** A decoded Company Game goes onto the board. Time away plays out at 1×: a real
 *  second is a sim second (04 "Offline progress"). Opening it also leaves the title. */
export const applyCompany = (
  model: Model,
  id: string,
  game: Game,
  file: unknown,
  now: number,
  open: boolean,
): UpdateResult => {
  // A file that answers for another Company is stale: it does not land.
  const loaded = step(model.companyPhase, { _tag: 'Loaded', id })
  if (!isOpen(loaded) || loaded.id !== id) return { model }
  const away = game.wall > 0 ? (now - game.wall) / 1_000 : 0
  const back =
    away >= OFFLINE_MIN && !game.sandbox
      ? traced('sim.offline_catchup', { away_seconds: Math.round(away) }, () =>
          simulateAway(game, away),
        )
      : null
  const phase = back ? step(loaded, { _tag: 'AwayTaken', id, report: back.report }) : loaded
  const played = normalizeOrdinals(back?.game ?? game)
  // The Inbox survives the reload (18 "Open questions"), and the return from away writes to it.
  const kept = inboxOfSave(file)
  const inbox = back
    ? awayFacts(back.report, played).reduce(
        (next, fact) => mailed(next, fact, played.time, true),
        kept,
      )
    : kept
  // A Sandbox or Challenge on the board keeps the Company aside until the player comes back.
  const aside = offCompany(model)
  const held = aside ? (model.company ?? model.board) : model.board
  const companyBoard: Board = {
    ...held,
    disclosure: disclosureOfSave(file),
    dashboard: { ...held.dashboard, history: historyOfSave(file) },
    game: played,
    inbox,
    clock: { ...held.clock, savedAt: played.time, sampledAt: played.time },
    bottleneckAt: -1,
  }
  const next: Model = {
    ...model,
    companyPhase: phase,
    saves: { ...model.saves, current: id },
    route: open && !aside ? AppRoute.Company() : model.route,
    panel: open && !aside ? (back ? 'away' : 'none') : model.panel,
    saveFocus: null,
    saveConfirm: { _tag: 'List' },
    board: aside ? model.board : companyBoard,
    company: aside ? companyBoard : model.company,
  }
  return {
    model: { ...next, saves: refreshedIndex(next.saves, played) },
    commands: back
      ? [AppendLog({ entries: [line(played.time, 'OfflineReturned', { ...back.report })] })]
      : [],
  }
}

/** The single save of the build before Company files becomes the first Company. */
export const adoptLegacy = (model: Model, json: string, now: number): UpdateResult => {
  const raw = parseJson(json)
  const migrated = Option.map(raw, (value) =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? migrateSaveFile(value as Record<string, unknown>)
      : value,
  )
  const decoded = Option.match(migrated, {
    onNone: () => Exit.fail('The save is not JSON.'),
    onSome: (value) => Exit.mapError(decodeGame(value), (error) => error.message),
  })
  if (Exit.isFailure(decoded))
    return withToast(model, say(model).toasts.unreadableSave, 'warn', [
      KeepBrokenSave({ json, reason: String(Cause.squash(decoded.cause)) }),
    ])
  const game = decoded.value
  const createdAt = game.wall > 0 ? game.wall : now
  const file = fileFor({
    id: newSaveId(model.saves.companies, game.seed),
    name: say(model).toasts.recoveredCompany,
    logo: DEFAULT_LOGO,
    founding: game.founding,
    game,
    now,
    createdAt,
    recovered: true,
  })
  const saves: SaveIndex = { current: file.id, companies: withFile(model.saves, file).companies }
  const applied = applyCompany(
    {
      ...model,
      saves,
      oldSave: true,
      companyPhase: step(model.companyPhase, { _tag: 'Open', id: file.id }),
    },
    file.id,
    game,
    Option.getOrNull(raw),
    now,
    model.route._tag === 'Company',
  )
  return {
    ...applied,
    commands: [...(applied.commands ?? []), ...saveCommands(applied.model)],
  }
}

/** Imports the single save of the build before Company files, leaving the old key in place. */
export const importOldSave = (model: Model, json: string | null, now: number): UpdateResult => {
  if (json === null) return withToast(model, say(model).toasts.noPreviousSave, 'plain')
  if (hasRecovered(model.saves.companies))
    return withToast(model, say(model).toasts.previousSaveKnown, 'plain')
  const raw = parseJson(json)
  const migrated = Option.map(raw, (value) =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
      ? migrateSaveFile(value as Record<string, unknown>)
      : value,
  )
  const decoded = Option.match(migrated, {
    onNone: () => Exit.fail('The save is not JSON.'),
    onSome: (value) => Exit.mapError(decodeGame(value), (error) => error.message),
  })
  if (Exit.isFailure(decoded))
    return withToast(model, say(model).toasts.previousSaveUnreadable, 'warn')
  const game = decoded.value
  const file = fileFor({
    id: newSaveId(model.saves.companies, game.seed),
    name: say(model).toasts.recoveredCompany,
    logo: DEFAULT_LOGO,
    founding: game.founding,
    game,
    now,
    createdAt: game.wall > 0 ? game.wall : now,
    recovered: true,
  })
  const saves: SaveIndex = { current: file.id, companies: withFile(model.saves, file).companies }
  const applied = applyCompany(
    {
      ...model,
      saves,
      oldSave: true,
      companyPhase: step(model.companyPhase, { _tag: 'Open', id: file.id }),
    },
    file.id,
    game,
    Option.getOrNull(raw),
    now,
    true,
  )
  return withToast(applied.model, say(model).toasts.recovered(file.name), 'ok', [
    ...(applied.commands ?? []),
    ...saveCommands(applied.model),
  ])
}

/** Applies a change to the Founder record, saves it, or says why not. */
export const changeFounder = (
  model: Model,
  change: Result.Result<Founder, Actions.Refusal>,
  done?: string,
): UpdateResult =>
  Result.match(change, {
    onFailure: (refusal) => withToast(model, refusalIn(say(model), refusal), 'warn'),
    onSuccess: (founder) => {
      const next: Model = { ...model, founder }
      const commands = [WriteFounder({ founder })]
      return done ? withToast(next, done, 'ok', commands) : { model: next, commands }
    },
  })

/** Founds the next Company with the Founder's Venture, Mutators, perks and kept research. */
export const found = (model: Model): UpdateResult => {
  const founder = founded(model.founder)
  const founding = foundingOf(model.founder)
  const game = foundCompany(model.board.game.seed + 7919, founding, model.founder.keep)
  const now = Date.now()
  const file = fileFor({
    id: newSaveId(model.saves.companies, game.seed),
    name: nameOr(model.draft.name),
    logo: model.draft.logo,
    founding,
    game,
    now,
  })
  const started = startCompany({ ...model, founder }, game, game.stage >= 1 ? 'era' : 'none', file)
  return {
    ...started,
    commands: [...(started.commands ?? []), WriteFounder({ founder })],
  }
}

/** Leaves an exited Company for the title screen: nothing to continue, nothing to save. */
export const leaveExited = (model: Model, menu: Menu): UpdateResult => ({
  model: {
    ...model,
    route: routeOfMenu(menu),
    panel: 'none',
    companyPhase: step(model.companyPhase, { _tag: 'Closed' }),
    saves: { ...model.saves, current: null },
    saveFocus: null,
    saveConfirm: { _tag: 'List' },
    survey: EMPTY_SURVEY,
    board: freshBoard(newGame(model.board.game.seed)),
  },
})

/** The IPO lists the Company: Legacy for the listing, and the Company goes on as Public. */
export const listed = (model: Model, game: Game): Readonly<{ game: Game; founder: Founder }> => {
  const ipo = ipoExit(game, solveFlow(game), currentFile(model)?.name ?? '')
  return { game: ipo.game, founder: recordExit(model.founder, ipo) }
}

type CompaniesTag =
  | 'SavesLoaded'
  | 'CompanyLoaded'
  | 'CompanyNameChanged'
  | 'LogoChosen'
  | 'CompanyChosen'
  | 'CompanyClosed'
  | 'CompanyOpened'
  | 'CompanyDeleteAsked'
  | 'CompanyDeleteCancelled'
  | 'CompanyDeleteConfirmed'
  | 'CompanyDeleted'
  | 'OldSaveImportAsked'
  | 'OldSaveLoaded'
  | 'FounderLoaded'
  | 'Saved'
  | 'CompanyFounded'
  | 'PreseedStarted'

export const companiesHandlers = (model: Model): MessageCases<UpdateResult, CompaniesTag> => ({
  SavesLoaded: ({ index, legacy, now }) => {
    if (index !== null) {
      const parsed = Option.getOrNull(parseIndex(index))
      if (!parsed) {
        const back = titleIfBoard(model)
        return withToast(back.model, say(model).toasts.unreadableList, 'warn', [
          KeepBrokenSave({ json: index, reason: 'The company list is not a save index.' }),
          ...(back.commands ?? []),
        ])
      }
      const loaded: Model = {
        ...model,
        saves: parsed,
        oldSave: legacy !== null,
        companyPhase: step(model.companyPhase, {
          _tag: 'SavesLoaded',
          current: parsed.current,
        }),
      }
      if (parsed.current === null) return titleIfBoard(loaded)
      return {
        model: loaded,
        // A reload on the Company's board opens it; anywhere else it waits for Continue.
        commands: [LoadCompany({ id: parsed.current, open: model.route._tag === 'Company' })],
      }
    }
    return legacy === null ? titleIfBoard(model) : adoptLegacy(model, legacy, now)
  },

  CompanyLoaded: ({ id, open, json, now }) => {
    // A file that does not answer leaves nothing opening.
    const failed = (): Model => ({
      ...model,
      companyPhase: step(model.companyPhase, { _tag: 'Failed', id }),
    })
    if (json === null) {
      const back = titleIfBoard(failed())
      return open
        ? withToast(back.model, say(model).toasts.companyMissing, 'warn', back.commands)
        : { model: back.model }
    }
    const raw = parseJson(json)
    const file = Option.map(raw, (value) =>
      typeof value === 'object' && value !== null && !Array.isArray(value)
        ? migrateSaveFile(value as Record<string, unknown>)
        : value,
    )
    const decoded = Option.match(file, {
      onNone: () => Exit.fail('The save is not JSON.'),
      onSome: (value) => Exit.mapError(decodeGame(value), (error) => error.message),
    })
    // A save this version cannot read is set aside, not overwritten by the next autosave.
    if (Exit.isFailure(decoded)) {
      const back = titleIfBoard(failed())
      return withToast(back.model, say(model).toasts.unreadableCompany, 'warn', [
        KeepBrokenSave({ json, reason: String(Cause.squash(decoded.cause)) }),
        ...(back.commands ?? []),
      ])
    }
    return applyCompany(model, id, decoded.value, Option.getOrNull(file), now, open)
  },

  CompanyNameChanged: ({ name }) => ({
    model: { ...model, draft: { ...model.draft, name: name.slice(0, MAX_COMPANY_NAME) } },
  }),

  LogoChosen: ({ logo }) => ({ model: { ...model, draft: { ...model.draft, logo } } }),

  CompanyChosen: ({ id }) =>
    fileOf(model.saves, id)
      ? { model: { ...model, saveFocus: id, saveConfirm: { _tag: 'List' } } }
      : { model },

  CompanyClosed: () => ({
    model: {
      ...model,
      route: AppRoute.Menu({ menu: 'companies' }),
      saveFocus: null,
      saveConfirm: { _tag: 'List' },
    },
  }),

  CompanyOpened: ({ id }) => {
    if (fileOf(model.saves, id) === null) return { model }
    const phase = model.companyPhase
    if (isPlaying(phase) && phase.id === id)
      return continued({ ...model, saveFocus: null, saveConfirm: { _tag: 'List' } })
    return {
      model: {
        ...model,
        companyPhase: step(phase, { _tag: 'Open', id }),
        saveFocus: null,
        saveConfirm: { _tag: 'List' },
      },
      commands: [LoadCompany({ id, open: true })],
    }
  },

  CompanyDeleteAsked: () =>
    model.saveFocus === null
      ? { model }
      : {
          model: {
            ...model,
            saveConfirm: confirmDeleteStep(model.saveConfirm, {
              _tag: 'Asked',
              id: model.saveFocus,
            }),
          },
        },

  CompanyDeleteCancelled: () => ({
    model: {
      ...model,
      saveConfirm: confirmDeleteStep(model.saveConfirm, { _tag: 'Cancelled' }),
    },
  }),

  CompanyDeleteConfirmed: () => {
    const id = model.saveFocus
    if (id === null || fileOf(model.saves, id) === null) return { model }
    const saves = withoutFile(model.saves, id)
    const current = model.saves.current === id || companyIdOf(model.companyPhase) === id
    const next: Model = {
      ...model,
      saves,
      saveFocus: null,
      saveConfirm: confirmDeleteStep(model.saveConfirm, { _tag: 'Confirmed' }),
      ...(current
        ? {
            companyPhase: step(model.companyPhase, { _tag: 'Deleted', id }),
            board: freshBoard(newGame(model.board.game.seed)),
            panel: 'none' as const,
          }
        : {}),
    }
    return { model: next, commands: [DeleteCompany({ id, index: saves })] }
  },

  CompanyDeleted: () => ({ model }),

  OldSaveImportAsked: () =>
    model.oldSave
      ? { model, commands: [ReadOldSave({})] }
      : withToast(model, say(model).toasts.noPreviousSave, 'plain'),

  OldSaveLoaded: ({ json, now }) => importOldSave(model, json, now),

  FounderLoaded: ({ json, deviceId, today }) => {
    const loaded = Option.getOrElse(
      json === null ? Option.none() : parseFounder(json),
      () => model.founder,
    )
    const founder = loaded.deviceId ? loaded : { ...loaded, deviceId }
    const next: Model = { ...model, founder, today }
    const commands: Array<AnyCommand> = loaded.deviceId ? [] : [WriteFounder({ founder })]
    // A reload on a Challenge opens it once the Founder says whether it is unlocked.
    if (model.route._tag !== 'Challenge') return { model: next, commands }
    const entry = challengeById(model.route.challenge)
    if (entry && challengeOpen(entry, founder.completed)) {
      const opened = enterChallenge(next, entry.id)
      return { ...opened, commands: [...commands, ...(opened.commands ?? [])] }
    }
    const menu = AppRoute.Menu({ menu: 'challenges' })
    return {
      model: { ...next, route: menu },
      commands: [...commands, ReplaceUrl({ url: urlOf(menu) })],
    }
  },

  Saved: () => ({ model }),

  CompanyFounded: () => found(model),

  PreseedStarted: () => {
    const founding = foundingOf(model.founder)
    const game = { ...preseedGame(model.board.game.seed + 7919), founding }
    const now = Date.now()
    const file = fileFor({
      id: newSaveId(model.saves.companies, game.seed),
      name: nameOr(model.draft.name),
      logo: model.draft.logo,
      founding,
      game,
      now,
    })
    return startCompany(model, game, 'era', file)
  },
})
