import { expect, test } from 'vitest'
import { Option } from 'effect'
import type { Url } from 'foldkit/url'
import {
  COMPONENT_IDS,
  CVE_TERMS,
  ERAS,
  FRAMEWORK_IDS,
  GLOSSARY,
  INCIDENT_IDS,
  RUNTIME_IDS,
  researchList,
} from '@quorum/simulation/catalog'
import { SANDBOX_IDS } from '@quorum/simulation/sandbox'
import { prosePaths } from './content.ts'
import { Message, init, normalize, update } from './main.ts'
import { renderPage } from './entry.server.ts'
import { PAGES, SECTION_ORDER, navOf, pageAt } from './pages.ts'
import { componentsHitBy, sandboxesFiring } from './reference/graph.ts'
import { buildIndex, indexJson, loadIndex, search } from './search.ts'
import * as Search from './submodels/search.ts'
import {
  MAX_WORDS,
  RECENT_ENTRIES,
  dayOf,
  fallbackEntry,
  problemsIn,
  renderAll,
  renderRecent,
  tidy,
} from '../scripts/changelog.ts'

/* The wiki's contract: every page has one clean path, renders at build time, and can be found. */

test('every page has one path, without a trailing slash', () => {
  const paths = PAGES.map((page) => page.path)
  expect(new Set(paths).size).toBe(paths.length)
  expect(paths.filter((path) => normalize(path) !== path)).toEqual([])
})

/* The build prerenders every path, so this renders the home page and each section's first page and
   reads their links: the layouts and the navigation stay reachable without compiling the corpus. */
const sample = ['/', ...SECTION_ORDER.map((section) => navOf('en', section)[0]?.path ?? '')]

test('the home page and every section render their own page, and every link in them reaches a page', async () => {
  const broken: Array<string> = []
  for (const path of sample) {
    const result = await renderPage(new Request(`https://wiki.playquorum.dev${path}`))
    expect(result._tag, path).toBe('Rendered')
    if (result._tag !== 'Rendered') continue
    expect(result.status, path).toBeUndefined()
    expect(result.application.title, path).toContain(pageAt(path)?.title ?? '')
    for (const [, href] of result.application.html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (href && href !== '/sitemap.xml' && !pageAt(normalize(href)))
        broken.push(`${path} → ${href}`)
    }
  }
  expect(broken).toEqual([])
}, 120_000)

test('every catalog entry has its own page', () => {
  const ids = [
    ...COMPONENT_IDS.map((id) => `/components/${id}`),
    ...researchList.map((entry) => `/research/${entry.id}`),
    ...INCIDENT_IDS.map((id) => `/incidents/${id}`),
    ...RUNTIME_IDS.map((id) => `/runtimes/${id}`),
    ...FRAMEWORK_IDS.map((id) => `/frameworks/${id}`),
    ...GLOSSARY.map((entry) => `/glossary/${entry.id}`),
    ...CVE_TERMS.map((entry) => `/glossary/${entry.id}`),
    ...SANDBOX_IDS.map((id) => `/sandboxes/${id}`),
  ]
  expect(ids.filter((path) => !pageAt(path))).toEqual([])
  expect(PAGES.filter((page) => page.parent === '/eras')).toHaveLength(ERAS.length)
})

test('every prose file belongs to a page', () => {
  expect(prosePaths.filter((path) => !pageAt(path))).toEqual([])
})

test('a path with no page renders the 404 page with a 404 status', async () => {
  const result = await renderPage(new Request('https://wiki.playquorum.dev/no/such/page'))
  expect(result._tag === 'Rendered' && result.status).toBe(404)
})

test('a trailing slash reaches the same page', async () => {
  const result = await renderPage(new Request('https://wiki.playquorum.dev/about/contributing/'))
  expect(result._tag === 'Rendered' && result.status).toBeUndefined()
})

test('search ranks a title match first, finds aliases, and survives a typo', () => {
  const index = buildIndex(PAGES)
  expect(search(index, 'improve the wiki')[0]?.path).toBe('/about/contributing')
  expect(search(index, 'github').map((hit) => hit.path)).toContain('/about/contributing')
  expect(search(index, 'lb')[0]?.path).toBe('/components/lb')
  expect(search(index, 'kubernets')[0]?.path).toBe('/components/cluster')
  expect(search(index, 'zzzz')).toEqual([])
  // stemming, a name over a long body, and a Component over its guides
  expect(search(index, 'caching')[0]?.path).toBe('/components/cache')
  expect(search(index, 'pooler')[0]?.path).toBe('/components/pooler')
  expect(search(index, 'contributing')[0]?.path).toBe('/about/contributing')
  expect(search(index, 'k8s').map((hit) => hit.path)).toEqual(['/components/cluster'])
})

test('the built search index loads the way the browser loads it', () => {
  const loaded = loadIndex(indexJson(PAGES))
  expect(search(loaded, 'lb')[0]?.path).toBe('/components/lb')
  expect(search(loaded, 'kubernets')[0]?.path).toBe('/components/cluster')
})

test('the play section comes first and its pages follow their order', () => {
  expect(SECTION_ORDER[0]).toBe('play')
  const orders = navOf('en', 'play').map((page) => page.order)
  expect(orders).toEqual([...orders].sort((a, b) => a - b))
  expect(PAGES.filter((page) => page.section === 'play' && page.era !== null)).toEqual([])
})

test('an incident page names the Components that teach it and the Sandboxes that fire it', () => {
  expect(componentsHitBy('stampede')).toEqual(['cache'])
  expect(sandboxesFiring('stampede')).toEqual(['stampede'])
})

test('the arrow keys wrap around the search results', () => {
  const at = (active: number, delta: number) =>
    Search.update(
      { locale: 'en', query: 'cache', open: true, active, status: 'ready' },
      Search.Message.Moved({ delta, count: 3 }),
    ).model.active
  expect([at(2, 1), at(0, -1), at(0, 1)]).toEqual([0, 2, 1])
})

test('the changelog shows the latest entries on the short page and every entry on the full one', () => {
  expect(dayOf('2026-11-08T23:59:00+00:00')).toBe('2026-11-08')
  expect(dayOf('2026-11-09T03:00:00+07:00')).toBe('2026-11-08')
  const entries = Array.from({ length: RECENT_ENTRIES + 2 }, (_, n) => ({
    day: `2026-11-${String(n + 1).padStart(2, '0')}`,
    body: `Change ${n + 1}.`,
  })).sort((a, b) => b.day.localeCompare(a.day))
  const recent = renderRecent(entries)
  expect(recent.indexOf('Monday, 9 November 2026')).toBeLessThan(
    recent.indexOf('Sunday, 8 November 2026'),
  )
  expect(recent).toContain('Change 9.')
  expect(recent).not.toContain('Change 1.')
  expect(renderAll(entries)).toContain('Change 1.')
})

test('a changelog entry keeps to the Keep a Changelog sections and the day’s commits', () => {
  const commit = (hash: string): { hash: string; date: string; subject: string; body: string } => ({
    hash,
    date: '2026-11-08T10:00:00Z',
    subject: 'A change',
    body: '',
  })
  const day = [commit('a'.repeat(40))]
  const linked = `- A change. ([aaaaaaa](https://github.com/elianiva/quorum/commit/${'a'.repeat(40)}))`
  const entry = `### Added\n\n${linked}\n`
  const bare = `### Added\n\n- A change. [${'a'.repeat(40)}]`
  expect(problemsIn(entry, day)).toEqual([])
  expect(tidy(bare, day)).toBe(
    `### Added\n\n- A change. [aaaaaaa](https://github.com/elianiva/quorum/commit/${'a'.repeat(40)})`,
  )
  expect(tidy('full\u2011height', day)).toBe('full-height')
  expect(tidy('a **bold** word', day)).toBe('a bold word')
  expect(tidy(`### Added\n\n- A change. (${'a'.repeat(40)})`, day)).toBe(
    `### Added\n\n- A change. ([aaaaaaa](https://github.com/elianiva/quorum/commit/${'a'.repeat(40)}))`,
  )
  expect(problemsIn('### Added\n\n- A change.', day)).toContain('the entry links no commit')
  expect(problemsIn(`### Added\n\n${linked}\n- No link here.`, day)).toContainEqual(
    expect.stringContaining('a bullet links no commit'),
  )
  expect(problemsIn('### Added\n\n- The player can move. (link)', day)).toContain(
    'the entry talks about "the player"; address the reader as "you"',
  )
  expect(problemsIn('## A change', day)).toContain(
    'the entry uses a heading other than a ### Keep a Changelog section',
  )
  expect(problemsIn('### Misc\n\n- A change.', day)).toContain(
    '"Misc" is not one of Added, Changed, Deprecated, Removed, Fixed, or Security',
  )
  expect(problemsIn('### Added\n\nA change.', day)).toContain(
    'the Added section is not a bullet list',
  )
  expect(problemsIn(entry.replace('a'.repeat(40), 'b'.repeat(40)), day)).toContain(
    "the entry links bbbbbbb, which is not one of the day's commits",
  )
  expect(problemsIn(`### Added\n\n${'word '.repeat(MAX_WORDS + 1)}`, day)).toContainEqual(
    expect.stringContaining(`the limit is ${MAX_WORDS}`),
  )
})

test('the fallback entry links the day’s commits', () => {
  const hash = 'a'.repeat(40)
  const entry = fallbackEntry([
    { hash, date: '2026-11-08T10:00:00Z', subject: 'A change', body: '' },
  ])
  expect(entry).toBe(
    `### Changed\n\n- A change ([aaaaaaa](https://github.com/elianiva/quorum/commit/${hash}))`,
  )
})

const urlOf = (pathname: string, hash = ''): Url => ({
  protocol: 'https:',
  host: 'wiki.playquorum.dev',
  port: Option.none(),
  pathname,
  search: Option.none(),
  hash: hash === '' ? Option.none() : Option.some(hash),
})

test('a heading link keeps the drawer, the hubs and the search; a page link resets them', () => {
  const model = {
    ...init(urlOf('/play/move-and-select')).model,
    menu: true,
    navToggled: ['/eras'],
    search: { ...Search.init('en'), query: 'retry', open: true },
  }
  const scrolled = update(
    model,
    Message.ChangedUrl({ url: urlOf('/play/move-and-select', 'sell') }),
  )
  expect(scrolled.model).toMatchObject({
    path: '/play/move-and-select',
    menu: true,
    navToggled: ['/eras'],
    search: { query: 'retry', open: true },
  })
  const moved = update(model, Message.ChangedUrl({ url: urlOf('/play/wire-nodes') }))
  expect(moved.model).toMatchObject({
    path: '/play/wire-nodes',
    menu: false,
    navToggled: [],
    search: { query: '', open: false },
  })
})
