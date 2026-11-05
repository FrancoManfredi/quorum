import { defineConfig } from 'vitest/config'
import { simVersion } from '../../packages/simulation/sim-version.ts'

export default defineConfig({ plugins: [simVersion()] })
