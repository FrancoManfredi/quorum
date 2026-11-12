import type { Html } from 'foldkit/html'
import { Maximize2, Minimize2, type IconNode } from 'lucide'
import { cn } from 'cn'
import {
  COMPONENT_IDS,
  INSIGHT_POOLS,
  researchList,
  type ResearchDef,
} from '@quorum/simulation/catalog'
import { BY_RESEARCH } from '@quorum/simulation/term-links'
import { EYEBROW, FIGURE, SCROLL, insightChip } from '@quorum/ui/game/bits'
import { compact } from '@quorum/ui/game/format'
import { POOL_ICONS, poolColor, recipeOf } from '@quorum/ui/game/pools'
import { NODE_SIZE, researchLayout } from '@quorum/ui/game/research-layouts'
import { TRACK_ICONS, researchMark } from '@quorum/ui/game/research-marks'
import { icon } from '@quorum/ui/primitives/icon'
import type { Page } from '../page.ts'
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
  researchPath,
  section,
  termsSection,
  type H,
  type Lang,
} from './shared.ts'
import { componentPath } from './components.ts'

/* One page per Research item, and the Research tree as the hub. Layout and marks are the game's. */

const trackLabel = (l: Lang, track: ResearchDef['track']): string =>
  l.cat.RESEARCH_TRACKS.find((entry) => entry.key === track)?.label ?? track

/** An Insight pool's name in the page's language, such as "Checkout Insight". */
const poolLabel = (l: Lang, pool: (typeof INSIGHT_POOLS)[number]): string =>
  l.t.reference.research.insightName(l.cat.POOLS[pool].label)

const chip = (l: Lang, pool: (typeof INSIGHT_POOLS)[number], figure: string, h: H): Html =>
  insightChip(pool, figure, h, false, 'plain', poolLabel(l, pool))

const recipe = (l: Lang, entry: ResearchDef, h: H): Html =>
  h.span(
    [h.Class('inline-flex flex-wrap items-center justify-end gap-2')],
    recipeOf(entry.id).map(([pool, cost]) => chip(l, pool, compact(cost), h)),
  )

const unlocksOf = (
  l: Lang,
  entry: ResearchDef,
): ReadonlyArray<Readonly<{ path: string; text: string }>> => [
  ...COMPONENT_IDS.filter((id) => l.cat.COMPONENTS[id].unlock === entry.id).map((id) => ({
    path: componentPath(id),
    text: l.cat.COMPONENTS[id].name,
  })),
  ...Object.values(l.cat.RUNTIMES)
    .filter((runtime) => runtime.research === entry.id)
    .map((runtime) => ({ path: `/runtimes/${runtime.id}`, text: runtime.name })),
  ...Object.values(l.cat.TASKS)
    .filter((task) => task.research === entry.id)
    .map((task) => ({ path: '/team#tasks', text: l.t.reference.research.task(task.name) })),
  ...Object.values(l.cat.FEATURES)
    .filter((feature) => feature.research === entry.id)
    .map((feature) => ({
      path: '/team#features',
      text: l.t.reference.research.feature(feature.name),
    })),
]

const entity = (l: Lang, entry: ResearchDef): Page => {
  const t = l.t.reference.research
  const path = researchPath(entry.id)
  const text = authored(l, path)
  const followUps = researchList.filter((candidate) => candidate.requires.includes(entry.id))
  const unlocks = unlocksOf(l, entry)
  const prevents = Object.values(l.cat.INCIDENTS).filter((incident) =>
    incident.actions.includes(entry.id),
  )
  return page(l, {
    path,
    title: entry.name,
    summary: entry.blurb,
    parent: '/research',
    order: researchList.findIndex((candidate) => candidate.id === entry.id),
    era: entry.era,
    aliases: [entry.id, trackLabel(l, entry.track)],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        unlocks.length ? l.title('whatItUnlocks') : null,
        l.title('prerequisites'),
        prevents.length ? l.title('incidentsItPrevents') : null,
        BY_RESEARCH[entry.id]?.length ? l.title('engineeringTerms') : null,
      ]),
    ],
    text: `${entry.blurb} ${text.text}`,
    aside: (_model, h) =>
      factsBox(
        l,
        entry.name,
        researchMark(entry, 'sm', false, h),
        null,
        [
          { name: t.track, value: trackLabel(l, entry.track) },
          { name: t.era, value: link(eraPath(entry.era), eraName(l, entry.era), h) },
          { name: t.cost, value: recipe(l, entry, h) },
          {
            name: t.requires,
            value: linkList(
              entry.requires.map((id) => researchLink(l, id, h)),
              h,
            ),
          },
        ],
        h,
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          ...(text.view ? [text.view(model, h)] : []),
          unlocks.length
            ? section(
                l.title('whatItUnlocks'),
                [
                  h.p(
                    [],
                    [
                      linkList(
                        unlocks.map((item) => link(item.path, item.text, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          section(
            l.title('prerequisites'),
            [
              h.p(
                [],
                entry.requires.length
                  ? [
                      t.prerequisitesIntro,
                      linkList(
                        entry.requires.map((id) => researchLink(l, id, h)),
                        h,
                      ),
                      '.',
                    ]
                  : [t.root(trackLabel(l, entry.track))],
              ),
              ...(followUps.length
                ? [
                    h.p(
                      [],
                      [
                        t.leadsTo,
                        linkList(
                          followUps.map((next) => researchLink(l, next.id, h)),
                          h,
                        ),
                        '.',
                      ],
                    ),
                  ]
                : []),
            ],
            h,
          ),
          prevents.length
            ? section(
                l.title('incidentsItPrevents'),
                [
                  h.ul(
                    [],
                    prevents.map((incident) =>
                      h.li(
                        [h.Key(incident.id)],
                        [link(`/incidents/${incident.id}`, incident.name, h)],
                      ),
                    ),
                  ),
                ],
                h,
              )
            : h.empty,
          termsSection(l, BY_RESEARCH[entry.id], h),
        ],
      ),
    related: ['/research'],
  })
}

/** The game's Research tree, read-only: each item links to its page. */
const tree = (l: Lang, h: H, full = false): Html => {
  const layout = researchLayout()
  const research = l.cat.RESEARCH
  return h.div(
    [
      // column-reverse opens the box scrolled to the bottom, where the Garage Era and the roots are.
      h.Class(
        cn(
          SCROLL,
          'not-prose flex flex-col-reverse overflow-auto rounded-lg border border-border bg-canvas',
          full ? 'h-[calc(100dvh-210px)]' : 'max-h-[72vh]',
        ),
      ),
      h.AriaLabel(l.t.reference.research.treeLabel),
    ],
    [
      h.div(
        [
          h.Class('relative shrink-0'),
          h.Style({ width: `${layout.width}px`, height: `${layout.height}px` }),
        ],
        [
          ...layout.bands.map((band) =>
            h.div(
              [
                h.Key(`era-${band.era}`),
                h.Class('absolute border-t border-hairline'),
                h.Style({
                  left: `${band.x}px`,
                  top: `${band.y}px`,
                  width: `${band.w}px`,
                  height: `${band.h}px`,
                }),
              ],
              [
                h.a(
                  [
                    h.Href(eraPath(band.era)),
                    h.Class(cn(EYEBROW, 'absolute top-3 left-5 hover:text-foreground')),
                  ],
                  [eraName(l, band.era)],
                ),
              ],
            ),
          ),
          ...layout.tracks.map((track) =>
            h.div(
              [
                h.Key(`root-${track.track}`),
                h.Class(
                  'absolute flex w-[180px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2',
                ),
                h.Style({ left: `${track.x}px`, top: `${track.y}px` }),
              ],
              [
                h.span(
                  [
                    h.Class(
                      'grid size-14 place-items-center rounded-xl border border-border bg-background',
                    ),
                  ],
                  [icon(h, TRACK_ICONS[track.track], 'size-6')],
                ),
                h.span([h.Class('text-[14px] font-semibold')], [trackLabel(l, track.track)]),
              ],
            ),
          ),
          h.svg(
            [
              h.AriaHidden(true),
              h.Class('pointer-events-none absolute inset-0 overflow-visible'),
              h.Width(String(layout.width)),
              h.Height(String(layout.height)),
              h.Fill('none'),
            ],
            layout.wires.map((wire) =>
              h.path(
                [
                  h.Key(wire.key),
                  h.D(wire.d),
                  h.StrokeWidth(wire.root ? '2' : '1.5'),
                  h.StrokeLinecap('round'),
                  h.StrokeLinejoin('round'),
                  h.Class(wire.root ? 'stroke-foreground/15' : 'stroke-foreground/25'),
                ],
                [],
              ),
            ),
          ),
          ...[...layout.placed.values()].map(({ entry, x, y }) =>
            h.a(
              [
                h.Key(entry.id),
                h.Href(researchPath(entry.id)),
                h.Style({
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${NODE_SIZE.w}px`,
                  height: `${NODE_SIZE.h}px`,
                }),
                h.Class(
                  'press absolute flex items-center gap-2.5 overflow-hidden rounded-xl bg-raised px-2.5 py-1 shadow-raised transition-[filter] hover:brightness-[0.985]',
                ),
              ],
              [
                researchMark(entry, 'sm', false, h),
                h.span(
                  [h.Class('flex min-w-0 flex-1 flex-col gap-1')],
                  [
                    h.span(
                      [h.Class('line-clamp-2 text-[12px] leading-tight font-semibold')],
                      [research[entry.id].name],
                    ),
                    h.span(
                      [h.Class('flex w-fit items-center gap-2 text-[11px]')],
                      recipeOf(entry.id).map(([pool, cost]) => chip(l, pool, compact(cost), h)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ],
  )
}

/** Every track side by side, its items grouped under the Era they open in. */
const byTrack = (l: Lang, h: H): Html =>
  h.div(
    [
      h.Class(
        'not-prose my-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2',
      ),
    ],
    l.cat.RESEARCH_TRACKS.map((track) => {
      const items = researchList.filter((entry) => entry.track === track.key)
      const eras = [...new Set(items.map((entry) => entry.era))].sort((a, b) => a - b)
      return h.section(
        [h.Key(track.key), h.Class('bg-background p-4')],
        [
          h.h3(
            [h.Class('mt-0! flex items-center gap-2 text-[15px] font-semibold')],
            [
              icon(h, TRACK_ICONS[track.key], 'size-4 text-muted-foreground'),
              track.label,
              h.span(
                [h.Class(cn(FIGURE, 'ml-auto text-[12px] font-normal text-muted-foreground'))],
                [String(items.length)],
              ),
            ],
          ),
          h.dl(
            [h.Class('mt-3 flex flex-col gap-3')],
            eras.flatMap((era) => [
              h.dt(
                [
                  h.Key(`${era}-t`),
                  h.Class('text-[12px] font-medium tracking-wide text-muted-foreground uppercase'),
                ],
                [h.a([h.Href(eraPath(era)), h.Class('hover:text-foreground')], [eraName(l, era)])],
              ),
              h.dd(
                [h.Key(`${era}-d`), h.Class('mt-1 flex flex-col gap-1')],
                items
                  .filter((entry) => entry.era === era)
                  .map((entry) =>
                    h.a(
                      [
                        h.Key(entry.id),
                        h.Href(researchPath(entry.id)),
                        h.Class('flex items-center gap-2 text-[14px] leading-snug hover:underline'),
                      ],
                      [researchMark(entry, 'sm', false, h), l.cat.RESEARCH[entry.id].name],
                    ),
                  ),
              ),
            ]),
          ),
        ],
      )
    }),
  )

const treeButton = (href: string, label: string, mark: IconNode, h: H): Html =>
  h.a(
    [
      h.Href(href),
      h.Class(
        'inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-[13px] font-medium text-foreground no-underline hover:bg-muted',
      ),
    ],
    [icon(h, mark, 'size-4'), label],
  )

/** Every Insight pool some item costs, in catalog order. */
const usedPools = INSIGHT_POOLS.filter((pool) =>
  researchList.some((entry) => recipeOf(entry.id).some(([spent]) => spent === pool)),
)

/** How to read the cost on an item: what its icon names and what its number counts. */
const costLegend = (l: Lang, h: H): Html => {
  const t = l.t.reference.research
  return h.div(
    [h.Class('not-prose my-5')],
    [
      h.ul(
        [
          h.Class(
            'grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2',
          ),
        ],
        [
          ...usedPools.map((pool) =>
            h.li(
              [h.Key(pool), h.Class('flex items-center gap-3 bg-background px-3.5 py-2.5')],
              [
                h.span(
                  [
                    h.AriaHidden(true),
                    h.Class('grid size-8 shrink-0 place-items-center rounded-md bg-muted'),
                    h.Style({ color: poolColor(pool) }),
                  ],
                  [icon(h, POOL_ICONS[pool], 'size-4')],
                ),
                h.span(
                  [h.Class('min-w-0')],
                  [
                    h.span([h.Class('block text-[14px] font-medium')], [poolLabel(l, pool)]),
                    h.span(
                      [h.Class('block text-[12px] leading-snug text-muted-foreground')],
                      [pool === 'failure' ? t.failureEarned : t.sampled(l.cat.POOLS[pool].label)],
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Blank cells finish the last row at two and three columns, so the hairlines do not show through.
          ...Array.from({ length: (3 - (usedPools.length % 3)) % 3 }, (_, index) =>
            h.li([h.Key(`fill-3-${index}`), h.Class('hidden bg-background lg:block')], []),
          ),
          ...Array.from({ length: (2 - (usedPools.length % 2)) % 2 }, (_, index) =>
            h.li(
              [h.Key(`fill-2-${index}`), h.Class('hidden bg-background sm:block lg:hidden')],
              [],
            ),
          ),
        ],
      ),
    ],
  )
}

export const researchPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.research
  const entities = researchList.map((entry) => entity(l, l.cat.RESEARCH[entry.id] as ResearchDef))
  /** The tree on a page of its own, as wide as the screen, like the game's Research panel. */
  const fullTree = page(l, {
    path: '/research/tree',
    title: t.fullTitle,
    summary: t.fullSummary,
    parent: '/research',
    order: -1,
    wide: true,
    aliases: t.fullAliases,
    body: (_model, h) =>
      h.div(
        [],
        [
          h.div(
            [h.Class('mb-4 flex justify-end')],
            [treeButton('/research', t.backToPage, Minimize2, h)],
          ),
          tree(l, h, true),
        ],
      ),
  })
  const hub = page(l, {
    path: '/research',
    title: t.title,
    summary: t.summary,
    order: 3,
    aliases: t.aliases,
    headings: headingsFor([l.title('readingACost'), l.title('theTree'), l.title('byTrack')]),
    text: entities.map((entry) => entry.title).join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          section(
            l.title('readingACost'),
            [
              h.p(
                [],
                [
                  t.cost1,
                  link('/components/analytics', t.cost1Link, h),
                  t.cost2,
                  chip(l, 'write', '5k', h),
                  t.cost3,
                  poolLabel(l, 'write'),
                  t.cost4,
                  chip(l, 'failure', '2k', h),
                  t.cost5,
                  poolLabel(l, 'failure'),
                  t.cost6,
                ],
              ),
              costLegend(l, h),
              h.p([], [t.earn, link('/explanation/observability', t.earnLink, h), t.earnAfter]),
            ],
            h,
          ),
          section(
            l.title('theTree'),
            [
              h.div(
                [h.Class('not-prose mb-3 flex justify-end')],
                [treeButton('/research/tree', t.openInFull, Maximize2, h)],
              ),
              tree(l, h),
            ],
            h,
          ),
          section(l.title('byTrack'), [byTrack(l, h)], h),
        ],
      ),
  })
  return [hub, fullTree, ...entities]
}
