import * as Markdown from '@foldkit/markdown'
import { Schema } from 'effect'
import { Frontmatter } from './frontmatter.ts'
import { DEFAULT_LOCALE, type Locale } from './i18n/locale.ts'
import { anchorsFor, headingsOf, linksIn, prose, textOf, type Anchors } from './prose.ts'
import type { Page } from './page.ts'

export type ProseModule = Readonly<{ default: unknown; frontmatter: unknown }>

/* Prose lives in `content/` (English) and `content-es/` (Spanish, the same relative paths). English
   is the source of structure: a Spanish file replaces an English page's title, summary, aliases and
   body, while its section, group, order, era, gdd and toc always come from the English file. A page
   with no Spanish file shows its English text. Spanish loads as a separate chunk
   (src/locales/es.ts) and registers its files here. */

const english = import.meta.glob<ProseModule>('../content/**/*.md', { eager: true })

const decodeFrontmatter = Schema.decodeUnknownSync(Frontmatter)

/** The directory each language's files live in, as the repository names it. */
const ROOTS: Readonly<Record<Locale, string>> = { en: 'content', es: 'content-es' }

type Entry = Readonly<{
  path: string
  source: string
  document: Markdown.MarkdownDocument
  frontmatter: Frontmatter | null
}>

const pathOf = (file: string, root: string): string => {
  const path = file
    .slice(file.indexOf(`/${root}/`) + root.length + 1)
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
  return path === '' ? '/' : path
}

const entriesOf = (
  modules: Readonly<Record<string, ProseModule>>,
  locale: Locale,
): ReadonlyArray<Entry> =>
  Object.entries(modules).map(([file, module]) => {
    const root = ROOTS[locale]
    return {
      path: pathOf(file, root),
      source: `apps/wiki/${root}${file.slice(file.indexOf(`/${root}/`) + root.length + 1)}`,
      document: Markdown.decodeDocument(module.default),
      frontmatter: module.frontmatter === undefined ? null : decodeFrontmatter(module.frontmatter),
    }
  })

const byLocale: Partial<Record<Locale, ReadonlyArray<Entry>>> = {
  [DEFAULT_LOCALE]: entriesOf(english, DEFAULT_LOCALE),
}

const entriesIn = (locale: Locale): ReadonlyArray<Entry> => byLocale[locale] ?? []

const englishEntries = (): ReadonlyArray<Entry> => entriesIn('en')

/** Makes a language's files known. Done once, by the language's bundle. */
export const registerProse = (
  locale: Locale,
  modules: Readonly<Record<string, ProseModule>>,
): void => {
  byLocale[locale] = entriesOf(modules, locale)
}

/** The Spanish counterpart of an English entry, if its file exists. */
const translation = (locale: Locale, path: string, structured: boolean): Entry | null =>
  locale === 'en'
    ? null
    : (entriesIn(locale).find(
        (candidate) => candidate.path === path && (candidate.frontmatter !== null) === structured,
      ) ?? null)

export type Prose = Readonly<{
  document: Markdown.MarkdownDocument
  text: string
  source: string
  /** Anchors that keep a translation's headings at the English ids; null for English. */
  anchors: Anchors | null
  /** The text is English because no translation exists. */
  fallback: boolean
}>

/** Prose for a catalog page, by its path, such as `/components/lb`. A translated file replaces the English one. */
export const proseAt = (locale: Locale, path: string): Prose | null => {
  const base = englishEntries().find((entry) => entry.path === path && !entry.frontmatter)
  if (!base) return null
  const own = translation(locale, path, false)
  const chosen = own ?? base
  return {
    document: chosen.document,
    text: textOf(chosen.document),
    source: chosen.source,
    anchors: own ? anchorsFor(own.document, base.document) : null,
    fallback: locale !== 'en' && own === null,
  }
}

/** The wiki paths and Sandboxes that a page's prose links to or places. The English text is the
    source of every relationship, so a translation never changes which pages are related. */
export const linksFrom = (path: string): ReturnType<typeof linksIn> =>
  linksIn(englishEntries().find((candidate) => candidate.path === path)?.document ?? { blocks: [] })

/** The English source document of an authored page, by its path. */
export const documentOf = (path: string): Markdown.MarkdownDocument | null =>
  englishEntries().find((candidate) => candidate.path === path && candidate.frontmatter)
    ?.document ?? null

/** Every prose file that belongs to a catalog page, for the coverage tests. */
export const prosePaths: ReadonlyArray<string> = englishEntries()
  .filter((entry) => !entry.frontmatter)
  .map((entry) => entry.path)

/** The authored pages in a language: Spanish text where it exists, English where it does not. */
export const authoredPages = (locale: Locale): ReadonlyArray<Page> =>
  englishEntries().flatMap((base): ReadonlyArray<Page> => {
    const meta = base.frontmatter
    if (!meta) return []
    const own = translation(locale, base.path, true)
    const text = own?.frontmatter ?? meta
    const document = (own ?? base).document
    const anchors = own ? anchorsFor(own.document, base.document) : undefined
    const headings = headingsOf(document, anchors)
    return [
      {
        locale,
        path: base.path,
        title: text.title,
        summary: text.summary,
        section: meta.section,
        parent: null,
        group: meta.group ?? null,
        order: Number(meta.order ?? 100),
        era: meta.era === undefined ? null : Number(meta.era),
        // A Spanish page keeps its English aliases too, so a reader who knows the English term finds it.
        aliases: [
          ...new Set(
            [text.aliases, meta.aliases]
              .flatMap((aliases) => (aliases ?? '').split(','))
              .map((alias) => alias.trim())
              .filter(Boolean),
          ),
        ],
        source: (own ?? base).source,
        gdd: meta.gdd ?? null,
        headings: meta.toc === 'top' ? headings.filter((heading) => heading.level === 2) : headings,
        wide: false,
        aside: null,
        body: (model, h) => prose(document, model, h, anchors),
        related: [],
        text: textOf(document),
        fallback: locale !== 'en' && own === null,
      },
    ]
  })
