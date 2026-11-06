import { expect, test } from 'vitest'
import {
  COMPONENT_IDS,
  ERAS,
  FRAMEWORK_IDS,
  GLOSSARY,
  INCIDENT_IDS,
  RUNTIME_IDS,
  researchList,
} from '@quorum/simulation/catalog'
import { SANDBOX_IDS } from '@quorum/simulation/sandbox'
import { prosePaths } from './content.ts'
import { normalize } from './main.ts'
import { renderPage, prerenderPaths } from './entry.server.ts'
import { PAGES, SECTION_ORDER, navOf, pageAt } from './pages.ts'
import { componentsHitBy, sandboxesFiring } from './reference/graph.ts'
import { indexOf, search } from './search.ts'
import * as Search from './submodels/search.ts'
import { PER_DAY, dayOf, renderAll, renderRecent } from '../scripts/changelog.ts'

/* The wiki's contract: every page has one clean path, renders at build time, and can be found. */

test('every page has one path, without a trailing slash', () => {
  const paths = PAGES.map((page) => page.path)
  expect(new Set(paths).size).toBe(paths.length)
  expect(paths.filter((path) => normalize(path) !== path)).toEqual([])
})

test('every prerendered path renders its own page, and every link in it reaches a page', async () => {
  const broken: Array<string> = []
  for (const path of prerenderPaths) {
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

test('search ranks a title match first and finds a page by its alias', () => {
  const index = indexOf(PAGES)
  expect(search(index, 'improve the wiki')[0]?.page.path).toBe('/about/contributing')
  expect(search(index, 'github')[0]?.page.path).toBe('/about/contributing')
  expect(search(index, 'zzzz-no-match')).toEqual([])
})

test('the play section comes first and its pages follow their order', () => {
  expect(SECTION_ORDER[0]).toBe('play')
  const orders = navOf('play').map((page) => page.order)
  expect(orders).toEqual([...orders].sort((a, b) => a - b))
  expect(PAGES.filter((page) => page.section === 'play' && page.era !== null)).toEqual([])
})

test('an incident page names the Components that teach it and the Sandboxes that fire it', () => {
  expect(componentsHitBy('stampede')).toEqual(['cache'])
  expect(sandboxesFiring('stampede')).toEqual(['stampede'])
})

test('the arrow keys wrap around the search results', () => {
  const at = (active: number, delta: number) =>
    Search.update({ query: 'cache', open: true, active }, Search.Message.Moved({ delta, count: 3 }))
      .model.active
  expect([at(2, 1), at(0, -1), at(0, 1)]).toEqual([0, 2, 1])
})

test('the changelog groups commits by UTC day, cuts the short page, and keeps every commit on the full one', () => {
  expect(dayOf('2026-11-08T23:59:00+00:00')).toBe('2026-11-08')
  expect(dayOf('2026-11-09T03:00:00+07:00')).toBe('2026-11-08')
  const commit = (n: number, date: string, subject: string) => ({
    hash: String(n).repeat(40),
    date,
    subject,
  })
  const busy = Array.from({ length: PER_DAY + 2 }, (_, n) =>
    commit(n, '2026-11-08T10:00:00Z', `Busy day change ${n}`),
  )
  const commits = [
    commit(9, '2026-11-09T10:00:00Z', 'Add the Monday thing'),
    commit(8, '2026-11-08T11:00:00Z', 'Merge branch x'),
    ...busy,
  ]
  const recent = renderRecent(commits)
  expect(recent.indexOf('Monday, 9 November 2026')).toBeLessThan(
    recent.indexOf('Sunday, 8 November 2026'),
  )
  expect(recent).not.toContain('Merge branch')
  expect(recent).toContain('Busy day change 0')
  expect(recent).not.toContain(`Busy day change ${PER_DAY}`)
  expect(recent).toContain('(/about/changelog/all#sunday-8-november-2026)')
  expect(renderAll(commits)).toContain(`Busy day change ${PER_DAY + 1}`)
})
