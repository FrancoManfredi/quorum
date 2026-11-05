import { Schema } from 'effect'
import { Game } from './state.ts'

const encode = Schema.encodeSync(Game)

/**
 * FNV-1a, 32 bits, over the encoded Game as JSON, as 8 hex digits. ECMAScript
 * fully specifies `JSON.stringify` and number-to-string, and `Math.imul` is
 * exact, so every engine gets the same hash for the same Game.
 */
export const hashGame = (game: Game): string => {
  // Ordinals are display metadata: they never change a Step or a replay hash.
  // Strip the key after encoding, so the JSON key order stays the one the
  // golden hashes were taken with.
  const encoded = encode(game) as unknown as Record<string, unknown> & {
    nodes: Array<Record<string, unknown>>
  }
  const stable = {
    ...encoded,
    nodes: encoded.nodes.map((node) => {
      const { ordinal: _, ...rest } = node
      return rest
    }),
  }
  const text = JSON.stringify(stable)
  let hash = 0x81_1c_9d_c5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01_00_01_93) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
