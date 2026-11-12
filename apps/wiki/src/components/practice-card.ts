import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { localeOf } from '../i18n/builder.ts'
import { langOf } from '../i18n/lang.ts'
import { Locale } from '../i18n/locale.ts'
import { Message } from '../main.ts'
import type { PracticeId } from './practice.ts'

const IDS = ['place', 'wire', 'rearrange'] as const

// Defined on first use: this module is imported while main.ts is still loading.
const definePracticeMounted = () =>
  Mount.define('PracticeMounted', {
    args: { id: Schema.Literals(IDS), locale: Locale },
    messages: [Message.Navigated],
    execute: ({ element, id, locale }) =>
      Effect.gen(function* () {
        // Pixi loads only on pages that hold a board.
        const { mountPractice } = yield* Effect.promise(() => import('./practice-board.ts'))
        yield* Effect.acquireRelease(
          Effect.sync(() => mountPractice(id, locale, element as HTMLElement)),
          (detach) => Effect.sync(detach),
        )
        return Message.Navigated()
      }),
  })

let practiceMounted: ReturnType<typeof definePracticeMounted> | null = null

export const practiceView = (id: PracticeId, h: HtmlBuilder<Message>): Html => {
  const locale = localeOf(h)
  return h.section(
    [
      h.Key(`practice-${id}`),
      h.AriaLabel(
        langOf(locale).t.islands.practice.boardLabel(langOf(locale).t.islands.practice.titles[id]),
      ),
      h.Class('not-prose my-6 min-h-[520px] rounded-lg border border-border'),
      h.OnMount((practiceMounted ??= definePracticeMounted())({ id, locale })),
    ],
    [],
  )
}
