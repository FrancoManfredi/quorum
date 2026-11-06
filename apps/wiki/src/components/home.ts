import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ArrowRight, BookOpen } from 'lucide'
import {
  COMPONENTS,
  COMPONENT_IDS,
  ERAS,
  type ComponentId,
  GLOSSARY,
  INCIDENT_IDS,
  researchList,
} from '@quorum/simulation/catalog'
import { SANDBOX_IDS } from '@quorum/simulation/sandbox'
import { FIGURE } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import type { Section } from '../frontmatter.ts'
import type { Message, Model } from '../main.ts'
import type { Page } from '../page.ts'
import { navOf, pageAt } from '../pages.ts'
import { PATHS, stepsOf } from '../paths.ts'
import { componentBadge } from '../reference/components.ts'
import { pathCard } from './path-nav.ts'
import { QUADRANTS, quadrantBadge } from './quadrant.ts'

/* The home page: what the wiki is, the guided paths, then the four kinds of page and the catalog. */

type H = HtmlBuilder<Message>

/** One kind of page: its badge, what it is for, and its first pages. */
const kind = (section: Section, h: H): Html =>
  h.section(
    [h.Key(section), h.Class('flex flex-col bg-background p-5')],
    [
      h.div(
        [h.Class('flex items-center gap-2')],
        [
          quadrantBadge(section, 'size-5', h),
          h.h3([h.Class('text-[15px] font-semibold')], [QUADRANTS[section].label]),
        ],
      ),
      h.p([h.Class('mt-1 text-[13px] text-muted-foreground')], [QUADRANTS[section].purpose]),
      h.ul(
        [h.Class('mt-3 flex flex-col')],
        navOf(section)
          .slice(0, 6)
          .map((target) =>
            h.li(
              [h.Key(target.path)],
              [
                h.a(
                  [h.Href(target.path), h.Class('block truncate py-1 text-[14px] hover:underline')],
                  [target.title],
                ),
              ],
            ),
          ),
      ),
    ],
  )

const COUNTS: ReadonlyArray<Readonly<{ path: string; value: number; label: string }>> = [
  { path: '/components', value: COMPONENT_IDS.length, label: 'Components' },
  { path: '/research', value: researchList.length, label: 'Research items' },
  { path: '/eras', value: ERAS.length, label: 'Eras' },
  { path: '/incidents', value: INCIDENT_IDS.length, label: 'Incidents' },
  { path: '/sandboxes', value: SANDBOX_IDS.length, label: 'Sandboxes' },
  { path: '/glossary', value: GLOSSARY.length, label: 'Engineering terms' },
]

/** The catalog as six lookups: a number and where it leads. */
const counts = (h: H): Html =>
  h.dl(
    [
      h.Class(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6',
      ),
    ],
    COUNTS.map((entry) =>
      h.a(
        [
          h.Key(entry.path),
          h.Href(entry.path),
          h.Class(
            'group flex flex-col gap-1 bg-background px-4 py-4 transition-colors hover:bg-muted/60',
          ),
        ],
        [
          h.dd(
            [h.Class(cn(FIGURE, 'text-[26px] leading-none font-medium'))],
            [String(entry.value)],
          ),
          h.dt(
            [h.Class('text-[13px] text-muted-foreground group-hover:text-foreground')],
            [entry.label],
          ),
        ],
      ),
    ),
  )

const FIRST_TUTORIAL = '/tutorials/first-company'

/** Guides a reader opens with a problem in hand, most common first. */
const TROUBLE: ReadonlyArray<string> = [
  '/guides/find-the-bottleneck',
  '/guides/read-p99',
  '/guides/scale-the-database',
  '/guides/fix-slow-queries',
  '/guides/survive-a-traffic-spike',
  '/guides/stop-a-retry-storm',
]

const grid = (columns: string, items: ReadonlyArray<Html>, h: H): Html =>
  h.div(
    [h.Class(cn('grid gap-px overflow-hidden rounded-lg border border-border bg-border', columns))],
    items,
  )

/** A heading with the sentence that says what the block is for. */
const block = (title: string, lead: string, content: Html, h: H): Html =>
  h.section(
    [h.Class('mt-14')],
    [
      h.div(
        [h.Class('flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1')],
        [
          h.h2([h.Class('text-[20px] font-semibold tracking-tight')], [title]),
          h.p([h.Class('text-[13.5px] text-muted-foreground')], [lead]),
        ],
      ),
      h.div([h.Class('mt-4')], [content]),
    ],
  )

const troubleLink = (target: Page, h: H): Html =>
  h.a(
    [
      h.Key(target.path),
      h.Href(target.path),
      h.Class('group flex flex-col gap-1 bg-background p-4 transition-colors hover:bg-muted/60'),
    ],
    [
      h.span(
        [h.Class('flex items-center justify-between gap-2 text-[14.5px] font-medium')],
        [
          target.title,
          icon(
            h,
            ArrowRight,
            'size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5',
          ),
        ],
      ),
      h.span(
        [h.Class('line-clamp-2 text-[13px] leading-snug text-muted-foreground')],
        [target.summary],
      ),
    ],
  )

/** The board's dotted canvas, as the backdrop of the hero. */
const CANVAS = {
  backgroundImage: 'radial-gradient(var(--canvas-grid) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
}

/** A request's way through a small Design, drawn with the game's own badges. */
const FLOW: ReadonlyArray<ComponentId> = ['users', 'lb', 'server', 'cache', 'database']

const flow = (h: H): Html =>
  h.ol(
    [
      h.AriaHidden(true),
      h.Class(
        'hidden items-start gap-2 rounded-lg border border-border bg-background/80 p-5 lg:flex',
      ),
    ],
    FLOW.flatMap((id, index) => [
      ...(index > 0
        ? [h.li([h.Key(`to-${id}`), h.Class('mt-[18px] h-px w-6 bg-border')], [])]
        : []),
      h.li(
        [h.Key(id), h.Class('flex w-14 flex-col items-center gap-2')],
        [
          componentBadge(id, 'size-10', h),
          h.span([h.Class(cn(FIGURE, 'text-[11px] text-muted-foreground'))], [COMPONENTS[id].code]),
        ],
      ),
    ]),
  )

export const homeView = (page: Page, model: Model, h: H): Html => {
  const trouble = TROUBLE.flatMap((path) => {
    const target = pageAt(path)
    return target ? [target] : []
  })
  return h.div(
    [h.Class('min-w-0 pb-16 lg:col-span-2 xl:col-span-3')],
    [
      h.header(
        [
          h.Class(
            'mt-8 grid items-center gap-10 overflow-hidden rounded-xl border border-border bg-canvas px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-16',
          ),
          h.Style(CANVAS),
        ],
        [
          h.div(
            [h.Class('max-w-[62ch]')],
            [
              h.h1(
                [
                  h.Class(
                    'text-[44px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance',
                  ),
                ],
                ['Quorum Wiki'],
              ),
              h.p(
                [h.Class('mt-4 text-[17px] leading-relaxed text-pretty text-muted-foreground')],
                [page.summary],
              ),
              h.div(
                [h.Class('mt-7 flex flex-wrap items-center gap-3')],
                [
                  pageAt(FIRST_TUTORIAL)
                    ? h.a(
                        [
                          h.Href(FIRST_TUTORIAL),
                          h.Class(
                            'inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-[14px] font-medium text-background hover:opacity-90',
                          ),
                        ],
                        ['Start your first Company', icon(h, ArrowRight, 'size-4')],
                      )
                    : h.empty,
                  h.a(
                    [
                      h.Href('/components'),
                      h.Class(
                        'inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-[14px] font-medium hover:border-foreground/30',
                      ),
                    ],
                    [icon(h, BookOpen, 'size-4'), 'Browse the Components'],
                  ),
                ],
              ),
            ],
          ),
          flow(h),
        ],
      ),
      h.div([h.Class('mt-8')], [counts(h)]),
      block(
        'Something is going wrong',
        'Start from the symptom you see in the game.',
        grid(
          'sm:grid-cols-2 lg:grid-cols-3',
          trouble.map((target) => troubleLink(target, h)),
          h,
        ),
        h,
      ),
      block(
        'Guided paths',
        'A reading order from lesson to idea to recipe.',
        grid(
          'md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2',
          PATHS.filter((path) => stepsOf(path).length > 0).map((path) => pathCard(path, model, h)),
          h,
        ),
        h,
      ),
      block(
        'Browse by kind',
        'Five kinds of page, each for a different need.',
        h.div(
          [],
          [
            grid(
              'sm:grid-cols-2 xl:grid-cols-5',
              (['play', 'tutorials', 'guides', 'explanation', 'reference'] as const).map(
                (section) => kind(section, h),
              ),
              h,
            ),
            h.p(
              [h.Class('mt-6 text-[13px] text-muted-foreground')],
              [
                'Want the rules, formulas, and open questions behind the game? Read the ',
                h.a(
                  [h.Href('/design'), h.Class('text-foreground underline underline-offset-4')],
                  ['Design'],
                ),
                ' document, or see ',
                h.a(
                  [
                    h.Href('/about/changelog'),
                    h.Class('text-foreground underline underline-offset-4'),
                  ],
                  ['what changed this week'],
                ),
                '. Quorum is a game, and it simplifies real systems on purpose. ',
                h.a(
                  [
                    h.Href('/about/disclaimer'),
                    h.Class('text-foreground underline underline-offset-4'),
                  ],
                  ['Read what that means'],
                ),
                ' before you act on what you learn here.',
              ],
            ),
          ],
        ),
        h,
      ),
    ],
  )
}
