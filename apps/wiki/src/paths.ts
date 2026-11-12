import type { Locale } from './i18n/locale.ts'
import type { Messages } from './i18n/messages.ts'
import { navOf, pageIn } from './pages.ts'
import type { Page } from './page.ts'

/* The guided paths: an ordered list of logical page paths, the same in every language. A path's
   title and summary are interface copy (`t.paths`). */

export type PathId = keyof Messages['paths']

export type Path = Readonly<{
  id: PathId
  steps: ReadonlyArray<string>
}>

export const PATHS: ReadonlyArray<Path> = [
  {
    id: 'play',
    steps: navOf('en', 'play').map((page) => page.path),
  },
  {
    id: 'scaling-steps',
    steps: navOf('en', 'patterns')
      .filter((page) => page.group === 'Scaling steps')
      .map((page) => page.path),
  },
  {
    id: 'first-steps',
    steps: [
      '/tutorials/first-company',
      '/tutorials/first-bottleneck',
      '/explanation/requests',
      '/tutorials/first-incident',
      '/tutorials/research-and-insight',
      '/guides/find-the-bottleneck',
    ],
  },
  {
    id: 'read-the-numbers',
    steps: [
      '/explanation/latency',
      '/explanation/queues',
      '/guides/read-p99',
      '/explanation/apdex-and-revenue',
      '/explanation/observability',
    ],
  },
  {
    id: 'scale-up',
    steps: [
      '/explanation/the-data-tier',
      '/guides/scale-the-database',
      '/guides/fix-slow-queries',
      '/guides/survive-a-traffic-spike',
      '/explanation/errors-and-retries',
      '/guides/stop-a-retry-storm',
      '/guides/go-global',
    ],
  },
  {
    id: 'run-the-company',
    steps: [
      '/explanation/money',
      '/guides/cut-the-cloud-bill',
      '/explanation/team-and-velocity',
      '/explanation/progression',
      '/tutorials/first-exit',
      '/explanation/legacy',
      '/guides/prepare-for-an-exit',
    ],
  },
]

export const stepsOf = (locale: Locale, path: Path): ReadonlyArray<Page> =>
  path.steps.flatMap((step) => {
    const page = pageIn(locale, step)
    return page ? [page] : []
  })

/** The first path that holds a page, and the page's index in it. */
export const placeOf = (
  locale: Locale,
  pagePath: string,
): Readonly<{ path: Path; index: number }> | null => {
  for (const path of PATHS) {
    const index = stepsOf(locale, path).findIndex((page) => page.path === pagePath)
    if (index !== -1) return { path, index }
  }
  return null
}

/** The step a reader resumes from: the first one they have not opened. */
export const resumeOf = (
  locale: Locale,
  path: Path,
  visited: ReadonlyArray<string>,
): Page | null => {
  const steps = stepsOf(locale, path)
  return steps.find((page) => !visited.includes(page.path)) ?? null
}
