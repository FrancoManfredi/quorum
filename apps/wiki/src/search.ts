import MiniSearch, { type Options } from 'minisearch'
import type { Section } from './frontmatter.ts'
import type { Page } from './page.ts'

/* Full-text search over every page, in the browser. The index is built at build time
   (vite.config.ts) and fetched when a reader first opens the search, so a reader who never
   searches downloads none of it. Why MiniSearch: docs/research/full-text-search.md. */

export type Hit = Readonly<{
  path: string
  title: string
  summary: string
  section: Section
  /** The heading the query names, for the result's anchor. */
  heading: string | null
}>

type Anchor = Readonly<{ id: string; text: string }>

type Document = Readonly<{
  id: string
  path: string
  title: string
  aliases: string
  kind: string
  headings: string
  summary: string
  text: string
  section: Section
  anchors: ReadonlyArray<Anchor>
}>

type Stored = Readonly<
  Pick<Document, 'path' | 'title' | 'aliases' | 'summary' | 'section' | 'anchors'>
>

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'do',
  'does',
  'for',
  'how',
  'i',
  'in',
  'is',
  'it',
  'my',
  'did',
  'can',
  'why',
  'when',
  'where',
  'who',
  'which',
  'should',
  'need',
  'many',
  'much',
  'out',
  'up',
  'of',
  'on',
  'or',
  'the',
  'to',
  'what',
  'with',
])

/** A light English stemmer, so "caching" finds "cache", "retries" finds "retry", and
    "contributing" finds "contribute". Index and query stem the same way, so a stem need not be a
    word. Short words ("lb", "cdc", "dns") and terms with a digit ("p99") stay as typed. */
export const stem = (word: string): string => {
  if (word.length <= 3 || /\d/.test(word)) return word
  let out = word
  if (out.endsWith('ies') && out.length > 4) out = `${out.slice(0, -3)}y`
  else if (out.endsWith('sses')) out = out.slice(0, -2)
  else if (out.endsWith('s') && !out.endsWith('ss') && !out.endsWith('us') && !out.endsWith('is'))
    out = out.slice(0, -1)
  for (const suffix of ['ing', 'ed']) {
    if (out.endsWith(suffix) && /[aeiouy]/.test(out.slice(0, -suffix.length))) {
      out = out.slice(0, -suffix.length)
      if (/([^aeiouylsz])\1$/.test(out)) out = out.slice(0, -1)
      break
    }
  }
  return out.length > 3 && out.endsWith('e') ? out.slice(0, -1) : out
}

const words = (text: string): ReadonlyArray<string> =>
  text
    .toLowerCase()
    .replace(/['\u2019]s\b/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/** The terms a text is searched by: stop words dropped, the rest stemmed. */
const termsOf = (text: string): ReadonlyArray<string> =>
  words(text)
    .filter((word) => !STOPWORDS.has(word))
    .map(stem)

/** What a page's section is called, so "tutorial" and "guide" find those pages. */
const KINDS: Readonly<Partial<Record<Section, string>>> = {
  tutorials: 'tutorial',
  guides: 'guide',
  patterns: 'pattern',
  explanation: 'explanation',
}

/** A title or alias match beats a heading, which beats the summary and the body. A one-letter
    prefix matches half the index, and a fuzzy match on a short word is a different word. */
const OPTIONS: Options<Document> = {
  fields: ['title', 'aliases', 'headings', 'summary', 'text', 'kind'],
  storeFields: ['path', 'title', 'aliases', 'summary', 'section', 'anchors'],
  tokenize: (text) => [...words(text)],
  processTerm: (term) => {
    if (STOPWORDS.has(term)) return null
    return stem(term)
  },
  searchOptions: {
    boost: { title: 6, aliases: 5, headings: 3, summary: 2, kind: 2 },
    // "autoscalr" and "kubernets" reach their pages; "lb" and "dlq" stay exact.
    fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
    prefix: (term) => term.length >= 3,
  },
}

export type Index = MiniSearch<Document>

const documentOf = (page: Page): Document => ({
  id: page.path,
  path: page.path,
  title: page.title,
  aliases: [...new Set(page.aliases)].join(' | '),
  kind: KINDS[page.section] ?? '',
  headings: page.headings.map((heading) => heading.text).join(' '),
  summary: page.summary,
  text: page.text,
  section: page.section,
  anchors: page.headings.map(({ id, text }) => ({ id, text })),
})

export const buildIndex = (pages: ReadonlyArray<Page>): Index => {
  const index = new MiniSearch<Document>(OPTIONS)
  index.addAll(pages.map(documentOf))
  return index
}

/** The index as the one file the build writes beside the pages. */
export const indexJson = (pages: ReadonlyArray<Page>): string => JSON.stringify(buildIndex(pages))

export const loadIndex = (json: string): Index => MiniSearch.loadJSON<Document>(json, OPTIONS)

/** The heading a query names, so a result opens at that section rather than the page top. Terms
    shorter than four letters, such as "the" and "of", name every heading, so only terms of four
    letters or more, and terms with a digit such as "p99", count. */
const headingOf = (anchors: ReadonlyArray<Anchor>, terms: ReadonlyArray<string>): string | null => {
  const candidates = terms.filter((term) => term.length >= 3 || /\d/.test(term))
  let best: Readonly<{ id: string; score: number }> | null = null
  for (const anchor of anchors) {
    const heading = termsOf(anchor.text)
    const score = candidates.reduce(
      (total, term) =>
        heading.some((word) => word.startsWith(term)) ? total + term.length : total,
      0,
    )
    if (score > 0 && (best === null || score > best.score)) best = { id: anchor.id, score }
  }
  return best?.id ?? null
}

/** The title already names every term, so the page top is the answer, not one of its sections. */
const hasAll = (title: string, terms: ReadonlyArray<string>): boolean => {
  const own = termsOf(title)
  return terms.every((term) => own.includes(term))
}

/** Who answers a name when several pages share it: the Component, then the guide, then the
    glossary entry, then the pattern and the research note behind it. */
const PRIORS: ReadonlyArray<readonly [string, number]> = [
  ['/components/', 1.2],
  ['/glossary/', 1.05],
  ['/incidents/', 1.05],
  ['/research/', 0.95],
  ['/design/', 0.9],
]

/** A page whose title or alias is exactly the query is what the reader named; the sum of weak
    matches across a long page must not outrank it. A title says it more than an alias does. */
const NAMED_BY_TITLE = 4
const NAMED_BY_ALIAS = 2
const NAMED_IN_TITLE = 1.5

export const search = (index: Index, query: string, limit = 8): ReadonlyArray<Hit> => {
  const terms = termsOf(query)
  if (terms.length === 0) return []
  const wanted = terms.join(' ')
  return index
    .search(query)
    .map((result) => {
      // MiniSearch types stored fields as `any`; this is the shape `storeFields` writes.
      const stored = result as unknown as Stored
      const titleTerms = termsOf(stored.title)
      const named =
        titleTerms.join(' ') === wanted
          ? NAMED_BY_TITLE
          : stored.aliases.split(' | ').some((alias) => termsOf(alias).join(' ') === wanted)
            ? NAMED_BY_ALIAS
            : hasAll(stored.title, terms)
              ? NAMED_IN_TITLE
              : 1
      const prior = PRIORS.find(([prefix]) => stored.path.startsWith(prefix))?.[1] ?? 1
      return { stored, score: result.score * prior * named }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ stored }) => ({
      path: stored.path,
      title: stored.title,
      summary: stored.summary,
      section: stored.section,
      heading: hasAll(stored.title, terms) ? null : headingOf(stored.anchors, terms),
    }))
}
