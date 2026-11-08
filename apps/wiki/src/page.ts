import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Section } from './frontmatter.ts'
import type { Message, Model } from './main.ts'

/* One wiki page. Authored pages come from content/; reference pages come from the catalog. */

export type Heading = Readonly<{ id: string; text: string; level: 2 | 3 }>

export type View = (model: Model, h: HtmlBuilder<Message>) => Html

export type Page = Readonly<{
  path: string
  title: string
  /** One sentence: the search result and the page's description. */
  summary: string
  section: Section
  /** The hub page it belongs under, such as `/components`; the sidebar opens it there. */
  parent: string | null
  /** A heading the sidebar lists it under; pages of one group have adjacent orders. */
  group: string | null
  /** Position in its section or group, lowest first. */
  order: number
  /** The Era index where a reader first needs it; null for any time. */
  era: number | null
  /** Other words a reader may search for. */
  aliases: ReadonlyArray<string>
  /** The repository file to edit, for an authored page. */
  source: string | null
  /** The design page this page rewrites, for readers who want the source. */
  gdd: string | null
  headings: ReadonlyArray<Heading>
  /** Spans the frame: no navigation rail and no contents list. */
  wide: boolean
  /** Facts beside the text, such as a Component's infobox. */
  aside: View | null
  body: View
  /** Pages to list at the end, by path. */
  related: ReadonlyArray<string>
  /** The words search looks through beyond the title and headings. */
  text: string
}>

/** A heading's anchor: lower case, words joined by hyphens. */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
