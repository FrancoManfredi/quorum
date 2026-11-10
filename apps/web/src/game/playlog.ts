import { Schema } from 'effect'

export const LOG_KEY = 'quorum.playlog.v1'
/** The log is a support aid. Keep the recent lines only: the storage quota belongs to saves. */
const LIMIT = 2_000

/** One line of the log. `data` is the event's payload as JSON. */
export const LogEntry = Schema.Struct({
  t: Schema.Finite,
  type: Schema.String,
  data: Schema.String,
})
export type LogEntry = typeof LogEntry.Type

type Stored = Readonly<{
  session: string
  seq: number
  wall: number
  t: number
  type: string
  data: unknown
}>

let cache: Array<Stored> | null = null
let seq = 0
const session = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

const isStored = (value: unknown): value is Stored => {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return (
    typeof entry['session'] === 'string' &&
    typeof entry['seq'] === 'number' &&
    Number.isFinite(entry['seq']) &&
    typeof entry['wall'] === 'number' &&
    typeof entry['t'] === 'number' &&
    typeof entry['type'] === 'string' &&
    'data' in entry
  )
}

const load = (): Array<Stored> => {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(LOG_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    cache = Array.isArray(parsed) ? parsed.filter(isStored).slice(-LIMIT) : []
  } catch {
    cache = []
  }
  seq = cache.reduce((highest, entry) => Math.max(highest, entry.seq), 0)
  return cache
}

const persist = (entries: Array<Stored>): void => {
  try {
    window.localStorage.setItem(LOG_KEY, JSON.stringify(entries))
  } catch {
    // Storage is full: keep the newest half and try once more.
    entries.splice(0, Math.floor(entries.length / 2))
    try {
      window.localStorage.setItem(LOG_KEY, JSON.stringify(entries))
    } catch {
      // The log lives in memory until export.
    }
  }
}

export const appendLog = (lines: ReadonlyArray<LogEntry>): void => {
  if (lines.length === 0) return
  const entries = load()
  const wall = Date.now()
  for (const line of lines) {
    seq += 1
    let data: unknown
    try {
      data = JSON.parse(line.data)
    } catch {
      data = line.data
    }
    entries.push({ session, seq, wall, t: Math.round(line.t * 100) / 100, type: line.type, data })
  }
  if (entries.length > LIMIT) entries.splice(0, entries.length - LIMIT)
  schedulePersist()
}

// Writing the whole log on every gesture blocks the page, so writes wait a moment and batch up.
const PERSIST_AFTER_MS = 2_000
let pending: ReturnType<typeof setTimeout> | null = null

const flush = (): void => {
  if (pending !== null) clearTimeout(pending)
  pending = null
  if (cache) persist(cache)
}

const schedulePersist = (): void => {
  if (pending === null) pending = setTimeout(flush, PERSIST_AFTER_MS)
}

export const logSize = (): number => load().length

/** Downloads the log as JSON Lines: one event per line. */
export const downloadLog = (): void => {
  const body = load()
    .map((entry) => JSON.stringify(entry))
    .join('\n')
  const blob = new Blob([body], { type: 'application/x-ndjson' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `quorum-log-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const clearLog = (): void => {
  cache = []
  seq = 0
  flush()
}

declare global {
  interface Window {
    /** The game log, for the browser console. */
    quorumLog?: () => ReadonlyArray<unknown>
  }
}

if (typeof window !== 'undefined') {
  window.quorumLog = () => load()
  // A closing or hidden tab writes what is still waiting.
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
