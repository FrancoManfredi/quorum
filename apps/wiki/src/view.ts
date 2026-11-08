import type { Document, HtmlBuilder } from 'foldkit/html'
import { article, notFound } from './components/article.ts'
import { header } from './components/header.ts'
import { homeView } from './components/home.ts'
import { sidebar } from './components/sidebar.ts'
import { toc } from './components/toc.ts'
import type { Message, Model } from './main.ts'
import { pageAt } from './pages.ts'
import { WIKI_ORIGIN } from './site.ts'

export const view = (model: Model, h: HtmlBuilder<Message>): Document => {
  const page = pageAt(model.path)
  const isHome = model.path === '/'
  const wide = page?.wide === true
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
          [
            h.Class(
              wide
                ? 'mx-auto max-w-[1800px] px-4 sm:px-6'
                : 'mx-auto grid max-w-[1400px] px-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]',
            ),
          ],
          [
            // Home is a landing page: it spans the frame, and the section bar leads on.
            (!isHome && !wide) || model.menu ? sidebar(model, h) : h.empty,
            page
              ? isHome
                ? homeView(page, model, h)
                : article(page, model, h)
              : notFound(model, h),
            page && !isHome && !wide ? toc(page, h) : h.empty,
          ],
        ),
      ],
    ),
  }
}
