import * as Markdown from '@foldkit/markdown'
import { Option, Schema } from 'effect'
import { COMPONENTS, ERAS, KINDS, RESEARCH_TRACKS, researchList } from '@quorum/simulation/catalog'
import { GUIDED } from '@quorum/simulation/sandbox'
import { inertHtml } from 'foldkit/html'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { documentOf } from './content.ts'
import type { Section } from './frontmatter.ts'
import { islandAttributes } from './islands.ts'
import { init, type Message, type Model } from './main.ts'
import type { Page } from './page.ts'
import { PAGES, SECTION_ORDER, childrenOf, navOf, pageAt } from './pages.ts'
import { WIKI_ORIGIN } from './site.ts'

/* ==========================================================================
   Every page as Markdown, for agents and anyone who prefers plain text. The
   page at /explanation/latency has a twin at /explanation/latency.md, and
   /llms.txt indexes them all (llmstxt.org). `pageMarkdown` is the one
   function from Page to Markdown:

   - an authored page converts its source document, and directives become
     text from the catalog (`blocksMarkdown`);
   - a generated reference page converts the view that renders it, so the
     two cannot drift (`htmlMarkdown`).

   The build writes the files into the build output (vite.config.ts).
   ========================================================================== */

type Inline = Markdown.Inline
type Block = Markdown.MarkdownDocument['blocks'][number]

/** The Markdown twin of a page's URL: `/a/b` → `/a/b.md`, `/` → `/index.md`. */
export const markdownPath = (path: string): string => (path === '/' ? '/index.md' : `${path}.md`)

const markdownUrl = (path: string): string => `${WIKI_ORIGIN}${markdownPath(path)}`

/** A link target: wiki paths point at the twin, anything else stays. */
const target = (url: string): string => {
  if (!url.startsWith('/') || url.startsWith('//')) return url
  const hash = url.indexOf('#')
  const path = hash === -1 ? url : url.slice(0, hash)
  const rest = hash === -1 ? '' : url.slice(hash)
  return `${markdownUrl(path.replace(/\/+$/, '') || '/')}${rest}`
}

/* ---- Authored pages: the Markdown document ----------------------------- */

const inlines = (content: ReadonlyArray<Inline>): string =>
  content
    .map((node): string => {
      switch (node._tag) {
        case 'Text':
          return node.value
        case 'InlineCode':
          return `\`${node.value}\``
        case 'HardBreak':
          return '  \n'
        case 'Emphasis':
          return `*${inlines(node.content)}*`
        case 'Strong':
          return `**${inlines(node.content)}**`
        case 'Strikethrough':
          return `~~${inlines(node.content)}~~`
        case 'Link':
          return `[${inlines(node.content)}](${target(node.url)})`
        case 'Image':
          return `![${node.alt}](${node.url.startsWith('/') && !node.url.startsWith('//') ? `${WIKI_ORIGIN}${node.url}` : node.url})`
      }
    })
    .join('')

const quote = (text: string): string =>
  text
    .split('\n')
    .map((line) => (line === '' ? '>' : `> ${line}`))
    .join('\n')

const indent = (text: string, by: string): string =>
  text
    .split('\n')
    .map((line, index) => (index === 0 || line === '' ? line : `${by}${line}`))
    .join('\n')

const NOTE_LABELS = { tip: 'Tip', warn: 'Watch out', real: 'How real is it' } as const

const percent = (share: number): string => `${Math.round(share * 1000) / 10}%`

const decode = {
  Note: Schema.decodeUnknownSync(islandAttributes.Note),
  Sandbox: Schema.decodeUnknownSync(islandAttributes.Sandbox),
  Component: Schema.decodeUnknownSync(islandAttributes.Component),
  Mix: Schema.decodeUnknownSync(islandAttributes.Mix),
  Track: Schema.decodeUnknownSync(islandAttributes.Track),
  Quiz: Schema.decodeUnknownSync(islandAttributes.Quiz),
}

const island = (block: Extract<Block, { _tag: 'Island' }>): string => {
  switch (block.name) {
    case 'Note': {
      const { tone } = decode.Note(block.attributes)
      return quote(`**${NOTE_LABELS[tone ?? 'tip']}.** ${blocksMarkdown(block.blocks)}`)
    }
    case 'Sandbox': {
      const { id } = decode.Sandbox(block.attributes)
      const def = GUIDED[id]
      const goal = def.objectives[0]?.goal
      return `Sandbox: [${def.name}](${markdownUrl(`/sandboxes/${id}`)})${goal ? `: ${goal}` : ''}`
    }
    case 'Practice': {
      const { id } = block.attributes as { id?: string }
      return `Interactive practice board: ${id ?? ''}, open the page to use it.`
    }
    case 'Component': {
      const { id } = decode.Component(block.attributes)
      const def = COMPONENTS[id]
      return `Component: [${def.name}](${markdownUrl(`/components/${id}`)}) (${def.product}): ${def.blurb}`
    }
    case 'Mix': {
      const era = ERAS[Number(decode.Mix(block.attributes).era)]
      const shares = Object.entries(era?.mix ?? {})
        .map(([kind, share]) => `${KINDS[kind as keyof typeof KINDS].label} ${percent(share)}`)
        .join(', ')
      return `Request mix in the ${era?.name ?? ''} Era: ${shares}.`
    }
    case 'Track': {
      const { track } = decode.Track(block.attributes)
      const label = RESEARCH_TRACKS.find((entry) => entry.key === track)?.label ?? track
      const items = researchList
        .filter((entry) => entry.track === track)
        .map((entry) => `[${entry.name}](${markdownUrl(`/research/${entry.id}`)})`)
      return `Research track ${label}: ${items.join(', ')}.`
    }
    case 'Quiz': {
      const quiz = decode.Quiz(block.attributes)
      const options = quiz.options.split('|')
      const answer = Number(quiz.answer)
      return [
        `**Quiz:** ${quiz.question}`,
        '',
        ...options.map((option, index) => `${index + 1}. ${option}`),
        '',
        `Answer: ${answer}. ${options[answer - 1] ?? ''}. ${quiz.explain}`,
      ].join('\n')
    }
    default:
      return blocksMarkdown(block.blocks)
  }
}

const row = (cells: ReadonlyArray<Markdown.TableCell>): string =>
  `| ${cells.map((cell) => inlines(cell.content).replace(/\|/g, '\\|')).join(' | ')} |`

const blockMarkdown = (block: Block): string => {
  switch (block._tag) {
    case 'Heading':
      return `${'#'.repeat(block.level)} ${inlines(block.content)}`
    case 'Paragraph':
      return inlines(block.content)
    case 'CodeBlock':
      return `\`\`\`${Option.getOrElse(block.maybeLanguage, () => '')}\n${block.value}\n\`\`\``
    case 'List':
      return block.items
        .map((item, index) => {
          const marker = block.isOrdered
            ? `${Option.getOrElse(block.maybeStartNumber, () => 1) + index}. `
            : '- '
          return `${marker}${indent(blocksMarkdown(item.blocks), ' '.repeat(marker.length))}`
        })
        .join('\n')
    case 'Blockquote':
      return quote(blocksMarkdown(block.blocks))
    case 'ThematicBreak':
      return '---'
    case 'Table':
      return [
        row(block.headerRow.cells),
        `| ${block.headerRow.cells.map(() => '---').join(' | ')} |`,
        ...block.bodyRows.map((bodyRow) => row(bodyRow.cells)),
      ].join('\n')
    case 'Island':
      return island(block)
  }
}

/** A document's blocks as Markdown, with directives replaced by readable text. */
export const blocksMarkdown = (blocks: ReadonlyArray<Block>): string =>
  blocks.map(blockMarkdown).join('\n\n')

/* ---- Generated pages: the view that renders them ----------------------- */

type Node = Readonly<{
  sel?: string
  text?: string
  data?: Readonly<Record<string, unknown>>
  children?: ReadonlyArray<Node | string | null>
}>

const attribute = (node: Node, name: string): string => {
  for (const key of ['attrs', 'props'] as const) {
    const value = (node.data?.[key] as Record<string, unknown> | undefined)?.[name]
    if (typeof value === 'string') return value
  }
  return ''
}

const classesOf = (node: Node): ReadonlyArray<string> =>
  Object.keys((node.data?.['class'] as object | undefined) ?? {}).flatMap((name) =>
    name.split(/\s+/),
  )

const SKIPPED = new Set(['svg', 'button', 'input', 'script', 'style', 'nav', 'form'])
const BLOCKS = new Set(
  'div section article header footer figure figcaption details summary p ul ol li dl dt dd table tr pre aside'.split(
    ' ',
  ),
)

const block = (text: string): string => `\n\n${text.trim()}\n\n`

const flow = (node: Node | string | null | undefined): string => {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  if (node.sel === undefined) return node.text ?? ''
  const tag = node.sel.split(/[.#]/)[0] ?? ''
  if (SKIPPED.has(tag) || classesOf(node).includes('anchor')) return ''
  const inner = (): string => (node.children ?? []).map(flow).join('')
  if (/^h[1-6]$/.test(tag)) return block(`${'#'.repeat(Number(tag.slice(1)))} ${inner().trim()}`)
  switch (tag) {
    case 'a': {
      const text = inner().replace(/\s+/g, ' ').trim()
      const href = attribute(node, 'href')
      return href ? `[${text}](${target(href)})` : text
    }
    case 'strong':
    case 'b':
      return `**${inner()}**`
    case 'em':
    case 'i':
      return `*${inner()}*`
    case 'code':
      return `\`${inner()}\``
    case 'pre':
      return block(`\`\`\`\n${inner().replace(/^`|`$/g, '')}\n\`\`\``)
    case 'br':
      return '\n'
    case 'li':
      return `\n- ${inner().trim().replace(/\n\n+/g, '\n').replace(/\n/g, '\n  ')}`
    case 'dt':
      return `\n- **${inner().trim()}:** `
    case 'dd':
      return `${inner().trim()}\n`
    case 'aside':
      return block(quote(inner().trim()))
    case 'table':
      return block(tableMarkdown(node))
    case 'span':
      return ` ${inner()} `
    default:
      return BLOCKS.has(tag) ? block(inner()) : inner()
  }
}

const rowsOf = (node: Node): ReadonlyArray<Node> =>
  (node.children ?? []).flatMap((child): ReadonlyArray<Node> => {
    if (!child || typeof child === 'string') return []
    return child.sel === 'tr' ? [child] : rowsOf(child)
  })

const cellsOf = (tableRow: Node): ReadonlyArray<string> =>
  (tableRow.children ?? []).flatMap((child) =>
    child && typeof child !== 'string' && (child.sel === 'th' || child.sel === 'td')
      ? [flow(child).replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|')]
      : [],
  )

const tableMarkdown = (node: Node): string => {
  const [head, ...body] = rowsOf(node).map(cellsOf)
  if (!head) return ''
  return [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...body.map((line) => `| ${line.join(' | ')} |`),
  ].join('\n')
}

/** Rendered markup as Markdown, with the spacing around inline pieces tidied. */
export const htmlMarkdown = (html: Html): string =>
  flow(html as Node | null)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/ ([.,;:)])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/* ---- Pages ------------------------------------------------------------- */

// A page body reads the model only for reader state, which a static document does not have.
const modelAt = (path: string): Model => {
  const { model } = (init as unknown as (url: unknown) => Readonly<{ model: Model }>)({
    pathname: path,
  })
  return model
}

const inert = inertHtml as unknown as HtmlBuilder<Message>

const rendered = new Map<string, string>()

/** One page as Markdown: its title and summary, its body, and what it links on to. A page never changes, so its text is made once. */
export const pageMarkdown = (page: Page): string => {
  const cached = rendered.get(page.path)
  if (cached !== undefined) return cached
  const text = renderMarkdown(page)
  rendered.set(page.path, text)
  return text
}

const renderMarkdown = (page: Page): string => {
  const document = documentOf(page.path)
  const model = modelAt(page.path)
  const body = document ? blocksMarkdown(document.blocks) : htmlMarkdown(page.body(model, inert))
  const facts = page.aside
    ? htmlMarkdown(page.aside(model, inert))
        .replace(/^> ?/gm, '')
        .replace(/\n{2,}/g, '\n')
    : ''
  const related = page.related.flatMap((path) => {
    const twin = pageAt(path)
    return twin ? [`- [${twin.title}](${markdownUrl(twin.path)})`] : []
  })
  return [
    `# ${page.title}`,
    `> ${page.summary}`,
    body,
    facts ? `## Facts\n\n${facts}` : '',
    related.length ? `## See also\n\n${related.join('\n')}` : '',
    `Source: ${WIKI_ORIGIN}${page.path === '/' ? '' : page.path}`,
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n')
}

/* ---- The index (llmstxt.org) ------------------------------------------- */

const SECTION_LABELS: Record<Section, string> = {
  play: 'Play the game',
  tutorials: 'Tutorials',
  guides: 'Guides',
  explanation: 'Explanation',
  reference: 'Reference',
  design: 'Design',
  about: 'About',
}

const entry = (page: Page): string =>
  `- [${page.title}](${markdownUrl(page.path)}): ${page.summary.replace(/\s+/g, ' ')}`

/** `/llms.txt`: the pages by section, then the pages under each generated hub. */
export const llmsTxt = (): string => {
  const home = pageAt('/')
  const sections = SECTION_ORDER.map((section) => ({
    title: SECTION_LABELS[section],
    pages: navOf(section),
  }))
  const hubs = SECTION_ORDER.flatMap((section) => navOf(section)).flatMap((hub) => {
    const children = childrenOf(hub.path)
    return children.length ? [{ title: hub.title, pages: children }] : []
  })
  return [
    '# Quorum Wiki',
    `> The player wiki for Quorum, a game about running the infrastructure of a growing Company. Every page is also served as Markdown at its URL plus \`.md\`; numbers come from the game's catalog. The game changes every week, so a page can lag behind it; see the changelog at ${WIKI_ORIGIN}/about/changelog.`,
    `Every page in one file: [llms-full.txt](${WIKI_ORIGIN}/llms-full.txt)`,
    ...(home ? ['## Start', entry(home)] : []),
    ...[...sections, ...hubs].flatMap(({ title, pages }) =>
      pages.length ? [`## ${title}`, pages.map(entry).join('\n')] : [],
    ),
  ]
    .join('\n\n')
    .concat('\n')
}

/** `/llms-full.txt`: every page, one after another. */
export const llmsFullTxt = (): string =>
  PAGES.map((page) => `<!-- ${markdownUrl(page.path)} -->\n\n${pageMarkdown(page)}`).join(
    '\n---\n\n',
  )

/** Every file the build adds to the output, by path from its root. */
export const markdownFiles = (): Readonly<Record<string, string>> => ({
  'llms.txt': llmsTxt(),
  'llms-full.txt': llmsFullTxt(),
  ...Object.fromEntries(
    PAGES.map((page) => [markdownPath(page.path).slice(1), pageMarkdown(page)]),
  ),
})
