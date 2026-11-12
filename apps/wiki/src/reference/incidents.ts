import type { Html } from 'foldkit/html'
import { cn } from 'cn'
import { INCIDENT_IDS, type IncidentDef } from '@quorum/simulation/catalog'
import { BY_INCIDENT } from '@quorum/simulation/term-links'
import { FIGURE } from '@quorum/ui/game/bits'
import { duration } from '@quorum/ui/game/format'
import type { Page } from '../page.ts'
import { componentList } from './components.ts'
import { componentsHitBy, sandboxesFiring } from './graph.ts'
import {
  authored,
  eraName,
  eraPath,
  factsBox,
  headingsFor,
  link,
  linkList,
  page,
  paragraph,
  researchLink,
  section,
  table,
  termsSection,
  type H,
  type Lang,
} from './shared.ts'

/* One page per incident, and a hub that lists them by Era. */

export const incidentPath = (id: IncidentDef['id']): string => `/incidents/${id}`

/** The failure page that shows this incident's shape in a real system. */
const PRODUCTION: Partial<Record<IncidentDef['id'], string>> = {
  config: '/patterns/one-control-plane-73-hours',
  'disk-full': '/patterns/one-command-removed-the-index',
  regex: '/patterns/canary-the-edge-rules',
}

const SEVERITY_CLASS: Record<1 | 2 | 3, string> = {
  1: 'bg-danger text-white',
  2: 'bg-warn text-white',
  3: 'bg-foreground/10 text-foreground',
}

/** SEV1 is the worst, as in a real on-call rotation. */
export const severityChip = (severity: 1 | 2 | 3, h: H): Html =>
  h.span(
    [
      h.Class(
        cn(
          FIGURE,
          'inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
          SEVERITY_CLASS[severity],
        ),
      ),
    ],
    [`SEV${severity}`],
  )

const entity = (l: Lang, def: IncidentDef): Page => {
  const t = l.t.reference.incidents
  const path = incidentPath(def.id)
  const text = authored(l, path)
  const hits = componentsHitBy(def.id)
  const practice = sandboxesFiring(def.id)
  const productionPath = PRODUCTION[def.id]
  const production = productionPath ? t.production[def.id as keyof typeof t.production] : null
  return page(l, {
    path,
    title: def.name,
    summary: def.cause,
    parent: '/incidents',
    order: INCIDENT_IDS.indexOf(def.id),
    era: def.era,
    aliases: [def.id, ...t.entityAliases],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        l.title('whatHappens'),
        production ? l.title('seenInProduction') : null,
        l.title('howToPrevent'),
        hits.length ? l.title('componentsItHits') : null,
        practice.length ? l.title('practiceIt') : null,
        BY_INCIDENT[def.id]?.length ? l.title('engineeringTerms') : null,
      ]),
    ],
    text: `${def.cause} ${def.prevention} ${text.text} ${production?.label ?? ''}`,
    aside: (_model, h) =>
      factsBox(
        l,
        def.name,
        severityChip(def.severity, h),
        null,
        [
          { name: t.firstEra, value: link(eraPath(def.era), eraName(l, def.era), h) },
          { name: t.startsAt, value: `SEV${def.severity}` },
          {
            name: t.escalatesTo,
            value: def.escalatesTo === def.severity ? '—' : `SEV${def.escalatesTo}`,
          },
          { name: t.lasts, value: duration(def.duration) },
        ],
        h,
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          section(l.title('whatHappens'), [paragraph(def.cause, h)], h),
          ...(text.view ? [text.view(model, h)] : []),
          ...(production && productionPath
            ? [
                section(
                  l.title('seenInProduction'),
                  [
                    h.p(
                      [],
                      [
                        production.sentence,
                        ' ',
                        link(productionPath, production.label, h),
                        t.shapeAndLimit,
                      ],
                    ),
                  ],
                  h,
                ),
              ]
            : []),
          section(
            l.title('howToPrevent'),
            [
              paragraph(def.prevention, h),
              ...(def.actions.length
                ? [
                    h.p([], [t.postmortem]),
                    h.ol(
                      [],
                      def.actions.map((id) => h.li([h.Key(id)], [researchLink(l, id, h)])),
                    ),
                  ]
                : []),
            ],
            h,
          ),
          hits.length
            ? section(l.title('componentsItHits'), [componentList(l, hits, h)], h)
            : h.empty,
          practice.length
            ? section(
                l.title('practiceIt'),
                [
                  h.p(
                    [],
                    [
                      linkList(
                        practice.map((id) => link(`/sandboxes/${id}`, l.cat.GUIDED[id].name, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          termsSection(l, BY_INCIDENT[def.id], h),
        ],
      ),
    related: ['/incidents', '/mechanics/incidents'],
  })
}

export const incidentPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.incidents
  const incidents = l.cat.INCIDENTS
  const entities = INCIDENT_IDS.map((id) => entity(l, incidents[id]))
  const hub = page(l, {
    path: '/incidents',
    title: t.title,
    summary: t.summary,
    order: 5,
    aliases: t.aliases,
    headings: headingsFor([l.title('allIncidents')]),
    text: entities.map((entry) => entry.title).join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          section(
            l.title('allIncidents'),
            [
              table(
                t.columns,
                [...INCIDENT_IDS]
                  .sort((a, b) => incidents[a].era - incidents[b].era)
                  .map((id) => {
                    const def = incidents[id]
                    return {
                      key: id,
                      cells: [
                        link(incidentPath(id), def.name, h),
                        // "Pre-seed" must not break at its hyphen in the narrow table.
                        h.span([h.Class('whitespace-nowrap')], [eraName(l, def.era)]),
                        severityChip(def.severity, h),
                        def.actions[0] ? researchLink(l, def.actions[0], h) : '—',
                      ],
                    }
                  }),
                h,
              ),
            ],
            h,
          ),
        ],
      ),
  })
  return [hub, ...entities]
}
