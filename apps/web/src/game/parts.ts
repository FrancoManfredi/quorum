import type { IconNode } from 'lucide'
import { COMPONENTS, type BuildGroup, type ComponentId } from '@quorum/simulation/catalog'
import { isUnlocked, priceOf } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { money } from '@quorum/ui/game/format'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { localized, type Messages } from '../i18n/messages.ts'

/* ==========================================================================
   A part as a list row shows it. The dock lists parts and the command palette
   lists the same parts, so both read their words, price, and lock from here.
   ========================================================================== */

export type Part = Readonly<{
  type: ComponentId
  name: string
  blurb: string
  group: BuildGroup
  icon: IconNode
  /** The price, already written; null in a Sandbox, where a part costs nothing. */
  price: string | null
  /** The price is more than the Company holds, so it reads as a refusal. */
  short: boolean
  /** The Research that unlocks it, or null when it can be placed now. */
  locked: string | null
}>

/** The words and figures of one part, in the player's language. */
export const partOf = (t: Messages, game: Game, type: ComponentId): Part => {
  const def = localized(COMPONENTS[type], t.catalog.components[type])
  const price = priceOf(game, type)
  return {
    type,
    name: def.name,
    blurb: def.blurb,
    group: def.group,
    icon: COMPONENT_ICONS[type],
    price: game.sandbox ? null : money(price),
    short: !game.sandbox && game.cash < price,
    locked: isUnlocked(game, type) ? null : t.catalog.research[def.unlock ?? 'stripe'].name,
  }
}
