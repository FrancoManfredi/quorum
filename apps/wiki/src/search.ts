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
  headings: string
  summary: string
  text: string
  section: Section
  anchors: ReadonlyArray<Anchor>
}>

type Stored = Readonly<Pick<Document, 'path' | 'title' | 'summary' | 'section' | 'anchors'>>

/** A title or alias match beats a heading, which beats the summary and the body. */
const OPTIONS: Options<Document> = {
  fields: ['title', 'aliases', 'headings', 'summary', 'text'],
  storeFields: ['path', 'title', 'summary', 'section', 'anchors'],
  tokenize: (text) =>
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  searchOptions: {
    boost: { title: 6, aliases: 5, headings: 3, summary: 2 },
    // "autoscalr" and "kubernets" reach their pages; "lb" stays exact.
    fuzzy: 0.2,
    prefix: true,
  },
}

export type Index = MiniSearch<Document>

const documentOf = (page: Page): Document => ({
  id: page.path,
  path: page.path,
  title: page.title,
  aliases: page.aliases.join(' '),
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

/** The heading a query names, so a result opens at that section rather than the page top. Short
    words such as "the" and "of" name every heading, so only words of four letters or more, and
    terms with a digit such as "p99", count. */
const headingOf = (anchors: ReadonlyArray<Anchor>, words: ReadonlyArray<string>): string | null => {
  const candidates = words.filter((word) => word.length >= 4 || /\d/.test(word))
  let best: Readonly<{ id: string; score: number }> | null = null
  for (const anchor of anchors) {
    const text = anchor.text.toLowerCase()
    const score = candidates.reduce(
      (total, word) => (text.includes(word) ? total + word.length : total),
      0,
    )
    if (score > 0 && (best === null || score > best.score)) best = { id: anchor.id, score }
  }
  return best?.id ?? null
}

export const search = (index: Index, query: string, limit = 8): ReadonlyArray<Hit> => {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (words.length === 0) return []
  return index
    .search(query)
    .slice(0, limit)
    .map((result) => {
      // MiniSearch types stored fields as `any`; this is the shape `storeFields` writes.
      const stored = result as unknown as Stored
      return {
        path: stored.path,
        title: stored.title,
        summary: stored.summary,
        section: stored.section,
        heading: headingOf(stored.anchors, words),
      }
    })
}
