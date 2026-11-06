import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { GLOSSARY } from '../src/catalog.ts'
import { newGame } from '../src/company.ts'
import { DISCOVERABLE, discoverTerms } from '../src/discovery.ts'
import { StepEvent } from '../src/events.ts'
import type { Incident } from '../src/state.ts'

const incident: Incident = {
  kind: 'spike',
  remaining: 60,
  nodeId: null,
  startedAt: 0,
  baseline: 0,
  usersAtStart: 0,
  impaired: 0,
  lostRevenue: 0,
  failed: 0,
  signalAt: null,
  ackAt: null,
  severity: 3,
  magnitude: 3,
  zone: null,
  region: null,
  causedBy: null,
}

/* The glossary catalog is the one source for the Glossary panel and the wiki's /glossary pages. */

const designDir = fileURLToPath(new URL('../../../apps/wiki/content/design/', import.meta.url))

const slug = (heading: string): string =>
  heading
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9 -]/g, '')
    .replaceAll(' ', '-')

const anchorsOf = async (page: string): Promise<ReadonlySet<string>> => {
  const text = await readFile(`${designDir}${page}.md`, 'utf8')
  return new Set([...text.matchAll(/^#{2,6} (.+)$/gm)].map(([, heading]) => slug(heading ?? '')))
}

test('every glossary entry is complete and every reference resolves', async () => {
  const ids = new Set(GLOSSARY.map((entry) => entry.id))
  expect(ids.size).toBe(GLOSSARY.length)
  for (const entry of GLOSSARY) {
    expect(entry.id, entry.term).toBe(slug(entry.term))
    expect(entry.definition.length, entry.id).toBeGreaterThan(0)
    expect(entry.inGame.length, entry.id).toBeGreaterThan(0)
    expect(entry.links.length, entry.id).toBeGreaterThan(0)
    for (const link of entry.links) expect(link.url, entry.id).toMatch(/^https:\/\//)
    for (const id of entry.related) {
      expect(ids.has(id) && id !== entry.id, `${entry.id} → ${id}`).toBe(true)
    }
    for (const target of entry.design ?? []) {
      const [, page, anchor] = /^\/design\/([^#]+)#(.+)$/.exec(target.url) ?? []
      expect(page, `${entry.id}: ${target.url}`).toBeTruthy()
      expect((await anchorsOf(page ?? '')).has(anchor ?? ''), `${entry.id}: ${target.url}`).toBe(
        true,
      )
    }
  }
})

test('discovery meets entries from what the Company runs and goes through, never in a Sandbox', () => {
  const game = newGame(7)
  const ids = new Set(GLOSSARY.map((entry) => entry.id))
  const first = discoverTerms(game, [])
  expect(first).toContain('apdex')
  expect(first).not.toContain('cache-aside')
  const cached = {
    ...game,
    nodes: [...game.nodes, { ...game.nodes[1]!, id: 'c', type: 'cache' as const }],
  }
  expect(discoverTerms(cached, [])).toContain('cache-aside')
  const storm = discoverTerms(game, [
    StepEvent.IncidentStarted({ incident: { ...incident, kind: 'retry-storm' } }),
  ])
  expect(storm).toContain('metastable-failure')
  for (const id of storm) expect(ids.has(id)).toBe(true)
  expect(discoverTerms({ ...game, sandbox: true }, [])).toEqual([])
})

test('every discovery id names a glossary entry', () => {
  const ids = new Set(GLOSSARY.map((entry) => entry.id))
  for (const id of DISCOVERABLE) expect(ids.has(id), id).toBe(true)
})
