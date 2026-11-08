import { copy, insightName, localized, type Messages } from '@/i18n/messages.ts'
import { ResearchMessage, STUDY_QUEUE, queueIndex } from '@/game/research.ts'
import { Option } from 'effect'
import * as Effect from 'effect/Effect'
import { Mount } from 'foldkit'
import { DragAndDrop } from '@foldkit/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowDown,
  ArrowUp,
  Check,
  X,
  type IconNode,
  Lock,
  TriangleAlert,
  CircleHelp,
} from 'lucide'
import {
  GLOSSARY,
  RESEARCH,
  researchList,
  type ResearchDef,
  type ResearchId,
  type ResearchTrack,
} from '@quorum/simulation/catalog'
import { BY_RESEARCH } from '@quorum/simulation/term-links'
import { glossaryUrl } from '@/platform/analytics.ts'
import type { Ledger } from '@quorum/simulation/ledger'
import { has, missingPrerequisites, needs, researchReady } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import {
  limitingPool,
  studySeconds,
  studySpeed,
  studyStall,
  progressOf as studyProgressOf,
} from '@quorum/simulation/studies'
import { compact } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { stallReasonIn } from '@/i18n/format.ts'
import { unsampledOf } from '@quorum/simulation/solve-insight'
import { ledgerOf, type Model } from '@/game/model.ts'
import { POOL_ORDER, recipeOf } from '@quorum/ui/game/pools'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, FLOAT, PANEL, SCROLL, insightChip } from '@quorum/ui/game/bits'
import { LOOKS, TRACK_ICONS, colorOf, researchMark } from '@quorum/ui/game/research-marks'
import {
  eraName,
  nodeSize,
  researchLayout,
  type Layout,
  type Placed,
} from '@quorum/ui/game/research-layouts'

/** Items that list `id` as a prerequisite. */
const followUps = (id: ResearchId): ReadonlyArray<ResearchDef> =>
  researchList.filter((entry) => entry.requires.includes(id))

type State = 'owned' | 'buy' | 'saving' | 'locked'

// A queued item is saving even while locked: it waits behind its queued prerequisites.
const stateOf = (game: Game, entry: ResearchDef): State =>
  has(game, entry.id)
    ? 'owned'
    : game.studies.some((item) => item.id === entry.id)
      ? 'saving'
      : !researchReady(game, entry.id)
        ? 'locked'
        : 'buy'

/** The item the side pane shows: the player's pick, else the most useful next one. */
const focusOf = (model: Model): ResearchDef => {
  const game = model.board.game
  if (model.board.research.focus) return RESEARCH[model.board.research.focus]
  const action = game.openActions.find((id) => !has(game, id))
  if (action) return RESEARCH[action]
  const ready = researchList
    .filter((entry) => researchReady(game, entry.id) && !has(game, entry.id))
    .toSorted((a, b) => a.cost - b.cost)
  return ready[0] ?? researchList[0] ?? RESEARCH.stripe
}

const NODE_CLASS: Record<State, string> = {
  owned: 'bg-nested shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
  buy: 'bg-raised shadow-raised hover:brightness-[0.985]',
  saving: 'bg-raised shadow-raised hover:brightness-[0.985]',
  locked: 'border border-dashed border-border bg-canvas hover:bg-foreground/[0.03]',
}

/** The recipe as pool chips, or a check once researched. */
const price = (entry: ResearchDef, state: State, grey: boolean, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return state === 'owned'
    ? h.span(
        [h.Class('flex items-center gap-1 text-[calc(11px*var(--type-scale))] text-ok')],
        [icon(h, Check, 'size-3'), t.research.researched],
      )
    : h.span(
        [
          h.Class(
            cn(
              'flex w-fit items-center gap-2 text-[calc(11px*var(--type-scale))]',
              grey ? 'text-muted-foreground' : '',
            ),
          ),
        ],
        [
          state === 'locked' ? icon(h, Lock, 'size-2.5') : h.empty,
          ...recipeOf(entry.id).map(([pool, cost]) =>
            insightChip(pool, compact(cost), h, grey, 'plain', insightName(t, pool)),
          ),
        ],
      )
}

/** A Study's duration at the current speed, such as "4 min". */
const duration = (t: Messages, game: Game, entry: ResearchDef): string => {
  const seconds = studySeconds(entry.id) / studySpeed(game)
  return seconds < 90 ? t.units.s(Math.round(seconds)) : t.units.min(Math.round(seconds / 60))
}

/** Each pool of the recipe: what it costs, what the pool holds, and what it earns. */
const costRows = (
  game: Game,
  ledger: Ledger,
  entry: ResearchDef,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const running = game.studies[0]?.id === entry.id
  const limit = running ? limitingPool(game) : null
  return h.div(
    [h.Class('flex flex-col gap-1')],
    [
      h.span([h.Class(cn(EYEBROW, 'px-2'))], [t.research.cost(duration(t, game, entry))]),
      ...recipeOf(entry.id, game.discounts).map(([pool, cost]) =>
        h.div(
          [
            h.Key(pool),
            h.Class(cn(FIGURE, 'flex items-center gap-2 px-2 text-[calc(12px*var(--type-scale))]')),
          ],
          [
            insightChip(pool, compact(cost), h, false, 'plain', insightName(t, pool)),
            h.span(
              [
                h.Class(
                  cn('ml-auto', game.pools[pool] < cost ? 'text-warn' : 'text-muted-foreground'),
                ),
              ],
              [t.research.held(compact(game.pools[pool]))],
            ),
            h.span(
              [
                h.Class(
                  cn(
                    'w-[64px] text-right',
                    ledger.insight[pool] > 0 ? 'text-ok' : 'text-warn',
                    pool === limit ? 'font-semibold' : '',
                  ),
                ),
              ],
              [t.research.s(ledger.insight[pool].toFixed(1))],
            ),
          ],
        ),
      ),
    ],
  )
}

/** A card's icon, name and price or status; `grey` draws it uncoloured. */
const face = (
  game: Game,
  entry: ResearchDef,
  state: State,
  grey: boolean,
  large: boolean,
  far: boolean,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const open = state !== 'owned' && game.openActions.includes(entry.id)
  return [
    researchMark(entry, 'sm', grey, h),
    h.span(
      [h.Class('flex min-w-0 flex-1 flex-col gap-1')],
      [
        h.span(
          [
            h.Class(
              cn(
                'flex items-start gap-1 text-[calc(12.5px*var(--type-scale))] leading-tight font-semibold',
                grey ? 'text-muted-foreground' : '',
              ),
            ),
          ],
          [
            // Two lines fit inside the box by design: the box is wide enough for the
            // longest name in every language at 150% (15 "Accessibility"). The clamp
            // stays as the last guard against a name added later. `auto-phrase` breaks
            // Japanese at a phrase boundary rather than mid-term, where it is supported.
            h.span(
              [h.Class(cn('[word-break:auto-phrase]', far ? 'line-clamp-1' : 'line-clamp-2'))],
              [t.catalog.research[entry.id].name],
            ),
            open ? icon(h, TriangleAlert, 'size-3 shrink-0 text-warn') : h.empty,
          ],
        ),
        // Beyond the next Era the card is a silhouette: what the item is for, never its price.
        far
          ? h.span(
              [
                h.Class(
                  'line-clamp-1 text-[calc(10.5px*var(--type-scale))] leading-snug text-muted-foreground',
                ),
              ],
              [t.catalog.research[entry.id].blurb],
            )
          : price(entry, state, grey, h),
      ],
    ),
  ]
}

/** A card node. Saving up: the card is the progress bar, a coloured copy wiping in from the left. */
const card = (
  game: Game,
  entry: ResearchDef,
  state: State,
  large: boolean,
  far: boolean,
  h: HtmlBuilder<Message>,
) => {
  const share = Math.min(1, studyProgressOf(game.studies.find((item) => item.id === entry.id)))
  const color = colorOf(LOOKS[entry.id])
  return state === 'saving'
    ? [
        ...face(game, entry, state, true, large, far, h),
        h.span(
          [
            h.Key('fill'),
            h.AriaHidden(true),
            h.Class(
              'absolute inset-0 flex items-center gap-2.5 px-2.5 py-1 transition-[clip-path] duration-500 ease-linear',
            ),
            h.Style({
              background: `linear-gradient(to right, color-mix(in oklab, ${color} 8%, var(--raised-top)), color-mix(in oklab, ${color} 22%, var(--raised-top)))`,
              'clip-path': `inset(0 ${(1 - share) * 100}% 0 0)`,
            }),
          ],
          face(game, entry, state, false, large, far, h),
        ),
        h.span(
          [
            h.Key('edge'),
            h.AriaHidden(true),
            h.Class('absolute inset-y-0 w-[1.5px] transition-[left] duration-500 ease-linear'),
            h.Style({ left: `${share * 100}%`, background: color, opacity: '0.55' }),
          ],
          [],
        ),
      ]
    : face(game, entry, state, state === 'locked', large, far, h)
}

/** The interface's type scale: the tree's boxes and spacing grow with it (15 "Accessibility"). */
const scaleOf = (model: Model): number => (model.prefs.text === 'large' ? 1.5 : 1)

const node = (model: Model, place: Placed, focused: boolean, h: HtmlBuilder<Message>): Html => {
  const game = model.board.game
  const { entry } = place
  const state = stateOf(game, entry)
  const large = model.prefs.text === 'large'
  const size = nodeSize(scaleOf(model))
  // Beyond the next Era the item is a silhouette: a name and what it is for, no price,
  // and no click. The player can still want it before research makes it a choice.
  const far = entry.era > game.stage + 1 && state === 'locked'
  const style = h.Style({
    left: `${place.x}px`,
    top: `${place.y}px`,
    width: `${size.w}px`,
    height: `${size.h}px`,
  })
  const shape = h.Class(
    cn(
      'absolute flex items-center gap-2.5 overflow-hidden rounded-xl px-2.5 py-1 text-left transition-[filter,box-shadow,outline-color,opacity]',
      NODE_CLASS[state],
      focused
        ? 'outline-2 outline-offset-2 outline-primary-strong'
        : 'outline-2 outline-offset-2 outline-transparent',
      far ? 'opacity-45' : '',
    ),
  )
  const body = card(game, entry, state, large, far, h)
  return far
    ? h.div(
        [
          h.Key(entry.id),
          h.DataAttribute('research', entry.id),
          h.AriaDisabled(true),
          style,
          shape,
        ],
        body,
      )
    : h.button(
        [
          h.Key(entry.id),
          h.Type('button'),
          h.DataAttribute('research', entry.id),
          h.AriaPressed(focused ? 'true' : 'false'),
          h.OnClick(
            Message.ResearchChanged({ message: ResearchMessage.Focused({ id: entry.id }) }),
          ),
          h.OnDoubleClick(
            Message.ResearchChanged({ message: ResearchMessage.Bought({ id: entry.id }) }),
          ),
          style,
          shape,
        ],
        body,
      )
}

const wires = (model: Model, layout: Layout, focus: ResearchDef, h: HtmlBuilder<Message>): Html =>
  h.svg(
    [
      h.AriaHidden(true),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.Class('pointer-events-none absolute inset-0 overflow-visible'),
      h.Width(String(layout.width)),
      h.Height(String(layout.height)),
      h.Fill('none'),
    ],
    layout.wires.map((wire) => {
      const done = wire.from
        ? has(model.board.game, wire.from)
        : wire.to
          ? has(model.board.game, wire.to)
          : false
      const lit = focus.id === wire.to || focus.id === wire.from
      return h.path(
        [
          h.Key(wire.key),
          h.D(wire.d),
          h.StrokeWidth(lit ? '2.25' : wire.root ? '2' : '1.5'),
          h.StrokeLinecap('round'),
          h.StrokeLinejoin('round'),
          h.Class(
            cn(
              lit
                ? 'stroke-primary-strong'
                : done
                  ? 'stroke-foreground/40'
                  : wire.root
                    ? 'stroke-foreground/15'
                    : 'stroke-foreground/20',
              'transition-[stroke] duration-150',
            ),
          ),
          ...(done || wire.root ? [] : [h.Attribute('stroke-dasharray', '3 4')]),
        ],
        [],
      )
    }),
  )

const progressOf = (game: Game, track: ResearchTrack) => {
  const entries = researchList.filter((entry) => entry.track === track)
  return { owned: entries.filter((entry) => has(game, entry.id)).length, total: entries.length }
}

const progressBar = (
  game: Game,
  track: ResearchTrack,
  className: string,
  h: HtmlBuilder<Message>,
) => {
  const { owned, total } = progressOf(game, track)
  return h.div(
    [h.Class(cn('flex items-center gap-2', className))],
    [
      h.span(
        [h.Class('h-1 flex-1 overflow-hidden rounded-full bg-well shadow-well')],
        [
          h.span(
            [
              h.Class('block h-full rounded-full bg-ok'),
              h.Style({ width: `${(owned / total) * 100}%` }),
            ],
            [],
          ),
        ],
      ),
      h.span(
        [h.Class(cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'))],
        [`${owned}/${total}`],
      ),
    ],
  )
}

const eraLabel = (game: Game, era: number, h: HtmlBuilder<Message>) => [
  era > game.stage ? icon(h, Lock, 'size-3') : h.empty,
  copy(h).catalog.eras[era]?.name ?? eraName(era),
  era === game.stage ? h.span([h.Class('size-1.5 rounded-full bg-ok')], []) : h.empty,
]

const backdrop = (model: Model, layout: Layout, h: HtmlBuilder<Message>) => {
  const t = copy(h)

  const game = model.board.game
  // One band per Era, the current one tinted and the ones ahead washed out.
  const bands = layout.bands.map((band) =>
    h.div(
      [
        h.Key(`era-${band.era}`),
        h.Class(
          cn(
            'absolute border-t border-hairline',
            band.era === game.stage
              ? 'bg-ok/[0.035]'
              : band.era > game.stage + 1
                ? 'bg-foreground/[0.04]'
                : band.era > game.stage
                  ? 'bg-foreground/[0.02]'
                  : '',
          ),
        ),
        h.Style({
          left: `${band.x}px`,
          top: `${band.y}px`,
          width: `${band.w}px`,
          height: `${band.h}px`,
        }),
      ],
      [
        h.span(
          [
            h.Class(
              cn(
                EYEBROW,
                'absolute top-3 left-5 flex items-center gap-1.5',
                band.era === game.stage ? 'text-foreground' : '',
              ),
            ),
          ],
          eraLabel(game, band.era, h),
        ),
      ],
    ),
  )
  const roots = layout.tracks.map((track) =>
    h.div(
      [
        h.Key(`root-${track.track}`),
        h.Class(
          'absolute flex w-[180px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2',
        ),
        h.Style({ left: `${track.x}px`, top: `${track.y}px` }),
      ],
      [
        h.span(
          [h.Class('grid size-14 place-items-center rounded-2xl bg-surface shadow-card')],
          [icon(h, TRACK_ICONS[track.track], 'size-6')],
        ),
        h.span(
          [h.Class('text-[calc(14px*var(--type-scale))] font-semibold')],
          [t.catalog.researchTracks[track.track].label],
        ),
        progressBar(game, track.track, 'w-28', h),
      ],
    ),
  )
  return [...bands, ...roots]
}

/**
 * The screen scrolls like a page. It opens with the focused item in view,
 * and scrolls to an item when the player focuses one that is off screen.
 */
const scrollTo = (host: HTMLElement, target: Element, behavior: ScrollBehavior) => {
  const box = target.getBoundingClientRect()
  const view = host.getBoundingClientRect()
  if (
    box.left > view.left &&
    box.right < view.right &&
    box.top > view.top + 80 &&
    box.bottom < view.bottom - 80
  )
    return
  target.scrollIntoView({ block: 'center', inline: 'center', behavior })
}

/** Opens the tree scrolled to the focused item; the Research test resolves it by name. */
export const ResearchScroll = Mount.define('ResearchScroll', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const host = element as HTMLElement
        const focused = host.querySelector('[aria-pressed="true"]')
        if (focused) scrollTo(host, focused, 'instant')
        const watch = new MutationObserver((changes) => {
          for (const change of changes)
            if ((change.target as Element).getAttribute('aria-pressed') === 'true')
              scrollTo(host, change.target as Element, 'smooth')
        })
        watch.observe(host, { subtree: true, attributes: true, attributeFilter: ['aria-pressed'] })
        const events = new AbortController()
        let start: { id: number; x: number; y: number; left: number; top: number } | null = null
        let dragged = false
        host.addEventListener(
          'pointerdown',
          (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return
            start = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              left: host.scrollLeft,
              top: host.scrollTop,
            }
            dragged = false
          },
          { signal: events.signal },
        )
        host.addEventListener(
          'pointermove',
          (event) => {
            if (!start || start.id !== event.pointerId) return
            if ((event.buttons & 1) === 0) {
              start = null
              host.classList.remove('cursor-grabbing', 'select-none')
              return
            }
            const dx = event.clientX - start.x
            const dy = event.clientY - start.y
            if (!dragged && Math.hypot(dx, dy) < 5) return
            if (!dragged) {
              dragged = true
              host.setPointerCapture(event.pointerId)
              host.classList.add('cursor-grabbing', 'select-none')
            }
            event.preventDefault()
            host.scrollLeft = start.left - dx
            host.scrollTop = start.top - dy
          },
          { signal: events.signal },
        )
        const end = (event: PointerEvent) => {
          if (start?.id !== event.pointerId) return
          start = null
          host.classList.remove('cursor-grabbing', 'select-none')
        }
        host.addEventListener('pointerup', end, { signal: events.signal })
        host.addEventListener('pointercancel', end, { signal: events.signal })
        host.addEventListener(
          'click',
          (event) => {
            if (!dragged || event.detail === 0) return
            event.preventDefault()
            event.stopPropagation()
            dragged = false
          },
          { capture: true, signal: events.signal },
        )
        host.addEventListener('dragstart', (event) => event.preventDefault(), {
          signal: events.signal,
        })
        return { watch, events }
      }),
      ({ watch, events }) =>
        Effect.sync(() => {
          watch.disconnect()
          events.abort()
        }),
    ).pipe(Effect.as(Message.Synced())),
})

const linkRow = (game: Game, entry: ResearchDef, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const far = entry.era > game.stage + 1 && !has(game, entry.id)
  const inner = [
    researchMark(entry, 'sm', stateOf(game, entry) === 'locked', h),
    h.span([h.Class('min-w-0 flex-1 truncate')], [t.catalog.research[entry.id].name]),
    has(game, entry.id)
      ? icon(h, Check, 'size-3.5 text-ok')
      : icon(h, Lock, 'size-3 text-muted-foreground'),
  ]
  return far
    ? h.div(
        [
          h.Key(entry.id),
          h.AriaDisabled(true),
          h.Class('flex w-full items-center gap-2.5 px-2 py-1.5'),
        ],
        inner,
      )
    : h.button(
        [
          h.Key(entry.id),
          h.Type('button'),
          h.OnClick(
            Message.ResearchChanged({ message: ResearchMessage.Focused({ id: entry.id }) }),
          ),
          h.Class(
            'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[calc(12.5px*var(--type-scale))] hover:bg-foreground/5',
          ),
        ],
        inner,
      )
}

/** One (?) link per term behind the item; each opens its page on the wiki. */
const terms = (entry: ResearchDef, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const entries = (BY_RESEARCH[entry.id] ?? []).flatMap((id) =>
    GLOSSARY.filter((term) => term.id === id),
  )
  return entries.length > 0
    ? h.div(
        [h.Class('flex flex-wrap gap-1.5')],
        entries.map((term) =>
          h.a(
            [
              h.Key(term.id),
              h.Href(glossaryUrl(term.id)),
              h.Target('_blank'),
              h.Rel('noreferrer noopener'),
              h.Title(t.research.glossary(t.catalog.glossary[term.id]?.term ?? term.term)),
              h.Class(
                'flex items-center gap-1 rounded-md bg-nested px-1.5 py-0.5 text-[calc(11.5px*var(--type-scale))] text-muted-foreground hover:text-foreground',
              ),
            ],
            [
              icon(h, CircleHelp, 'size-3 shrink-0'),
              t.catalog.glossary[term.id]?.term ?? term.term,
            ],
          ),
        ),
      )
    : h.empty
}

/**
 * How many rows a queue row slides for a drag from `from` to `to`. Rows keep their
 * order in the DOM, so the queue can show where the drop lands without the rows
 * moving under the pointer.
 */
const queueSlide = (index: number, from: number, to: number): number => {
  // The dragged row goes down to the slot the drop leaves it in. The rows between it
  // and that slot step one place back toward where it started, so the slot follows
  // the pointer and the rows never cross it.
  if (index === from) return to - from
  const without = index > from ? index - 1 : index
  return (without < to ? without : without + 1) - index
}

/** A small icon button in the queue. */
const queueButton = (
  label: string,
  glyph: IconNode,
  message: Message,
  enabled: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  button(
    {
      onClick: message,
      isDisabled: !enabled,
      variant: 'ghost',
      size: 'icon-xs',
      className: 'text-muted-foreground',
      attributes: [h.AriaLabel(label), h.Title(label)],
    },
    icon(h, glyph, 'size-3.5'),
    h,
  )

/** The Study queue, in order: the first one runs. Drag a row to reorder it. */
const queuePanel = (model: Model, focus: ResearchId, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const studies = game.studies
  const ledger = ledgerOf(model)
  const drag = model.board.research.drag
  const dragging = DragAndDrop.isDragging(drag)
  const draggedId = DragAndDrop.maybeDraggedItemId(drag)
  // Where the drop leaves the dragged row. The rows stay put in the DOM and slide by
  // whole rows, so the queue shows the gap without moving the target under the pointer.
  const from = Option.match(draggedId, {
    onNone: () => -1,
    onSome: (id) => studies.findIndex((item) => item.id === id),
  })
  const landing =
    from < 0
      ? null
      : Option.match(DragAndDrop.maybeDropTarget(drag), {
          onNone: () => null,
          onSome: ({ containerId, index }) =>
            containerId !== STUDY_QUEUE
              ? null
              : Math.min(studies.length - 1, queueIndex(from, index)),
        })
  const overQueue = landing !== null
  if (studies.length === 0) return h.empty
  return h.section(
    [
      h.Key('queue'),
      ...(dragging ? [h.DataAttribute('research-drag-active', '')] : []),
      h.Class(cn('flex max-h-[40%] shrink-0 flex-col border-b border-hairline p-1.5', SCROLL)),
      // The queue is a listbox, so the window-level shortcuts ignore it; Escape still closes
      // the panel unless a drag is running (the drag component handles that Escape itself).
      h.OnKeyDownPreventDefault((key) =>
        key === 'Escape' && !dragging ? Option.some(Message.PanelClosed()) : Option.none(),
      ),
    ],
    [
      h.div(
        [
          ...DragAndDrop.droppable(STUDY_QUEUE, t.research.studyQueue),
          // Team pods ring their whole rounded card; the queue gets the same treatment, inset
          // by the section's padding so the ring follows its corners instead of the card edge.
          h.Class(
            cn(
              'flex flex-col gap-0.5 rounded-xl transition-shadow',
              overQueue && 'ring-2 ring-primary ring-offset-2',
            ),
          ),
        ],
        [
          h.span([h.Class(cn(EYEBROW, 'px-2 pt-1 pb-0.5'))], [t.research.queue]),
          ...studies.map((item, index) => {
            const entry = localized(RESEARCH[item.id], t.catalog.research[item.id])
            const stall = studyStall(game, ledger, item.id)
            const isDragged = Option.exists(draggedId, (id) => id === item.id)
            const slide = landing === null ? 0 : queueSlide(index, from, landing)
            // The dragged row holds the slot the drop leaves it in: a hint of the icon
            // under the cursor's ghost, or the whole row when the keyboard moves it.
            const slot = isDragged && landing !== null
            const keyboard = drag.dragState._tag === 'KeyboardDragging'
            // Rows share one height, so a row slides by its own height plus the gap
            // between rows; a transition retargets it when the pointer moves on.
            const offset =
              slide === 0 ? [] : [h.Style({ translate: `0 calc(${slide} * (100% + 0.125rem))` })]
            return h.div(
              [
                h.Key(item.id),
                ...offset,
                h.Class(
                  cn(
                    'flex items-center gap-1 rounded-lg pl-1',
                    // A pointer drag slides its rows; the keyboard moves one at once.
                    dragging && !keyboard && 'transition-[translate] duration-150 ease-out',
                    slot &&
                      'pointer-events-none bg-primary/[0.05] ring-1 ring-inset ring-primary/30',
                    !slot && item.id === focus && 'bg-nested',
                    isDragged && landing === null && 'opacity-45',
                    slot &&
                      !keyboard &&
                      '[&>*:not(:first-child)]:invisible [&>*:first-child]:opacity-40',
                  ),
                ),
              ],
              [
                // The icon is the drag handle, so the row's buttons keep their own keys.
                h.span(
                  [
                    ...DragAndDrop.draggable(
                      {
                        model: drag,
                        toParentMessage: (message) =>
                          Message.ResearchChanged({
                            message: ResearchMessage.DragChanged({ message }),
                          }),
                        itemId: item.id,
                        containerId: STUDY_QUEUE,
                        index,
                      },
                      h,
                    ),
                    ...DragAndDrop.sortable(item.id),
                    h.AriaLabel(t.research.reorder(entry.name)),
                    h.Title(t.research.dragToReorder),
                    h.Class(
                      'grid cursor-grab touch-none self-stretch place-items-center rounded-md px-0.5 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-primary',
                    ),
                  ],
                  [researchMark(entry, 'sm', false, h)],
                ),
                h.button(
                  [
                    h.Type('button'),
                    h.OnClick(
                      Message.ResearchChanged({
                        message: ResearchMessage.Focused({ id: item.id }),
                      }),
                    ),
                    h.Class(
                      'flex min-w-0 flex-1 items-center gap-2 rounded-md py-1 text-left text-[calc(12.5px*var(--type-scale))] hover:text-foreground',
                    ),
                  ],
                  [
                    h.span([h.Class('truncate font-medium')], [t.catalog.research[entry.id].name]),
                    h.span(
                      [
                        ...(stall ? [h.Title(stallReasonIn(t, stall))] : []),
                        h.Class(
                          cn(
                            FIGURE,
                            'ml-auto flex shrink-0 items-center gap-1 text-[calc(11.5px*var(--type-scale))]',
                            stall ? 'text-warn' : 'text-muted-foreground',
                          ),
                        ),
                      ],
                      [
                        stall ? icon(h, TriangleAlert, 'size-3') : h.empty,
                        `${Math.floor(Math.min(1, studyProgressOf(item)) * 100)}%`,
                      ],
                    ),
                  ],
                ),
                queueButton(
                  t.research.moveUp,
                  ArrowUp,
                  Message.ResearchChanged({
                    message: ResearchMessage.StudyMoved({ id: item.id, direction: -1 }),
                  }),
                  index > 0 && !needs(item.id, studies[index - 1]?.id ?? item.id),
                  h,
                ),
                queueButton(
                  t.research.moveDown,
                  ArrowDown,
                  Message.ResearchChanged({
                    message: ResearchMessage.StudyMoved({ id: item.id, direction: 1 }),
                  }),
                  index < studies.length - 1 && !needs(studies[index + 1]?.id ?? item.id, item.id),
                  h,
                ),
                queueButton(
                  t.research.cancel,
                  X,
                  Message.ResearchChanged({
                    message: ResearchMessage.StudyCancelled({ id: item.id }),
                  }),
                  true,
                  h,
                ),
              ],
            )
          }),
          Option.match(DragAndDrop.ghostStyle(drag), {
            onNone: () => h.empty,
            onSome: (style) =>
              Option.match(draggedId, {
                onNone: () => h.empty,
                onSome: (id) => {
                  const entry = localized(
                    RESEARCH[id as ResearchId],
                    t.catalog.research[id as ResearchId],
                  )
                  return h.div(
                    [
                      h.AriaHidden(true),
                      h.Style(style),
                      h.Class(
                        cn(
                          FLOAT,
                          'pointer-events-none z-50 flex items-center gap-2 px-3 py-2 text-[calc(12.5px*var(--type-scale))] font-medium',
                        ),
                      ),
                    ],
                    [researchMark(entry, 'sm', false, h), t.catalog.research[entry.id].name],
                  )
                },
              }),
          }),
        ],
      ),
    ],
  )
}

const detail = (model: Model, entry: ResearchDef, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const queued = game.studies.findIndex((item) => item.id === entry.id)
  const state = stateOf(game, entry)
  const open = state !== 'owned' && game.openActions.includes(entry.id)
  const track = t.catalog.researchTracks[entry.track].label
  // A locked item queues with its missing prerequisites (10 "Studies"), once every one is open.
  const chain = state === 'locked' ? missingPrerequisites(game, entry.id) : []
  const era = Math.max(entry.era, ...chain.map((id) => RESEARCH[id].era))
  const ledger = ledgerOf(model)
  // The first Study that cannot finish: the item's own, or one that queueing it would add.
  const stalled =
    state === 'owned' || era > game.stage
      ? undefined
      : [...chain, entry.id]
          .map((id) => ({ id, stall: studyStall(game, ledger, id) }))
          .find((item) => item.stall !== null)
  const label =
    state === 'owned'
      ? t.research.researched
      : state === 'buy'
        ? t.research.startStudy(duration(t, game, entry))
        : era > game.stage
          ? t.research.opensIn(t.catalog.eras[era]?.name ?? eraName(era))
          : chain.length > 2
            ? t.research.studyAfterCount(chain.length)
            : chain.length > 0
              ? t.research.studyAfter(chain.map((id) => t.catalog.research[id].name))
              : queued > 0
                ? t.research.studyNow
                : t.research.studying(Math.floor(studyProgressOf(game.studies[0]) * 100))
  const queueable = era <= game.stage && chain.length > 0
  const follow = followUps(entry.id)
  return h.aside(
    [
      h.Key('detail'),
      h.Class(
        cn(
          FLOAT,
          'absolute right-4 bottom-4 z-10 flex max-h-[calc(100%-96px)] w-[320px] flex-col overflow-hidden compact:right-3 compact:bottom-3 compact:left-3 compact:max-h-[46%] compact:w-auto',
        ),
      ),
    ],
    [
      queuePanel(model, entry.id, h),
      h.div(
        [h.Key(entry.id), h.Class(`flex min-h-0 flex-1 flex-col gap-4 p-5 ${SCROLL} enter-pop`)],
        [
          h.div(
            [h.Class('flex items-center gap-3')],
            [
              researchMark(entry, 'lg', state === 'locked', h),
              h.div(
                [h.Class('flex min-w-0 flex-col gap-1')],
                [
                  h.span(
                    [
                      h.Class(
                        'text-[calc(16px*var(--type-scale))] leading-tight font-semibold tracking-[-0.02em]',
                      ),
                    ],
                    [t.catalog.research[entry.id].name],
                  ),
                  h.span(
                    [h.Class(EYEBROW)],
                    [`${track} · ${t.catalog.eras[entry.era]?.name ?? eraName(entry.era)}`],
                  ),
                ],
              ),
            ],
          ),
          h.p(
            [h.Class('text-[calc(13px*var(--type-scale))] leading-relaxed text-foreground/85')],
            [t.catalog.research[entry.id].blurb],
          ),
          terms(entry, h),
          open
            ? h.div(
                [
                  h.Class(
                    'flex items-start gap-2 rounded-lg bg-[var(--warn-soft)] px-3 py-2 text-[calc(12px*var(--type-scale))] leading-snug text-warn',
                  ),
                ],
                [
                  icon(h, TriangleAlert, 'mt-px size-3.5 shrink-0'),
                  t.research.openActionItemTheIncidentIt,
                ],
              )
            : h.empty,
          stalled?.stall
            ? h.div(
                [
                  h.Class(
                    'flex items-start gap-2 rounded-lg bg-[var(--warn-soft)] px-3 py-2 text-[12px] leading-snug text-warn',
                  ),
                ],
                [
                  icon(h, TriangleAlert, 'mt-px size-3.5 shrink-0'),
                  stalled.id !== entry.id
                    ? t.research.stallsFirst(
                        t.catalog.research[stalled.id].name,
                        stallReasonIn(t, stalled.stall),
                      )
                    : queued === 0
                      ? t.research.everyStudyBehindItWaits(stallReasonIn(t, stalled.stall))
                      : t.research.atTheFrontOfTheQueue(stallReasonIn(t, stalled.stall)),
                ],
              )
            : h.empty,
          state === 'owned' ? h.empty : costRows(game, ledger, entry, h),
          entry.requires.length > 0
            ? h.div(
                [h.Class('flex flex-col gap-1')],
                [
                  h.span([h.Class(cn(EYEBROW, 'px-2'))], [t.research.requires]),
                  ...entry.requires.map((id) => linkRow(game, RESEARCH[id], h)),
                ],
              )
            : h.empty,
          follow.length > 0
            ? h.div(
                [h.Class('flex flex-col gap-1')],
                [
                  h.span([h.Class(cn(EYEBROW, 'px-2'))], [t.research.leadsTo]),
                  ...follow.map((next) => linkRow(game, next, h)),
                ],
              )
            : h.empty,
        ],
      ),
      h.div(
        [h.Class('flex gap-2 border-t border-hairline p-3')],
        [
          button(
            {
              onClick: Message.ResearchChanged({
                message:
                  queued > 0
                    ? ResearchMessage.StudyPrioritized({ id: entry.id })
                    : ResearchMessage.Bought({ id: entry.id }),
              }),
              isDisabled: !(state === 'buy' || queueable || (state === 'saving' && queued > 0)),
              size: 'lg',
              variant: state === 'buy' || queueable || queued > 0 ? 'default' : 'outline',
              className: cn(FIGURE, 'min-w-0 flex-1'),
            },
            [state === 'owned' ? icon(h, Check, 'size-4 text-ok') : h.empty, label],
            h,
          ),
          queued >= 0
            ? button(
                {
                  onClick: Message.ResearchChanged({
                    message: ResearchMessage.StudyCancelled({ id: entry.id }),
                  }),
                  size: 'lg',
                  variant: 'outline',
                },
                [t.research.cancel],
                h,
              )
            : h.empty,
        ],
      ),
    ],
  )
}

export const researchPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const focus = focusOf(model)
  const layout = researchLayout(scaleOf(model))
  const unsampled = unsampledOf(ledgerOf(model))
  return h.div(
    [
      h.Key('research'),
      h.DataAttribute('exit', 'gesture'),
      h.Class('absolute inset-0 z-30 bg-canvas enter-backdrop'),
    ],
    [
      h.div(
        [
          h.Key('scroll'),
          h.OnMount(ResearchScroll()),
          h.Class(`absolute inset-0 cursor-grab ${SCROLL}`),
        ],
        [
          // Room above for the header, and to the right and below for the detail card.
          h.div(
            [h.Class('w-fit pt-20 pr-[360px] pb-10 pl-4 compact:pr-4 compact:pb-[50vh]')],
            [
              h.div(
                [
                  h.Class('relative'),
                  h.Style({ width: `${layout.width}px`, height: `${layout.height}px` }),
                ],
                [
                  ...backdrop(model, layout, h),
                  wires(model, layout, focus, h),
                  ...[...layout.placed.values()].map((place) =>
                    node(model, place, place.entry.id === focus.id, h),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      h.div(
        [
          h.Class(
            'pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3 compact:inset-x-3 compact:top-[max(12px,env(safe-area-inset-top))]',
          ),
        ],
        [
          h.div(
            [h.Class(cn(PANEL, 'pointer-events-auto flex items-baseline gap-4 px-4 py-2.5'))],
            [
              h.span(
                [h.Class('text-[calc(17px*var(--type-scale))] font-semibold tracking-[-0.025em]')],
                [t.research.research],
              ),
              h.span(
                [
                  h.Class(
                    'flex flex-wrap items-center gap-x-3 gap-y-1 text-[calc(12.5px*var(--type-scale))]',
                  ),
                ],
                [
                  ...POOL_ORDER.filter((pool) => model.board.game.pools[pool] >= 1).map((pool) =>
                    insightChip(
                      pool,
                      compact(model.board.game.pools[pool]),
                      h,
                      false,
                      'plain',
                      insightName(t, pool),
                    ),
                  ),
                  // Traffic no tap samples earns nothing and shows nothing: the first thing to fix
                  // when research drags (12 "The cost of seeing").
                  unsampled.share >= 0.01
                    ? h.span(
                        [
                          h.Class('flex items-center gap-1 text-warn'),
                          h.Title(t.hud.unsampledHint),
                        ],
                        [
                          icon(h, TriangleAlert, 'size-3'),
                          t.hud.unsampled(Math.round(unsampled.share * 100)),
                        ],
                      )
                    : h.empty,
                ],
              ),
            ],
          ),
          h.div(
            [h.Class(cn(PANEL, 'pointer-events-auto p-1'))],
            [
              button(
                {
                  onClick: Message.PanelClosed(),
                  variant: 'ghost',
                  size: 'icon',
                  className: 'text-muted-foreground',
                  attributes: [h.AriaLabel(t.research.closeEsc)],
                },
                icon(h, X, 'size-4'),
                h,
              ),
            ],
          ),
        ],
      ),
      detail(model, focus, h),
    ],
  )
}
