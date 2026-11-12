import type { Html } from 'foldkit/html'
import {
  ERAS,
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
  type Lang,
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
const busiest = (l: Lang, def: VentureDef): string =>
  (Object.entries(trafficOf(def)) as Array<[RequestKind, number]>)
    .slice(0, 3)
    .map(([kind, share]) => `${l.cat.KINDS[kind].label} ${percent(share)}`)
    .join(' · ')

const hour = (value: number): string => `${String(value).padStart(2, '0')}:00`

const venturePath = (id: VentureId): string => `/ventures#${id}`

const ventureName = (l: Lang, id: VentureId, h: H): Html =>
  link(venturePath(id), l.cat.VENTURES[id].name, h)

const startsWith = (l: Lang, def: VentureDef, h: H): ReadonlyArray<Html> => [
  ...(def.start.runtime === null
    ? []
    : [link(runtimePath(def.start.runtime), l.cat.RUNTIMES[def.start.runtime].name, h)]),
  ...def.start.researched.map((research) => researchLink(l, research, h)),
]

const ventureBlock = (l: Lang, id: VentureId, h: H): Html => {
  const t = l.t.reference.ventures
  const def = l.cat.VENTURES[id]
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
                h.dt([h.Key('incident-t'), h.Class('text-muted-foreground')], [t.signature]),
                h.dd(
                  [h.Key('incident-d'), h.Class('m-0')],
                  [link(incidentPath(def.signature), l.cat.INCIDENTS[def.signature].name, h)],
                ),
              ]),
          h.dt([h.Key('market-t'), h.Class('text-muted-foreground')], [t.market]),
          h.dd([h.Key('market-d'), h.Class('m-0')], [`×${def.market}`]),
          h.dt([h.Key('legacy-t'), h.Class('text-muted-foreground')], [t.legacy]),
          h.dd([h.Key('legacy-d'), h.Class('m-0')], [`×${def.legacy}`]),
        ],
      ),
    ],
  )
}

export const venturePages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.ventures
  const VENTURES = l.cat.VENTURES
  return [
    page(l, {
      path: '/ventures',
      title: t.title,
      summary: t.summary,
      order: 10,
      aliases: t.aliases,
      headings: [
        ...headingsFor([
          l.title('traffic'),
          l.title('whenBusy'),
          l.title('startingOut'),
          l.title('everyVenture'),
        ]),
        ...VENTURE_IDS.map((id) => ({ id, text: VENTURES[id].name, level: 3 as const })),
      ],
      text: VENTURE_IDS.map((id) => `${VENTURES[id].name} ${VENTURES[id].summary}`).join(' '),
      body: (_model, h) =>
        h.div(
          [h.Class('prose')],
          [
            paragraph(t.intro, h),
            section(
              l.title('traffic'),
              [
                paragraph(t.trafficIntro, h),
                table(
                  t.trafficColumns,
                  VENTURE_IDS.map((id) => ({
                    key: id,
                    cells: [
                      ventureName(l, id, h),
                      mixBar(trafficOf(VENTURES[id]), h, false),
                      busiest(l, VENTURES[id]),
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
              l.title('whenBusy'),
              [
                paragraph(t.busyIntro, h),
                table(
                  t.busyColumns,
                  VENTURE_IDS.map((id) => {
                    const def = VENTURES[id]
                    return {
                      key: id,
                      cells: [
                        ventureName(l, id, h),
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
              l.title('startingOut'),
              [
                paragraph(t.startIntro, h),
                table(
                  t.startColumns,
                  VENTURE_IDS.map((id) => {
                    const def = VENTURES[id]
                    return {
                      key: id,
                      cells: [
                        ventureName(l, id, h),
                        money(def.start.cash),
                        `×${def.market}`,
                        linkList(startsWith(l, def, h), h),
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
              l.title('everyVenture'),
              VENTURE_IDS.map((id) => ventureBlock(l, id, h)),
              h,
            ),
          ],
        ),
      related: ['/prestige', '/eras'],
    }),
  ]
}
