import type { SaveIndex } from './saves.ts'

/** One Company's Game per file, so an autosave writes one Company only. */
export const SAVE_PREFIX = 'quorum.save.v3.'

/**
 * Keys written by builds before the public save format. Their readers are gone, so the data is
 * unreachable; sweeping it keeps the browser's storage for the Companies the player can open.
 */
const LEGACY_KEYS = ['quorum.save.v1', 'quorum.save.v2', 'quorum.save.v2.broken'] as const

export const sweepLegacyStorage = (): void => {
  try {
    for (const key of LEGACY_KEYS) window.localStorage.removeItem(key)
  } catch {
    // Blocked storage holds no legacy keys this build can reach either.
  }
}

/** Removes Company files the list no longer names, so a failed index write cannot leak them. */
export const pruneCompanyFiles = (index: SaveIndex): void => {
  const keep = new Set(index.companies.map((file) => `${SAVE_PREFIX}${file.id}`))
  try {
    const stale: Array<string> = []
    for (let at = 0; at < window.localStorage.length; at += 1) {
      const key = window.localStorage.key(at)
      if (key !== null && key.startsWith(SAVE_PREFIX) && !keep.has(key)) stale.push(key)
    }
    for (const key of stale) window.localStorage.removeItem(key)
  } catch {
    // Blocked storage: nothing to sweep.
  }
}
