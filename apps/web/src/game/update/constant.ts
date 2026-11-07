import { DILATION_SPEEDS } from '@quorum/simulation/catalog'
import { Game } from '@quorum/simulation/state'
import { perkLevel } from '@quorum/simulation/founding'

/** The UI reads the Ledger four times a second; the Simulation steps every 100 ms of sim time. */
export const TICK_MS = 250

/**
 * How often a held buy or upgrade control buys again (15 "Bulk actions"). It is
 * the UI tick: the only cadence the game owns, and the rate the board already
 * re-reads the Game at, so a hold buys once per tick and never catches up.
 */
export const REPEAT_MS = TICK_MS

/** Steps per tick at 1×: 250 ms over 100 ms Steps. 2.5 is exact in binary, so the carry never drifts. */
export const STEPS_PER_TICK = 2.5

export const SAVE_EVERY = 5

export const SAMPLE_EVERY = 10

export const SPEEDS = [0.5, 1, 3, 10] as const

/** The Company speeds: Time dilation adds 20× and 40× (plan M7.3). */
export const speedsOf = (game: Game): ReadonlyArray<number> => [
  ...SPEEDS,
  ...(DILATION_SPEEDS[perkLevel(game, 'time-dilation')] ?? []),
]

/* ---------- init ---------- */
