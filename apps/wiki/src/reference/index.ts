import type { Lang } from '../i18n/lang.ts'
import type { Page } from '../page.ts'
import { componentPages } from './components.ts'
import { eraPages } from './eras.ts'
import { glossaryPages } from './glossary.ts'
import { incidentPages } from './incidents.ts'
import { patternsPages } from './patterns.ts'
import { researchPages } from './research.ts'
import { stackPages } from './stacks.ts'
import { systemPages } from './systems.ts'
import { venturePages } from './ventures.ts'

/* Reference pages, generated from the catalog. */

export const referencePages = (l: Lang): ReadonlyArray<Page> => [
  ...componentPages(l),
  ...researchPages(l),
  ...eraPages(l),
  ...stackPages(l),
  ...incidentPages(l),
  ...glossaryPages(l),
  ...patternsPages(l),
  ...systemPages(l),
  ...venturePages(l),
]
