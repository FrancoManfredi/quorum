import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import { report } from './engines/report.ts'
import { simVersion } from './sim-version.ts'

/** The cross-engine check (`pnpm test:engines`): the same hashes in Chromium, Firefox and WebKit as in Node. */
export default defineConfig({
  plugins: [simVersion()],
  test: {
    include: ['engines/**/*.browser.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      commands: { node: () => report() },
      instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
    },
  },
})
