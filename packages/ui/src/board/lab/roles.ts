import { CLEARANCE, type Pt } from '../geometry.ts'
import { tidy } from '../tidy.ts'
import type { LabLink, LabNode } from './measure.ts'

/*
 * The role-column Tidy with the lab's knobs. The shipped `tidy` is the source of
 * truth; this wrapper only exposes the clearance and height cap for comparisons.
 */
export const roleLayout = (
  nodes: ReadonlyArray<LabNode>,
  links: ReadonlyArray<LabLink>,
  clearance: number = CLEARANCE,
  maxHeight: number = 3000,
): ReadonlyMap<string, Pt> => tidy(nodes, links, ['all', 'a', 'b', 'c'], { clearance, maxHeight })
