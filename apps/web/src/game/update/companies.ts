import * as Actions from '@quorum/simulation/actions'
import { AppRoute, routeOfMenu } from '../route.ts'
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
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { historyOfSave } from '../history.ts'
import { inboxOfSave, mailed } from '../inbox.ts'
import { ipoExit } from '@quorum/simulation/exit'
import { ledgerOf, Model, currentFile, type Menu } from '../model.ts'
import { line } from '../telemetry.ts'
import { newGame, preseedGame } from '@quorum/simulation/company'
import { normalizeOrdinals } from '@quorum/simulation/labels'
import { continued } from './session.ts'
import { refusalIn } from '../../i18n/refusal.ts'
import { revealAtStart, revealsOfSave } from '../reveal.ts'
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
    loaded: true,
    toast: null,
    panel,
    company: null,
    saves: { current: file.id, companies: withFile(model.saves, file).companies },
    draft: { name: '', logo: model.draft.logo },
    saveFocus: null,
    saveConfirm: false,
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
  const away = game.wall > 0 ? (now - game.wall) / 1_000 : 0
  const back =
    away >= OFFLINE_MIN && !game.sandbox
      ? traced('sim.offline_catchup', { away_seconds: Math.round(away) }, () =>
          simulateAway(game, away),
        )
      : null
  const played = normalizeOrdinals(back?.game ?? game)
  // The Inbox survives the reload (18 "Open questions"), and the return from away writes to it.
  const kept = inboxOfSave(file)
  const inbox = back
    ? awayFacts(back.report, played).reduce(
        (next, fact) => mailed(next, fact, played.time, true),
        kept,
      )
    : kept
  const next: Model = {
    ...model,
    loaded: true,
    saves: { ...model.saves, current: id },
    route: open ? AppRoute.Company() : model.route,
    panel: open ? (back ? 'away' : 'none') : model.panel,
    saveFocus: null,
    saveConfirm: false,
    board: {
      ...model.board,
      disclosure: { ...model.board.disclosure, ...revealsOfSave(file) },
      dashboard: { ...model.board.dashboard, history: historyOfSave(file) },
      game: played,
      inbox,
      clock: { ...model.board.clock, savedAt: played.time, sampledAt: played.time },
      bottleneckAt: -1,
      away: back?.report ?? null,
    },
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
  const decoded = Option.match(raw, {
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
    { ...model, saves, oldSave: true },
    file.id,
    game,
    Option.getOrNull(raw),
    now,
    false,
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
  const decoded = Option.match(raw, {
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
    { ...model, saves, oldSave: true },
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
    loaded: false,
    saves: { ...model.saves, current: null },
    saveFocus: null,
    saveConfirm: false,
    board: freshBoard(newGame(model.board.game.seed)),
  },
})

/** The IPO lists the Company: Legacy for the listing, and the Company goes on as Public. */
export const listed = (model: Model, game: Game): Readonly<{ game: Game; founder: Founder }> => {
  const ipo = ipoExit(game, solveFlow(game), currentFile(model)?.name ?? '')
  return { game: ipo.game, founder: recordExit(model.founder, ipo) }
}

/* ---------- Challenges ---------- */

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
      if (!parsed)
        return withToast(model, say(model).toasts.unreadableList, 'warn', [
          KeepBrokenSave({ json: index, reason: 'The company list is not a save index.' }),
        ])
      return {
        model: { ...model, saves: parsed, oldSave: legacy !== null },
        commands: parsed.current === null ? [] : [LoadCompany({ id: parsed.current, open: false })],
      }
    }
    return legacy === null ? { model } : adoptLegacy(model, legacy, now)
  },

  CompanyLoaded: ({ id, open, json, now }) => {
    if (json === null)
      return open ? withToast(model, say(model).toasts.companyMissing, 'warn') : { model }
    const raw = parseJson(json)
    const decoded = Option.match(raw, {
      onNone: () => Exit.fail('The save is not JSON.'),
      onSome: (value) => Exit.mapError(decodeGame(value), (error) => error.message),
    })
    // A save this version cannot read is set aside, not overwritten by the next autosave.
    if (Exit.isFailure(decoded))
      return withToast(model, say(model).toasts.unreadableCompany, 'warn', [
        KeepBrokenSave({ json, reason: String(Cause.squash(decoded.cause)) }),
      ])
    return applyCompany(model, id, decoded.value, Option.getOrNull(raw), now, open)
  },

  CompanyNameChanged: ({ name }) => ({
    model: { ...model, draft: { ...model.draft, name: name.slice(0, MAX_COMPANY_NAME) } },
  }),

  LogoChosen: ({ logo }) => ({ model: { ...model, draft: { ...model.draft, logo } } }),

  CompanyChosen: ({ id }) =>
    fileOf(model.saves, id)
      ? { model: { ...model, saveFocus: id, saveConfirm: false } }
      : { model },

  CompanyClosed: () => ({
    model: {
      ...model,
      route: AppRoute.Menu({ menu: 'companies' }),
      saveFocus: null,
      saveConfirm: false,
    },
  }),

  CompanyOpened: ({ id }) =>
    fileOf(model.saves, id) === null
      ? { model }
      : model.loaded && model.saves.current === id
        ? continued({ ...model, saveFocus: null, saveConfirm: false })
        : {
            model: { ...model, saveFocus: null, saveConfirm: false },
            commands: [LoadCompany({ id, open: true })],
          },

  CompanyDeleteAsked: () => ({ model: { ...model, saveConfirm: true } }),

  CompanyDeleteCancelled: () => ({ model: { ...model, saveConfirm: false } }),

  CompanyDeleteConfirmed: () => {
    const id = model.saveFocus
    if (id === null || fileOf(model.saves, id) === null) return { model }
    const saves = withoutFile(model.saves, id)
    const current = model.saves.current === id
    const next: Model = {
      ...model,
      saves,
      saveFocus: null,
      saveConfirm: false,
      ...(current
        ? {
            loaded: false,
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
    if (loaded.deviceId) return { model: { ...model, founder: loaded, today } }
    const founder = { ...loaded, deviceId }
    return { model: { ...model, founder, today }, commands: [WriteFounder({ founder })] }
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
