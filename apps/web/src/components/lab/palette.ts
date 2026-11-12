import { Effect, Option } from 'effect'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Search } from 'lucide'
import { EYEBROW } from '@quorum/ui/game/bits'
import { icon } from '@quorum/ui/primitives/icon'
import { Kbd } from '@quorum/ui/primitives/kbd'
import { cn } from '@/lib/utils'
import { copy, type Messages } from '@/i18n/messages.ts'
import { Message } from '@/game/message.ts'
import {
  activeOf,
  commandsOf,
  matchesOf,
  PALETTE_GROUPS,
  type PaletteCommand,
} from '@/game/palette.ts'
import { partCells } from './part-row.ts'
import type { Model } from '@/game/model.ts'

/**
 * The search field takes the keyboard when the palette opens, and the list
 * follows the highlighted row, so the arrows never move past the fold.
 */
export const PaletteFocus = Mount.define('PaletteFocus', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const panel = element as HTMLElement
        const input = panel.querySelector('input')
        input?.focus()
        input?.setSelectionRange(input.value.length, input.value.length)
        const reveal = () =>
          panel
            .querySelector<HTMLElement>('[data-palette-active]')
            ?.scrollIntoView({ block: 'nearest' })
        reveal()
        const observer = new MutationObserver(reveal)
        observer.observe(panel, {
          subtree: true,
          attributes: true,
          attributeFilter: ['data-palette-active'],
        })
        // Tab stays in the field: the rows are arrows and Enter, not a tab order.
        const keep = (event: KeyboardEvent) => {
          if (event.key !== 'Tab') return
          event.preventDefault()
          input?.focus()
        }
        panel.addEventListener('keydown', keep)
        return () => {
          observer.disconnect()
          panel.removeEventListener('keydown', keep)
        }
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.Synced())),
})

/** The keys the board runs it with, in the app's keycap. */
const shortcut = (command: PaletteCommand, h: HtmlBuilder<Message>): Html =>
  command.keys === undefined
    ? h.empty
    : h.span(
        [h.Class('flex shrink-0 items-center gap-1'), h.AriaHidden(true)],
        command.keys.map((key) => Kbd({ className: 'shrink-0 min-w-0 px-1.5' }, [key], h)),
      )

/** What Enter does to the highlighted row: its one action, in the ink fill. */
const runHint = (h: HtmlBuilder<Message>): Html =>
  h.span(
    [h.Class('flex shrink-0 items-center'), h.AriaHidden(true)],
    [
      Kbd(
        {
          className: 'shrink-0 min-w-0 px-1.5 bg-primary-fill text-on-primary-fill shadow-primary',
        },
        ['↵'],
        h,
      ),
    ],
  )

/** Every other row: the mark in a quiet tile, then its name. */
const plainCell = (
  command: PaletteCommand,
  active: boolean,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => [
  h.span(
    [
      h.Class(
        cn(
          'grid size-7 shrink-0 place-items-center rounded-lg',
          active
            ? 'bg-raised text-foreground shadow-raised'
            : 'bg-foreground/[0.06] text-muted-foreground',
        ),
      ),
    ],
    [icon(h, command.glyph, 'size-[15px]')],
  ),
  h.span(
    [h.Class('min-w-0 flex-1 truncate text-[calc(13px*var(--type-scale))] leading-none')],
    [command.label],
  ),
]

/** One row: the mark, its name, its shortcut, and what Enter does to it. */
const row = (command: PaletteCommand, active: boolean, h: HtmlBuilder<Message>): Html =>
  h.button(
    [
      h.Key(command.id),
      h.Id(`palette-option-${command.id}`),
      h.Type('button'),
      h.Role('option'),
      h.Tabindex(-1),
      h.AriaSelected(active),
      ...(active ? [h.DataAttribute('palette-active', '')] : []),
      h.OnClick(Message.PaletteChosen({ id: command.id })),
      h.OnMouseMove(Message.PaletteHighlighted({ id: command.id })),
      h.Class(
        cn(
          'press flex w-full items-center text-left',
          command.part === undefined
            ? 'h-10 gap-2.5 rounded-lg px-2'
            : 'h-12 gap-3 rounded-xl px-2',
          command.part?.locked !== null && command.part !== undefined ? 'opacity-70' : '',
          active
            ? 'bg-foreground/10 text-foreground'
            : 'text-foreground/85 hover:bg-foreground/[0.05]',
        ),
      ),
    ],
    [
      ...(command.part === undefined ? plainCell(command, active, h) : partCells(command.part, h)),
      shortcut(command, h),
      active ? runHint(h) : h.empty,
    ],
  )

/** The rows, grouped by area in the order the palette lists them. */
const results = (
  rows: ReadonlyArray<PaletteCommand>,
  active: PaletteCommand | null,
  query: string,
  t: Messages,
  h: HtmlBuilder<Message>,
): Html => {
  const frame =
    'max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:thin]'
  if (rows.length === 0)
    return h.div(
      [h.Id('palette-results'), h.Role('status'), h.Class(frame)],
      [
        h.p(
          [
            h.Class(
              'px-2.5 py-10 text-center text-[calc(12.5px*var(--type-scale))] text-muted-foreground',
            ),
          ],
          [t.palette.noMatches(query)],
        ),
      ],
    )
  return h.div(
    [h.Id('palette-results'), h.Role('listbox'), h.AriaLabel(t.palette.title), h.Class(frame)],
    PALETTE_GROUPS.flatMap((group) => {
      const groupRows = rows.filter((command) => command.group === group)
      if (groupRows.length === 0) return []
      return [
        h.div(
          [h.Key(`group-${group}`), h.Role('group'), h.AriaLabel(t.palette.groups[group])],
          [
            h.div(
              [
                h.Class(
                  cn(EYEBROW, 'px-2.5 pb-1.5', group === PALETTE_GROUPS[0] ? 'pt-1' : 'pt-3'),
                ),
                h.AriaHidden(true),
              ],
              [t.palette.groups[group]],
            ),
            ...groupRows.map((command) => row(command, command.id === active?.id, h)),
          ],
        ),
      ]
    }),
  )
}

/** The command palette over the board: one search field, and every action grouped by area. */
export const commandPalette = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  if (!model.palette.open) return h.empty
  const rows = matchesOf(commandsOf(t, model), t, model.palette.query)
  const active = activeOf(rows, model.palette.query, model.palette.active)
  return h.div(
    [
      h.Key('palette'),
      h.DataAttribute('exit', 'gesture'),
      h.Class(
        'modal-overlay absolute inset-0 z-40 flex items-start justify-center px-3 pt-[12vh] compact:px-2 compact:pt-[max(8px,env(safe-area-inset-top))]',
      ),
    ],
    [
      h.div(
        [
          h.Role('dialog'),
          h.AriaModal(true),
          h.AriaLabel(t.palette.title),
          h.OnMount(PaletteFocus()),
          h.Class(
            'enter-modal flex w-[min(620px,100%)] flex-col overflow-hidden rounded-2xl bg-surface shadow-float',
          ),
        ],
        [
          h.div(
            [h.Class('flex h-12 shrink-0 items-center gap-2.5 border-b border-hairline px-3.5')],
            [
              icon(h, Search, 'size-4 shrink-0 text-muted-foreground'),
              h.input([
                h.Id('palette-search'),
                h.Type('text'),
                h.Value(model.palette.query),
                h.Placeholder(t.palette.search),
                h.AriaLabel(t.palette.search),
                h.Role('combobox'),
                h.AriaExpanded(true),
                h.AriaControls('palette-results'),
                ...(active === null ? [] : [h.AriaActiveDescendant(`palette-option-${active.id}`)]),
                h.Autocomplete('off'),
                h.Spellcheck(false),
                h.Class(
                  'h-full min-w-0 flex-1 bg-transparent text-[calc(15px*var(--type-scale))] tracking-[-0.01em] text-foreground caret-foreground outline-none placeholder:text-muted-foreground',
                ),
                h.OnInput((query: string) => Message.PaletteQueryChanged({ query })),
                h.OnKeyDownPreventDefault((key, modifiers) => {
                  if (key === 'Escape') return Option.some(Message.PaletteClosed())
                  if (key === 'ArrowDown' || key === 'ArrowUp')
                    return Option.some(
                      Message.PaletteMoved({ delta: key === 'ArrowDown' ? 1 : -1 }),
                    )
                  if (key === 'Enter')
                    return active === null
                      ? Option.none()
                      : Option.some(Message.PaletteChosen({ id: active.id }))
                  if ((modifiers.metaKey || modifiers.ctrlKey) && key.toLowerCase() === 'k')
                    return Option.some(Message.PaletteClosed())
                  return Option.none()
                }),
              ]),
              Kbd({ className: 'shrink-0' }, [t.panels.esc], h),
            ],
          ),
          results(rows, active, model.palette.query, t, h),
        ],
      ),
    ],
  )
}
