import { Effect } from 'effect'
import { Server } from 'foldkit/experimental'
import { langOf } from './i18n/lang.ts'
import { LOCALES, LOCALE_TAGS, localeOfPath, withLocale, type Locale } from './i18n/locale.ts'
import { init, normalize } from './main.ts'
import { markdownPath } from './markdown.ts'
import type { Page } from './page.ts'
import { PAGES, pageAt, pageIn, pagesFor } from './pages.ts'
import { indexJson } from './search.ts'
import { GAME_ORIGIN, WIKI_ORIGIN } from './site.ts'
import { view } from './view.ts'
// The Spanish bundle registers itself here, since the server renders every language.
import './locales/es.ts'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap'

const escape = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The absolute URL of a page's logical path in a language. */
const urlOf = (locale: Locale, path: string): string => `${WIKI_ORIGIN}${withLocale(locale, path)}`

const website = (locale: Locale) => ({
  '@type': 'WebSite',
  '@id': `${WIKI_ORIGIN}${withLocale(locale, '/')}#website`,
  name: langOf(locale).t.site.name,
  url: `${urlOf(locale, '/')}`,
  inLanguage: LOCALE_TAGS[locale].lang,
  about: { '@type': 'VideoGame', name: 'Quorum', url: `${GAME_ORIGIN}/` },
})

/* Structured data (schema.org): the site on its home page, and on every other page the article
   and the trail the page shows above its title (src/components/article.ts). */
const structuredData = (page: Page): string => {
  const { locale } = page
  const site = website(locale)
  const parent = page.parent ? pageIn(locale, page.parent) : null
  const graph =
    page.path === '/'
      ? [site]
      : [
          {
            '@type': 'TechArticle',
            headline: page.title,
            description: page.summary,
            url: urlOf(locale, page.path),
            inLanguage: LOCALE_TAGS[locale].lang,
            isPartOf: { '@id': site['@id'] },
            about: site.about,
          },
          ...(parent
            ? [
                {
                  '@type': 'BreadcrumbList',
                  itemListElement: [parent, page].map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.title,
                    item: urlOf(locale, item.path),
                  })),
                },
              ]
            : []),
        ]
  // `<` cannot end the script early.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
  return `<script type="application/ld+json">${json.replace(/</g, '\\u003c')}</script>`
}

/** Every language a page is served in, for search engines: `hreflang` for each, and the English
    page as the default for a reader whose language the wiki does not have. */
const alternates = (path: string): ReadonlyArray<string> => [
  ...LOCALES.map(
    (locale) =>
      `<link rel="alternate" hreflang="${LOCALE_TAGS[locale].lang}" href="${urlOf(locale, path)}">`,
  ),
  `<link rel="alternate" hreflang="x-default" href="${urlOf('en', path)}">`,
]

export const renderDocument: Server.DocumentRenderer = (application, assets) => {
  // A 404 has no canonical URL: it is no page, and its language is the one its view rendered.
  const pathname = application.canonical ? normalize(new URL(application.canonical).pathname) : null
  const page = pathname === null ? null : pageAt(pathname)
  const locale =
    pathname === null
      ? (LOCALES.find((candidate) => LOCALE_TAGS[candidate].lang === application.lang) ?? 'en')
      : localeOfPath(pathname)
  const t = langOf(locale).t.site
  const description = escape(page?.summary ?? t.description)
  const title = escape(application.title)
  return Server.renderDocument(application, assets, {
    lang: LOCALE_TAGS[locale].lang,
    head: [
      `<meta name="description" content="${description}">`,
      // A 404 is not a page to index.
      ...(page ? [] : ['<meta name="robots" content="noindex">']),
      '<meta name="theme-color" content="#f1f2f4">',
      `<meta property="og:type" content="${page?.path === '/' ? 'website' : 'article'}">`,
      `<meta property="og:site_name" content="${escape(t.name)}">`,
      `<meta property="og:locale" content="${LOCALE_TAGS[locale].og}">`,
      ...LOCALES.filter((other) => other !== locale).map(
        (other) => `<meta property="og:locale:alternate" content="${LOCALE_TAGS[other].og}">`,
      ),
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:image" content="${WIKI_ORIGIN}/og.png">`,
      '<meta property="og:image:type" content="image/png">',
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      `<meta property="og:image:alt" content="${escape(t.ogImageAlt)}">`,
      '<meta name="twitter:card" content="summary_large_image">',
      ...(page
        ? [
            ...alternates(page.path),
            // The Markdown twin of a page is English: llms.txt and the `.md` files are not translated.
            ...(locale === 'en'
              ? [
                  `<link rel="alternate" type="text/markdown" href="${WIKI_ORIGIN}${markdownPath(page.path)}">`,
                ]
              : []),
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

/** The search index of each language, by the file the build writes it to (vite.config.ts). */
export const searchIndexes = (): Readonly<Record<string, string>> =>
  Object.fromEntries(
    LOCALES.map((locale) => [
      withLocale(locale, '/search-index.json').slice(1),
      indexJson(pagesFor(locale), locale),
    ]),
  )

/** Every page in every language: English at its path, Spanish under `/es`. */
export const prerenderPaths: ReadonlyArray<string> = LOCALES.flatMap((locale) =>
  PAGES.map((page) => withLocale(locale, page.path)),
)

/** The sitemap the build writes (vite.config.ts), each page in every language with its
    alternates. `lastmod` gives the date a source file last changed; a page without a source
    file, or a date, has no `<lastmod>`. */
export const sitemap = (lastmod: (source: string) => string | null): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...LOCALES.flatMap((locale) =>
      pagesFor(locale).map((page) => {
        const date = page.source ? lastmod(page.source) : null
        return `<url><loc>${urlOf(locale, page.path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}${LOCALES.map(
          (other) =>
            `<xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[other].lang}" href="${urlOf(other, page.path)}"/>`,
        ).join('')}</url>`
      }),
    ),
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
