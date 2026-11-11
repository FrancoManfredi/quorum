import type { Document, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { article, notFound } from './components/article.ts'
import { header } from './components/header.ts'
import { homeView } from './components/home.ts'
import { sidebar } from './components/sidebar.ts'
import { toc } from './components/toc.ts'
import type { Message, Model } from './main.ts'
import { pageAt } from './pages.ts'
import { WIKI_ORIGIN } from './site.ts'

/* The page frame: the header, the navigation rail, the page, and the facts rail. The reading
   measure lives in styles.css (--measure), and the article column holds it at xl. */

/** The frame the header, the section bar, and the page share. */
export const FRAME = 'mx-auto max-w-[1152px] px-4 sm:px-6'

const GRID =
  'grid gap-x-8 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_var(--measure)_minmax(0,1fr)]'

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const page = pageAt(model.path)
  const isHome = model.path === '/'
  const wide = page?.wide === true
  const railPage = isHome || wide ? null : page
  const hasRail = railPage !== null && (railPage.aside !== null || railPage.headings.length >= 2)
  return {
    title: page
      ? isHome
        ? 'Quorum Wiki'
        : `${page.title} · Quorum Wiki`
      : 'Not found · Quorum Wiki',
    lang: 'en',
    ...(page ? { canonical: `${WIKI_ORIGIN}${page.path}` } : {}),
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
                      ? h.div([h.Class('lg:max-w-[320px]')], [railPage.aside(model, h)])
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
