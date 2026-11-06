import { Check, Circle, RotateCcw, X, createElement, type IconNode } from 'lucide'
import { COMPONENTS, DOCK_GROUPS, DOCK_OF } from '@quorum/simulation/catalog'
import { priceOf } from '@quorum/simulation/lookups'
import { attachBoard, fitBoard, setBoard } from '@quorum/ui/board/board'
import { money } from '@quorum/ui/game/format'
import { COMPONENT_ICONS, GROUP_ICONS } from '@quorum/ui/game/icons'
import { GROUP_TEXT } from '@quorum/ui/game/bits'
import {
  DOCK,
  TITLES,
  boardState,
  complete,
  dockGroups,
  goals,
  start,
  update,
  type Practice,
  type PracticeEvent,
  type PracticeId,
} from './practice.ts'

/* ==========================================================================
   One live Practice board: the game's own Pixi board on a local Game, with a
   small dock, a goal list, a Reset button and the game's refusal text. It is
   paused: no clock runs. Loaded on demand from practice.ts's island view.
   ========================================================================== */

const GOAL_TEXT: Record<PracticeId, string> = {
  place: 'Place an App Server and a Database. Pick a part in the dock, then click the board.',
  wire: 'Link Users to App Server, App Server to Database, and App Server to Analytics. Drag from the output port on the right edge of a card to another card.',
  rearrange:
    'Hold Shift and drag on empty space to box-select Nodes, then drag one of them to move the group. Then click a Link and press Delete, or click its x badge, to cut it.',
}

const svg = (node: IconNode, size = 16): SVGElement =>
  createElement(node, { width: size, height: size, 'aria-hidden': 'true' })

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  children: ReadonlyArray<Node | string> = [],
  attrs: Readonly<Record<string, string>> = {},
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag)
  node.className = className
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  node.append(...children)
  return node
}

const BUTTON =
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[13px] hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

export const mountPractice = (id: PracticeId, root: HTMLElement): (() => void) => {
  const key = `practice-${id}`
  let state: Practice = start(id)
  let openGroup: string | null = null
  const events = new AbortController()

  const title = el('h3', 'm-0 text-[14px] font-semibold tracking-tight', [TITLES[id]])
  const reset = el('button', BUTTON, [svg(RotateCcw, 14), 'Reset'], { type: 'button' })
  const head = el(
    'div',
    'flex items-center justify-between gap-3 border-b border-border px-4 py-2.5',
    [title, reset],
  )
  const intro = el('p', 'm-0 px-4 pt-3 text-[13.5px] leading-snug text-muted-foreground', [
    GOAL_TEXT[id],
  ])
  const host = el(
    'div',
    'relative mx-4 mt-3 h-[440px] overflow-hidden rounded-md border border-border bg-muted/30',
    [],
    {
      role: 'application',
      'aria-label': `${TITLES[id]}: a practice board. The goals are listed below the board.`,
    },
  )
  // A board on a page lets the page scroll: only Ctrl or Cmd zooms it.
  host.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) event.stopPropagation()
    },
    { capture: true, signal: events.signal },
  )
  const dockHost = el('div', 'px-4 pt-3 empty:hidden')
  const cash = el('span', 'text-[12.5px] text-muted-foreground tabular-nums')
  const checklist = el('ul', 'm-0 flex list-none flex-col gap-1 p-0', [], {
    'aria-live': 'polite',
    'aria-label': 'Goals',
  })
  const note = el('p', 'm-0 min-h-5 text-[13px]', [], { role: 'status', 'aria-live': 'polite' })
  const foot = el('div', 'flex flex-col gap-2 px-4 pt-3 pb-4', [
    el('div', 'flex items-center justify-between', [
      el('span', 'text-[12.5px] font-medium', ['Goals']),
      cash,
    ]),
    checklist,
    note,
  ])
  root.replaceChildren(head, intro, host, dockHost, foot)

  const renderDock = () => {
    const groups = dockGroups(id)
    if (groups.length === 0) return dockHost.replaceChildren()
    const tabs = DOCK_GROUPS.filter((group) => groups.includes(group.key)).map((group) => {
      const open = openGroup === group.key
      const button = el(
        'button',
        `${BUTTON} ${GROUP_TEXT[group.family]} ${open ? 'bg-muted' : ''}`,
        [svg(GROUP_ICONS[group.family]), el('span', 'text-foreground', [group.label])],
        { type: 'button', 'aria-pressed': String(open), title: group.label },
      )
      button.addEventListener('click', () => {
        openGroup = open ? null : group.key
        renderDock()
      })
      return button
    })
    const rows = DOCK[id]
      .filter((type) => openGroup !== null && DOCK_OF[type] === openGroup)
      .map((type) => {
        const price = priceOf(state.game, type)
        const armed = state.placing === type
        const button = el(
          'button',
          `${BUTTON} ${armed ? 'bg-muted' : ''}`,
          [
            svg(COMPONENT_ICONS[type]),
            el('span', 'font-medium', [COMPONENTS[type].name]),
            el(
              'span',
              `tabular-nums ${state.game.cash < price ? 'text-danger' : 'text-muted-foreground'}`,
              [money(price)],
            ),
          ],
          { type: 'button', 'aria-pressed': String(armed), title: COMPONENTS[type].blurb },
        )
        button.addEventListener('click', () => {
          openGroup = null
          send({ _tag: 'Arm', type })
        })
        return button
      })
    const armed = state.placing
    const stop = armed
      ? el('button', BUTTON, [svg(X, 14), `Stop placing ${COMPONENTS[armed].name} (Esc)`], {
          type: 'button',
        })
      : null
    stop?.addEventListener('click', () => send({ _tag: 'Arm', type: null }))
    dockHost.replaceChildren(
      el('div', 'flex flex-wrap items-center gap-2', [
        el('div', 'flex gap-1.5', tabs, { role: 'group', 'aria-label': 'Build' }),
        ...rows,
        ...(armed
          ? [
              el('span', 'text-[12.5px] text-muted-foreground', [
                `Click the board to place the ${COMPONENTS[armed].name}, or press Enter.`,
              ]),
              ...(stop ? [stop] : []),
            ]
          : []),
      ]),
    )
  }

  const render = () => {
    setBoard(key, boardState(state))
    renderDock()
    cash.textContent = id === 'place' ? `Cash ${money(state.game.cash)}` : ''
    checklist.replaceChildren(
      ...goals(state).map((goal) =>
        el(
          'li',
          `flex items-center gap-2 text-[13.5px] ${goal.done ? 'text-ok' : 'text-foreground'}`,
          [
            svg(goal.done ? Check : Circle, 14),
            goal.label,
            el('span', 'sr-only', [goal.done ? ' (done)' : ' (not yet)']),
          ],
        ),
      ),
    )
    const finished = complete(state)
    title.dataset['done'] = String(finished)
    note.className = `m-0 min-h-5 text-[13px] ${state.note?.tone === 'warn' ? 'text-warn' : 'text-ok'}`
    note.textContent =
      state.note?.text ?? (finished ? 'All goals done. Reset to practice again.' : '')
    if (finished && !state.note) note.className = 'm-0 min-h-5 text-[13px] text-ok'
  }

  const send = (event: PracticeEvent) => {
    state = update(state, event)
    render()
    // A new card can land outside the view: show the whole Design again.
    if (event._tag === 'Place') requestAnimationFrame(() => fitBoard(key))
  }

  reset.addEventListener('click', () => {
    state = start(id)
    openGroup = null
    render()
    requestAnimationFrame(() => fitBoard(key))
  })

  // The game's own keys for a part in hand: Enter puts it in the next free spot, Esc puts it down.
  root.addEventListener(
    'keydown',
    (event) => {
      if (!state.placing) return
      const target = event.target as HTMLElement
      if (event.key === 'Escape') {
        event.preventDefault()
        send({ _tag: 'Arm', type: null })
      } else if (event.key === 'Enter' && target.tagName !== 'BUTTON') {
        event.preventDefault()
        send({ _tag: 'Place', x: 400, y: 120 })
      }
    },
    { signal: events.signal },
  )

  setBoard(key, boardState(state))
  const detach = attachBoard(key, host, {
    onNodeTap: (nodeId) => send({ _tag: 'Tap', nodeId }),
    onNodeMove: (nodeId, x, y) => send({ _tag: 'Move', nodeId, x, y }),
    onFooter: (nodeId) => send({ _tag: 'Footer', nodeId }),
    onLink: (from, to) => send({ _tag: 'Link', from, to }),
    onUnlink: (from, to) => send({ _tag: 'Unlink', from, to }),
    onPlace: (x, y) => send({ _tag: 'Place', x, y }),
    onEmptyTap: () => send({ _tag: 'Empty' }),
    onNodeToggle: (nodeId) => send({ _tag: 'Toggle', nodeId }),
    onBox: (ids, mode) => send({ _tag: 'Box', ids, mode }),
  })
  render()
  // The board starts asynchronously and draws a state sent before that; send it again over its
  // first second, as the card boards do.
  let frames = 0
  let frame = requestAnimationFrame(function again() {
    setBoard(key, boardState(state))
    frames += 1
    if (frames === 30) fitBoard(key)
    if (frames < 60) frame = requestAnimationFrame(again)
  })
  return () => {
    cancelAnimationFrame(frame)
    events.abort()
    detach()
  }
}
