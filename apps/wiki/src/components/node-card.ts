import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { COMPONENTS, COMPONENT_IDS, type ComponentId } from '@quorum/simulation/catalog'
import { heightOf } from '@quorum/ui/board/geometry'
import { Message } from '../main.ts'

/* ==========================================================================
   A Component's Node card in a page. The build prerenders an empty canvas
   of the card's size; in the browser the game's own board draws the card
   into it (node-board.ts), so it looks exactly as it does in the game.
   ========================================================================== */

/** What node-board.ts asks the board for: the zoom it fits to at most, its fit margin, and its top and bottom insets. */
const SCALE = 1.1
const PAD = 8
const INSET = 16

// Defined on first use: this module is imported while main.ts is still loading.
const defineCardMounted = () =>
  Mount.define('CardMounted', {
    args: { type: Schema.Literals(COMPONENT_IDS) },
    messages: [Message.Navigated],
    execute: ({ element, type }) =>
      Effect.gen(function* () {
        // Pixi loads only on pages that show a card.
        const { drawNodeCard } = yield* Effect.promise(() => import('./node-board.ts'))
        yield* Effect.acquireRelease(
          Effect.sync(() => drawNodeCard(`card-${type}`, type, element as HTMLElement)),
          (detach) => Effect.sync(detach),
        )
        return Message.Navigated()
      }),
  })

let cardMounted: ReturnType<typeof defineCardMounted> | null = null

export const nodeCard = (type: ComponentId, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Key(`card-${type}`),
      h.Role('img'),
      h.AriaLabel(`${COMPONENTS[type].name} Node card`),
      // The card is a picture here: the page scrolls, the board does not pan.
      h.Class('pointer-events-none relative w-full'),
      h.Style({ height: `${Math.round((heightOf(type) + 2 * PAD) * SCALE) + 2 * INSET}px` }),
      h.OnMount((cardMounted ??= defineCardMounted())({ type })),
    ],
    [],
  )
