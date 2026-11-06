import { copy, nodeTitle, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { churnOf, type ChurnFix, type ChurnRow, type RegionChurn } from '@quorum/simulation/churn'
import { DEVICE_INFO } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import { openRegions } from '@quorum/simulation/regions'
import type { Game } from '@quorum/simulation/state'
import { compact, ms } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { FIGURE, SCROLL, WELL, toneText } from '@quorum/ui/game/bits'
import { shell } from './panels.ts'

/* ==========================================================================
   The Churn breakdown (GDD 12): why each region's Users leave, and the fixes
   that win back the Apdex the region needs. It opens from Users on the HUD.
   ========================================================================== */

/** The button that applies a row's fix, or its advice as text. */
const fixOf = (game: Game, fix: ChurnFix, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  if (fix._tag === 'advice')
    return h.span(
      [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
      [fix.text],
    )
  const shown = fix._tag === 'node' ? game.nodes.find((node) => node.id === fix.nodeId) : undefined
  const [label, message] =
    fix._tag === 'region'
      ? [
          `${
            has(game, 'infra-as-code') &&
            !game.nodes.some((node) => node.region === fix.region && node.type !== 'users')
              ? 'Mirror into'
              : openRegions(game).includes(fix.region)
                ? 'Build in'
                : t.churn.open
          } ${t.catalog.regionInfo[fix.region].name}`,
          Message.ChurnFixTaken({ fix: 'region', target: fix.region }),
        ]
      : fix._tag === 'research'
        ? [
            `Research ${t.catalog.research[fix.research].name}`,
            Message.ChurnFixTaken({ fix: 'research', target: fix.research }),
          ]
        : [
            t.churn.show(shown ? nodeTitle(t, game, shown) : t.churn.node),
            Message.ChurnFixTaken({ fix: 'node', target: fix.nodeId }),
          ]
  return button(
    { onClick: message, variant: 'outline', size: 'sm', className: 'justify-self-start' },
    label,
    h,
  )
}

/** The slowest hop and the internet hop per device that a row names, as one line. */
const detailOf = (t: Messages, game: Game, entry: ChurnRow): string => {
  const hop = entry.hop
  const shown = hop ? game.nodes.find((node) => node.id === hop.nodeId) : undefined
  return [
    ...(hop
      ? [`Slowest hop: ${shown ? nodeTitle(t, game, shown) : 'Node'} adds ${ms(hop.ms)}`]
      : []),
    ...(entry.device
      ? [`${DEVICE_INFO[entry.device.device].name} adds ${ms(entry.device.ms)} over the internet`]
      : []),
  ].join(' · ')
}

const row = (
  game: Game,
  entry: ChurnRow,
  widest: number,
  fixed: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const detail = detailOf(t, game, entry)
  return h.div(
    [h.Key(`${entry.kind}:${entry.cause}`)],
    [
      rowGrid(game, entry, widest, fixed, h),
      ...(detail === ''
        ? []
        : [
            h.div(
              [
                h.Class(
                  cn(
                    'px-3 pb-1 text-[calc(11.5px*var(--type-scale))] text-muted-foreground',
                    !entry.needed && 'opacity-60',
                  ),
                ),
              ],
              [detail],
            ),
          ]),
    ],
  )
}

const rowGrid = (
  game: Game,
  entry: ChurnRow,
  widest: number,
  fixed: boolean,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Class(
        cn(
          'grid grid-cols-[88px_80px_1fr_44px_minmax(0,180px)] items-center gap-3 px-3 py-1.5 compact:grid-cols-[72px_64px_1fr_40px]',
          !entry.needed && 'opacity-60',
        ),
      ),
    ],
    [
      h.span(
        [h.Class('truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
        [t.catalog.kinds[entry.kind].label],
      ),
      h.span(
        [
          h.Class(
            cn(
              'text-[calc(12px*var(--type-scale))]',
              entry.cause === 'slow' || entry.cause === 'far' ? 'text-warn' : 'text-danger',
            ),
          ),
        ],
        [entry.cause],
      ),
      h.div(
        [
          h.Class('h-1.5 rounded-full bg-muted'),
          h.Title(entry.p99 === null ? '' : `p99 ${ms(entry.p99)} · T ${ms(entry.target)}`),
        ],
        [
          h.div(
            [
              h.Class(
                cn('h-full rounded-full', entry.needed ? 'bg-danger' : 'bg-muted-foreground'),
              ),
              h.Style({ width: `${Math.max(4, (entry.points / widest) * 100)}%` }),
            ],
            [],
          ),
        ],
      ),
      h.span(
        [h.Class(cn(FIGURE, 'text-right text-[calc(12px*var(--type-scale))]'))],
        [entry.points.toFixed(3)],
      ),
      h.div([h.Class('compact:col-span-4')], fixed ? [fixOf(game, entry.fix, h)] : []),
    ],
  )
}

const section = (game: Game, region: RegionChurn, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const falling = region.perHour < 0
  const share = region.users > 0 ? (region.perHour / region.users) * 100 : 0
  const widest = region.rows.reduce((most, entry) => Math.max(most, entry.points), 0.001)
  return h.section(
    [h.Key(region.region), h.Class(cn('flex flex-col py-1', WELL))],
    [
      h.div(
        [h.Class('flex flex-wrap items-baseline gap-x-4 gap-y-1 px-3 pt-2 pb-1.5')],
        [
          h.span(
            [h.Class('text-[calc(14px*var(--type-scale))] font-semibold')],
            [t.catalog.regionInfo[region.region].name],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(12.5px*var(--type-scale))]'))],
            [t.churn.users(compact(region.users))],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12.5px*var(--type-scale))]',
                  toneText(region.now >= region.target ? 'ok' : 'danger'),
                ),
              ),
            ],
            [`Apdex ${region.now.toFixed(2)} / ${region.target.toFixed(2)}`],
          ),
          h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12.5px*var(--type-scale))]',
                  toneText(falling ? 'danger' : 'ok'),
                ),
              ),
            ],
            [`${share >= 0 ? '+' : '−'}${Math.abs(share).toFixed(1)}%/h`],
          ),
          h.span(
            [
              h.Class(
                cn(FIGURE, 'ml-auto text-[calc(12.5px*var(--type-scale))] text-muted-foreground'),
              ),
            ],
            [t.churn.n1Day(compact(region.inADay))],
          ),
        ],
      ),
      // Each fix shows once, on the first row the region needs it for.
      ...region.rows.map((entry, index) =>
        row(
          game,
          entry,
          widest,
          entry.needed &&
            region.rows.findIndex(
              (other) => JSON.stringify(other.fix) === JSON.stringify(entry.fix),
            ) === index,
          h,
        ),
      ),
    ],
  )
}

/** The breakdown runs a day's forecast, so each Game computes it once, not every frame. */
const cache = new WeakMap<Game, ReadonlyArray<RegionChurn>>()

export const churnPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const regions = cache.get(game) ?? churnOf(game, ledgerOf(model))
  cache.set(game, regions)
  return shell(
    t.churn.whyUsersLeave,
    [],
    [
      h.div(
        [h.Class(cn('flex flex-col gap-3 px-5 pt-1 pb-5', SCROLL))],
        regions.map((region) => section(game, region, h)),
      ),
    ],
    'max-w-[720px]',
    h,
  )
}
