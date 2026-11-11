import { Locale } from '../i18n/index.ts'
import { copyIn } from '../i18n/messages.ts'
import { nameIn } from '../i18n/refusal.ts'
import { activityIn } from './presence.ts'
import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Command } from 'foldkit'
import { load, pushUrl, replaceUrl } from 'foldkit/navigation'
import { fitBoard, focusBoard, repaintBoards, setBoard } from '@quorum/ui/board/board'
import { solveFlow } from '@quorum/simulation/solve'
import { compute } from '@quorum/ui/board/compute'
import { nodeOrdinals } from '@quorum/simulation/labels'
import { regionView } from '@quorum/simulation/regions'
import { ComponentId, Game, Region } from '@quorum/simulation/state'
import { Message } from './message.ts'
import { Founder } from '@quorum/simulation/founder'
import {
  Motion,
  Prefs,
  Reveal,
  SandboxStore,
  TextSize,
  Theme,
  Tone,
  TradeoffOption,
} from './model.ts'
import { refreshed, SaveIndex } from './saves.ts'
import {
  BROKEN_SAVE_KEY,
  FOUNDER_KEY,
  PREFS_KEY,
  SANDBOX_KEY,
  SAVE_INDEX_KEY,
  pruneCompanyFiles,
  readStored,
  removeStored,
  saveKeyOf,
  writeStored,
} from './storage.ts'
import { History } from './history.ts'
import { SavedInbox } from './inbox.ts'
import { saveJson } from './save-file.ts'
import { play, setMuted, setVolume, SOUND_NAMES } from './sound.ts'
import { pruneAgentRooms, setAgentAccess } from './agent-room.ts'
import { appendLog, clearLog, downloadLog, LogEntry } from './playlog.ts'
import { forward, setAnalyticsEnabled } from '../platform/analytics.ts'
import { SurveySubmission } from '@quorum/rpc'
import { ClientMessage } from '@quorum/simulation/room'
import { Sample } from '@quorum/simulation/state'
import { ApiRpc } from '@/platform/rpc.ts'
import { annotateSpan, reportSurveyFailure, setSentryConsent, traced } from '../platform/sentry.ts'
import { send as sendRoom } from '../platform/room-socket.ts'

/** A Playbook following the pointer on the board. */
const StampArg = Schema.NullOr(
  Schema.Array(
    Schema.Struct({
      type: ComponentId,
      dx: Schema.Finite,
      dy: Schema.Finite,
      ghost: Schema.Boolean,
    }),
  ),
)

export const SyncBoard = Command.define('SyncBoard', {
  args: {
    game: Game,
    locale: Locale,
    bottleneck: Schema.NullOr(Schema.String),
    selected: Schema.NullOr(Schema.String),
    selection: Schema.Array(Schema.String),
    placing: Schema.NullOr(ComponentId),
    stamp: StampArg,
    history: Schema.Record(Schema.String, Schema.Array(Schema.Finite)),
    region: Region,
    paused: Schema.Boolean,
    speed: Schema.Finite,
    suspended: Schema.Boolean,
    /** The Node whose footer button glows: a disclosure cue. */
    cue: Schema.NullOr(Schema.String),
    /** Fit the view to the new Design once it is drawn. */
    fit: Schema.Boolean,
    /** Bring this Node into view after the state is drawn, as a reveal does. */
    focus: Schema.NullOr(Schema.String),
  },
  messages: [Message.Synced],
  execute: ({
    game,
    locale,
    bottleneck: _bottleneck,
    selected,
    selection,
    placing,
    stamp,
    history,
    region,
    paused,
    speed,
    suspended,
    cue,
    fit,
    focus,
  }) =>
    Effect.sync(() => {
      setBoard('board', {
        locale,
        translate: (text) => nameIn(copyIn(locale), text),
        translateActivity: (activity) => activityIn(locale, activity),
        game: regionView(game, region),
        ordinals: nodeOrdinals(game),
        ledger: { ...solveFlow(game), bottleneck: null },
        selected,
        selection,
        placing,
        stamp,
        history,
        region,
        paused,
        speed,
        suspended,
        cue,
      })
      if (fit) fitBoard('board')
      if (focus) focusBoard('board', focus)
    }).pipe(Effect.as(Message.Synced())),
})

/** Runs a Tradeoff option's ghost runs on the compute worker. A superseded or refused run sends nothing back. */
export const ComputePreview = Command.define('ComputePreview', {
  args: { game: Game, nodeId: Schema.String, option: TradeoffOption },
  messages: [Message.PreviewComputed, Message.Synced],
  execute: ({ game, nodeId, option }) =>
    Effect.promise(() =>
      traced('compute.preview', {}, () => compute('preview', { game, nodeId, option })),
    ).pipe(
      Effect.map((preview) =>
        preview
          ? Message.PreviewComputed({
              nodeId,
              option,
              preview: { ...preview, burn: [...preview.burn] },
            })
          : Message.Synced(),
      ),
    ),
})

/** Searches the Bottleneck on the compute worker. A superseded search sends nothing back. */
export const ComputeBottleneck = Command.define('ComputeBottleneck', {
  args: { game: Game, at: Schema.Finite },
  messages: [Message.BottleneckFound, Message.Synced],
  execute: ({ game, at }) =>
    Effect.promise(() =>
      traced('compute.bottleneck', {}, () => compute('bottleneck', { game })),
    ).pipe(
      Effect.map((bottleneck) =>
        bottleneck === undefined ? Message.Synced() : Message.BottleneckFound({ bottleneck, at }),
      ),
    ),
})

/** Runs a Node's what-if rows on the compute worker. A superseded run sends nothing back. */
export const ComputeWhatIfs = Command.define('ComputeWhatIfs', {
  args: { game: Game, nodeId: Schema.String, at: Schema.Finite },
  messages: [Message.WhatIfsFound, Message.Synced],
  execute: ({ game, nodeId, at }) =>
    Effect.promise(() =>
      traced('compute.whatIf', {}, () => compute('whatIf', { game, nodeId })),
    ).pipe(
      Effect.map((rows) =>
        rows === undefined
          ? Message.Synced()
          : Message.WhatIfsFound({ nodeId, at, rows: rows.map((row) => ({ ...row })) }),
      ),
    ),
})

/** Adds a history entry for the route a Message opened. */
export const PushUrl = Command.define('PushUrl', {
  args: { url: Schema.String },
  messages: [Message.Navigated],
  execute: ({ url }) => pushUrl(url).pipe(Effect.as(Message.Navigated())),
})

/** Corrects the URL in place when it names a screen that cannot open. */
export const ReplaceUrl = Command.define('ReplaceUrl', {
  args: { url: Schema.String },
  messages: [Message.Navigated],
  execute: ({ url }) => replaceUrl(url).pipe(Effect.as(Message.Navigated())),
})

export const LoadUrl = Command.define('LoadUrl', {
  args: { href: Schema.String },
  messages: [Message.Navigated],
  execute: ({ href }) => load(href).pipe(Effect.as(Message.Navigated())),
})

export const FitBoard = Command.define('FitBoard', {
  args: {},
  messages: [Message.Synced],
  execute: () => Effect.sync(() => fitBoard('board')).pipe(Effect.as(Message.Synced())),
})

/** Reads the Company index, and the single save of the build before Company files. */
/** Takes the open Company online: the Room steps it from here. */
export const PublishRoom = Command.define('PublishRoom', {
  args: {
    name: Schema.String,
    game: Game,
    samples: Schema.Array(Sample),
    wall: Schema.Finite,
  },
  messages: [Message.RoomPublished, Message.RoomPublishFailed],
  execute: ({ name, game, samples, wall }) =>
    Effect.gen(function* () {
      const rpc = yield* ApiRpc
      return yield* rpc.roomPublish({ name, game, samples, wall })
    }).pipe(
      Effect.match({
        onSuccess: ({ code, token }) => Message.RoomPublished({ code, token }),
        onFailure: (error) => Message.RoomPublishFailed({ message: error.message }),
      }),
    ),
})

/** Asks whether the Room a link named is still open, so a dead link says so. */
export const CheckRoom = Command.define('CheckRoom', {
  args: { code: Schema.String },
  messages: [Message.RoomChecked],
  execute: ({ code }) =>
    Effect.gen(function* () {
      const rpc = yield* ApiRpc
      return yield* rpc.roomInfo({ code })
    }).pipe(
      Effect.match({
        onSuccess: (info) => Message.RoomChecked({ code, exists: info.exists }),
        // A Room the network cannot reach is left to the socket to retry.
        onFailure: () => Message.RoomChecked({ code, exists: true }),
      }),
    ),
})

/** One frame out to the Room. A closed socket drops it; the next snapshot repairs the Board. */
export const SendRoom = Command.define('SendRoom', {
  args: { message: ClientMessage },
  messages: [Message.RoomSent],
  execute: ({ message }) =>
    Effect.sync(() => sendRoom(message)).pipe(Effect.as(Message.RoomSent())),
})

export const LoadSaves = Command.define('LoadSaves', {
  args: {},
  messages: [Message.SavesLoaded],
  execute: () =>
    Effect.sync(() => Message.SavesLoaded({ index: readStored(SAVE_INDEX_KEY), now: Date.now() })),
})

/** Removes Company files the list does not name, after a failed index write or a crashed save. */
export const PruneSaves = Command.define('PruneSaves', {
  args: { index: SaveIndex },
  messages: [Message.Synced],
  execute: ({ index }) =>
    Effect.sync(() => {
      pruneCompanyFiles(index)
      pruneAgentRooms(new Set(index.companies.map((file) => file.id)))
    }).pipe(Effect.as(Message.Synced())),
})

/** Reads one Company's Game, to continue it or to open it from the Companies page. */
export const LoadCompany = Command.define('LoadCompany', {
  args: { id: Schema.String, open: Schema.Boolean },
  messages: [Message.CompanyLoaded],
  execute: ({ id, open }) =>
    Effect.sync(() => Message.CompanyLoaded({ id, open, json: readStored(saveKeyOf(id)) })),
})

export const WriteCompany = Command.define('WriteCompany', {
  args: {
    id: Schema.String,
    index: SaveIndex,
    game: Game,
    revealed: Schema.Array(Reveal),
    pending: Schema.Array(Reveal),
    dashboard: History,
    /** The Inbox the Company keeps (18 "Open questions"): its Mail and its mutes. */
    inbox: SavedInbox,
  },
  messages: [Message.Saved, Message.SaveFailed],
  execute: ({ id, index, game, revealed, pending, dashboard, inbox }) =>
    Effect.sync(() => {
      const file = index.companies.find((entry) => entry.id === id)
      if (!file) return Message.SaveFailed()
      const stamped = refreshed(file, game, Date.now())
      const json = JSON.stringify(saveJson({ game, revealed, pending, dashboard, inbox }))
      const wrote = traced('save.write', {}, () => {
        annotateSpan({ 'save.bytes': json.length })
        return writeStored(saveKeyOf(id), json)
      })
      // A full or blocked storage loses the save, not the game. The player hears about it.
      return wrote &&
        writeStored(
          SAVE_INDEX_KEY,
          JSON.stringify({
            ...index,
            companies: index.companies.map((entry) => (entry.id === id ? stamped : entry)),
          }),
        )
        ? Message.Saved()
        : Message.SaveFailed()
    }),
})

/** Removes one Company's file and writes the index without it. */
export const DeleteCompany = Command.define('DeleteCompany', {
  args: { id: Schema.String, index: SaveIndex },
  messages: [Message.CompanyDeleted],
  execute: ({ id, index }) =>
    Effect.sync(() => {
      removeStored(saveKeyOf(id))
      writeStored(SAVE_INDEX_KEY, JSON.stringify(index))
      return Message.CompanyDeleted({ id })
    }),
})

/** Sets a save this version cannot read aside, so the next Company does not overwrite it. */
export const KeepBrokenSave = Command.define('KeepBrokenSave', {
  args: { json: Schema.String, reason: Schema.String },
  messages: [Message.Synced],
  execute: ({ json, reason }) =>
    Effect.sync(() => {
      console.error('The save could not be read:', reason)
      writeStored(BROKEN_SAVE_KEY, json)
      return Message.Synced()
    }),
})

/** Drops the kept copy once an import has put a save of this build in the Company. */
export const ClearBrokenSave = Command.define('ClearBrokenSave', {
  args: {},
  messages: [Message.Synced],
  execute: () =>
    Effect.sync(() => {
      removeStored(BROKEN_SAVE_KEY)
      return Message.Synced()
    }),
})

export const LoadSandboxStore = Command.define('LoadSandboxStore', {
  args: {},
  messages: [Message.SandboxStoreLoaded],
  execute: () => Effect.sync(() => Message.SandboxStoreLoaded({ json: readStored(SANDBOX_KEY) })),
})

export const WriteSandboxStore = Command.define('WriteSandboxStore', {
  args: { store: SandboxStore },
  messages: [Message.Synced],
  execute: ({ store }) =>
    Effect.sync(() => {
      // A full or blocked storage loses Sandbox progress, not the game.
      writeStored(SANDBOX_KEY, JSON.stringify(store))
      return Message.Synced()
    }),
})

export const LoadPrefs = Command.define('LoadPrefs', {
  args: {},
  messages: [Message.PrefsLoaded],
  execute: () => Effect.sync(() => Message.PrefsLoaded({ json: readStored(PREFS_KEY) })),
})

export const WritePrefs = Command.define('WritePrefs', {
  args: { prefs: Prefs },
  messages: [Message.Synced],
  execute: ({ prefs }) =>
    Effect.sync(() => {
      // Blocked storage only means the cards stay full size.
      writeStored(PREFS_KEY, JSON.stringify(prefs))
      return Message.Synced()
    }),
})

/** What Settings apply to the page: mute, volume, motion, language, agent access, text size, and theme. */
export type Settings = Readonly<{
  muted: boolean
  volume: number
  motion: Motion
  locale: Locale
  agentAccess: boolean
  text: TextSize
  theme: Theme
  analytics: boolean
}>

/** Applies the settings to a root element. Pure DOM, so the Settings test reads it back. */
export const applySettings = (root: HTMLElement, settings: Settings): void => {
  setMuted(settings.muted)
  setVolume(settings.volume)
  setAgentAccess(settings.agentAccess)
  setAnalyticsEnabled(settings.analytics)
  setSentryConsent(settings.analytics)
  root.lang = settings.locale
  if (settings.motion === 'reduce') root.dataset['motion'] = 'reduce'
  else delete root.dataset['motion']
  // 150% text is a scale on the type, not on the boxes: styles.css reads `data-text`.
  if (settings.text === 'large') root.dataset['text'] = '150'
  else delete root.dataset['text']
  // theme.css restyles everything under `.dark`.
  root.classList.toggle('dark', settings.theme === 'dark')
}

/** Applies the settings: mute and volume for every sound, reduced motion as `data-motion`, text as `data-text`, and the theme as `.dark`. */
export const ApplySettings = Command.define('ApplySettings', {
  args: {
    muted: Schema.Boolean,
    volume: Schema.Finite,
    motion: Motion,
    locale: Locale,
    agentAccess: Schema.Boolean,
    analytics: Schema.Boolean,
    text: TextSize,
    theme: Theme,
  },
  messages: [Message.Synced],
  execute: (settings) =>
    Effect.sync(() => {
      const root = document.documentElement
      const wasDark = root.classList.contains('dark')
      applySettings(root, settings)
      // The board resolves its colours from the theme once, so a new theme repaints it.
      if (wasDark !== (settings.theme === 'dark')) repaintBoards()
      return Message.Synced()
    }),
})

/** Moves keyboard focus into the Inspector, onto its first control. */
export const FocusInspector = Command.define('FocusInspector', {
  args: {},
  messages: [Message.Synced],
  execute: () =>
    Effect.sync(() => {
      document
        .querySelector<HTMLElement>(
          '[data-inspector] :is(button, [href], input, select, [tabindex]):not([disabled])',
        )
        ?.focus()
      return Message.Synced()
    }),
})

/** Moves keyboard focus onto the Dashboard's scroll area, so Tab, arrows, and Page Down scroll it,
 *  and scrolls one of its panels into view when the caller names one. */
export const FocusDashboard = Command.define('FocusDashboard', {
  args: { focus: Schema.optionalKey(Schema.String) },
  messages: [Message.Synced],
  execute: ({ focus }) =>
    Effect.promise(async () => {
      // The panel renders in the same update, so wait for its frame before focusing it.
      await new Promise((resolve) => requestAnimationFrame(resolve))
      document.querySelector<HTMLElement>('[data-scroll="dashboard"]')?.focus()
      if (focus !== undefined)
        document.querySelector<HTMLElement>(`[data-panel="${focus}"]`)?.scrollIntoView({
          block: 'start',
        })
      return Message.Synced()
    }),
})

export const ToggleFullscreen = Command.define('ToggleFullscreen', {
  args: {},
  messages: [Message.Synced],
  execute: () =>
    Effect.promise(async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen()
        else await document.documentElement.requestFullscreen()
      } catch {
        // The browser refused; the game still fills the window.
      }
      return Message.Synced()
    }),
})

/**
 * How long a toast stays, by what it says. A refusal names a Research and its price, so it stays
 * longer than a confirmation. Nothing here carries an action: an action would wait for the player.
 */
export const TOAST_MS: Record<Tone, number> = {
  plain: 2600,
  ok: 2600,
  warn: 5200,
  danger: 7000,
  primary: 3400,
}

export const ClearToast = Command.define('ClearToast', {
  args: { id: Schema.Finite, after: Schema.Finite },
  messages: [Message.ToastCleared],
  execute: ({ id, after }) =>
    Effect.sleep(`${Math.round(after)} millis`).pipe(Effect.as(Message.ToastCleared({ id }))),
})

/** Waits out the clock-in, then shows the title. */
export const RevealTitle = Command.define('RevealTitle', {
  args: {},
  messages: [Message.TitleRevealed],
  execute: () => Effect.sleep('1100 millis').pipe(Effect.as(Message.TitleRevealed())),
})

/** The title monitor's connect sequence plays, then the board shows. */
export const ConnectBoard = Command.define('ConnectBoard', {
  args: {},
  messages: [Message.Connected],
  execute: () => Effect.sleep('1200 millis').pipe(Effect.as(Message.Connected())),
})

export const AppendLog = Command.define('AppendLog', {
  args: { entries: Schema.Array(LogEntry) },
  messages: [Message.Synced],
  execute: ({ entries }) =>
    Effect.sync(() => {
      appendLog(entries)
      forward(entries)
    }).pipe(Effect.as(Message.Synced())),
})

export const ExportLog = Command.define('ExportLog', {
  args: {},
  messages: [Message.Synced],
  execute: () => Effect.sync(() => downloadLog()).pipe(Effect.as(Message.Synced())),
})

export const ClearLog = Command.define('ClearLog', {
  args: {},
  messages: [Message.Synced],
  execute: () => Effect.sync(() => clearLog()).pipe(Effect.as(Message.Synced())),
})

export const PlaySound = Command.define('PlaySound', {
  args: { sound: Schema.Literals(SOUND_NAMES), pitch: Schema.Finite, spatial: Schema.Boolean },
  messages: [Message.Synced],
  execute: ({ sound, pitch, spatial }) =>
    Effect.sync(() => play(sound, pitch, spatial)).pipe(Effect.as(Message.Synced())),
})

export const LoadFounder = Command.define('LoadFounder', {
  args: {},
  messages: [Message.FounderLoaded],
  execute: () =>
    Effect.sync(() => {
      // A device id for Challenge histograms, used only if the Founder has none yet.
      // Not `crypto.randomUUID`: it exists only in secure contexts, and a page opened over HTTP is not one.
      const deviceId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('')
      const fresh = { deviceId, today: new Date().toISOString().slice(0, 10) }
      return Message.FounderLoaded({ json: readStored(FOUNDER_KEY), ...fresh })
    }),
})

export const WriteFounder = Command.define('WriteFounder', {
  args: { founder: Founder },
  messages: [Message.Synced],
  execute: ({ founder }) =>
    Effect.sync(() => {
      // A full or blocked storage loses the record, not the Company.
      writeStored(FOUNDER_KEY, JSON.stringify(founder))
      return Message.Synced()
    }),
})

/** Copies text to the clipboard, and says whether it worked. */
export const CopyText = Command.define('CopyText', {
  args: { text: Schema.String, done: Schema.String, blocked: Schema.String },
  messages: [Message.ToastRaised],
  execute: ({ text, done, blocked }) =>
    Effect.promise(async () => {
      try {
        await navigator.clipboard.writeText(text)
        return Message.ToastRaised({ message: done, tone: 'ok' })
      } catch {
        return Message.ToastRaised({ message: blocked, tone: 'warn' })
      }
    }),
})

export const AskSaveImport = Command.define('AskSaveImport', {
  args: {},
  messages: [Message.SaveImported],
  execute: () =>
    Effect.sync(() => Message.SaveImported({ text: window.prompt('Paste a save (QSV1:…)') })),
})

/** Downloads the save as a file the player can keep or move to another browser. */
export const DownloadSave = Command.define('DownloadSave', {
  args: { text: Schema.String, name: Schema.String },
  messages: [Message.Synced],
  execute: ({ text, name }) =>
    Effect.sync(() => {
      const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = name
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      return Message.Synced()
    }),
})

/** The text of the save file the player picks, or null when the picker closes with nothing. */
const pickSaveText = (): Promise<string | null> =>
  new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.hidden = true
    input.accept = '.txt,.json,text/plain,application/json'
    const done = (text: string | null): void => {
      input.remove()
      resolve(text)
    }
    input.addEventListener('cancel', () => done(null))
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) return done(null)
      void file.text().then(done, () => done(null))
    })
    document.body.append(input)
    input.click()
  })

/**
 * Opens the browser's file picker and hands back the save file it reads. `as` says what the file
 * becomes: the save of the open Company, or a Company of its own on the list.
 */
export const PickSaveFile = Command.define('PickSaveFile', {
  args: { as: Schema.Literals(['save', 'company']) },
  messages: [Message.SaveImported, Message.CompanyImported],
  execute: ({ as }) =>
    Effect.promise(async () => {
      const text = await pickSaveText()
      return as === 'company' ? Message.CompanyImported({ text }) : Message.SaveImported({ text })
    }),
})

export const AskPlaybook = Command.define('AskPlaybook', {
  args: {},
  messages: [Message.PlaybookImported],
  execute: () =>
    Effect.sync(() =>
      Message.PlaybookImported({ text: window.prompt('Paste a Playbook (QPB1:…)') }),
    ),
})

/** Sends the Exit survey. A mutation, not a Query: the answers never come back. */
export const SubmitSurvey = Command.define('SubmitSurvey', {
  args: { submission: SurveySubmission },
  messages: [Message.SurveySent, Message.SurveyFailed],
  execute: ({ submission }) =>
    Effect.gen(function* () {
      const rpc = yield* ApiRpc
      return yield* rpc.surveySubmit(submission)
    }).pipe(
      // A failure is swallowed into a Message, so it reaches Sentry here or nowhere.
      Effect.tapError((error) => Effect.sync(() => reportSurveyFailure(error, submission.exit))),
      Effect.match({
        onSuccess: () => Message.SurveySent(),
        onFailure: (error) =>
          Message.SurveyFailed({
            message: error.message,
            // Anything but a declared ApiError is a transport failure, which has no useful message.
            offline: error._tag !== 'ApiError',
          }),
      }),
    ),
})
