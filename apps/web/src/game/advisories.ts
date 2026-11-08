import {
  COMPONENTS,
  CVE_DEFS,
  patchCost,
  patchWindow,
  type CveDef,
  type GlossaryEntry,
} from '@quorum/simulation/catalog'

/** An advisory prints its CVE id in the subject and the body: CVE-2026-0451. */
const CVE_ID = /CVE-\d{4}-\d{4,}/

/** The CVE id a piece of text names, if it names one. */
export const cveIdIn = (text: string): string | null => CVE_ID.exec(text)?.[0] ?? null

/** The Glossary's id for an advisory: CVE-2026-0451 is `cve-2026-0451`. */
export const cveTermId = (id: string): string => `cve-${id.replace(/^cve-/i, '').toLowerCase()}`

const componentsOf = (def: CveDef): string =>
  def.affects.map((id) => COMPONENTS[id].name).join(', ')

const minutes = (score: number): number => Math.round(patchWindow(score) / 60)

/**
 * Every CVE the Simulation can disclose, as a Glossary entry: the id, what it
 * affects, and the patch ticket it files. These are the ids a real advisory
 * names, so a player can look one up and see the ones the Design can run.
 */
export const CVE_TERMS: ReadonlyArray<GlossaryEntry> = CVE_DEFS.map((def) => ({
  id: cveTermId(def.id),
  term: def.id,
  category: 'security',
  definition: `Score ${def.score} of 10. Affects ${componentsOf(def)}.`,
  inGame: `Security mail names it and files a patch ticket: ${patchCost(def.score)} DH, due ${minutes(def.score)} minutes after disclosure. Overdue, it turns red on the Team backlog, and a minute later it is exploited.`,
  related: ['dependency-scanning'],
  links: [],
}))

const KNOWN = new Set(CVE_DEFS.map((def) => def.id))

/** True when the Glossary lists this id: a fake advisory's id is never here. */
export const glossaryKnowsCve = (id: string): boolean => KNOWN.has(id)

/** The Glossary entry a letter's CVE id opens, or null when the Glossary does not know it. */
export const advisoryTell = (text: string): Readonly<{ id: string; term: string }> | null => {
  const id = cveIdIn(text)
  return id !== null && KNOWN.has(id) ? { id, term: cveTermId(id) } : null
}
