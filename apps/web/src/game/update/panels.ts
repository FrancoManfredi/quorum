import { ApplySettings, FocusDashboard, WriteFounder, WritePrefs } from '../commands.ts'
import { EMPTY_RESEARCH, ResearchMessage } from '../research.ts'
import { Message } from '../message.ts'
import { Model, Prefs, halted } from '../model.ts'
import { Option, Schema } from 'effect'
import { PrefsMessage, updatePrefs } from '../prefs.ts'
import { Update } from 'foldkit'
import {
  closePanel,
  withToast,
  type Dispatch,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { discoverTerm } from '@quorum/simulation/founder'
import { foldInbox } from './mail.ts'
import { leaveExited } from './companies.ts'
import { has } from '@quorum/simulation/lookups'
import { initTeam } from '../team.ts'
import { languageListbox } from '../../i18n/listbox.ts'
import { moreMenu, type MoreItem } from '../more.ts'
import { onBoard } from '../route.ts'
import { openRegions } from '@quorum/simulation/regions'
import { openingFolder, reading } from '../inbox.ts'
import { type RegionId as Region, type ResearchId } from '@quorum/simulation/catalog'
import { updateDashboard } from '../dashboard.ts'
import { updateGlossary } from '../glossary.ts'

/** Saves and applies the Model's settings. */
export const savePrefs = (model: Model): UpdateResult => ({
  model,
  commands: [
    WritePrefs({ prefs: model.prefs }),
    ApplySettings({
      muted: model.prefs.muted,
      motion: model.prefs.motion,
      locale: model.prefs.locale,
      agentAccess: model.prefs.agentAccess,
      analytics: model.prefs.analytics,
      text: model.prefs.text,
      theme: model.prefs.theme,
    }),
  ],
})

/** A Settings gesture: the Prefs Submodel changes, then the new settings are saved and applied. */
export const foldPrefs = (model: Model, message: PrefsMessage): UpdateResult =>
  Update.combine(model, [
    Update.foldChild({
      update: updatePrefs,
      read: (parent: Model) => Option.some(parent.prefs),
      write: (parent, prefs) => ({ ...parent, prefs }),
      toParentMessage: (child) => Message.PrefsChanged({ message: child }),
    })(message),
    savePrefs,
  ])

export const foldGlossary = Update.foldChild({
  update: updateGlossary,
  read: (model: Model) => Option.some(model.glossary),
  write: (model, glossary) => ({ ...model, glossary }),
  toParentMessage: (message) => Message.GlossaryChanged({ message }),
})

export const foldDashboard = Update.foldChild({
  update: updateDashboard,
  read: (model: Model) => Option.some(model.board.dashboard),
  write: (model, dashboard) => ({ ...model, board: { ...model.board, dashboard } }),
  toParentMessage: (message) => Message.DashboardChanged({ message }),
})

// Stored JSON that does not parse or no longer fits its Schema reads as nothing.
export const parsePrefs = Schema.decodeUnknownOption(Schema.fromJsonString(Prefs))

export const foldLanguagePicker = (route: Dispatch) =>
  Update.foldChild({
    update: languageListbox.update,
    read: (model: Model) => Option.some(model.languagePicker),
    write: (model, languagePicker) => ({ ...model, languagePicker }),
    toParentMessage: (message) => Message.LanguagePickerChanged({ message }),
    foldOutMessage:
      ({ value }) =>
      (model) =>
        route(
          model,
          Message.PrefsChanged({ message: PrefsMessage.LocaleChosen({ locale: value }) }),
        ),
  })

/** What each item in the phone toolbar's More menu does: the same as its desktop button. */
export const MORE_ACTIONS: Record<MoreItem, Message> = {
  exit: Message.PanelOpened({ panel: 'exit' }),
  playbooks: Message.PanelOpened({ panel: 'playbooks' }),
  dashboard: Message.PanelOpened({ panel: 'dashboard' }),
  help: Message.PanelOpened({ panel: 'help' }),
  glossary: Message.GlossaryOpened({ id: null }),
  undo: Message.UndoChosen(),
  redo: Message.RedoChosen(),
  tidy: Message.BoardTidied(),
  fit: Message.BoardFitted(),
  fullscreen: Message.FullscreenToggled(),
}

export const foldMoreMenu = (route: Dispatch) =>
  Update.foldChild({
    update: moreMenu.update,
    read: (model: Model) => Option.some(model.moreMenu),
    write: (model, moreMenu) => ({ ...model, moreMenu }),
    toParentMessage: (message) => Message.MoreMenuChanged({ message }),
    foldOutMessage:
      ({ value }) =>
      (model) =>
        route(model, MORE_ACTIONS[value]),
  })

type PanelsTag =
  | 'PanelOpened'
  | 'ChurnFixTaken'
  | 'PanelClosed'
  | 'PrefsLoaded'
  | 'PrefsChanged'
  | 'WindowBlurred'
  | 'WindowFocused'
  | 'InsightHelpToggled'
  | 'GlossaryOpened'
  | 'GlossaryChanged'
  | 'InboxChanged'
  | 'DashboardChanged'
  | 'LanguagePickerChanged'
  | 'MoreMenuChanged'
  | 'ToastRaised'
  | 'ToastCleared'
  | 'Synced'

export const panelsHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, PanelsTag> => ({
  PanelOpened: ({ panel }) => {
    const opened: Model = {
      ...model,
      panel,
      board: {
        ...model.board,
        team: initTeam(),
        tool: null,
        research: EMPTY_RESEARCH,
        dashboard: { ...model.board.dashboard, hover: null },
      },
    }
    const next =
      panel === 'inbox'
        ? {
            ...opened,
            board: {
              ...opened.board,
              inbox: reading({
                ...opened.board.inbox,
                folder: openingFolder(opened.board.inbox),
                label: null,
              }),
            },
          }
        : opened
    return {
      model: next,
      // The scroll area takes focus, so the keyboard reaches the last rows without a pointer.
      commands: panel === 'dashboard' && model.panel !== 'dashboard' ? [FocusDashboard({})] : [],
    }
  },

  ChurnFixTaken: ({ fix, target }) => {
    const game = model.board.game
    const board = { ...model, panel: 'none' as const }
    if (fix === 'research') {
      const opened = route(model, Message.PanelOpened({ panel: 'research' }))
      const focused = route(
        opened.model,
        Message.ResearchChanged({
          message: ResearchMessage.Focused({ id: target as ResearchId }),
        }),
      )
      return { ...focused, commands: [...(opened.commands ?? []), ...(focused.commands ?? [])] }
    }
    if (fix === 'node') {
      const node = game.nodes.find((entry) => entry.id === target)
      if (!node) return { model: board }
      return route(board, Message.RevealNode({ nodeId: node.id }))
    }
    const region = target as Region
    const shown = route(
      board,
      openRegions(game).includes(region)
        ? Message.RegionPicked({ region })
        : Message.RegionOpened({ region }),
    )
    // With Infrastructure as code, an empty region is built by mirroring one that works.
    const empty = !game.nodes.some((node) => node.region === region && node.type !== 'users')
    return has(game, 'infra-as-code') && empty && shown.model.board.region === region
      ? { ...shown, model: { ...shown.model, panel: 'mirror' } }
      : shown
  },
  // An exited Company has nothing left to play: closing its panel goes to the next one.

  PanelClosed: () => {
    if (model.board.exited) return leaveExited(model, 'found')
    const next = closePanel(model)
    return { model: next }
  },

  PrefsLoaded: ({ json }) =>
    Option.match(json === null ? Option.none() : parsePrefs(json), {
      onNone: () => ({ model }),
      onSome: (prefs) => ({
        model: {
          ...model,
          prefs,
        },
        commands: [
          ApplySettings({
            muted: prefs.muted,
            motion: prefs.motion,
            locale: prefs.locale,
            agentAccess: prefs.agentAccess,
            analytics: prefs.analytics,
            text: prefs.text,
            theme: prefs.theme,
          }),
        ],
      }),
    }),

  PrefsChanged: ({ message }) => foldPrefs(model, message),

  WindowBlurred: () => {
    // The pointer is not followed outside the window, so a hold ends with the focus.
    const held: Model = model.board.hold
      ? { ...model, board: { ...model.board, hold: null } }
      : model
    if (!held.prefs.blurPause || halted(held) || !onBoard(held.route)) return { model: held }
    const next: Model = {
      ...held,
      board: { ...held.board, clock: { ...held.board.clock, paused: true, away: true } },
    }
    return { model: next }
  },

  WindowFocused: () => {
    if (!model.board.clock.away) return { model }
    const next: Model = {
      ...model,
      board: { ...model.board, clock: { ...model.board.clock, paused: false, away: false } },
    }
    return { model: next }
  },

  InsightHelpToggled: () => ({
    model: { ...model, board: { ...model.board, insightHelp: !model.board.insightHelp } },
  }),

  GlossaryOpened: ({ id }) => {
    const founder = id ? discoverTerm(model.founder, id) : model.founder
    // Browsing inside the panel keeps the search and filter; opening it from outside resets them.
    const browsing = model.panel === 'glossary' && id !== null
    const next: Model = {
      ...model,
      panel: 'glossary',
      glossary: {
        focus: id,
        returnTo:
          model.panel === 'research' ? 'research' : browsing ? model.glossary.returnTo : 'none',
        query: browsing ? model.glossary.query : '',
        category: browsing ? model.glossary.category : null,
      },
      founder,
      board: { ...model.board, tool: null },
    }
    return {
      model: next,
      commands: founder === model.founder ? [] : [WriteFounder({ founder })],
    }
  },

  GlossaryChanged: ({ message }) => foldGlossary(model, message),

  InboxChanged: ({ message }) => foldInbox(model, message, route),

  DashboardChanged: ({ message }) => foldDashboard(model, message),

  LanguagePickerChanged: ({ message }) => foldLanguagePicker(route)(model, message),

  MoreMenuChanged: ({ message }) => foldMoreMenu(route)(model, message),

  ToastRaised: ({ message: text, tone }) => withToast(model, text, tone),

  ToastCleared: ({ id }) => ({
    model: model.toast?.id === id ? { ...model, toast: null } : model,
  }),

  Synced: () => ({ model }),
})
