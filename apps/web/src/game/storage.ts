import type { SaveIndex } from './saves.ts'

/* ==========================================================================
   Every key Quorum writes to this browser, and the one place that reads and
   writes them. `docs/storage.md` is the contract these names follow.
   ========================================================================== */

/** The Company list: `current` and one file per Company. */
export const SAVE_INDEX_KEY = 'quorum.saves.v1'
/** One Company's Game per file, so an autosave writes one Company only. */
export const SAVE_PREFIX = 'quorum.save.v3.'
/** The last Company file this build could not read. */
export const BROKEN_SAVE_KEY = 'quorum.save.broken.v1'
export const PREFS_KEY = 'quorum.prefs.v1'
export const FOUNDER_KEY = 'quorum.founder.v1'
export const SANDBOX_KEY = 'quorum.sandbox.v1'
export const AGENT_ROOMS_KEY = 'quorum.agent.rooms'
export const ANALYTICS_KEY = 'quorum.analytics.v1'
export const LOG_KEY = 'quorum.playlog.v1'
/** The display name other Seats see. */
export const ROOM_NAME_KEY = 'quorum.room.name'

/** One Company's file, keyed by its id. */
export const saveKeyOf = (id: string): string => `${SAVE_PREFIX}${id}`

/** The browser's storage, or null where it is absent or blocked. */
const storage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** One key's text, or null when the key is absent or storage is blocked. */
export const readStored = (key: string): string | null => {
  const target = storage()
  if (target === null) return null
  try {
    return target.getItem(key)
  } catch {
    return null
  }
}

/** Writes one key. False when storage is full or blocked, so the caller can say so. */
export const writeStored = (key: string, value: string): boolean => {
  const target = storage()
  if (target === null) return false
  try {
    target.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const removeStored = (key: string): void => {
  const target = storage()
  if (target === null) return
  try {
    target.removeItem(key)
  } catch {
    // Blocked storage holds nothing this build can remove.
  }
}

/** Every key the browser holds, in the order storage lists them. */
export const storedKeys = (): ReadonlyArray<string> => {
  const target = storage()
  if (target === null) return []
  try {
    const keys: Array<string> = []
    for (let at = 0; at < target.length; at += 1) {
      const key = target.key(at)
      if (key !== null) keys.push(key)
    }
    return keys
  } catch {
    return []
  }
}

/**
 * Keys written by builds before the public save format. Their readers are gone, so the data is
 * unreachable; sweeping it keeps the browser's storage for the Companies the player can open.
 */
const LEGACY_KEYS = ['quorum.save.v1', 'quorum.save.v2', 'quorum.save.v2.broken'] as const

export const sweepLegacyStorage = (): void => {
  for (const key of LEGACY_KEYS) removeStored(key)
}

/** Removes Company files the list no longer names, so a failed index write cannot leak them. */
export const pruneCompanyFiles = (index: SaveIndex): void => {
  const keep = new Set(index.companies.map((file) => saveKeyOf(file.id)))
  for (const key of storedKeys())
    if (key.startsWith(SAVE_PREFIX) && !keep.has(key)) removeStored(key)
}
