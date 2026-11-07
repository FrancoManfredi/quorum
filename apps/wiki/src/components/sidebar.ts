import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ChevronDown, ChevronRight } from 'lucide'
import { FIGURE } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { SCROLL } from '@quorum/ui/game/bits'
import { Message, type Model } from '../main.ts'
import type { Page } from '../page.ts'
import { childrenOf, navOf, pageAt } from '../pages.ts'
import * as Spoilers from '../submodels/spoilers.ts'
import { QUADRANTS, quadrantBadge, quadrantColor } from './quadrant.ts'

/* The navigation rail: the current section's pages, and the open hub's pages beneath it. */

type H = HtmlBuilder<Message>

/** One row. The current page gets a filled row with its kind's colour as a bar. */
const navLink = (
  page: Page,
  current: string,
  color: string,
  h: H,
  nested = false,
  room = false,
  number: number | null = null,
): Html => {
  const active = page.path === current
  return h.a(
    [
      h.Key(page.path),
      h.Href(page.path),
      ...(active ? [h.AriaCurrent('page')] : []),
      h.Class(
        cn(
          'relative block rounded-md py-1.5 text-[13.5px] leading-snug transition-colors',
          nested ? 'pr-2 pl-3' : room ? 'pr-14 pl-2.5' : 'px-2.5',
          active
            ? 'bg-muted font-medium text-foreground'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        ),
      ),
    ],
    [
      active
        ? h.span(
            [
              h.AriaHidden(true),
              h.Class('absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full'),
              h.Style({ background: color }),
            ],
            [],
          )
        : h.empty,
      number === null
        ? h.span([], [page.title])
        : h.span(
            [h.Class('flex items-baseline gap-1.5')],
            [
              h.span(
                [
                  h.Class(
                    cn(
                      FIGURE,
                      'w-4 shrink-0 text-right text-[11px]',
                      active ? 'text-foreground' : 'text-muted-foreground/70',
                    ),
                  ),
                ],
                [String(number)],
              ),
              h.span([h.Class('min-w-0 flex-1')], [page.title]),
            ],
          ),
    ],
  )
}

/** A group of pages under one heading: a button with the page count and a chevron, and the pages beneath it when open. */
const groupBlock = (
  name: string,
  pages: ReadonlyArray<Page>,
  current: string,
  isOpen: boolean,
  color: string,
  h: H,
): Html => {
  const numbered = name === 'Stack ladder'
  return h.div(
    [h.Key(`group-${name}`), h.Class('mt-2')],
    [
      h.button(
        [
          h.Type('button'),
          h.AriaExpanded(isOpen),
          h.AriaLabel(`${isOpen ? 'Collapse' : 'Expand'} ${name}`),
          h.OnClick(Message.NavToggled({ path: `group:${name}` })),
          h.Class(
            cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60',
              isOpen ? 'text-foreground' : 'text-muted-foreground',
            ),
          ),
        ],
        [
          h.span(
            [
              h.AriaHidden(true),
              h.Class('size-1.5 shrink-0 rounded-full'),
              h.Style({ background: color }),
            ],
            [],
          ),
          h.span([h.Class('min-w-0 flex-1 truncate text-[13px] font-semibold')], [name]),
          h.span(
            [h.Class(cn(FIGURE, 'text-[11px] text-muted-foreground'))],
            [String(pages.length)],
          ),
          icon(h, isOpen ? ChevronDown : ChevronRight, 'size-3.5'),
        ],
      ),
      isOpen
        ? h.div(
            [h.Class('mt-0.5 mb-1 ml-1.5 flex flex-col gap-0.5 border-l border-border')],
            pages.map((entry) =>
              navLink(entry, current, color, h, false, false, numbered ? entry.order - 100 : null),
            ),
          )
        : h.empty,
    ],
  )
}

/** A hub: its row, how many pages sit under it, and a chevron that turns when it is open. */
const hubLink = (hub: Page, current: string, isOpen: boolean, color: string, h: H): Html => {
  const count = childrenOf(hub.path).length
  return h.div(
    [h.Key(`${hub.path}-row`), h.Class('relative flex items-center')],
    [
      h.div([h.Class('min-w-0 flex-1')], [navLink(hub, current, color, h, false, count > 0)]),
      count > 0
        ? h.button(
            [
              h.Type('button'),
              h.AriaLabel(`${isOpen ? 'Collapse' : 'Expand'} ${hub.title}`),
              h.AriaExpanded(isOpen),
              h.OnClick(Message.NavToggled({ path: hub.path })),
              h.Class(
                cn(
                  'absolute right-1 flex h-6 cursor-pointer items-center gap-1 rounded px-1.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground',
                  isOpen && 'text-foreground',
                ),
              ),
            ],
            [
              h.span([h.Class(cn(FIGURE, 'text-[11px]'))], [String(count)]),
              icon(h, isOpen ? ChevronDown : ChevronRight, 'size-3.5'),
            ],
          )
        : h.empty,
    ],
  )
}

/** Consecutive pages that share a group, in order; ungrouped pages are their own run. */
const segmentsOf = (
  pages: ReadonlyArray<Page>,
): ReadonlyArray<Readonly<{ group: string | null; pages: ReadonlyArray<Page> }>> =>
  pages.reduce<Array<{ group: string | null; pages: Array<Page> }>>((runs, entry) => {
    const last = runs[runs.length - 1]
    if (last && last.group === entry.group) last.pages.push(entry)
    else runs.push({ group: entry.group, pages: [entry] })
    return runs
  }, [])

export const sidebar = (model: Model, h: H): Html => {
  const page = pageAt(model.path)
  const open = page?.parent ?? page?.path ?? null
  // Home has no section of its own; it lists the play pages, where a new player starts.
  const section = model.path === '/' ? 'play' : (page?.section ?? 'play')
  const color = quadrantColor(section)
  const isOpen = (path: string): boolean => (path === open) !== model.navToggled.includes(path)
  return h.nav(
    [
      h.AriaLabel(QUADRANTS[section].label),
      h.Class(
        cn(
          SCROLL,
          // A phone opens the menu over the page; a desktop keeps it as a sticky rail.
          'border-border lg:sticky lg:top-[100px] lg:flex lg:h-[calc(100dvh-100px)] lg:flex-col lg:self-start lg:border-r lg:pr-4',
          model.menu
            ? 'fixed inset-x-0 top-[100px] bottom-0 z-30 flex flex-col bg-background px-4 lg:static lg:bg-transparent lg:px-0'
            : 'hidden',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('pt-4 lg:pt-6')],
        [
          h.div(
            [h.Class('mb-3 flex items-center gap-2 px-2.5')],
            [
              quadrantBadge(section, 'size-5', h),
              h.span(
                [h.Class('text-[13px] font-semibold text-foreground')],
                [QUADRANTS[section].label],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col gap-0.5')],
            segmentsOf(navOf(section)).flatMap((segment) =>
              segment.group !== null
                ? [
                    groupBlock(
                      segment.group,
                      segment.pages,
                      model.path,
                      (segment.pages.some((entry) => entry.path === model.path) ||
                        (page?.group ?? null) === segment.group) !==
                        model.navToggled.includes(`group:${segment.group}`),
                      color,
                      h,
                    ),
                  ]
                : segment.pages.flatMap((hub) => [
                    hubLink(hub, model.path, isOpen(hub.path), color, h),
                    ...(isOpen(hub.path) && childrenOf(hub.path).length > 0
                      ? [
                          h.div(
                            [
                              h.Key(`${hub.path}-children`),
                              h.Class(
                                'mt-0.5 mb-1.5 ml-3 flex flex-col gap-0.5 border-l border-border pl-1',
                              ),
                            ],
                            childrenOf(hub.path).map((child) =>
                              navLink(child, model.path, color, h, true),
                            ),
                          ),
                        ]
                      : []),
                  ]),
            ),
          ),
        ],
      ),
      // The spoiler filter stays in reach at the foot, however long the list.
      h.div(
        [h.Class('sticky bottom-0 mt-auto bg-background pt-4 pb-4 lg:pb-6')],
        [
          h.submodel({
            slotId: 'spoilers',
            model: model.spoilers,
            view: Spoilers.view,
            toParentMessage: (message) => Message.SpoilersChanged({ message }),
          }),
        ],
      ),
    ],
  )
}
