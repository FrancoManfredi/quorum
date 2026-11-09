import { defineConfig } from 'vitest/config'
import { wikiSources } from '../../packages/agent/wiki-sources.ts'
import { simVersion } from '../../packages/simulation/sim-version.ts'

export default defineConfig({ plugins: [simVersion(), wikiSources()] })
