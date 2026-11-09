import { COMPONENTS, type ComponentId } from '@quorum/simulation/catalog'

/* ==========================================================================
   The wiki pages an agent can read as MCP resources. The wiki's Markdown is
   written for a browser: its directives draw live catalog tables, and its links
   point at wiki paths. This turns each page into plain Markdown that stands on
   its own, and gives it a stable `quorum://wiki/...` address.
   ========================================================================== */

export const WIKI_ORIGIN = 'https://wiki.playquorum.dev'
export const WIKI_INDEX_URI = 'quorum://wiki/index'

export type WikiPage = Readonly<{
  uri: string
  /** The section and page, such as `explanation/requests`. */
  path: string
  title: string
  description: string
  text: string
}>

const SECTION_TITLES: Readonly<Record<string, string>> = {
  explanation: 'How the game works',
  components: 'Components',
  guides: 'Guides',
  tutorials: 'Tutorials',
}

const uriOf = (path: string): string => `quorum://wiki/${path}`

const frontmatterOf = (
  source: string,
): Readonly<{ meta: Record<string, string>; body: string }> => {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source)
  if (!match) return { meta: {}, body: source }
  const meta: Record<string, string> = {}
  for (const line of (match[1] ?? '').split('\n')) {
    const colon = line.indexOf(':')
    if (colon > 0) meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return { meta, body: source.slice(match[0].length) }
}

const TONES: Readonly<Record<string, string>> = { real: 'In real systems', tip: 'Tip' }

/**
 * Keeps the prose and drops what only a browser can draw. A leaf directive (`::Options{...}`) is a
 * live table, quiz, or sandbox, so it goes. A container (`:::Note{...}` to `:::`) keeps its text
 * under a bold label.
 */
const plainMarkdown = (body: string): string =>
  body
    .split('\n')
    .flatMap((line) => {
      const container = /^:{3,}([A-Za-z]+)(?:\{(.*)\})?\s*$/.exec(line)
      if (container) {
        const tone = /tone="([^"]*)"/.exec(container[2] ?? '')?.[1] ?? ''
        return [`**${TONES[tone] ?? container[1]}:**`]
      }
      if (/^:{3,}\s*$/.test(line)) return []
      if (/^::[A-Za-z]+/.test(line)) return []
      return [line]
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Points a wiki path at the page's resource when the agent can read it, else at the website. */
const withLinks = (text: string, known: ReadonlySet<string>): string =>
  text.replace(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g, (_all, path: string, hash: string | undefined) => {
    const key = path.replace(/^\//, '')
    return known.has(key)
      ? `](${uriOf(key)}${hash ?? ''})`
      : `](${WIKI_ORIGIN}${path === '/' ? '' : path}${hash ?? ''})`
  })

const firstParagraph = (body: string): string => {
  const paragraph = body.trim().split(/\n\s*\n/)[0] ?? ''
  const plain = paragraph
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 220 ? `${plain.slice(0, 217).trimEnd()}...` : plain
}

const titleOf = (path: string, meta: Record<string, string>): string => {
  if (meta['title']) return meta['title']
  const [section, id = path] = path.split('/')
  return section === 'components' ? (COMPONENTS[id as ComponentId]?.name ?? id) : id
}

/** The resource for every wiki page, from the page sources by `section/page` path. */
export const wikiPages = (sources: Readonly<Record<string, string>>): ReadonlyArray<WikiPage> => {
  const known = new Set(Object.keys(sources))
  return Object.entries(sources)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, source]) => {
      const { meta, body } = frontmatterOf(source)
      return {
        uri: uriOf(path),
        path,
        title: titleOf(path, meta),
        description: meta['summary'] ?? firstParagraph(body),
        text: withLinks(plainMarkdown(body), known),
      }
    })
}

/** The index page: where to start, and every other page by section. */
export const wikiIndex = (pages: ReadonlyArray<WikiPage>): string => {
  const sections = Object.entries(SECTION_TITLES).flatMap(([section, heading]) => {
    const own = pages.filter((page) => page.path.startsWith(`${section}/`))
    return own.length === 0
      ? []
      : [
          `## ${heading}`,
          own.map((page) => `- [${page.title}](${page.uri}): ${page.description}`).join('\n'),
        ]
  })
  return [
    '# Quorum wiki',
    'Quorum is an incremental systems game. The player wires Components into a Design, Users send requests through it, and the Simulation turns that into the figures the tools return. Each page below is one resource: read the one that matches the figure or Node you are looking at.',
    `Start with [How requests flow](quorum://wiki/explanation/requests). The reference pages, patterns, and the design document are on the website at ${WIKI_ORIGIN}.`,
    ...sections,
  ].join('\n\n')
}
