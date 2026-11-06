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
import { WIKI_ORIGIN } from './src/site.ts'

/* After Foldkit writes the HTML, write llms.txt and a .md twin of every page beside it. The files
   come from the built server entry's `markdownFiles` (src/markdown.ts). */
const markdownTwins = (): Plugin => ({
  name: 'wiki:markdown-twins',
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
      builder.config.logger.info(`  wrote llms.txt and ${Object.keys(files).length - 2} .md pages`)
    },
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
    markdownTwins(),
  ],
  resolve: { dedupe: ['effect', 'foldkit'] },
}))
