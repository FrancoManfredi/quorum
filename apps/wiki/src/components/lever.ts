import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import type { LeverKind } from '@quorum/simulation/catalog'
import { FIGURE } from '@quorum/ui/game/bits'
import { localeOf } from '../i18n/builder.ts'
import { langOf } from '../i18n/lang.ts'
import { leverOf, leverRows } from '../reference/levers.ts'

/* A kind's Product lever as the game offers it: three steps, each with the share
   it gives the kind, its Dev Hours, and its growth cost. */

const percent = (share: number): string => `${Math.round(share * 1000) / 10}%`

export const leverView = <M>(kind: LeverKind, h: HtmlBuilder<M>): Html => {
  const l = langOf(localeOf(h))
  const t = l.t.islands.lever
  const def = leverOf(l, kind)
  const rows = leverRows(kind)
  const cell = 'px-3 py-1.5 text-left'
  return h.figure(
    [h.Class('not-prose my-6 overflow-hidden rounded-lg border border-border')],
    [
      h.div(
        [
          h.Class(
            'flex items-baseline justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2',
          ),
        ],
        [
          h.span([h.Class('text-[13px] font-medium')], [t.title(def.name)]),
          h.span(
            [h.Class('text-[12px] text-muted-foreground')],
            [t.default(percent(def.base), def.era)],
          ),
        ],
      ),
      h.div(
        [h.Class('overflow-x-auto')],
        [
          h.table(
            [h.Class('w-full border-collapse text-[13px] leading-snug')],
            [
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    [t.step, t.share, t.devHours, t.growth].map((header) =>
                      h.th(
                        [
                          h.Key(header),
                          h.Class(
                            cn(cell, 'bg-muted/30 text-[12px] font-medium text-muted-foreground'),
                          ),
                        ],
                        [header],
                      ),
                    ),
                  ),
                ],
              ),
              h.tbody(
                [],
                rows.map((row) =>
                  h.tr(
                    [h.Key(String(row.step)), h.Class('border-b border-border last:border-b-0')],
                    [
                      h.td([h.Class(cn(cell, FIGURE))], [String(row.step)]),
                      h.td([h.Class(cn(cell, FIGURE))], [percent(row.share)]),
                      h.td([h.Class(cn(cell, FIGURE))], [String(row.dh)]),
                      h.td([h.Class(cn(cell, FIGURE))], [`−${Math.round(row.growth * 100)}%`]),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      h.figcaption(
        [h.Class('border-t border-border px-3 py-2 text-[12px] text-muted-foreground')],
        [t.note],
      ),
    ],
  )
}
