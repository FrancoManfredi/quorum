import { copy, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { BurnLines } from '@quorum/simulation/ledger'
import { REQUEST_KINDS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import { money } from '@quorum/ui/game/format'
import type { Message } from '@/game/message.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { FIGURE, WELL } from '@quorum/ui/game/bits'
import { cn } from '@/lib/utils'
import { shell } from './panels.ts'

type Line = Readonly<{ key: keyof BurnLines; label: string; note: string }>

const linesOf = (t: Messages): ReadonlyArray<Line> => [
  { key: 'compute', label: t.cost.compute, note: t.cost.notes.compute },
  { key: 'data', label: t.cost.data, note: t.cost.notes.data },
  { key: 'storage', label: t.cost.storage, note: t.cost.notes.storage },
  { key: 'egress', label: t.cost.egress, note: t.cost.notes.egress },
  { key: 'thirdParty', label: t.cost.thirdParties, note: t.cost.notes.thirdParty },
  {
    key: 'requests',
    label: t.cost.requests,
    note: t.cost.notes.requests,
  },
  { key: 'observability', label: t.cost.observability, note: t.cost.notes.observability },
  { key: 'salaries', label: t.cost.salaries, note: t.cost.notes.salaries },
]

const row = (line: Line, value: number, total: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Class(
        'grid grid-cols-[1fr_auto_64px] items-baseline gap-4 border-b border-border py-2 last:border-b-0',
      ),
    ],
    [
      h.div(
        [h.Class('min-w-0')],
        [
          h.div([h.Class('text-[calc(13.5px*var(--type-scale))] text-foreground')], [line.label]),
          h.div(
            [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
            [line.note],
          ),
        ],
      ),
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(13.5px*var(--type-scale))] text-foreground'))],
        [t.cost.s(money(value))],
      ),
      h.span(
        [
          h.Class(
            cn(FIGURE, 'text-right text-[calc(12px*var(--type-scale))] text-muted-foreground'),
          ),
        ],
        [total > 0 ? `${Math.round((value / total) * 100)}%` : '—'],
      ),
    ],
  )
}

/** A simple two-column figure row, for unit economics and cost allocation. */
const figureRow = (label: string, value: string, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        'flex items-baseline justify-between gap-4 border-b border-border py-1.5 last:border-b-0',
      ),
    ],
    [
      h.span([h.Class('text-[calc(12.5px*var(--type-scale))] text-foreground')], [label]),
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(12.5px*var(--type-scale))] text-muted-foreground'))],
        [value],
      ),
    ],
  )

export const costPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const ledger = ledgerOf(model)
  const lines = ledger.burnLines
  const total = ledger.burn
  const revenue = ledger.revenue
  const margin = revenue > 0 ? (revenue - total) / revenue : null
  const unitEconomics = has(game, 'unit-economics')
    ? REQUEST_KINDS.filter((kind) => (ledger.costPerKind[kind] ?? 0) > 0)
    : []
  const costAllocation = has(game, 'cost-allocation')
    ? (Object.entries(ledger.costPerService) as ReadonlyArray<[string, number]>).filter(
        ([, cost]) => cost > 0,
      )
    : []
  return shell(
    t.cost.cloudBill,
    [],
    [
      h.div(
        [h.Class('flex items-baseline gap-6 px-5 pb-2')],
        [
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(20px*var(--type-scale))] leading-none font-medium'),
                  ),
                ],
                [t.cost.s(money(total))],
              ),
              h.span(
                [h.Class('text-[calc(12px*var(--type-scale))] text-muted-foreground')],
                [t.cost.burn],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(20px*var(--type-scale))] leading-none font-medium'),
                  ),
                ],
                [t.cost.s(money(revenue))],
              ),
              h.span(
                [h.Class('text-[calc(12px*var(--type-scale))] text-muted-foreground')],
                [t.cost.revenue],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(20px*var(--type-scale))] leading-none font-medium'),
                  ),
                ],
                [margin === null ? '—' : `${Math.round(margin * 100)}%`],
              ),
              h.span(
                [h.Class('text-[calc(12px*var(--type-scale))] text-muted-foreground')],
                [t.cost.margin],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class(cn(WELL, 'mx-5 mb-4 px-4 py-2'))],
        linesOf(t).map((line) => row(line, lines[line.key], total, h)),
      ),
      ...(unitEconomics.length > 0
        ? [
            h.div(
              [h.Class('px-5 pb-1 text-[calc(12px*var(--type-scale))] text-muted-foreground')],
              ['Unit economics · cost per served request'],
            ),
            h.div(
              [h.Class(cn(WELL, 'mx-5 mb-4 px-4 py-2'))],
              unitEconomics.map((kind) =>
                figureRow(
                  t.catalog.kinds[kind].label,
                  `${money(ledger.costPerKind[kind] ?? 0)}/req`,
                  h,
                ),
              ),
            ),
          ]
        : []),
      ...(costAllocation.length > 0
        ? [
            h.div(
              [h.Class('px-5 pb-1 text-[calc(12px*var(--type-scale))] text-muted-foreground')],
              ['Cost allocation · by Service'],
            ),
            h.div(
              [h.Class(cn(WELL, 'mx-5 mb-4 px-4 py-2'))],
              costAllocation.map(([id, cost]) => {
                const service = game.services.find((entry) => entry.id === id)
                const team = game.teams.find((entry) => entry.id === service?.owner)
                return figureRow(
                  `${service?.name ?? id} (${team?.name ?? 'core'})`,
                  t.cost.s(money(cost)),
                  h,
                )
              }),
            ),
          ]
        : []),
      h.p(
        [
          h.Class(
            'px-5 pb-4 text-[calc(12.5px*var(--type-scale))] leading-snug text-muted-foreground',
          ),
        ],
        [t.cost.billExplainer],
      ),
    ],
    'max-w-[560px]',
    h,
  )
}
