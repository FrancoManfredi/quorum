import type { Html, HtmlBuilder } from 'foldkit/html'
import type { BurnLines } from '@quorum/simulation/ledger'
import { money } from '@quorum/ui/game/format'
import type { Message } from '@/game/message.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { FIGURE, WELL } from '@quorum/ui/game/bits'
import { cn } from '@/lib/utils'
import { shell } from './panels.ts'

/* ==========================================================================
   The cloud bill (09 "The cloud bill", 15 "Panels"): every line the build
   charges, so Burn can be read as a bill rather than one number.
   ========================================================================== */

type Line = Readonly<{ key: keyof BurnLines; label: string; note: string }>

const LINES: ReadonlyArray<Line> = [
  { key: 'compute', label: 'Compute', note: 'App Servers, Workers, edge, and platform Nodes' },
  { key: 'data', label: 'Data', note: 'Database, cache, pooler, replicas, and the rest' },
  { key: 'storage', label: 'Storage', note: 'GB stored, priced per GB per second' },
  { key: 'egress', label: 'Egress', note: 'Bytes out from the origin and the CDN' },
  { key: 'thirdParty', label: 'Third parties', note: 'Payment fees, scans, tokens, and messages' },
  { key: 'requests', label: 'Requests', note: 'API Gateway requests, priced per request' },
  { key: 'observability', label: 'Observability', note: 'Analytics sampling and retention' },
  { key: 'salaries', label: 'Salaries', note: 'Engineers, by language and policy' },
]

const row = (line: Line, value: number, total: number, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        'grid grid-cols-[1fr_auto_64px] items-baseline gap-4 border-b border-border py-2 last:border-b-0',
      ),
    ],
    [
      h.div(
        [h.Class('min-w-0')],
        [
          h.div([h.Class('text-[13.5px] text-foreground')], [line.label]),
          h.div([h.Class('text-[12px] leading-snug text-muted-foreground')], [line.note]),
        ],
      ),
      h.span([h.Class(cn(FIGURE, 'text-[13.5px] text-foreground'))], [`${money(value)}/s`]),
      h.span(
        [h.Class(cn(FIGURE, 'text-right text-[12px] text-muted-foreground'))],
        [total > 0 ? `${Math.round((value / total) * 100)}%` : '—'],
      ),
    ],
  )

export const costPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const ledger = ledgerOf(model)
  const lines = ledger.burnLines
  const total = ledger.burn
  const revenue = ledger.revenue
  const margin = revenue > 0 ? (revenue - total) / revenue : null
  return shell(
    'The cloud bill',
    [],
    [
      h.div(
        [h.Class('flex items-baseline gap-6 px-5 pb-2')],
        [
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [h.Class(cn(FIGURE, 'text-[20px] leading-none font-medium'))],
                [`${money(total)}/s`],
              ),
              h.span([h.Class('text-[12px] text-muted-foreground')], ['Burn']),
            ],
          ),
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [h.Class(cn(FIGURE, 'text-[20px] leading-none font-medium'))],
                [`${money(revenue)}/s`],
              ),
              h.span([h.Class('text-[12px] text-muted-foreground')], ['Revenue']),
            ],
          ),
          h.div(
            [h.Class('flex flex-col')],
            [
              h.span(
                [h.Class(cn(FIGURE, 'text-[20px] leading-none font-medium'))],
                [margin === null ? '—' : `${Math.round(margin * 100)}%`],
              ),
              h.span([h.Class('text-[12px] text-muted-foreground')], ['Margin']),
            ],
          ),
        ],
      ),
      h.div(
        [h.Class(cn(WELL, 'mx-5 mb-4 px-4 py-2'))],
        LINES.map((line) => row(line, lines[line.key], total, h)),
      ),
      h.p(
        [h.Class('px-5 pb-4 text-[12.5px] leading-snug text-muted-foreground')],
        [
          'The bill follows the Era’s cost index, so it rises with the Company. An API Gateway is billed per request; the Requests line is what it serves.',
        ],
      ),
    ],
    'max-w-[560px]',
    h,
  )
}
