import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { markdown } from '@foldkit/markdown/vite'
import { foldkit } from '@foldkit/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { simVersion } from '../../packages/simulation/sim-version.ts'
import { Frontmatter } from './src/frontmatter.ts'
import { islandAttributes } from './src/islands.ts'
import type { Locale } from './src/i18n/locale.ts'
import type { Page } from './src/page.ts'
import { WIKI_ORIGIN } from './src/site.ts'

/** The day each file in the repository last changed, from one pass over the git history. A
    shallow clone gives wrong dates, so the deploy fetches the full history (ci.yml). */
const lastChanged = (): Map<string, string> => {
  const dates = new Map<string, string>()
  let day = ''
  const log = execFileSync('git', ['log', '--format=%x00%cs', '--name-only'], {
    cwd: resolve(import.meta.dirname, '../..'),
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  for (const line of log.split('\n')) {
    if (line.startsWith('\0')) day = line.slice(1)
    else if (line !== '' && !dates.has(line)) dates.set(line, day)
  }
  return dates
}

/* After Foldkit writes the HTML, write llms.txt, a .md twin of every page, the sitemap, and the
   search index of each language beside them. The files come from the built server entry
   (src/markdown.ts, src/entry.server.ts). The Markdown files are English. */
const staticFiles = (): Plugin => ({
  name: 'wiki:static-files',
  apply: 'build',
  buildApp: {
    order: 'post',
    async handler(builder) {
      const output = (name: string) => {
        const config = builder.environments[name]?.config
        if (!config) throw new Error(`the build has no "${name}" environment`)
        return resolve(config.root, config.build.outDir)
      }
      const client = output('client')
      const server = output('ssr')
      const manifest = JSON.parse(await readFile(resolve(server, 'foldkit.build.json'), 'utf8'))
      const entry = await import(pathToFileURL(resolve(server, manifest.serverEntry)).href)
      const files: Record<string, string> = entry.markdownFiles()
      for (const [name, text] of Object.entries(files)) {
        await mkdir(dirname(resolve(client, name)), { recursive: true })
        await writeFile(resolve(client, name), text)
      }
      const indexes: Record<string, string> = entry.searchIndexes()
      for (const [name, json] of Object.entries(indexes)) {
        await mkdir(dirname(resolve(client, name)), { recursive: true })
        await writeFile(resolve(client, name), json)
      }
      const dates = lastChanged()
      await writeFile(
        resolve(client, 'sitemap.xml'),
        entry.sitemap((source: string) => dates.get(source) ?? null),
      )
      builder.config.logger.info(
        `  wrote llms.txt, sitemap.xml, ${Object.keys(indexes).length} search indexes, and ${Object.keys(files).length - 2} .md pages`,
      )
    },
  },
})

/* The dev server builds the same indexes on demand, so search works without a build. */
const INDEX_LOCALES: Readonly<Record<string, Locale>> = {
  '/search-index.json': 'en',
  '/es/search-index.json': 'es',
}

const searchIndexDev = (): Plugin => ({
  name: 'wiki:search-index-dev',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const locale = INDEX_LOCALES[(request.url ?? '').split('?')[0] ?? '']
      if (locale === undefined) return next()
      void (async () => {
        // The Spanish bundle registers its copy and prose when it loads.
        await server.ssrLoadModule('/src/locales/es.ts')
        const { pagesFor } = (await server.ssrLoadModule('/src/pages.ts')) as {
          pagesFor: (locale: Locale) => ReadonlyArray<Page>
        }
        const { indexJson } = (await server.ssrLoadModule('/src/search.ts')) as {
          indexJson: (pages: ReadonlyArray<Page>, locale: Locale) => string
        }
        response.setHeader('content-type', 'application/json')
        response.setHeader('cache-control', 'no-store')
        response.end(indexJson(pagesFor(locale), locale))
      })().catch(next)
    })
  },
})

/* Every page is rendered at build time from src/entry.server.ts and hydrated by src/entry.ts
   (ADR 0009). Markdown in content/ compiles to data, validated against the frontmatter and
   island schemas, so a bad page fails the build. */
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    simVersion(),
    foldkit({
      // A dev server restart would otherwise mint a new build id while the browser still holds the
      // cached dependency with the old one, and hydration refuses the page. Builds stay unique.
      ...(command === 'serve' ? { buildId: 'development' } : {}),
      ssr: {
        serverEntry: '/src/entry.server.ts',
        clientEntry: '/src/entry.ts',
        build: { prerender: { origin: WIKI_ORIGIN } },
      },
    }),
    markdown({ frontmatter: Frontmatter, islands: islandAttributes }),
    staticFiles(),
    searchIndexDev(),
  ],
  resolve: { dedupe: ['effect', 'foldkit'] },
}))
