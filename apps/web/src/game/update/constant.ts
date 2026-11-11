import { DILATION_SPEEDS, STEP_SECONDS } from '@quorum/simulation/catalog'
import { Game } from '@quorum/simulation/state'
import { perkLevel } from '@quorum/simulation/founding'

/** The nominal tick: the UI reads the Ledger four times a second. A tick owes the time it took. */
export const TICK_MS = 250

/**
 * The most Steps one tick may run: ten sim seconds, and never fewer than two ticks at the chosen
 * speed, so a fast clock still catches up. The cap stops a Design too heavy to run from spiralling.
 */
const MAX_TICK_STEPS = 100

export const mostSteps = (speed: number): number =>
  Math.max(MAX_TICK_STEPS, Math.ceil((2 * TICK_MS * speed) / (1_000 * STEP_SECONDS)))

export const SAVE_EVERY = 5

export const SAMPLE_EVERY = 10

export const SPEEDS = [0.5, 1, 3, 10] as const

/** The Company speeds: Time dilation adds 20× and 40× (plan M7.3). */
export const speedsOf = (game: Game): ReadonlyArray<number> => [
  ...SPEEDS,
  ...(DILATION_SPEEDS[perkLevel(game, 'time-dilation')] ?? []),
]
