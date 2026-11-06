import { markdown } from '@foldkit/markdown/vite'
import { foldkit } from '@foldkit/vite-plugin'
import { defineConfig } from 'vitest/config'
import { simVersion } from '../../packages/simulation/sim-version.ts'
import { Frontmatter } from './src/frontmatter.ts'
import { islandAttributes } from './src/islands.ts'

// Tests compile Markdown exactly as the build does.
export default defineConfig({
  plugins: [
    foldkit(),
    simVersion(),
    markdown({ frontmatter: Frontmatter, islands: islandAttributes }),
  ],
  resolve: { dedupe: ['effect', 'foldkit'] },
  // The corpus tests read every page of the wiki, which a CI runner needs more than 5 s for.
  test: { testTimeout: 30_000 },
})
