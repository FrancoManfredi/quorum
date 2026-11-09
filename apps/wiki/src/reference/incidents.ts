import type { Html } from 'foldkit/html'
import { cn } from 'cn'
import { INCIDENTS, INCIDENT_IDS, type IncidentDef } from '@quorum/simulation/catalog'
import { BY_INCIDENT } from '@quorum/simulation/term-links'
import { FIGURE } from '@quorum/ui/game/bits'
import { duration } from '@quorum/ui/game/format'
import { GUIDED } from '@quorum/simulation/sandbox'
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
} from './shared.ts'

/* One page per incident, and a hub that lists them by Era. */

export const incidentPath = (id: IncidentDef['id']): string => `/incidents/${id}`

/** The failure page that shows this incident's shape in a real system. */
const PRODUCTION: Partial<
  Record<IncidentDef['id'], Readonly<{ path: string; label: string; sentence: string }>>
> = {
  config: {
    path: '/patterns/one-control-plane-73-hours',
    label: 'One control plane, 73 hours: Roblox',
    sentence: 'Roblox lost 73 hours to a control-plane change in 2021.',
  },
  'disk-full': {
    path: '/patterns/one-command-removed-the-index',
    label: 'One command removed the index: AWS S3',
    sentence:
      'AWS lost S3 in us-east-1 for about four hours in 2017 when a command removed the index.',
  },
  regex: {
    path: '/patterns/canary-the-edge-rules',
    label: 'Canary the edge rules: Cloudflare',
    sentence: 'Cloudflare lost its network for 27 minutes in 2019 when a WAF rule backtracked.',
  },
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
          'inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold',
          SEVERITY_CLASS[severity],
        ),
      ),
    ],
    [`SEV${severity}`],
  )

const entity = (def: IncidentDef): Page => {
  const path = incidentPath(def.id)
  const text = authored(path)
  const hits = componentsHitBy(def.id)
  const practice = sandboxesFiring(def.id)
  const production = PRODUCTION[def.id]
  return page({
    path,
    title: def.name,
    summary: def.cause,
    parent: '/incidents',
    order: INCIDENT_IDS.indexOf(def.id),
    era: def.era,
    aliases: [def.id, 'incident', 'outage'],
    source: text.source,
    headings: [
      ...text.headings,
      ...headingsFor([
        'What happens',
        production ? 'Seen in production' : null,
        'How to prevent it',
        hits.length ? 'Components it hits' : null,
        practice.length ? 'Practice it' : null,
        BY_INCIDENT[def.id]?.length ? 'Engineering terms' : null,
      ]),
    ],
    text: `${def.cause} ${def.prevention} ${text.text} ${production?.label ?? ''}`,
    aside: (_model, h) =>
      factsBox(
        def.name,
        severityChip(def.severity, h),
        null,
        [
          { name: 'First Era', value: link(eraPath(def.era), eraName(def.era), h) },
          { name: 'Starts at', value: `SEV${def.severity}` },
          {
            name: 'Escalates to',
            value: def.escalatesTo === def.severity ? '—' : `SEV${def.escalatesTo}`,
          },
          { name: 'Lasts', value: duration(def.duration) },
        ],
        h,
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          section('What happens', [paragraph(def.cause, h)], h),
          ...(text.view ? [text.view(model, h)] : []),
          ...(production
            ? [
                section(
                  'Seen in production',
                  [
                    h.p(
                      [],
                      [
                        production.sentence,
                        ' ',
                        link(production.path, production.label, h),
                        ' shows the shape and says where the game stops.',
                      ],
                    ),
                  ],
                  h,
                ),
              ]
            : []),
          section(
            'How to prevent it',
            [
              paragraph(def.prevention, h),
              ...(def.actions.length
                ? [
                    h.p([], ['The postmortem opens the first of these that you do not own yet:']),
                    h.ol(
                      [],
                      def.actions.map((id) => h.li([h.Key(id)], [researchLink(id, h)])),
                    ),
                  ]
                : []),
            ],
            h,
          ),
          hits.length ? section('Components it hits', [componentList(hits, h)], h) : h.empty,
          practice.length
            ? section(
                'Practice it',
                [
                  h.p(
                    [],
                    [
                      linkList(
                        practice.map((id) => link(`/sandboxes/${id}`, GUIDED[id].name, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          termsSection(BY_INCIDENT[def.id], h),
        ],
      ),
    related: ['/incidents', '/mechanics/incidents'],
  })
}

const entities = INCIDENT_IDS.map((id) => entity(INCIDENTS[id]))

const hub = page({
  path: '/incidents',
  title: 'Incidents',
  summary:
    'Every incident the director can start, the Era it first appears in, how bad it gets, and the Research that prevents it.',
  order: 5,
  aliases: ['outage', 'postmortem', 'severity'],
  headings: headingsFor(['All incidents']),
  text: entities.map((entry) => entry.title).join(' '),
  body: (_model, h) =>
    h.div(
      [h.Class('prose')],
      [
        paragraph(
          'An incident starts at a severity and escalates when nobody fixes it. SEV1 is the worst. When it ends, the postmortem names the cause and opens the Research that prevents it next time.',
          h,
        ),
        section(
          'All incidents',
          [
            table(
              ['Incident', 'Era', 'Severity', 'Prevented by'],
              [...INCIDENT_IDS]
                .sort((a, b) => INCIDENTS[a].era - INCIDENTS[b].era)
                .map((id) => {
                  const def = INCIDENTS[id]
                  return {
                    key: id,
                    cells: [
                      link(incidentPath(id), def.name, h),
                      eraName(def.era),
                      severityChip(def.severity, h),
                      def.actions[0] ? researchLink(def.actions[0], h) : '—',
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

export const incidentPages: ReadonlyArray<Page> = [hub, ...entities]
