import { copy, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Check, Sparkles } from 'lucide'
import {
  AXES,
  FAMILIES,
  FRAMEWORKS,
  RUNTIMES,
  type Axes,
  type Axis,
  type FamilyId,
} from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import { migrationCost, targetOf } from '@quorum/simulation/migration'
import type { GameNode } from '@quorum/simulation/state'
import { deltaText } from './hud.ts'
import { money } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { glossaryUrl } from '@/platform/analytics.ts'
import type { Model, PreviewFigures, TradeoffOption } from '@/game/model.ts'
import type { TradeoffState } from '@/game/tradeoff-machine.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button, closeButton } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { FIGURE, PANEL } from '@quorum/ui/game/bits'

const kindTitleOf = (t: Messages): Record<TradeoffOption['kind'], string> => ({
  runtime: t.tradeoff.runtime,
  framework: t.tradeoff.framework,
  family: t.tradeoff.instance,
})

const axisLabelOf = (t: Messages): Record<Axis, string> => ({
  throughput: t.tradeoff.throughput,
  tail: t.tradeoff.tail,
  memory: t.tradeoff.memory,
  velocity: t.tradeoff.velocity,
  resilience: t.tradeoff.resilience,
  operability: t.tradeoff.operability,
})

/** Term names for the anchors the catalog names, shown as links to the wiki glossary. */
const termsOf = (t: Messages): Readonly<Record<string, string>> => ({
  'process-per-request': t.tradeoff.processPerRequest,
  'shared-nothing': t.tradeoff.sharedNothing,
  'gil-global-interpreter-lock': 'GIL',
  'cold-start': t.tradeoff.coldStart,
  'event-loop': t.tradeoff.eventLoop,
  'blast-radius': t.tradeoff.blastRadius,
  'vertical-and-horizontal-scaling': t.tradeoff.horizontalScaling,
  'tech-debt': t.tradeoff.techDebt,
  'n1-query': t.tradeoff.n1Query,
})

const nameOf = (t: Messages, option: TradeoffOption): string => {
  switch (option.kind) {
    case 'runtime':
      return t.catalog.runtimes[option.id].name
    case 'framework':
      return t.catalog.frameworks[option.id].name
    case 'family':
      return t.catalog.families[option.id].name
  }
}

/** The option the Node runs now, in the same option set. */
const currentOf = (node: GameNode, option: TradeoffOption): TradeoffOption => {
  switch (option.kind) {
    case 'runtime':
      return { kind: 'runtime', id: node.runtime }
    case 'framework':
      return { kind: 'framework', id: node.framework }
    case 'family':
      return { kind: 'family', id: node.family }
  }
}

/**
 * The six axes of an instance family, on the same radar as a Stack (16 "The
 * dominance test" scores the four families). 05's table carries the family's
 * facts, not its axes, so each read comes from them: throughput is vCPU per
 * dollar, memory is RAM per vCPU, and a Burstable box loses tail, resilience
 * and operability to the credit throttle. Velocity is the Stack's, so it sits
 * neutral. Higher is better on every axis, as for a runtime.
 */
export const familyAxes = (family: FamilyId): Axes => {
  const { ramPerVcpu, price } = FAMILIES[family]
  const throttled = family === 'burstable'
  // ARM is cheaper and 5% slower, and some software needs work to port (05 "App Server"), so it
  // gives up a point of tail and a point of operability for its price.
  const arm = family === 'arm'
  return {
    throughput: price <= 0.5 ? 5 : price <= 0.9 ? 4 : price <= 1.05 ? 3 : 2,
    tail: throttled ? 1 : arm ? 3 : ramPerVcpu >= 8 ? 5 : 4,
    memory: ramPerVcpu >= 8 ? 5 : ramPerVcpu >= 4 ? 3 : 2,
    velocity: 3,
    resilience: throttled ? 2 : ramPerVcpu >= 8 ? 4 : ramPerVcpu >= 4 ? 3 : 2,
    operability: throttled ? 2 : arm ? 3 : 4,
  }
}

const familyOf = (family: FamilyId): Readonly<{ axes: Axes; glossary: ReadonlyArray<string> }> => ({
  axes: familyAxes(family),
  glossary: [],
})

const stackOf = (
  option: TradeoffOption,
): Readonly<{ axes: Axes; glossary: ReadonlyArray<string> }> =>
  option.kind === 'runtime'
    ? RUNTIMES[option.id]
    : option.kind === 'framework'
      ? FRAMEWORKS[option.id]
      : familyOf(option.id)

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 62

const pointAt = (index: number, value: number): readonly [number, number] => {
  const angle = (Math.PI / 3) * index - Math.PI / 2
  const r = (RADIUS * value) / 5
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)]
}

const polygonOf = (axes: Axes): string =>
  AXES.map((axis, index) =>
    pointAt(index, axes[axis])
      .map((n) => n.toFixed(1))
      .join(','),
  ).join(' ')

const radar = (now: Axes, next: Axes, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.svg(
    [
      h.Class('mx-auto block h-[176px] w-[220px] overflow-visible'),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox(`0 22 ${SIZE} 176`),
      h.AriaLabel(t.tradeoff.sixAxesNowAndWithThis),
    ],
    [
      ...[1, 2, 3, 4, 5].map((ring) =>
        h.polygon([
          h.Key(`ring-${ring}`),
          h.Points(
            AXES.map((_, index) =>
              pointAt(index, ring)
                .map((n) => n.toFixed(1))
                .join(','),
            ).join(' '),
          ),
          h.Fill('none'),
          h.Class('stroke-hairline'),
          h.StrokeWidth('1'),
        ]),
      ),
      h.polygon([
        h.Key('now'),
        h.Points(polygonOf(now)),
        h.Class('fill-muted-foreground/10 stroke-muted-foreground'),
        h.StrokeWidth('1.25'),
        h.Attribute('stroke-dasharray', '3 2'),
      ]),
      h.polygon([
        h.Key('next'),
        h.Points(polygonOf(next)),
        h.Class('fill-group-compute/20 stroke-group-compute'),
        h.StrokeWidth('1.75'),
        h.StrokeLinejoin('round'),
      ]),
      ...AXES.map((axis, index) => {
        const [x, y] = pointAt(index, 6.6)
        const anchor = Math.abs(x - CENTER) < 4 ? 'middle' : x > CENTER ? 'start' : 'end'
        const up = next[axis] > now[axis]
        const down = next[axis] < now[axis]
        return h.text(
          [
            h.Key(`label-${axis}`),
            h.Attribute('x', x.toFixed(1)),
            h.Attribute('y', (y + 3.5).toFixed(1)),
            h.Attribute('text-anchor', anchor),
            h.Class(
              cn(
                'text-[calc(10.5px*var(--type-scale))] font-medium',
                up ? 'fill-ok' : down ? 'fill-danger' : 'fill-muted-foreground',
              ),
            ),
          ],
          [axisLabelOf(t)[axis]],
        )
      }),
    ],
  )
}

/** "+$0.80/s (+12%) · p99 +40 ms" from the ghost run. */
const previewLine = (t: Messages, model: Model, preview: PreviewFigures): string =>
  deltaText(
    t,
    {
      id: 0,
      label: '',
      before: preview.before,
      after: preview.after,
      worse: false,
      shownAt: 0,
    },
    has(model.board.game, 'percentiles'),
  )

/** Cash now, the change in Burn, and the restart. */
const costLine = (t: Messages, model: Model, preview: PreviewFigures): string => {
  const [before = 0, after = 0] = preview.burn
  const burn = after - before
  return [
    !model.board.game.sandbox && preview.cash > 0 ? money(preview.cash) : null,
    Math.abs(burn) >= 0.005
      ? t.tradeoff.burnChange(t.units.perSecond(`${burn > 0 ? '+' : '−'}${money(Math.abs(burn))}`))
      : null,
    preview.restart > 0 ? t.tradeoff.restartsCold(t.units.s(Math.ceil(preview.restart))) : null,
  ]
    .filter((part) => part !== null)
    .join(' · ')
}

const worse = (preview: PreviewFigures): boolean =>
  preview.after.revenue < preview.before.revenue * 0.98 ||
  preview.after.errors > preview.before.errors + 0.005

const effect = (model: Model, card: TradeoffState, h: HtmlBuilder<Message>): Html =>
  (card._tag === 'Hovering' || card._tag === 'Pinned') && card.preview
    ? h.div(
        [h.Class('flex flex-col gap-0.5')],
        [
          h.div(
            [h.Class('flex items-center gap-2')],
            [
              h.span(
                [
                  h.Class(
                    `size-2 shrink-0 rounded-full ${worse(card.preview) ? 'bg-danger' : 'bg-ok'}`,
                  ),
                ],
                [],
              ),
              h.span(
                [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))]'))],
                [previewLine(copy(h), model, card.preview)],
              ),
            ],
          ),
          costLine(copy(h), model, card.preview)
            ? h.span(
                [
                  h.Class(
                    cn(FIGURE, 'pl-4 text-[calc(11.5px*var(--type-scale))] text-muted-foreground'),
                  ),
                ],
                [costLine(copy(h), model, card.preview)],
              )
            : h.empty,
        ],
      )
    : card._tag === 'Refused'
      ? h.span([h.Class('text-[calc(12px*var(--type-scale))] text-warn')], [card.reason])
      : h.empty

const PLACE = 'absolute top-[76px] right-[372px] z-20 w-[320px] short:right-[340px]'

/** A phone shows the effect of an option as a strip above the safe area, not a floating card. */
const PLACE_PHONE =
  'compact:inset-x-2 compact:top-auto compact:right-2 compact:bottom-[max(8px,env(safe-area-inset-bottom))] compact:z-40 compact:w-auto'

/** An unpinned option takes the whole screen on a phone, like every other action. */
const PLACE_SCREEN =
  'compact:inset-0 compact:z-40 compact:max-h-none compact:w-auto compact:overflow-y-auto compact:rounded-none compact:p-5 compact:shadow-none'

export const tradeoffCard = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const card = model.board.tradeoff
  if (card._tag === 'Closed' || card.nodeId !== model.board.selected) return h.empty
  const node = model.board.game.nodes.find((entry) => entry.id === card.nodeId)
  if (!node) return h.empty
  const current = currentOf(node, card.option)
  const title = `${kindTitleOf(t)[card.option.kind]}: ${nameOf(t, current)} → ${nameOf(t, card.option)}`

  // Explicit reviews stay expanded even after this option set has been seen.
  if (card._tag !== 'Pinned' && model.prefs.seenTradeoffs.includes(card.option.kind))
    return h.div(
      [
        h.Key('tradeoff-line'),
        h.Class(cn(PLACE, PLACE_PHONE, PANEL, 'enter-panel flex flex-col gap-1 px-3.5 py-2.5')),
      ],
      [
        h.span(
          [h.Class('text-[calc(12.5px*var(--type-scale))] font-semibold')],
          [nameOf(t, card.option)],
        ),
        effect(model, card, h),
      ],
    )

  const stack = stackOf(card.option)
  const now = stackOf(current)
  const migration =
    !model.board.game.sandbox &&
    node.type === 'server' &&
    (card.option.kind === 'runtime' || card.option.kind === 'framework')
      ? targetOf(
          node,
          card.option.kind === 'runtime'
            ? { runtime: card.option.id }
            : { framework: card.option.id },
        )
      : null
  return h.div(
    [
      h.Key('tradeoff'),
      h.Class(cn(PLACE, PLACE_SCREEN, PANEL, 'enter-panel flex flex-col gap-3 p-4')),
      h.AriaLabel(title),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-2 pr-7')],
        [
          icon(h, Sparkles, 'size-4 shrink-0 text-group-compute'),
          h.span(
            [h.Class('min-w-0 flex-1 text-[calc(13.5px*var(--type-scale))] font-semibold')],
            [title],
          ),
        ],
      ),
      card._tag === 'Pinned'
        ? closeButton({ label: t.tradeoff.cancelEscape, onClick: Message.TradeoffClosed() }, h)
        : h.empty,
      radar(now.axes, stack.axes, h),
      effect(model, card, h),
      migration && card._tag !== 'Refused'
        ? h.p(
            [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
            [t.tradeoff.migrationDHAcrossAllAppServers(migrationCost(model.board.game, migration))],
          )
        : h.empty,
      stack && stack.glossary.length > 0
        ? h.div(
            [h.Class('flex flex-wrap gap-1.5')],
            stack.glossary.map((anchor) =>
              h.a(
                [
                  h.Key(anchor),
                  h.Href(glossaryUrl(anchor)),
                  h.Target('_blank'),
                  h.Rel('noreferrer noopener'),
                  h.Class(
                    'rounded-md bg-nested px-1.5 py-0.5 text-[calc(11px*var(--type-scale))] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground',
                  ),
                ],
                [termsOf(t)[anchor] ?? anchor],
              ),
            ),
          )
        : h.empty,
      card._tag === 'Pinned'
        ? h.div(
            [h.Class('flex gap-2')],
            [
              button(
                {
                  onClick: Message.OptionConfirmed(),
                  isDisabled: card.preview === null,
                  size: 'lg',
                  className: 'flex-1',
                  attributes: [h.Title(t.tradeoff.confirmEnter)],
                },
                [
                  icon(h, Check, 'size-4'),
                  migration ? t.tradeoff.startMigration : t.tradeoff.confirm,
                ],
                h,
              ),
              button(
                {
                  onClick: Message.TradeoffClosed(),
                  variant: 'outline',
                  size: 'lg',
                },
                [t.tradeoff.cancel],
                h,
              ),
            ],
          )
        : h.empty,
    ],
  )
}
