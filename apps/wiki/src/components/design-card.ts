import * as Effect from 'effect/Effect'
import { Schema } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { COMPONENTS, INCIDENTS, RESEARCH, SIZES } from '@quorum/simulation/catalog'
import { solveFlow } from '@quorum/simulation/solve'
import { heightOf } from '@quorum/ui/board/geometry'
import { compact, money, ms } from '@quorum/ui/game/format'
import { Message } from '../main.ts'
import { DESIGNS, DESIGN_IDS } from '../patterns/designs/index.ts'
import type { Setting } from '../patterns/design.ts'

/* ==========================================================================
   A Pattern Design in a page: the game's own board, then a table of every
   setting the picture uses and why. The build prerenders the frame and the
   table; in the browser design-board.ts draws the board into the frame.
   ========================================================================== */

// Defined on first use: this module is imported while main.ts is still loading.
const defineDesignMounted = () =>
  Mount.define('DesignMounted', {
    args: { id: Schema.Literals(DESIGN_IDS) },
    messages: [Message.Navigated],
    execute: ({ element, id }) =>
      Effect.gen(function* () {
        // Pixi loads only on pages that show a board.
        const { drawDesign } = yield* Effect.promise(() => import('./design-board.ts'))
        yield* Effect.acquireRelease(
          Effect.sync(() => drawDesign(id, element as HTMLElement)),
          (detach) => Effect.sync(detach),
        )
        return Message.Navigated()
      }),
  })

let designMounted: ReturnType<typeof defineDesignMounted> | null = null

const valueOf = (setting: Setting): string => {
  const { field, value } = setting
  if (field === 'size' && typeof value === 'number') return SIZES[value]?.name ?? String(value)
  if (value === true) return 'On'
  if (value === false) return 'Off'
  if (field === 'timeout' && typeof value === 'number') return `${value} s`
  return String(value)
}

/** The board's height: the packed Design's extent at a readable scale, never more than most of a screen. */
const heightFor = (id: string): string => {
  const design = DESIGNS[id]
  if (!design) return '320px'
  const top = Math.min(...design.game.nodes.map((node) => node.y))
  const bottom = Math.max(...design.game.nodes.map((node) => node.y + heightOf(node.type)))
  return `min(${Math.round(Math.max(260, (bottom - top) * 0.8 + 56))}px, 70vh)`
}

export const designView = (id: string, h: HtmlBuilder<Message>): Html => {
  const design = DESIGNS[id]
  if (!design) return h.empty
  const ledger = solveFlow(design.game)
  const rows = [
    ...design.nodes.flatMap((node) =>
      node.settings.map((setting) => ({
        key: `${node.id}-${setting.field}`,
        where: h.a(
          [h.Href(`/components/${node.type}`), h.Class('underline underline-offset-4')],
          [COMPONENTS[node.type].name],
        ),
        unlock: COMPONENTS[node.type].unlock,
        setting,
      })),
    ),
    ...design.links.flatMap((link) =>
      link.settings.map((setting) => ({
        key: `${link.from}-${link.to}-${setting.field}`,
        where: h.span(
          [],
          [
            `Link ${COMPONENTS[design.nodes.find((n) => n.id === link.from)?.type ?? 'users'].name} → ${COMPONENTS[design.nodes.find((n) => n.id === link.to)?.type ?? 'users'].name}`,
          ],
        ),
        unlock: undefined,
        setting,
      })),
    ),
  ]
  const needs = [
    ...new Set(
      design.nodes.flatMap((node) => {
        const unlock = COMPONENTS[node.type].unlock
        return unlock ? [unlock] : []
      }),
    ),
    ...design.researched,
  ]
  return h.figure(
    [h.Key(`design-${id}`), h.Class('not-prose my-6')],
    [
      h.div(
        [
          h.Role('img'),
          h.AriaLabel(
            `The Design: ${design.nodes.map((node) => COMPONENTS[node.type].name).join(', ')}`,
          ),
          h.Class('relative w-full cursor-grab overflow-hidden rounded-lg border border-border'),
          h.Style({ height: heightFor(id) }),
          h.OnMount((designMounted ??= defineDesignMounted())({ id })),
        ],
        [],
      ),
      h.p(
        [h.Class('mt-1.5 text-[12px] text-muted-foreground/80')],
        ['Drag to pan. Hold Ctrl or Cmd and scroll to zoom.'],
      ),
      h.figcaption(
        [h.Class('mt-2 text-[12.5px] text-muted-foreground')],
        [
          `At ${compact(design.users)} Users${design.incident ? ` and a running ${INCIDENTS[design.incident.kind].name} incident` : ''} the Simulation solves this Design to Apdex ${ledger.apdex.toFixed(2)}, p99 ${ms(ledger.p99)}, ${(ledger.errorShare * 100).toFixed(1)}% errors and ${money(ledger.burn)}/s Burn${ledger.egress >= 0.005 ? `, of which ${money(ledger.egress)}/s is egress` : ''}.${design.note ? ` ${design.note}` : ''}`,
        ],
      ),
      rows.length > 0
        ? h.div(
            [h.Class('mt-4 overflow-x-auto rounded-lg border border-border')],
            [
              h.table(
                [h.Class('w-full border-collapse text-[13.5px] leading-snug')],
                [
                  h.thead(
                    [],
                    [
                      h.tr(
                        [],
                        ['Where', 'Setting', 'Value', 'Why'].map((name) =>
                          h.th(
                            [
                              h.Class(
                                'border-b border-border bg-muted/50 px-3 py-2 text-left text-[12.5px] font-medium text-muted-foreground',
                              ),
                            ],
                            [name],
                          ),
                        ),
                      ),
                    ],
                  ),
                  h.tbody(
                    [h.Class('divide-y divide-border')],
                    rows.map((row) =>
                      h.tr(
                        [h.Key(row.key)],
                        [
                          h.td([h.Class('px-3 py-2 align-top whitespace-nowrap')], [row.where]),
                          h.td([h.Class('px-3 py-2 align-top')], [row.setting.label]),
                          h.td(
                            [h.Class('px-3 py-2 align-top whitespace-nowrap font-mono')],
                            [valueOf(row.setting)],
                          ),
                          h.td(
                            [h.Class('px-3 py-2 align-top text-muted-foreground')],
                            [row.setting.why],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          )
        : h.empty,
      needs.length > 0
        ? h.p(
            [h.Class('mt-2 text-[12.5px] text-muted-foreground')],
            [
              'Research this Design needs: ',
              ...needs.flatMap((research, index) => [
                ...(index > 0 ? [', '] : []),
                h.a(
                  [h.Href(`/research/${research}`), h.Class('underline underline-offset-4')],
                  [RESEARCH[research].name],
                ),
              ]),
              '.',
            ],
          )
        : h.empty,
    ],
  )
}
