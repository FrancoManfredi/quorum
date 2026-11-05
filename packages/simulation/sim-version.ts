import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * The Simulation's version is the git tree hash of `src/`: it changes when, and only when, a commit
 * changes the Simulation, so results from different versions are never compared. `SIM_VERSION` in the
 * environment overrides it for builds that run without a git checkout.
 */
const version = (): string =>
  process.env['SIM_VERSION'] ||
  execFileSync('git', ['rev-parse', '--short=8', 'HEAD:packages/simulation/src'], {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    encoding: 'utf8',
  }).trim()

/** A Vite or Rolldown plugin that fills in `__SIM_VERSION__` in `src/version.ts`. */
export const simVersion = () => {
  const value = version()
  return {
    name: 'sim-version',
    transform: (code: string, id: string): string | null =>
      id.endsWith('/simulation/src/version.ts') ? code.replace('__SIM_VERSION__', value) : null,
  }
}
