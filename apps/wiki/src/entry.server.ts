import { Effect } from 'effect'
import { Server } from 'foldkit/experimental'
import { init, normalize } from './main.ts'
import { markdownPath } from './markdown.ts'
import type { Page } from './page.ts'
import { PAGES, pageAt } from './pages.ts'
import { indexJson } from './search.ts'
import { GAME_ORIGIN, OG_IMAGE_ALT, WIKI_ORIGIN } from './site.ts'
import { view } from './view.ts'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap'

const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const urlOf = (path: string): string => `${WIKI_ORIGIN}${path}`

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${WIKI_ORIGIN}/#website`,
  name: 'Quorum Wiki',
  url: `${WIKI_ORIGIN}/`,
  inLanguage: 'en',
  about: { '@type': 'VideoGame', name: 'Quorum', url: `${GAME_ORIGIN}/` },
}

/* Structured data (schema.org): the site on its home page, and on every other page the article
   and the trail the page shows above its title (src/components/article.ts). */
const structuredData = (page: Page): string => {
  const parent = page.parent ? pageAt(page.parent) : null
  const graph =
    page.path === '/'
      ? [WEBSITE]
      : [
          {
            '@type': 'TechArticle',
            headline: page.title,
            description: page.summary,
            url: urlOf(page.path),
            inLanguage: 'en',
            isPartOf: { '@id': WEBSITE['@id'] },
            about: WEBSITE.about,
          },
          ...(parent
            ? [
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [parent, page].map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.title,
                    item: urlOf(item.path),
                  })),
                },
              ]
            : []),
        ]
  // `<` cannot end the script early.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`
}

export const renderDocument: Server.DocumentRenderer = (application, assets) => {
  const page = pageAt(normalize(new URL(application.canonical ?? WIKI_ORIGIN).pathname))
  const description = escape(page?.summary ?? 'How Quorum works.')
  const title = escape(application.title)
  return Server.renderDocument(application, assets, {
    lang: 'en',
    head: [
      `<meta name="description" content="${description}">`,
      // A 404 is not a page to index.
      ...(page ? [] : ['<meta name="robots" content="noindex">']),
      '<meta name="theme-color" content="#f1f2f4">',
      `<meta property="og:type" content="${page?.path === '/' ? 'website' : 'article'}">`,
      '<meta property="og:site_name" content="Quorum Wiki">',
      '<meta property="og:locale" content="en_US">',
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:image" content="${WIKI_ORIGIN}/og.png">`,
      '<meta property="og:image:type" content="image/png">',
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      `<meta property="og:image:alt" content="${OG_IMAGE_ALT}">`,
      '<meta name="twitter:card" content="summary_large_image">',
      ...(page
        ? [
            `<link rel="alternate" type="text/markdown" href="${urlOf(markdownPath(page.path))}">`,
            structuredData(page),
          ]
        : []),
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
      `<link rel="apple-touch-icon" href="${GAME_ORIGIN}/apple-touch-icon.png">`,
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      `<link rel="stylesheet" href="${FONTS}">`,
    ].join(''),
  })
}

/** The files the build adds beside the pages (vite.config.ts): llms.txt and every page's Markdown. */
export { markdownFiles } from './markdown.ts'

/** The search index the build writes beside the pages (vite.config.ts). */
export const searchIndex = (): string => indexJson(PAGES)

export const prerenderPaths: ReadonlyArray<string> = PAGES.map((page) => page.path)

/** The sitemap the build writes (vite.config.ts). `lastmod` gives the date a source file last
    changed; a page without a source file, or a date, has no `<lastmod>`. */
export const sitemap = (lastmod: (source: string) => string | null): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PAGES.map((page) => {
      const date = page.source ? lastmod(page.source) : null
      return `<url><loc>${urlOf(page.path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`
    }),
    '</urlset>',
    '',
  ].join('\n')

export const renderPage = (request: Request): Promise<Server.EntryResult> => {
  const path = normalize(new URL(request.url).pathname)
  return Effect.runPromise(
    Server.renderToString({ routing: {}, init, view }, { url: request.url }).pipe(
      Effect.map((application) =>
        Server.Rendered(application, pageAt(path) ? {} : { status: 404 }),
      ),
    ),
  )
}
