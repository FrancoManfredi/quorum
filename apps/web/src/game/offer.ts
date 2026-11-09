import { RESEARCH, type ResearchId } from '@quorum/simulation/catalog'
import type { Refusal } from '@quorum/simulation/actions'

/** The Research a locked click wanted, and the name of the option that wanted it. */
export type ResearchOffer = Readonly<{ id: ResearchId; what: string }>

/** The catalog entry behind the name a refusal carries. Refusals name their Research, so the UI
 *  reads it back rather than storing an id in the Simulation's prose. */
const named = (name: string): ResearchId | null =>
  (Object.keys(RESEARCH) as Array<ResearchId>).find((id) => RESEARCH[id].name === name) ?? null

/** What a refusal leaves on the board: an offer to study, or nothing when it was not about a Research. */
export const offerOf = (refusal: Refusal): ResearchOffer | null => {
  if (refusal._tag !== 'Locked') return null
  const id = named(refusal.research)
  return id === null ? null : { id, what: refusal.what }
}
