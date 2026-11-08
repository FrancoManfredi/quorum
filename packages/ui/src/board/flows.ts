import type { Game, GameNode } from '@quorum/simulation/state'
import { placeMs } from '@quorum/simulation/regions'
import { ms, rate as rateText } from '../game/format.ts'

/** World pixels between the still arrows, and their most on one belt. */
const ARROW_SPACING = 70
const ARROW_LIMIT = 4

export type FlowMarks = Readonly<{
  /** How many items ride the belt. Zero when the board holds still. */
  packets: number
  /** Where the still arrows sit, as fractions along the belt. Empty when it moves. */
  arrows: ReadonlyArray<number>
  /** The rate the still arrows carry, such as "420/s". Null when the belt moves. */
  label: string | null
}>

/** How many items a moving belt carries: a busier belt carries more, up to nine. */
const packetCount = (rate: number, length: number): number =>
  Math.max(1, Math.min(9, Math.round(Math.log2(1 + rate) * 1.4), Math.floor(length / 20) || 1))

/** Where still arrows sit: evenly spaced, never at a port, and fewer on a short belt. */
const arrowOffsets = (length: number): ReadonlyArray<number> => {
  const count = Math.max(1, Math.min(ARROW_LIMIT, Math.floor(length / ARROW_SPACING)))
  return Array.from({ length: count }, (_, index) => (index + 1) / (count + 1))
}

/** The rate a belt carries, in the interface's figures. */
export const flowLabel = (rate: number): string => `${rateText(rate)}/s`

/**
 * What a belt between regions says about the distance (15 "The board"): the round
 * trip its calls pay, in the milliseconds the Simulation charges them. Null inside
 * one region, and for a global Node, which pays no place at all.
 */
export const placeLabel = (game: Game, from: GameNode, to: GameNode): string | null => {
  if (from.region === to.region) return null
  const cost = placeMs(game, from, to)
  return cost > 0 ? ms(cost) : null
}

/** A belt's marks: moving items, or else arrows under the rate they carry. */
export const flowMarks = (still: boolean, rate: number, length: number): FlowMarks =>
  still
    ? { packets: 0, arrows: arrowOffsets(length), label: flowLabel(rate) }
    : { packets: packetCount(rate, length), arrows: [], label: null }
