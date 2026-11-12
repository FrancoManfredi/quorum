import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { localeOf } from '../i18n/builder.ts'
import { langOf } from '../i18n/lang.ts'
import { COMPONENT_IDS, type ComponentId } from '@quorum/simulation/catalog'
import { heightOf } from '@quorum/ui/board/geometry'
import { Message } from '../main.ts'

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

export const nodeCard = (type: ComponentId, h: HtmlBuilder<Message>): Html => {
  const l = langOf(localeOf(h))
  return h.div(
    [
      h.Key(`card-${type}`),
      h.Role('img'),
      h.AriaLabel(l.t.islands.nodeCard(l.cat.COMPONENTS[type].name)),
      // The card is a picture here: the page scrolls, the board does not pan.
      h.Class('pointer-events-none relative w-full'),
      h.Style({ height: `${Math.round((heightOf(type) + 2 * PAD) * SCALE) + 2 * INSET}px` }),
      h.OnMount((cardMounted ??= defineCardMounted())({ type })),
    ],
    [],
  )
}
