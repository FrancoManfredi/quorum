import type { Html } from 'foldkit/html'
import {
  ERAS,
  INCIDENTS,
  KINDS,
  RUNTIMES,
  VENTURES,
  VENTURE_IDS,
  type RequestKind,
  type VentureDef,
  type VentureId,
} from '@quorum/simulation/catalog'
import { money } from '@quorum/ui/game/format'
import { type Page } from '../page.ts'
import { mixBar } from '../components/mix.ts'
import { incidentPath } from './incidents.ts'
import { runtimePath } from './stacks.ts'
import {
  headingsFor,
  link,
  linkList,
  page,
  paragraph,
  percent,
  researchLink,
  section,
  table,
  type H,
} from './shared.ts'

/* The Ventures (13 "Ventures"): the traffic each one runs, when it is busy, and what it starts with. */

/** The last Era's mix serves every kind, so a Venture with no profile of its own shows in full. */
const WIDEST = ERAS[ERAS.length - 1]

/** A profile as a mix, largest kind first, so a bar and its labels read in order. */
const trafficOf = (def: VentureDef): Partial<Record<RequestKind, number>> => {
  const shares = def.shares ?? WIDEST?.mix ?? {}
  return Object.fromEntries(
    (Object.entries(shares) as Array<[RequestKind, number]>).toSorted((a, b) => b[1] - a[1]),
  ) as Partial<Record<RequestKind, number>>
}

/** The kinds a reader should know first: the three largest shares. */
const busiest = (def: VentureDef): string =>
  (Object.entries(trafficOf(def)) as Array<[RequestKind, number]>)
    .slice(0, 3)
    .map(([kind, share]) => `${KINDS[kind].label} ${percent(share)}`)
    .join(' · ')

const hour = (value: number): string => `${String(value).padStart(2, '0')}:00`

const venturePath = (id: VentureId): string => `/ventures#${id}`

const ventureName = (id: VentureId, h: H): Html => link(venturePath(id), VENTURES[id].name, h)

const startsWith = (def: VentureDef, h: H): ReadonlyArray<Html> => [
  ...(def.start.runtime === null
    ? []
    : [link(runtimePath(def.start.runtime), RUNTIMES[def.start.runtime].name, h)]),
  ...def.start.researched.map((research) => researchLink(research, h)),
]

const ventures = page({
  path: '/ventures',
  title: 'Ventures',
  summary:
    'The kind of company you found: the traffic it runs, when it is busy, and the rule that makes it hard.',
  order: 10,
  aliases: ['venture', 'startup', 'industry', 'founding', 'traffic mix', 'b2b saas', 'fintech'],
  headings: [
    ...headingsFor(['Traffic', 'When it is busy', 'Starting out', 'Every Venture']),
    ...VENTURE_IDS.map((id) => ({ id, text: VENTURES[id].name, level: 3 as const })),
  ],
  text: VENTURE_IDS.map((id) => `${VENTURES[id].name} ${VENTURES[id].summary}`).join(' '),
  body: (_model, h) =>
    h.div(
      [h.Class('prose')],
      [
        paragraph(
          'Every Venture is open at founding, and each one changes what your users ask for, when they ask for it, and the rule the Company cannot break. B2B SaaS is the default.',
          h,
        ),
        section(
          'Traffic',
          [
            paragraph(
              'A Venture sets the share of every request kind its users send. The share is its own, not a nudge to the Era’s: a media company sends mostly video, and a payments company sends mostly checkouts and writes. An Era masks the profile to the kinds it serves, so every Venture still opens on pages and reads in the Garage.',
              h,
            ),
            table(
              ['Venture', 'Where its traffic goes', 'Busiest kinds', 'Legacy ×'],
              VENTURE_IDS.map((id) => ({
                key: id,
                cells: [
                  ventureName(id, h),
                  mixBar(trafficOf(VENTURES[id]), h, false),
                  busiest(VENTURES[id]),
                  `×${VENTURES[id].legacy}`,
                ],
              })),
              h,
              [3],
            ),
          ],
          h,
        ),
        section(
          'When it is busy',
          [
            paragraph(
              'A Venture sets the hour demand peaks, how far it swings around the mean, and what a weekend does to it. Business-hours products go quiet at the weekend; consumer products do not.',
              h,
            ),
            table(
              ['Venture', 'Peak', 'Swing', 'Weekend'],
              VENTURE_IDS.map((id) => {
                const def = VENTURES[id]
                return {
                  key: id,
                  cells: [
                    ventureName(id, h),
                    hour(def.peak),
                    `±${Math.round(def.amplitude * 100)}%`,
                    `×${def.weekend}`,
                  ],
                }
              }),
              h,
              [1, 2, 3],
            ),
          ],
          h,
        ),
        section(
          'Starting out',
          [
            paragraph(
              'Every Venture starts in the Garage, but not with the same Cash, and a few bring a Stack or Research of its own.',
              h,
            ),
            table(
              ['Venture', 'Cash', 'Market ×', 'Stack and Research'],
              VENTURE_IDS.map((id) => {
                const def = VENTURES[id]
                return {
                  key: id,
                  cells: [
                    ventureName(id, h),
                    money(def.start.cash),
                    `×${def.market}`,
                    linkList(startsWith(def, h), h),
                  ],
                }
              }),
              h,
              [1, 2],
            ),
          ],
          h,
        ),
        section(
          'Every Venture',
          VENTURE_IDS.map((id) => ventureBlock(id, h)),
          h,
        ),
      ],
    ),
  related: ['/prestige', '/eras'],
})

const ventureBlock = (id: VentureId, h: H): Html => {
  const def = VENTURES[id]
  return h.section(
    [h.Key(id)],
    [
      h.h3(
        [h.Id(id), h.Class('group')],
        [def.name, h.a([h.Href(`#${id}`), h.Class('anchor')], ['#'])],
      ),
      paragraph(def.summary, h),
      mixBar(trafficOf(def), h),
      h.dl(
        [h.Class('not-prose my-4 grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-[9rem_1fr]')],
        [
          ...(def.signature === null
            ? []
            : [
                h.dt(
                  [h.Key('incident-t'), h.Class('text-muted-foreground')],
                  ['Signature incident'],
                ),
                h.dd(
                  [h.Key('incident-d'), h.Class('m-0')],
                  [link(incidentPath(def.signature), INCIDENTS[def.signature].name, h)],
                ),
              ]),
          h.dt([h.Key('market-t'), h.Class('text-muted-foreground')], ['Market ×']),
          h.dd([h.Key('market-d'), h.Class('m-0')], [`×${def.market}`]),
          h.dt([h.Key('legacy-t'), h.Class('text-muted-foreground')], ['Legacy']),
          h.dd([h.Key('legacy-d'), h.Class('m-0')], [`×${def.legacy}`]),
        ],
      ),
    ],
  )
}

export const venturePages: ReadonlyArray<Page> = [ventures]
