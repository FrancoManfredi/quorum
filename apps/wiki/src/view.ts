import type { Document, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { article, notFound } from './components/article.ts'
import { header } from './components/header.ts'
import { homeView } from './components/home.ts'
import { sidebar } from './components/sidebar.ts'
import { toc } from './components/toc.ts'
import { builderFor } from './i18n/builder.ts'
import { langOf } from './i18n/lang.ts'
import { LOCALE_TAGS, withLocale } from './i18n/locale.ts'
import type { Message, Model } from './main.ts'
import { pageIn } from './pages.ts'
import { WIKI_ORIGIN } from './site.ts'

/* The page frame: the header, the navigation rail, the page, and the facts rail. Each rail takes
   one step of Tailwind's width scale, and the page fills what the frame has left. */

/** The frame the header, the section bar, and the page share. */
export const FRAME = 'mx-auto max-w-7xl px-4 sm:px-6'

const GRID =
  'grid gap-x-8 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_16rem]'

export const view = (model: Model, plain: HtmlBuilder<Message>): Document => {
  // Every link a Spanish page draws points into `/es` (src/i18n/builder.ts).
  const h = builderFor(model.locale, plain)
  const t = langOf(model.locale).t.site
  const page = pageIn(model.locale, model.path)
  const isHome = model.path === '/'
  const wide = page?.wide === true
  const railPage = isHome || wide ? null : page
  const hasRail = railPage !== null && (railPage.aside !== null || railPage.headings.length >= 2)
  return {
    title: page ? (isHome ? t.name : t.title(page.title)) : t.notFoundTitle,
    lang: LOCALE_TAGS[model.locale].lang,
    ...(page ? { canonical: `${WIKI_ORIGIN}${withLocale(model.locale, page.path)}` } : {}),
    body: h.div(
      [h.Class('min-h-dvh')],
      [
        header(model, h),
        h.div(
          [h.Class(cn(FRAME, GRID))],
          [
            (!isHome && !wide) || model.menu ? sidebar(model, h) : h.empty,
            page
              ? isHome
                ? homeView(page, model, h)
                : article(page, model, h)
              : notFound(model, h),
            // Facts and the contents list share one rail. A page with neither gets no cell.
            hasRail && railPage
              ? h.div(
                  [
                    h.Class(
                      cn(
                        'flex flex-col gap-10',
                        railPage.aside
                          ? 'lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1 xl:pt-8'
                          : 'hidden xl:col-start-3 xl:row-start-1 xl:flex xl:pt-8',
                      ),
                    ),
                  ],
                  [
                    railPage.aside
                      ? h.div([h.Class('lg:max-w-xs')], [railPage.aside(model, h)])
                      : h.empty,
                    toc(railPage, h),
                  ],
                )
              : h.empty,
          ],
        ),
      ],
    ),
  }
}
