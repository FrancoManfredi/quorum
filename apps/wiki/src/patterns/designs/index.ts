import type { Design } from '../design.ts'
import { step1 } from './step-1.ts'
import { step2 } from './step-2.ts'
import { step3 } from './step-3.ts'
import { patternsData } from './patterns-data.ts'
import { patternsOps } from './patterns-ops.ts'
import { patternsProduction } from './patterns-production.ts'
import { patternsResilience } from './patterns-resilience.ts'
import { patternsScale } from './patterns-scale.ts'

/** Every Pattern Design by id. A page places one with `::Design{id="split-storage"}`. */
export const DESIGNS: Readonly<Record<string, Design>> = {
  ...step1,
  ...step2,
  ...step3,
  ...patternsScale,
  ...patternsData,
  ...patternsResilience,
  ...patternsOps,
  ...patternsProduction,
}

export const DESIGN_IDS: ReadonlyArray<string> = Object.keys(DESIGNS)
