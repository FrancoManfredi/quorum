import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ArrowRight, Check } from 'lucide'
import { FIGURE } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { langOf, type Lang } from '../i18n/lang.ts'
import type { Message, Model } from '../main.ts'
import type { Page } from '../page.ts'
import { PATHS, placeOf, resumeOf, stepsOf, type Path } from '../paths.ts'
import { quadrantColor } from './quadrant.ts'

/* The guided paths in the page: where a reader is in one, and the step after it. */

type H = HtmlBuilder<Message>

/** One segment per step: read steps fill, the current one takes its kind's colour. */
const segments = (
  l: Lang,
  steps: ReadonlyArray<Page>,
  current: string | null,
  model: Model,
  h: H,
): Html =>
  h.ol(
    [h.Class('flex gap-1')],
    steps.map((step, index) =>
      h.li(
        [h.Key(step.path), h.Class('flex-1')],
        [
          h.a(
            [
              h.Href(step.path),
              h.Title(l.t.pathNav.stepTitle(index + 1, step.title)),
              h.AriaLabel(l.t.pathNav.stepLabel(index + 1, step.title)),
              ...(step.path === current ? [h.AriaCurrent('step')] : []),
              h.Class(
                cn(
                  'block h-1.5 rounded-full transition-colors',
                  step.path === current
                    ? ''
                    : model.progress.visited.includes(step.path)
                      ? 'bg-foreground/45 hover:bg-foreground/60'
                      : 'bg-foreground/10 hover:bg-foreground/25',
                ),
              ),
              ...(step.path === current
                ? [h.Style({ background: quadrantColor(step.section) })]
                : []),
            ],
            [],
          ),
        ],
      ),
    ),
  )

/** Under a page's title: the path it belongs to and the reader's place in it. */
export const pathBar = (page: Page, model: Model, h: H): Html => {
  const l = langOf(page.locale)
  const place = placeOf(page.locale, page.path)
  if (!place) return h.empty
  const steps = stepsOf(page.locale, place.path)
  const title = l.t.paths[place.path.id].title
  return h.nav(
    [h.AriaLabel(l.t.pathNav.guidedPath(title)), h.Class('mt-6')],
    [
      h.div(
        [h.Class('mb-2 flex items-baseline justify-between gap-3')],
        [
          h.span([h.Class('text-[12px] text-muted-foreground')], [l.t.pathNav.path(title)]),
          h.span(
            [h.Class(cn(FIGURE, 'text-[12px] text-muted-foreground'))],
            [l.t.pathNav.place(place.index + 1, steps.length)],
          ),
        ],
      ),
      segments(l, steps, page.path, model, h),
    ],
  )
}

/** The next page, as docs sites end a page: a bordered link on the right. */
const nextCard = (label: string, target: Page, h: H): Html =>
  h.div(
    [h.Class('mt-14 flex justify-end')],
    [
      h.a(
        [
          h.Href(target.path),
          h.Class(
            'group flex w-full max-w-sm flex-col items-end gap-1 rounded-lg border border-border px-4 py-3 text-right transition-colors hover:border-foreground/30',
          ),
        ],
        [
          h.span([h.Class('text-[12px] text-muted-foreground')], [label]),
          h.span(
            [h.Class('flex items-center gap-1.5 text-[15px] font-medium')],
            [
              target.title,
              icon(h, ArrowRight, 'size-4 transition-transform group-hover:translate-x-0.5'),
            ],
          ),
        ],
      ),
    ],
  )

/** At a page's end: the next step of its path, or the next path when this one is done. */
export const pathNext = (page: Page, h: H): Html => {
  const l = langOf(page.locale)
  const place = placeOf(page.locale, page.path)
  if (!place) return h.empty
  const steps = stepsOf(page.locale, place.path)
  const next = steps[place.index + 1]
  if (next) return nextCard(l.t.pathNav.next, next, h)
  const following = PATHS[PATHS.indexOf(place.path) + 1]
  const first = following ? stepsOf(page.locale, following)[0] : undefined
  return following && first
    ? nextCard(l.t.pathNav.nextPath(l.t.paths[following.id].title), first, h)
    : h.empty
}

/** A path on the home page: its progress, the step to take next, and where it goes. */
export const pathCard = (path: Path, model: Model, h: H): Html => {
  const l = langOf(model.locale)
  const copy = l.t.paths[path.id]
  const steps = stepsOf(model.locale, path)
  const read = steps.filter((step) => model.progress.visited.includes(step.path)).length
  const resume = resumeOf(model.locale, path, model.progress.visited)
  const target = resume ?? steps[0]
  const label = read === 0 ? l.t.pathNav.start : resume ? l.t.pathNav.continue : l.t.pathNav.again
  return h.article(
    [h.Key(path.id), h.Class('flex flex-col gap-4 bg-background p-5')],
    [
      h.div(
        [h.Class('flex items-baseline justify-between gap-3')],
        [
          h.h3([h.Class('text-[16px] font-semibold tracking-tight')], [copy.title]),
          read === steps.length && steps.length > 0
            ? h.span(
                [h.Class('grid size-5 shrink-0 place-items-center rounded-full bg-ok text-white')],
                [icon(h, Check, 'size-3')],
              )
            : h.span(
                [h.Class(cn(FIGURE, 'shrink-0 text-[12px] text-muted-foreground'))],
                [`${read}/${steps.length}`],
              ),
        ],
      ),
      h.p([h.Class('text-[14px] leading-snug text-pretty text-muted-foreground')], [copy.summary]),
      segments(l, steps, null, model, h),
      target
        ? h.a(
            [
              h.Href(target.path),
              h.Class(
                'group mt-auto flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-[14px] transition-colors hover:border-foreground/30 hover:bg-well',
              ),
            ],
            [
              h.span(
                [h.Class('min-w-0 truncate')],
                [
                  h.span([h.Class('font-medium')], [label]),
                  ...(label === l.t.pathNav.again
                    ? []
                    : [h.span([h.Class('text-muted-foreground')], [` · ${target.title}`])]),
                ],
              ),
              icon(
                h,
                ArrowRight,
                'size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
              ),
            ],
          )
        : h.empty,
    ],
  )
}
