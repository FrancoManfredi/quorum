/* CVEs (GDD 18): vulnerabilities in software a Design runs. All fictional. */

import { COMPONENTS, type ComponentId } from './components.ts'
import type { GlossaryEntry } from './glossary.ts'

export type CveDef = Readonly<{
  id: string
  /** 1 to 10. A higher score means a smaller window and a bigger patch. */
  score: number
  /** The Components that run the affected software. A Design without one is not exposed. */
  affects: ReadonlyArray<ComponentId>
}>

export const CVE_DEFS: ReadonlyArray<CveDef> = [
  { id: 'CVE-2026-1337', score: 9.8, affects: ['lb', 'cdn', 'waf'] },
  { id: 'CVE-2026-0451', score: 7.5, affects: ['server'] },
  { id: 'CVE-2026-2718', score: 8.1, affects: ['database'] },
  { id: 'CVE-2026-0042', score: 5.3, affects: ['server', 'worker'] },
  { id: 'CVE-2026-3141', score: 7.5, affects: ['server'] },
  { id: 'CVE-2026-1024', score: 9.9, affects: ['server', 'worker'] },
]

/**
 * A fake advisory's backdoor (18 "Spam and phishing"): sim seconds from the click until the
 * attacker uses it and a Data breach starts. Dependency scanning stops the dropper, and a Security
 * team finds the backdoor in half the time.
 */
export const BACKDOOR_FUSE = 300
/** Share of a Study's Insight a vendor's demo takes off (18 "Spam and phishing"). */
export const VENDOR_DISCOUNT = 0.2

export const CVE_EVERY = 420
/** Sim seconds a patch ticket can stay overdue before the CVE is exploited. */
export const PATCH_GRACE = 60
/** The Dev Hours a patch takes: 2 for a low score, 5 for a critical one. */
export const patchCost = (score: number): number => Math.max(2, Math.round(score / 2))
/** Sim seconds from disclosure to the deadline: 3.5 minutes for a 9.9, 6.5 for a 5.3. */
export const patchWindow = (score: number): number => Math.round(600 - 40 * score)

/** The glossary's id for an advisory: CVE-2026-0451 is `cve-2026-0451`. */
export const cveTermId = (id: string): string => `cve-${id.replace(/^cve-/i, '').toLowerCase()}`

/**
 * Every CVE the Simulation can disclose, as a glossary entry: the id, what it affects,
 * and the patch ticket it files. These are the ids a real advisory names, so a player
 * can look one up on the wiki and see the ones the Design can run.
 */
export const CVE_TERMS: ReadonlyArray<GlossaryEntry> = CVE_DEFS.map((def) => ({
  id: cveTermId(def.id),
  term: def.id,
  category: 'security',
  definition: `Score ${def.score} of 10. Affects ${def.affects
    .map((id) => COMPONENTS[id].name)
    .join(', ')}.`,
  inGame: `Security mail names it and files a patch ticket: ${patchCost(def.score)} DH, due ${Math.round(
    patchWindow(def.score) / 60,
  )} minutes after disclosure. Overdue, it turns red on the Team backlog, and a minute later it is exploited.`,
  related: ['dependency-scanning'],
  links: [],
}))
