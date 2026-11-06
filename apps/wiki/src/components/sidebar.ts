import * as Effect from 'effect/Effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ChevronDown, ChevronRight } from 'lucide'
import { FIGURE } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { SCROLL } from '@quorum/ui/game/bits'
import { Message, type Model } from '../main.ts'
import type { Page } from '../page.ts'
import { childrenOf, navOf, pageAt } from '../pages.ts'
import { QUADRANTS, quadrantBadge, quadrantColor } from './quadrant.ts'

/* The navigation rail: the current section's pages, and the open hub's pages beneath it. */

type H = HtmlBuilder<Message>

// Defined on first use: this module is imported while main.ts is still loading.
const defineRevealed = () =>
  Mount.define('NavLinkRevealed', {
    messages: [Message.Navigated],
    execute: ({ element }) =>
      Effect.sync(() => {
        element.scrollIntoView({ block: 'nearest' })
        return Message.Navigated()
      }),
  })

let revealed: ReturnType<typeof defineRevealed> | null = null

/** One row. The current page gets a filled row with its kind's colour as a bar, and scrolls into view. */
const navLink = (page: Page, current: string, color: string, h: H, nested = false): Html => {
  const active = page.path === current
  return h.a(
    [
      h.Key(active ? `${page.path}-current` : page.path),
      h.Href(page.path),
      ...(active ? [h.AriaCurrent('page'), h.OnMount((revealed ??= defineRevealed())())] : []),
      h.Class(
        cn(
          'relative block rounded-md py-1.5 text-[13.5px] leading-snug transition-colors',
          nested ? 'pr-2 pl-3' : 'px-2.5',
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
      page.title,
    ],
  )
}

/** A hub: its row, how many pages sit under it, and a chevron that turns when it is open. */
const hubLink = (hub: Page, current: string, isOpen: boolean, color: string, h: H): Html => {
  const count = childrenOf(hub.path).length
  return h.div(
    [h.Key(`${hub.path}-row`), h.Class('relative flex items-center')],
    [
      h.div([h.Class('min-w-0 flex-1')], [navLink(hub, current, color, h)]),
      count > 0
        ? h.span(
            [
              h.AriaHidden(true),
              h.Class(
                cn(
                  'pointer-events-none absolute right-2 flex items-center gap-1 text-muted-foreground',
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

export const sidebar = (model: Model, h: H): Html => {
  const page = pageAt(model.path)
  const open = page?.parent ?? page?.path ?? null
  // Home has no section of its own; it lists the play pages, where a new player starts.
  const section = model.path === '/' ? 'play' : (page?.section ?? 'play')
  const color = quadrantColor(section)
  return h.nav(
    [
      h.AriaLabel(QUADRANTS[section].label),
      h.Class(
        cn(
          SCROLL,
          'sticky top-[100px] h-[calc(100dvh-100px)] self-start border-border py-6 pr-4 lg:block lg:border-r',
          model.menu ? 'block' : 'hidden',
        ),
      ),
    ],
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
        navOf(section).flatMap((hub) => [
          hubLink(hub, model.path, hub.path === open, color, h),
          ...(hub.path === open
            ? [
                h.div(
                  [
                    h.Key(`${hub.path}-children`),
                    h.Class('mt-0.5 mb-1.5 ml-3 flex flex-col gap-0.5 border-l border-border pl-1'),
                  ],
                  childrenOf(hub.path).map((child) => navLink(child, model.path, color, h, true)),
                ),
              ]
            : []),
        ]),
      ),
    ],
  )
}
