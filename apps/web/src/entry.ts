import { Layer } from 'effect'
import { Runtime } from 'foldkit'
import { setSeatActivity } from '@quorum/ui/board/board'
import { init, Message, Model, subscriptions, update, view } from './app/main.ts'
import { startMotion } from './game/motion.ts'
import { loadLocale, preloadLocales } from './i18n/messages.ts'
import { supportedLocales, type Locale } from './i18n/index.ts'
import { PREFS_KEY, readStored, sweepLegacyStorage } from './game/storage.ts'
import { activityChange } from './game/presence.ts'
import { publish } from './game/agent-tools.ts'
import { syncAgent } from './game/agent-room.ts'
import { observe } from './platform/analytics.ts'
import { ApiRpc } from './platform/rpc.ts'
import {
  reportCrash,
  reportSlow,
  startSentry,
  timedUpdate,
  tracerLayer,
} from './platform/sentry.ts'
import './styles.css'

// First, so errors while the app boots are caught too.
startSentry()

const application = Runtime.makeApplication({
  Model,
  init,
  update: (model, message) => {
    const result = timedUpdate(message, () => update(model, message))
    // A panel keeps this Seat's pointer on the Board, saying what it is doing.
    const activity = activityChange(model, result.model)
    if (activity !== undefined) setSeatActivity('board', activity)
    publish(result.model)
    syncAgent(result.model)
    observe(result.model)
    return result
  },
  view,
  subscriptions,
  routing: {
    onUrlRequest: (request) => Message.ClickedLink({ request }),
    onUrlChange: (url) => Message.ChangedUrl({ url }),
  },
  resources: Layer.mergeAll(ApiRpc.layer, tracerLayer),
  container: document.getElementById('root'),
  // The clock and its board sync fire 8 times a second and would push every gesture out of history.
  crash: { report: reportCrash },
  // Over a phase's budget, Foldkit tells Sentry which Message was slow. Under it, nothing is sent.
  slow: { show: 'Always', onSlow: reportSlow },
  devTools: { Message, excludeFromHistory: ['Ticked', 'Synced', 'DashboardChanged'] },
})

// Surfaces opened from the keyboard skip their entrance (see styles.css): shortcuts must feel instant.
const root = document.documentElement
addEventListener('keydown', () => (root.dataset['input'] = 'keyboard'), true)
addEventListener('pointerdown', () => (root.dataset['input'] = 'pointer'), true)

// Foldkit replaces the container it renders into, so motion watches the body.
startMotion(document.body)

// Ask the browser to keep the Company files when storage runs low. A refusal is fine.
if (navigator.storage?.persist) void navigator.storage.persist().catch(() => undefined)

/** The saved interface language, so a player who picked one does not see English first. */
const savedLocale = (): Locale => {
  const raw = readStored(PREFS_KEY)
  if (raw === null) return 'en'
  try {
    const value = (JSON.parse(raw) as { locale?: unknown }).locale
    return supportedLocales.some((entry) => entry.value === value) ? (value as Locale) : 'en'
  } catch {
    return 'en'
  }
}

const locale = savedLocale()
if (locale !== 'en') await loadLocale(locale).catch(() => undefined)

// The pre-public single save has no reader. Remove it, so the browser's quota holds live Companies.
sweepLegacyStorage()

Runtime.run(application)

// The other catalogs are large. Fetch them once the title is idle, so a language change is instant.
if (typeof window.requestIdleCallback === 'function')
  window.requestIdleCallback(() => preloadLocales(), { timeout: 3000 })
else window.setTimeout(() => preloadLocales(), 2000)
