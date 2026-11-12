import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ArrowUpRight, ChevronRight, Coffee, Pencil } from 'lucide'
import { FIGURE } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { langOf } from '../i18n/lang.ts'
import { withLocale } from '../i18n/locale.ts'
import type { Message, Model } from '../main.ts'
import type { Page } from '../page.ts'
import { pageIn } from '../pages.ts'
import { eraPath } from '../reference/shared.ts'
import { KOFI, editUrl } from '../site.ts'
import { hides } from '../submodels/spoilers.ts'
import { pathBar, pathNext } from './path-nav.ts'
import { quadrantBadge } from './quadrant.ts'

/* One page: its header, its body (and facts beside it), and its footer. */

type H = HtmlBuilder<Message>

const breadcrumbs = (page: Page, h: H): Html => {
  const t = langOf(page.locale).t
  const parent = page.parent ? pageIn(page.locale, page.parent) : null
  return h.div(
    [h.Class('flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground')],
    [
      quadrantBadge(page.section, 'size-4', h),
      h.span([], [t.quadrants[page.section].label]),
      ...(parent
        ? [
            icon(h, ChevronRight, 'size-3.5 opacity-60'),
            h.a([h.Href(parent.path), h.Class('hover:text-foreground')], [parent.title]),
          ]
        : []),
    ],
  )
}

/** Content from an Era the reader has not reached folds behind a toggle. */
const spoiler = (page: Page, model: Model, body: Html, h: H): Html => {
  if (!hides(model.spoilers, page.era)) return body
  const l = langOf(page.locale)
  return h.details(
    [h.Class('fold')],
    [
      h.summary(
        [
          h.Class(
            'cursor-pointer list-none rounded-md border border-dashed border-border px-4 py-3 text-[14px]',
          ),
        ],
        [
          h.span(
            [h.Class('font-medium')],
            [l.t.article.spoilerAbout(l.cat.ERAS[page.era ?? 0]?.name ?? '')],
          ),
          h.span([h.Class('text-muted-foreground')], [l.t.article.spoilerHidden]),
        ],
      ),
      h.div([h.Class('mt-6')], [body]),
    ],
  )
}

const footer = (page: Page, h: H): Html => {
  const t = langOf(page.locale).t.article
  const related = page.related.flatMap((path) => {
    const target = pageIn(page.locale, path)
    return target ? [target] : []
  })
  return h.footer(
    [h.Class('mt-16')],
    [
      related.length
        ? h.div(
            [h.Class('mb-10')],
            [
              h.div([h.Class('mb-3 text-[13px] font-semibold')], [t.seeAlso]),
              h.ul(
                [h.Class('divide-y divide-border border-y border-border')],
                related.map((target) =>
                  h.li(
                    [h.Key(target.path)],
                    [
                      h.a(
                        [h.Href(target.path), h.Class('group flex items-baseline gap-4 py-2.5')],
                        [
                          h.span(
                            [h.Class('shrink-0 text-[14px] font-medium group-hover:underline')],
                            [target.title],
                          ),
                          h.span(
                            [h.Class('min-w-0 truncate text-[13px] text-muted-foreground')],
                            [target.summary],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          )
        : h.empty,
      h.div(
        [
          h.Class(
            'flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5 text-[12px] text-muted-foreground',
          ),
        ],
        [
          page.source
            ? h.a(
                [
                  h.Href(editUrl(page.source)),
                  h.Class('inline-flex items-center gap-1.5 hover:text-foreground'),
                ],
                [icon(h, Pencil, 'size-3.5'), t.editOnGitHub],
              )
            : h.empty,
          page.gdd
            ? h.a(
                [h.Href(page.gdd), h.Class('inline-flex items-center gap-1 hover:text-foreground')],
                [t.designNotes, icon(h, ArrowUpRight, 'size-3.5')],
              )
            : h.empty,
          h.a(
            [h.Href(KOFI), h.Class('inline-flex items-center gap-1.5 hover:text-foreground')],
            [icon(h, Coffee, 'size-3.5'), t.support],
          ),
          h.span(
            [h.Class('ml-auto')],
            [
              t.disclaimerLead,
              h.a(
                [
                  h.Href('/about/disclaimer'),
                  h.Class('underline underline-offset-2 hover:text-foreground'),
                ],
                [t.disclaimerLink],
              ),
              t.disclaimerMid,
              h.a(
                [
                  h.Href('/about/changelog'),
                  h.Class('underline underline-offset-2 hover:text-foreground'),
                ],
                [t.changelogLink],
              ),
              '.',
            ],
          ),
        ],
      ),
    ],
  )
}

/** A page of another language that waits for its translation says so, and its text keeps its own language. */
const notice = (page: Page, h: H): Html =>
  page.fallback
    ? h.p(
        [
          h.Role('note'),
          h.Class(
            'mb-6 rounded-md border border-dashed border-border px-4 py-2.5 text-[13px] text-muted-foreground',
          ),
        ],
        [langOf(page.locale).t.article.untranslated],
      )
    : h.empty

export const article = (page: Page, model: Model, h: H): Html => {
  const l = langOf(page.locale)
  return h.article(
    [
      // A wide page spans the frame; every other page fills its column.
      h.Class(cn('min-w-0 py-8', page.wide && 'col-span-full')),
      h.DataAttribute('kind', page.section),
    ],
    [
      h.header(
        [h.Class('border-b border-border pb-8')],
        [
          h.div(
            [h.Class('flex items-center justify-between gap-4')],
            [
              breadcrumbs(page, h),
              page.era !== null
                ? h.a(
                    [
                      h.Href(eraPath(page.era)),
                      h.Class(
                        cn(FIGURE, 'text-[12px] text-muted-foreground hover:text-foreground'),
                      ),
                    ],
                    [l.t.article.era(page.era, l.cat.ERAS[page.era]?.name ?? '')],
                  )
                : h.empty,
            ],
          ),
          h.h1(
            [
              h.Class(
                'mt-4 text-[32px] leading-tight font-semibold tracking-[-0.025em] text-balance',
              ),
            ],
            [page.title],
          ),
          h.p(
            [h.Class('mt-2 text-[16px] leading-relaxed text-pretty text-muted-foreground')],
            [page.summary],
          ),
          pathBar(page, model, h),
        ],
      ),
      h.div(
        [h.Class('pt-8')],
        [
          notice(page, h),
          // The text of a page that waits for its translation is English.
          page.fallback
            ? h.div([h.Attribute('lang', 'en')], [spoiler(page, model, page.body(model, h), h)])
            : spoiler(page, model, page.body(model, h), h),
          pathNext(page, h),
          footer(page, h),
        ],
      ),
    ],
  )
}

export const notFound = (model: Model, h: H): Html => {
  const t = langOf(model.locale).t.article.notFound
  return h.article(
    [h.Class('py-16')],
    [
      h.div([h.Class(cn(FIGURE, 'text-[13px] text-muted-foreground'))], ['404']),
      h.h1([h.Class('mt-2 text-[32px] font-semibold tracking-tight')], [t.heading]),
      h.p(
        [h.Class('mt-2 text-[15px] text-muted-foreground')],
        [t.body(withLocale(model.locale, model.path))],
      ),
      h.a(
        [
          h.Href('/'),
          h.Class('mt-6 inline-block text-[14px] font-medium underline underline-offset-4'),
        ],
        [t.home],
      ),
    ],
  )
}
