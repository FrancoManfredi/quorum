import { availableParallelism } from 'node:os'
import { configDefaults, defineConfig } from 'vitest/config'
import { simVersion } from './sim-version.ts'

// `engines/` holds the cross-engine check, which `pnpm test:engines` runs in browsers.
export default defineConfig({
  plugins: [simVersion()],
  test: {
    exclude: [...configDefaults.exclude, 'engines/**'],
    // A loaded CI runner takes longer than the 5 s default on a full Company. Tests that need
    // much more set their own timeout; a real hang still stops at this cap.
    testTimeout: 20_000,
    // The tests are CPU-bound and the main process idles, so use every core, not Vitest's default of one fewer.
    maxWorkers: availableParallelism(),
  },
})
