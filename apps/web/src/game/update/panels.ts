import { ApplySettings, FocusDashboard, WritePrefs } from '../commands.ts'
import { EMPTY_RESEARCH, ResearchMessage } from '../research.ts'
import { Message } from '../message.ts'
import { Model, Prefs, clockAway, halted, roomLive } from '../model.ts'
import { isExited } from '../company-machine.ts'
import { clockStep } from '../clock-machine.ts'
import { step as holdStep } from '../hold-machine.ts'
import { Option, Schema } from 'effect'
import { PrefsMessage, updatePrefs, volumeIn } from '../prefs.ts'
import { updateSurvey } from '../survey.ts'
import { Update } from 'foldkit'
import {
  closePanel,
  withToast,
  type Dispatch,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { foldInbox } from './mail.ts'
import { leaveExited } from './companies.ts'
import { has } from '@quorum/simulation/lookups'
import { initTeam } from '../team.ts'
import { languageListbox } from '../../i18n/listbox.ts'
import { frameworkPicker, runtimePicker } from '../stack-picker.ts'
import { moreMenu, type MoreItem } from '../more.ts'
import { onBoard } from '../route.ts'
import { openRegions } from '@quorum/simulation/regions'
import { openingFolder, reading } from '../inbox.ts'
import { type RegionId as Region, type ResearchId } from '@quorum/simulation/catalog'
import { updateDashboard } from '../dashboard.ts'
import * as VolumeSlider from '@quorum/ui/primitives/slider'

export const savePrefs = (model: Model): UpdateResult => ({
  model,
  commands: [
    WritePrefs({ prefs: model.prefs }),
    ApplySettings({
      muted: model.prefs.muted,
      volume: model.prefs.volume,
      motion: model.prefs.motion,
      locale: model.prefs.locale,
      agentAccess: model.prefs.agentAccess,
      analytics: model.prefs.analytics,
      text: model.prefs.text,
      theme: model.prefs.theme,
    }),
  ],
})

/** Without Easy mode the clock runs at 1×, and a pause only the player could end ends now. */
const plainClock = (model: Model): UpdateResult =>
  model.prefs.easyMode
    ? { model }
    : {
        model: {
          ...model,
          board: {
            ...model.board,
            clock: {
              ...model.board.clock,
              speed: 1,
              mode: clockAway(model)
                ? model.board.clock.mode
                : clockStep(model.board.clock.mode, { _tag: 'Resumed' }),
            },
          },
        },
      }

/** A Settings gesture: the Prefs Submodel changes, then the new settings are saved and applied. */
export const foldPrefs = (model: Model, message: PrefsMessage): UpdateResult =>
  Update.combine(model, [
    Update.foldChild({
      update: updatePrefs,
      read: (parent: Model) => Option.some(parent.prefs),
      write: (parent, prefs) => ({ ...parent, prefs }),
      toParentMessage: (child) => Message.PrefsChanged({ message: child }),
    })(message),
    message._tag === 'EasyModeToggled' ? plainClock : (model: Model) => ({ model }),
    savePrefs,
  ])

/** The Exit survey's two fields; the parent sends the answers. */
export const foldSurvey = Update.foldChild({
  update: updateSurvey,
  read: (model: Model) => Option.some(model.survey),
  write: (model, survey) => ({ ...model, survey }),
  toParentMessage: (message) => Message.SurveyChanged({ message }),
})

export const foldDashboard = Update.foldChild({
  update: updateDashboard,
  read: (model: Model) => Option.some(model.board.dashboard),
  write: (model, dashboard) => ({ ...model, board: { ...model.board, dashboard } }),
  toParentMessage: (message) => Message.DashboardChanged({ message }),
})

// Stored JSON that does not parse or no longer fits its Schema reads as nothing.
export const parsePrefs = (json: string) =>
  Option.map(Schema.decodeOption(Schema.fromJsonString(Prefs))(json), (prefs) => ({
    ...prefs,
    volume: volumeIn(prefs.volume),
  }))

/** The Settings panel's sound level: its value lives in `prefs.volume`. */
export const foldVolumeSlider = (route: Dispatch) =>
  Update.foldChild({
    update: VolumeSlider.update,
    read: (model: Model) => Option.some(model.volumeSlider),
    write: (model, volumeSlider) => ({ ...model, volumeSlider }),
    toParentMessage: (message) => Message.VolumeSliderChanged({ message }),
    foldOutMessage:
      ({ value }) =>
      (model) =>
        route(
          model,
          Message.PrefsChanged({ message: PrefsMessage.VolumeChanged({ volume: value }) }),
        ),
  })

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

/** The Node the Inspector shows, which a Stack picker changes. */
const selectedNode = (model: Model) =>
  model.board.game.nodes.find((entry) => entry.id === model.board.selected)

export const foldRuntimePicker = (route: Dispatch) =>
  Update.foldChild({
    update: runtimePicker.update,
    read: (model: Model) => Option.some(model.runtimePicker),
    write: (model, runtimePicker) => ({ ...model, runtimePicker }),
    toParentMessage: (message) => Message.RuntimePickerChanged({ message }),
    foldOutMessage: (outMessage) => (model) => {
      if (outMessage._tag !== 'Selected') return { model }
      const node = selectedNode(model)
      return node
        ? route(
            model,
            Message.OptionChosen({
              nodeId: node.id,
              option: { kind: 'runtime', id: outMessage.value },
            }),
          )
        : { model }
    },
  })

export const foldFrameworkPicker = (route: Dispatch) =>
  Update.foldChild({
    update: frameworkPicker.update,
    read: (model: Model) => Option.some(model.frameworkPicker),
    write: (model, frameworkPicker) => ({ ...model, frameworkPicker }),
    toParentMessage: (message) => Message.FrameworkPickerChanged({ message }),
    foldOutMessage: (outMessage) => (model) => {
      if (outMessage._tag !== 'Selected') return { model }
      const node = selectedNode(model)
      return node
        ? route(
            model,
            Message.OptionChosen({
              nodeId: node.id,
              option: { kind: 'framework', id: outMessage.value },
            }),
          )
        : { model }
    },
  })

/** What each item in the phone toolbar's More menu does: the same as its desktop button. */
export const MORE_ACTIONS: Record<MoreItem, Message> = {
  exit: Message.PanelOpened({ panel: 'exit' }),
  playbooks: Message.PanelOpened({ panel: 'playbooks' }),
  dashboard: Message.PanelOpened({ panel: 'dashboard' }),
  help: Message.PanelOpened({ panel: 'help' }),
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
  | 'ResearchShown'
  | 'ChurnFixTaken'
  | 'PanelClosed'
  | 'PrefsLoaded'
  | 'PrefsChanged'
  | 'SurveyChanged'
  | 'WindowBlurred'
  | 'WindowFocused'
  | 'InsightHelpToggled'
  | 'InboxChanged'
  | 'DashboardChanged'
  | 'LanguagePickerChanged'
  | 'VolumeSliderChanged'
  | 'RuntimePickerChanged'
  | 'FrameworkPickerChanged'
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
        flow: { _tag: 'Idle' },
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

  ResearchShown: ({ id }) => {
    const opened = route(model, Message.PanelOpened({ panel: 'research' }))
    const focused = route(
      opened.model,
      Message.ResearchChanged({ message: ResearchMessage.Focused({ id }) }),
    )
    return { ...focused, commands: [...(opened.commands ?? []), ...(focused.commands ?? [])] }
  },

  ChurnFixTaken: ({ fix, target }) => {
    const game = model.board.game
    const board = { ...model, panel: 'none' as const }
    if (fix === 'research') return route(model, Message.ResearchShown({ id: target as ResearchId }))
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
    if (isExited(model.companyPhase)) return leaveExited(model, 'found')
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
            volume: prefs.volume,
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

  SurveyChanged: ({ message }) => foldSurvey(model, message),

  WindowBlurred: () => {
    // The pointer is not followed outside the window, so a hold ends with the focus.
    const held: Model =
      model.board.hold._tag === 'Held'
        ? {
            ...model,
            board: {
              ...model.board,
              hold: holdStep(model.board.hold, { _tag: 'HoldLifted' }),
            },
          }
        : model
    // A live Room runs on its own clock: a hidden tab must not freeze it for the others.
    if (!held.prefs.blurPause || halted(held) || roomLive(held) || !onBoard(held.route))
      return { model: held }
    const next: Model = {
      ...held,
      board: {
        ...held.board,
        clock: {
          ...held.board.clock,
          mode: clockStep(held.board.clock.mode, { _tag: 'Blurred' }),
        },
      },
    }
    return { model: next }
  },

  WindowFocused: () => {
    if (!clockAway(model)) return { model }
    const next: Model = {
      ...model,
      board: {
        ...model.board,
        clock: {
          ...model.board.clock,
          mode: clockStep(model.board.clock.mode, { _tag: 'Focused' }),
        },
      },
    }
    return { model: next }
  },

  InsightHelpToggled: () => ({
    model: { ...model, board: { ...model.board, insightHelp: !model.board.insightHelp } },
  }),

  InboxChanged: ({ message }) => foldInbox(model, message, route),

  DashboardChanged: ({ message }) => foldDashboard(model, message),

  LanguagePickerChanged: ({ message }) => foldLanguagePicker(route)(model, message),

  VolumeSliderChanged: ({ message }) => foldVolumeSlider(route)(model, message),

  RuntimePickerChanged: ({ message }) => {
    const result = foldRuntimePicker(route)(model, message)
    // Focusing the picker turns it into a search box: start from every option.
    return message._tag === 'Opened' ||
      (message._tag === 'PressedToggleButton' && result.model.runtimePicker.isOpen)
      ? {
          ...result,
          model: {
            ...result.model,
            runtimePicker: { ...result.model.runtimePicker, inputValue: '' },
          },
        }
      : result
  },

  FrameworkPickerChanged: ({ message }) => {
    const result = foldFrameworkPicker(route)(model, message)
    return message._tag === 'Opened' ||
      (message._tag === 'PressedToggleButton' && result.model.frameworkPicker.isOpen)
      ? {
          ...result,
          model: {
            ...result.model,
            frameworkPicker: { ...result.model.frameworkPicker, inputValue: '' },
          },
        }
      : result
  },

  MoreMenuChanged: ({ message }) => foldMoreMenu(route)(model, message),

  ToastRaised: ({ message: text, tone }) => withToast(model, text, tone),

  ToastCleared: ({ id }) => ({
    model: model.toast?.id === id ? { ...model, toast: null } : model,
  }),

  Synced: () => ({ model }),
})
