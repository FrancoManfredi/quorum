import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Message } from '../main.ts'
import { TITLES, type PracticeId } from './practice.ts'

/* ==========================================================================
   A live Practice board in a page. The build prerenders an empty frame; in
   the browser practice-board.ts fills it with the game's own board.
   ========================================================================== */

const IDS = ['place', 'wire', 'rearrange'] as const

// Defined on first use: this module is imported while main.ts is still loading.
const definePracticeMounted = () =>
  Mount.define('PracticeMounted', {
    args: { id: Schema.Literals(IDS) },
    messages: [Message.Navigated],
    execute: ({ element, id }) =>
      Effect.gen(function* () {
        // Pixi loads only on pages that hold a board.
        const { mountPractice } = yield* Effect.promise(() => import('./practice-board.ts'))
        yield* Effect.acquireRelease(
          Effect.sync(() => mountPractice(id, element as HTMLElement)),
          (detach) => Effect.sync(detach),
        )
        return Message.Navigated()
      }),
  })

let practiceMounted: ReturnType<typeof definePracticeMounted> | null = null

export const practiceView = (id: PracticeId, h: HtmlBuilder<Message>): Html =>
  h.section(
    [
      h.Key(`practice-${id}`),
      h.AriaLabel(`Practice board: ${TITLES[id]}`),
      h.Class('not-prose my-6 min-h-[520px] rounded-lg border border-border'),
      h.OnMount((practiceMounted ??= definePracticeMounted())({ id })),
    ],
    [],
  )
