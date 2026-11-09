import { Schema } from 'effect'

/* The frontmatter of an authored page. Values are flat strings (a @foldkit/markdown rule); the
   build rejects an unknown field. An entity's prose file (content/components/lb.md) has none:
   its title and facts come from the catalog. */

export const SECTIONS = [
  'play',
  'tutorials',
  'guides',
  'explanation',
  'patterns',
  'reference',
  'design',
  'about',
] as const
export type Section = (typeof SECTIONS)[number]

export const Frontmatter = Schema.Struct({
  title: Schema.String.check(Schema.isNonEmpty()),
  summary: Schema.String.check(Schema.isNonEmpty()),
  section: Schema.Literals(SECTIONS),
  /** The heading its page sits under in the section's list, such as the Patterns section's "Scaling steps". */
  group: Schema.optionalKey(Schema.String),
  /** Position in its section's list, lowest first. */
  order: Schema.optionalKey(Schema.String),
  /** The Era index (0 = Garage) where a reader first needs the page. */
  era: Schema.optionalKey(Schema.String),
  /** Other words a reader may search for, comma-separated. */
  aliases: Schema.optionalKey(Schema.String),
  /** The design page this page rewrites, for readers who want the source. */
  gdd: Schema.optionalKey(Schema.String),
  /** List only the top-level headings in the contents rail, for a page with many subheadings. */
  toc: Schema.optionalKey(Schema.Literal('top')),
})
export type Frontmatter = typeof Frontmatter.Type
