import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { CVE_TERMS, GLOSSARY } from '../src/catalog.ts'

/* The glossary catalog is the one source for the wiki's /glossary pages. */

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
  const terms = [...GLOSSARY, ...CVE_TERMS]
  const ids = new Set(terms.map((entry) => entry.id))
  expect(ids.size).toBe(terms.length)
  for (const entry of terms) {
    expect(entry.id, entry.term).toBe(slug(entry.term))
    expect(entry.definition.length, entry.id).toBeGreaterThan(0)
    expect(entry.inGame.length, entry.id).toBeGreaterThan(0)
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
  // Every engineering term names a source to read next; an advisory is read from its patch ticket.
  for (const entry of GLOSSARY) expect(entry.links.length, entry.id).toBeGreaterThan(0)
})
