import { copy, localized } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ChartLine, Lock, MessagesSquare, Plug, Wrench, X, type IconNode } from 'lucide'
import {
  DOCK_GROUPS,
  COMPONENTS,
  type DockGroup,
  type ComponentId,
} from '@quorum/simulation/catalog'
import { isUnlocked, priceOf } from '@quorum/simulation/lookups'
import { money } from '@quorum/ui/game/format'
import { COMPONENT_ICONS, GROUP_ICONS } from '@quorum/ui/game/icons'
import { Message } from '@/game/message.ts'
import { placingOf, type Model } from '@/game/model.ts'
import { dockGroups, dockItems } from '@/game/reveal.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { Kbd } from '@quorum/ui/primitives/kbd'
import { cn } from '@/lib/utils'
import { FIGURE, GROUP_TEXT, PANEL, groupBadge, tool } from '@quorum/ui/game/bits'

/* ==========================================================================
   The build dock, disclosed in steps: seven group icons. A group opens a list
   of its Components; picking one closes the list and arms it, then a click
   on the board places it.
   ========================================================================== */

/** The highlight's offset under the open tab, by the tab's place in the dock. */
const TAB_OFFSET = [
  'translate-x-0',
  'translate-x-11',
  'translate-x-22',
  'translate-x-33',
  'translate-x-44',
  'translate-x-55',
  'translate-x-66',
]

const DOCK_ICONS: Record<DockGroup, IconNode> = {
  edge: GROUP_ICONS.edge,
  compute: GROUP_ICONS.compute,
  data: GROUP_ICONS.data,
  messaging: MessagesSquare,
  platform: Wrench,
  insight: ChartLine,
  managed: Plug,
}

const row = (model: Model, type: ComponentId, index: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const def = localized(COMPONENTS[type], t.catalog.components[type])
  const unlocked = isUnlocked(model.board.game, type)
  const price = priceOf(model.board.game, type)
  return h.button(
    [
      h.Key(type),
      h.Type('button'),
      h.OnClick(Message.PlacingChosen({ type })),
      h.Class(
        cn(
          'press flex h-12 w-full shrink-0 items-center gap-3 rounded-xl px-2.5 text-left hover:bg-well',
          unlocked ? '' : 'opacity-70',
        ),
      ),
    ],
    [
      groupBadge(def.group, COMPONENT_ICONS[type], 'size-8 shrink-0', h, !unlocked),
      h.span(
        [h.Class('flex min-w-0 flex-1 flex-col gap-0.5')],
        [
          h.span(
            [h.Class('text-[calc(13px*var(--type-scale))] leading-none font-medium')],
            [def.name],
          ),
          h.span(
            [
              h.Class(
                'truncate text-[calc(11.5px*var(--type-scale))] leading-tight text-muted-foreground',
              ),
            ],
            [def.blurb],
          ),
        ],
      ),
      unlocked
        ? h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12.5px*var(--type-scale))]',
                  model.board.game.cash >= price ? '' : 'text-danger',
                ),
              ),
            ],
            [model.board.game.sandbox ? '' : money(price)],
          )
        : h.span(
            [
              h.Class(
                'flex items-center gap-1 text-[calc(11px*var(--type-scale))] text-muted-foreground',
              ),
            ],
            [icon(h, Lock, 'size-3'), t.catalog.research[def.unlock ?? 'stripe'].name],
          ),
      Kbd({}, [String(index + 1)], h),
    ],
  )
}

/** The part in hand: its mark and name, and a way to put it down. */
const armed = (type: ComponentId, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Key('armed'),
      h.DataAttribute('exit', 'gesture'),
      h.DataAttribute('exit-anchor', 'bottom'),
      h.Class(
        'swap flex items-center gap-2 pr-1 pb-1.5 pl-2 text-[calc(12.5px*var(--type-scale))] whitespace-nowrap',
      ),
    ],
    [
      groupBadge(COMPONENTS[type].group, COMPONENT_ICONS[type], 'size-5', h),
      h.span([h.Class('font-medium')], [t.catalog.components[type].name]),
      h.span([h.Class('text-muted-foreground compact:hidden')], [t.dock.clickTheBoard]),
      h.button(
        [
          h.Type('button'),
          h.Title(t.dock.stopPlacingEsc),
          h.AriaLabel(t.dock.stopPlacing),
          h.OnClick(Message.PlacingChosen({ type: null })),
          h.Class(tool(false)),
        ],
        [icon(h, X, 'size-4')],
      ),
    ],
  )
}

/** The open group's parts, keyed by group, so switching groups swaps the list
 *  in place while the dock morphs to its new height. */
const list = (model: Model, group: DockGroup, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Key(`list-${group}`),
      h.DataAttribute('exit', 'gesture'),
      h.DataAttribute('exit-anchor', 'bottom'),
      h.Class('swap flex w-[420px] max-w-full flex-col gap-0.5 pb-1 compact:w-auto'),
    ],
    dockItems(model.board.game, group).map((type, index) => row(model, type, index, h)),
  )

/** One surface. Its top slot holds the open group's parts or the part in hand,
 *  and the dock morphs between them instead of snapping (src/game/motion.ts).
 *  The dock is pinned at its bottom edge, so its content packs to the bottom:
 *  mid-morph, the tabs stay put and the top edge moves. */
export const dock = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const open = model.board.buildGroup
  const placing = placingOf(model)
  const groups = DOCK_GROUPS.filter((group) => dockGroups(model.board.game).includes(group.key))
  return h.div(
    [
      h.Key('dock'),
      h.DataAttribute('morph', 'gesture'),
      h.Class(
        `pointer-events-auto flex flex-col items-center justify-end p-1.5 ${PANEL} compact:items-stretch`,
      ),
    ],
    [
      open ? list(model, open, h) : placing ? armed(placing, h) : h.empty,
      h.div(
        [
          h.Class('flex items-center justify-center gap-1'),
          h.Role('group'),
          h.AriaLabel(t.dock.build),
        ],
        [
          h.div(
            [h.Class('relative flex gap-1')],
            [
              // One highlight slides between the tabs. It is a fresh element each time the
              // list opens, so it fades in on the tab you clicked instead of sliding from another.
              open
                ? h.span(
                    [
                      h.Key('tab-highlight'),
                      // The offset is a class, not an inline style: a style set after the element
                      // is inserted would transition from the left edge.
                      h.Class(
                        cn(
                          'animate-in fade-in pointer-events-none absolute top-0 left-0 size-10 rounded-xl bg-well shadow-well transition-[translate] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
                          TAB_OFFSET[groups.findIndex((group) => group.key === open)],
                        ),
                      ),
                    ],
                    [],
                  )
                : h.empty,
              ...groups.map((group, index) =>
                h.button(
                  [
                    h.Key(group.key),
                    h.Type('button'),
                    h.Title(`${t.catalog.dockGroups[group.key].label} (${index + 1})`),
                    h.AriaLabel(t.catalog.dockGroups[group.key].label),
                    h.AriaPressed(group.key === open ? 'true' : 'false'),
                    h.OnClick(Message.BuildGroupChosen({ group: group.key })),
                    h.Class(
                      cn(
                        'press relative grid size-10 shrink-0 place-items-center rounded-xl',
                        group.key === open ? '' : 'hover:bg-well',
                      ),
                    ),
                  ],
                  [
                    groupBadge(group.family, DOCK_ICONS[group.key], 'size-6', h),
                    // The open tab carries its group colour as an underline.
                    h.span(
                      [
                        h.Class(
                          cn(
                            'absolute bottom-1 h-0.5 rounded-full bg-current transition-[width] duration-200',
                            group.key === open ? 'w-4' : 'w-0',
                            GROUP_TEXT[group.family],
                          ),
                        ),
                      ],
                      [],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
