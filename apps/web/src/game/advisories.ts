import { CVE_DEFS, cveTermId } from '@quorum/simulation/catalog'

/** An advisory prints its CVE id in the subject and the body: CVE-2026-0451. */
const CVE_ID = /CVE-\d{4}-\d{4,}/

/** The CVE id a piece of text names, if it names one. */
export const cveIdIn = (text: string): string | null => CVE_ID.exec(text)?.[0] ?? null

const KNOWN = new Set(CVE_DEFS.map((def) => def.id))

/** True when the wiki glossary lists this id: a fake advisory's id is never here. */
export const glossaryKnowsCve = (id: string): boolean => KNOWN.has(id)

/** The wiki page a letter's CVE id opens, or null when the glossary does not know it. */
export const advisoryTell = (text: string): Readonly<{ id: string; term: string }> | null => {
  const id = cveIdIn(text)
  return id !== null && KNOWN.has(id) ? { id, term: cveTermId(id) } : null
}
