import { authoredPages } from './content.ts'
import type { Section } from './frontmatter.ts'
import { isLoaded, langOf } from './i18n/lang.ts'
import { DEFAULT_LOCALE, localeOfPath, stripLocale, type Locale } from './i18n/locale.ts'
import { measurementsPage } from './measurements/page.ts'
import type { Page } from './page.ts'
import { referencePages } from './reference/index.ts'

type Built = Readonly<{ pages: ReadonlyArray<Page>; byPath: ReadonlyMap<string, Page> }>

const built = new Map<Locale, Built>()

const buildFor = (locale: Locale): Built => {
  // A language whose bundle has not loaded reads English, and is not remembered as built.
  if (locale !== DEFAULT_LOCALE && !isLoaded(locale)) return buildFor(DEFAULT_LOCALE)
  const known = built.get(locale)
  if (known) return known
  const l = langOf(locale)
  const pages = [...authoredPages(locale), measurementsPage(l), ...referencePages(l)]
  const made = { pages, byPath: new Map(pages.map((page) => [page.path, page])) }
  built.set(locale, made)
  return made
}

/** Every page in a language, in the order the sources list them. */
export const pagesFor = (locale: Locale): ReadonlyArray<Page> => buildFor(locale).pages

/** The English pages, which are also the list of every path the wiki has. */
export const PAGES: ReadonlyArray<Page> = pagesFor(DEFAULT_LOCALE)

/** A page by its logical path in a language, such as `/glossary/latency`. */
export const pageIn = (locale: Locale, path: string): Page | null =>
  buildFor(locale).byPath.get(path) ?? null

/** A page by the URL path it is served at: `/glossary/latency` or `/es/glossary/latency`. */
export const pageAt = (pathname: string): Page | null =>
  pageIn(localeOfPath(pathname), stripLocale(pathname))

/** The top level of the navigation: "Play the game" and the four Diátaxis kinds, in the order a new player needs them. */
export const SECTION_ORDER: ReadonlyArray<Section> = [
  'play',
  'tutorials',
  'guides',
  'explanation',
  'patterns',
  'reference',
  'design',
  'about',
]

const inOrder =
  (locale: Locale) =>
  (a: Page, b: Page): number =>
    a.order - b.order || a.title.localeCompare(b.title, locale)

export const navOf = (locale: Locale, section: Section): ReadonlyArray<Page> =>
  pagesFor(locale)
    .filter((page) => page.section === section && page.parent === null && page.path !== '/')
    .sort(inOrder(locale))

/** The pages under a hub, in order. */
export const childrenOf = (locale: Locale, path: string): ReadonlyArray<Page> =>
  pagesFor(locale)
    .filter((page) => page.parent === path)
    .sort(inOrder(locale))
