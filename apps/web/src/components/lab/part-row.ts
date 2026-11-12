import type { Html, HtmlBuilder } from 'foldkit/html'
import { Lock } from 'lucide'
import { FIGURE, groupBadge } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import type { Message } from '@/game/message.ts'
import type { Part } from '@/game/parts.ts'
import { cn } from '@/lib/utils'

/* ==========================================================================
   A part as a list row shows it. The dock and the command palette draw the
   same cells, so the menu a player knows and the palette they search cannot
   drift apart.
   ========================================================================== */

/** A part's price, or the Research that still locks it. */
const detail = (part: Part, h: HtmlBuilder<Message>): Html => {
  if (part.locked !== null)
    return h.span(
      [
        h.Title(part.locked),
        h.Class(
          'flex shrink-0 items-center gap-1 text-[calc(11px*var(--type-scale))] text-muted-foreground',
        ),
      ],
      [icon(h, Lock, 'size-3.5'), h.span([h.Class('compact:hidden')], [part.locked])],
    )
  if (part.price === null) return h.empty
  return h.span(
    [
      h.Class(
        cn(
          FIGURE,
          'shrink-0 text-[calc(12.5px*var(--type-scale))]',
          part.short ? 'text-danger' : '',
        ),
      ),
    ],
    [part.price],
  )
}

/** The shaped badge, the name over its blurb, and the price or the lock. */
export const partCells = (part: Part, h: HtmlBuilder<Message>): ReadonlyArray<Html> => [
  groupBadge(part.group, part.icon, 'size-8 shrink-0', h, part.locked !== null),
  h.span(
    [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
    [
      h.span(
        [h.Class('truncate text-[calc(13px*var(--type-scale))] leading-none font-medium')],
        [part.name],
      ),
      h.span(
        [
          h.Class(
            'truncate text-[calc(11.5px*var(--type-scale))] leading-tight text-muted-foreground',
          ),
        ],
        [part.blurb],
      ),
    ],
  ),
  detail(part, h),
]
