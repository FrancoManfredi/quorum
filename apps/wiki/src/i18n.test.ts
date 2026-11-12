import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { langOf } from './i18n/lang.ts'
import { en } from './i18n/en/index.ts'
import { es } from './i18n/es/index.ts'
import { localeOfPath, stripLocale, withLocale } from './i18n/locale.ts'
import { prerenderPaths, renderDocument, renderPage, sitemap } from './entry.server.ts'
import { PAGES, pageAt, pageIn, pagesFor } from './pages.ts'
import { slug } from './page.ts'
import { buildIndex, search } from './search.ts'
// The Spanish bundle registers its copy and prose when it loads.
import './locales/es.ts'

/* The Spanish wiki's contract. The structure tests read whatever files `content-es/` holds, so a
   translator who drifts from the English page, in its headings, links, islands or frontmatter,
   fails here with the file and the difference. */

const root = fileURLToPath(new URL('..', import.meta.url))
const filesIn = (dir: string): ReadonlyArray<string> =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? filesIn(join(dir, entry.name))
      : entry.name.endsWith('.md')
        ? [join(dir, entry.name)]
        : [],
  )

const read = (file: string): string => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
const spanishFiles = filesIn(join(root, 'content-es')).map((file) =>
  relative(join(root, 'content-es'), file),
)
const englishOf = (name: string): string => join(root, 'content', name)
const spanishOf = (name: string): string => join(root, 'content-es', name)

type Parsed = Readonly<{ frontmatter: Readonly<Record<string, string>>; body: string }>

const parse = (text: string): Parsed => {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  if (!match) return { frontmatter: {}, body: text }
  const frontmatter = Object.fromEntries(
    (match[1] ?? '').split('\n').flatMap((line) => {
      const at = line.indexOf(':')
      return at === -1 ? [] : [[line.slice(0, at).trim(), line.slice(at + 1).trim()]]
    }),
  )
  return { frontmatter, body: match[2] ?? '' }
}

/** The lines of a body that are not inside a code fence. */
const proseLines = (body: string): ReadonlyArray<string> => {
  let fenced = false
  return body.split('\n').filter((line) => {
    if (line.startsWith('```')) {
      fenced = !fenced
      return false
    }
    return !fenced
  })
}

const headingLevels = (body: string): ReadonlyArray<number> =>
  proseLines(body).flatMap((line) => {
    const match = /^(#{1,6}) /.exec(line)
    return match ? [match[1]?.length ?? 0] : []
  })

const linksOf = (body: string): ReadonlyArray<string> =>
  proseLines(body)
    .flatMap((line) => [...line.matchAll(/\]\(([^)\s]+)/g)].map((match) => match[1] ?? ''))
    .sort()

/** An island line: `::Name{key="value" …}` or `:::Name{…}`. */
const islandsOf = (
  body: string,
): ReadonlyArray<Readonly<{ name: string; attributes: Record<string, string> }>> =>
  proseLines(body).flatMap((line) => {
    const match = /^:{2,3}([A-Za-z]+)(?:\{(.*)\})?\s*$/.exec(line)
    if (!match) return []
    const attributes = Object.fromEntries(
      [...(match[2] ?? '').matchAll(/([A-Za-z]+)="((?:[^"\\]|\\.)*)"/g)].map((pair) => [
        pair[1] ?? '',
        pair[2] ?? '',
      ]),
    )
    return [{ name: match[1] ?? '', attributes }]
  })

/** The attributes of an island that a translator writes in Spanish. Every other one is code. */
const TRANSLATED = new Set(['question', 'options', 'explain', 'label', 'title', 'caption', 'text'])

const STRUCTURAL = ['section', 'group', 'order', 'era', 'gdd', 'toc'] as const

const problems = (
  check: (name: string, spanish: Parsed, english: Parsed) => ReadonlyArray<string>,
) =>
  spanishFiles.flatMap((name) => {
    let english: string
    try {
      english = read(englishOf(name))
    } catch {
      return []
    }
    return check(name, parse(read(spanishOf(name))), parse(english)).map(
      (issue) => `${name}: ${issue}`,
    )
  })

test('every Spanish file has an English counterpart at the same path', () => {
  const missing = spanishFiles.filter((name) => {
    try {
      read(englishOf(name))
      return false
    } catch {
      return true
    }
  })
  expect(missing).toEqual([])
})

test('a Spanish file keeps the structural frontmatter of the English file', () => {
  expect(
    problems((_name, spanish, english) =>
      STRUCTURAL.flatMap((key) =>
        spanish.frontmatter[key] === english.frontmatter[key]
          ? []
          : [`${key} is "${spanish.frontmatter[key]}", English has "${english.frontmatter[key]}"`],
      ),
    ),
  ).toEqual([])
})

test('a Spanish file has the same headings at the same levels as the English file', () => {
  expect(
    problems((_name, spanish, english) => {
      const own = headingLevels(spanish.body)
      const source = headingLevels(english.body)
      return own.join('') === source.join('')
        ? []
        : [`heading levels are [${own.join(' ')}], English has [${source.join(' ')}]`]
    }),
  ).toEqual([])
})

test('a Spanish file links the same targets as the English file', () => {
  expect(
    problems((_name, spanish, english) => {
      const own = linksOf(spanish.body)
      const source = linksOf(english.body)
      return own.join('\n') === source.join('\n')
        ? []
        : [
            `links differ: missing ${JSON.stringify(source.filter((url) => !own.includes(url)))}, extra ${JSON.stringify(own.filter((url) => !source.includes(url)))}`,
          ]
    }),
  ).toEqual([])
})

test('a Spanish file places the same islands, and only translates their words', () => {
  expect(
    problems((_name, spanish, english) => {
      const own = islandsOf(spanish.body)
      const source = islandsOf(english.body)
      if (own.length !== source.length)
        return [`has ${own.length} islands, English has ${source.length}`]
      return own.flatMap((island, index) => {
        const twin = source[index]
        if (!twin || island.name !== twin.name)
          return [`island ${index + 1} is ${island.name}, English has ${twin?.name}`]
        const keys = Object.keys(island.attributes).sort().join(',')
        if (keys !== Object.keys(twin.attributes).sort().join(','))
          return [`island ${index + 1} (${island.name}) has attributes [${keys}]`]
        return Object.entries(island.attributes).flatMap(([key, value]) => {
          const original = twin.attributes[key] ?? ''
          if (!TRANSLATED.has(key))
            return value === original ? [] : [`island ${index + 1} changes ${key}`]
          return key === 'options' && value.split('|').length !== original.split('|').length
            ? [`island ${index + 1} has a different number of options`]
            : []
        })
      })
    }),
  ).toEqual([])
})

test('the chrome messages have every key in both languages', () => {
  // A list of aliases may differ in length, since Spanish adds its own words; every other list is a
  // table's columns, so its length must match.
  const shape = (value: unknown, key = ''): unknown =>
    Array.isArray(value) && /aliases/i.test(key)
      ? 'aliases'
      : typeof value === 'object' && value !== null
        ? Object.fromEntries(
            Object.entries(value)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([name, entry]) => [name, shape(entry, name)]),
          )
        : typeof value
  expect(shape(es)).toEqual(shape(en))
})

test('a heading anchor drops accents, and English anchors do not change', () => {
  expect(slug('Cómo funciona')).toBe('como-funciona')
  expect(slug('¿Qué desbloquea?')).toBe('que-desbloquea')
  expect(slug('How it works')).toBe('how-it-works')
  expect(slug('L0: Pulse (1–10 seconds)')).toBe('l0-pulse-110-seconds')
})

test('a URL names its language by the /es prefix, and a path keeps its slug', () => {
  expect(localeOfPath('/es')).toBe('es')
  expect(localeOfPath('/es/glossary/cache-stampede')).toBe('es')
  expect(localeOfPath('/essays')).toBe('en')
  expect(stripLocale('/es')).toBe('/')
  expect(stripLocale('/es/glossary/cache-stampede')).toBe('/glossary/cache-stampede')
  expect(stripLocale('/glossary/cache-stampede')).toBe('/glossary/cache-stampede')
  expect(withLocale('es', '/')).toBe('/es')
  expect(withLocale('es', '/team#features')).toBe('/es/team#features')
  expect(withLocale('en', '/team#features')).toBe('/team#features')
})

const rendered = async (path: string) => {
  const result = await renderPage(new Request(`https://wiki.playquorum.dev${path}`))
  if (result._tag !== 'Rendered') throw new Error(`${path} did not render`)
  return result
}

test('/es renders a Spanish page with the catalog words in Spanish', async () => {
  const term = langOf('es').cat.GLOSSARY.find((entry) => entry.id === 'cache-stampede')
  expect(term?.term).toBeTruthy()
  expect(term?.term).not.toBe(
    langOf('en').cat.GLOSSARY.find((entry) => entry.id === 'cache-stampede')?.term,
  )
  const result = await rendered('/es/glossary/cache-stampede')
  expect(result.status).toBeUndefined()
  expect(result.application.lang).toBe('es')
  expect(result.application.html).toContain(term?.term ?? '')
  expect(result.application.title).toContain(term?.term ?? '')
  const english = await rendered('/glossary/cache-stampede')
  expect(english.application.lang).toBe('en')
  expect(pageAt('/es/glossary/cache-stampede')?.locale).toBe('es')
  expect(pageAt('/glossary/cache-stampede')?.locale).toBe('en')
  expect((await rendered('/es/no/such/page')).status).toBe(404)
})

test('every internal link on a Spanish page points into /es', async () => {
  const stray: Array<string> = []
  for (const path of ['/es', '/es/components/lb', '/es/glossary/cache-stampede', '/es/patterns']) {
    const { application } = await rendered(path)
    for (const [, href] of application.html.matchAll(/href="(\/[^"]*)"/g)) {
      const target = href ?? ''
      // The switcher points at the other language, and a file is not a page.
      if (
        !target.startsWith('/es') &&
        !/\.[a-z0-9]+$/i.test(target.split('#')[0] ?? '') &&
        target !== (path.slice(3) || '/')
      )
        stray.push(`${path} → ${target}`)
    }
  }
  expect(stray).toEqual([])
})

const translated = spanishFiles.find(
  (name) => parse(read(spanishOf(name))).frontmatter['title'] !== undefined,
)

/** The logical path a content file serves: `about/contributing.md` is `/about/contributing`. */
const pathOfFile = (name: string): string => {
  const bare = name.split('\\').join('/').replace(/\.md$/, '')
  return bare === 'index' ? '/' : `/${bare.replace(/\/index$/, '')}`
}

test('a Spanish file replaces its page, and a page without one shows the English text with a notice', async () => {
  const notice = langOf('es').t.article.untranslated
  if (translated) {
    const path = pathOfFile(translated)
    const own = pageIn('es', path)
    expect(own?.title).toBe(parse(read(spanishOf(translated))).frontmatter['title'])
    expect(own?.fallback).toBe(false)
    expect(own?.source).toContain('content-es/')
    expect(pageIn('en', path)?.title).not.toBe(own?.title)
  }
  // The design record stays English (ADR 0014).
  const design = pageIn('es', '/design')
  expect(design?.fallback).toBe(true)
  expect(design?.title).toBe(pageIn('en', '/design')?.title)
  const { application } = await rendered('/es/design')
  expect(application.html).toContain(notice)
  expect((await rendered('/design')).application.html).not.toContain(notice)
})

test('a heading keeps its English id on a Spanish page, in the table of contents and in the text', async () => {
  const different = pagesFor('es').flatMap((page) => {
    const twin = pageIn('en', page.path)
    const own = page.headings.map((heading) => heading.id).join(' ')
    const source = twin?.headings.map((heading) => heading.id).join(' ')
    return own === source ? [] : [`${page.path}: [${own}] is not [${source}]`]
  })
  expect(different).toEqual([])
  if (!translated) return
  const path = pathOfFile(translated)
  const ids = (html: string) => [...html.matchAll(/<h[23] id="([^"]+)"/g)].map((match) => match[1])
  const spanish = ids((await rendered(withLocale('es', path))).application.html)
  const english = ids((await rendered(path)).application.html)
  expect(spanish).toEqual(english)
})

test('every page is prerendered in both languages, and the sitemap lists both with their alternates', () => {
  expect(prerenderPaths).toContain('/es')
  expect(prerenderPaths).toContain('/es/glossary/cache-stampede')
  expect(prerenderPaths).toContain('/glossary/cache-stampede')
  expect(prerenderPaths).toHaveLength(PAGES.length * 2)
  const map = sitemap(() => null)
  expect(map).toContain('<loc>https://wiki.playquorum.dev/glossary/cache-stampede</loc>')
  expect(map).toContain('<loc>https://wiki.playquorum.dev/es/glossary/cache-stampede</loc>')
  expect(map).toContain(
    'hreflang="es" href="https://wiki.playquorum.dev/es/glossary/cache-stampede"',
  )
})

test('the head names the language, the alternates and the default', async () => {
  const assets = { entryScript: '/entry.js', stylesheets: [], modulePreloads: [] }
  const spanish = renderDocument(
    (await rendered('/es/glossary/cache-stampede')).application,
    assets,
  )
  expect(spanish).toContain('<html lang="es"')
  expect(spanish).toContain('property="og:locale" content="es_ES"')
  expect(spanish).toContain('"inLanguage":"es"')
  expect(spanish).toContain(
    'hreflang="en" href="https://wiki.playquorum.dev/glossary/cache-stampede"',
  )
  expect(spanish).toContain(
    'hreflang="es" href="https://wiki.playquorum.dev/es/glossary/cache-stampede"',
  )
  expect(spanish).toContain(
    'hreflang="x-default" href="https://wiki.playquorum.dev/glossary/cache-stampede"',
  )
  expect(spanish).not.toContain('type="text/markdown"')
  const english = renderDocument((await rendered('/glossary/cache-stampede')).application, assets)
  expect(english).toContain('<html lang="en"')
  expect(english).toContain('property="og:locale" content="en_US"')
  expect(english).toContain('type="text/markdown"')
  const missing = renderDocument((await rendered('/es/no/such/page')).application, assets)
  expect(missing).toContain('<html lang="es"')
  expect(missing).toContain('<meta name="robots" content="noindex">')
  expect(missing).toContain('property="og:locale" content="es_ES"')
  expect(missing).toContain(`content="${escapeHtml(es.site.description)}"`)
})

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

test('the Spanish search index finds a page by its Spanish title, with or without accents', () => {
  const index = buildIndex(pagesFor('es'), 'es')
  const term = langOf('es').cat.GLOSSARY.find((entry) => entry.id === 'cache-stampede')?.term ?? ''
  const plain = term.normalize('NFD').replace(/[̀-ͯ]/g, '')
  expect(search(index, term, 'es').map((hit) => hit.path)).toContain('/glossary/cache-stampede')
  expect(search(index, plain, 'es').map((hit) => hit.path)).toContain('/glossary/cache-stampede')
  expect(search(index, 'zzzz', 'es')).toEqual([])
})
