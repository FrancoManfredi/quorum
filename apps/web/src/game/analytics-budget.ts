/* ==========================================================================
   The free-tier budget. Every event passes through `allow` in `before_send`.
   Funnel events bypass the session cap, so a conversion rate never loses its
   numerator, but they still count against the month.
   ========================================================================== */

import { ANALYTICS_KEY, readStored, writeStored } from './storage.ts'

export const SESSION_LIMIT = 80
export const MONTH_LIMIT = 600

/** Events that answer the activation and progression questions. */
const FUNNEL = new Set([
  'app:session_start',
  'app:session_end',
  'company:founded',
  'company:era_reached',
  'company:exited',
])

type Store = Readonly<{
  month: string
  events: number
  session: string
  sessionEvents: number
}>

let memory: Store | null = null

const isStore = (value: unknown): value is Store => {
  if (typeof value !== 'object' || value === null) return false
  const store = value as Record<string, unknown>
  return (
    typeof store['month'] === 'string' &&
    typeof store['events'] === 'number' &&
    Number.isFinite(store['events']) &&
    store['events'] >= 0 &&
    typeof store['session'] === 'string' &&
    typeof store['sessionEvents'] === 'number' &&
    Number.isFinite(store['sessionEvents']) &&
    store['sessionEvents'] >= 0
  )
}

const session = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const monthOf = (now: number): string => new Date(now).toISOString().slice(0, 7)

const read = (now: number): Store => {
  const month = monthOf(now)
  const fresh: Store = { month, events: 0, session, sessionEvents: 0 }
  const raw = readStored(ANALYTICS_KEY)
  if (raw === null) return memory ?? (memory = fresh)
  try {
    const stored: unknown = JSON.parse(raw)
    if (!isStore(stored) || stored.month !== month) return fresh
    return stored.session === session ? stored : { ...stored, session, sessionEvents: 0 }
  } catch {
    return memory ?? (memory = fresh)
  }
}

const write = (store: Store): void => {
  memory = store
  // A full or blocked storage still caps this session from memory.
  writeStored(ANALYTICS_KEY, JSON.stringify(store))
}

export const isFunnel = (event: string): boolean => FUNNEL.has(event)

/** True when the event fits the month and session budgets. */
export const allow = (event: string, now: number): boolean => {
  const store = read(now)
  if (store.events >= MONTH_LIMIT) return false
  if (!isFunnel(event) && store.sessionEvents >= SESSION_LIMIT) return false
  write({ ...store, events: store.events + 1, sessionEvents: store.sessionEvents + 1 })
  return true
}
