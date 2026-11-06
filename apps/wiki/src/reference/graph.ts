import {
  COMPONENTS,
  COMPONENT_IDS,
  researchList,
  type ComponentId,
  type IncidentId,
  type ResearchId,
} from '@quorum/simulation/catalog'
import { GUIDED, SANDBOX_IDS, type SandboxId } from '@quorum/simulation/sandbox'
import { linksFrom } from '../content.ts'

/* ==========================================================================
   Which pages point at which. The catalog does not say which Component an
   incident hits, but every Component page teaches its incidents with a link,
   so those links are the source: a link from /components/cache to
   /incidents/stampede means Cache can be hit by it. Sandboxes come from the
   objectives that fire an incident, and from the Sandboxes a page places.
   ========================================================================== */

const componentLinks = new Map(COMPONENT_IDS.map((id) => [id, linksFrom(`/components/${id}`)]))

/** The Components whose page teaches this incident. */
export const componentsHitBy = (incident: IncidentId): ReadonlyArray<ComponentId> =>
  COMPONENT_IDS.filter((id) => componentLinks.get(id)?.paths.has(`/incidents/${incident}`))

/** The incidents a Component's page teaches. */
export const incidentsOn = (component: ComponentId): ReadonlyArray<string> =>
  [...(componentLinks.get(component)?.paths ?? [])]
    .filter((path) => path.startsWith('/incidents/') && path !== '/incidents')
    .map((path) => path.slice('/incidents/'.length))

/** The guided Sandboxes that fire this incident. */
export const sandboxesFiring = (incident: IncidentId): ReadonlyArray<SandboxId> =>
  SANDBOX_IDS.filter((id) =>
    GUIDED[id].objectives.some((objective) => objective.incident?.kind === incident),
  )

/** The Components whose page places this Sandbox. */
export const componentsPlacing = (sandbox: SandboxId): ReadonlyArray<ComponentId> =>
  COMPONENT_IDS.filter((id) => componentLinks.get(id)?.sandboxes.has(sandbox))

/** Components named in this Component's page, or naming it in theirs. Not itself. */
export const worksWith = (component: ComponentId): ReadonlyArray<ComponentId> =>
  COMPONENT_IDS.filter(
    (id) =>
      id !== component &&
      (componentLinks.get(component)?.paths.has(`/components/${id}`) ||
        componentLinks.get(id)?.paths.has(`/components/${component}`)),
  )

/** Research that builds on the Research which unlocks this Component: what to learn after placing it. */
export const researchNext = (component: ComponentId): ReadonlyArray<ResearchId> => {
  const unlock = COMPONENTS[component].unlock
  return unlock
    ? researchList.filter((entry) => entry.requires.includes(unlock)).map((entry) => entry.id)
    : []
}
