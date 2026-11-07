import type { Design } from '../design.ts'
import { ladder1 } from './ladder-1.ts'
import { ladder2 } from './ladder-2.ts'
import { ladder3 } from './ladder-3.ts'
import { patternsData } from './patterns-data.ts'
import { patternsOps } from './patterns-ops.ts'
import { patternsResilience } from './patterns-resilience.ts'
import { patternsScale } from './patterns-scale.ts'

/** Every Pattern Design by id. A page places one with `::Design{id="split-storage"}`. */
export const DESIGNS: Readonly<Record<string, Design>> = {
  ...ladder1,
  ...ladder2,
  ...ladder3,
  ...patternsScale,
  ...patternsData,
  ...patternsResilience,
  ...patternsOps,
}

export const DESIGN_IDS: ReadonlyArray<string> = Object.keys(DESIGNS)
