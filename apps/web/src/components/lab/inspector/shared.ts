import { Option } from 'effect'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ChevronRight, Minus, Plus } from 'lucide'
import {
  COMPONENTS,
  FRAMEWORKS,
  FRAMEWORK_IDS,
  PM_MODES,
  OS_RAM,
  RUNTIMES,
  RUNTIME_IDS,
  type RequestKind,
  type RuntimeId,
  DB_ENGINES,
} from '@quorum/simulation/catalog'
import { nodeLabel, nodeLabelOf } from '@quorum/simulation/labels'
import { openRegions } from '@quorum/simulation/regions'
import type { Ledger, NodeLedger } from '@quorum/simulation/ledger'
import { frameworkReady, has, ramOf, runtimeReady } from '@quorum/simulation/lookups'
import type { DbEngine, Game, GameLink, GameNode, PmMode } from '@quorum/simulation/state'
import { serviceOfNode } from '@quorum/simulation/work'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, WELL, stackLogo } from '@quorum/ui/game/bits'

/** What a Component adds to its Node's Inspector, in the slots the panel has room for. */
export type PanelContext = Readonly<{
  model: Model
  game: Game
  node: GameNode
  ledger: Ledger
  h: HtmlBuilder<Message>
}>

export type Panel = Readonly<{
  /** The figures under "Live now"; the common figures show when absent. */
  stats?: (
    context: Omit<PanelContext, 'model'> & Readonly<{ own: NodeLedger }>,
  ) => ReadonlyArray<Html>
  /** Sections before the instance type. */
  top?: (context: PanelContext) => ReadonlyArray<Html>
  /** Sections after the instance type, before placement and region. */
  body?: (context: PanelContext) => ReadonlyArray<Html>
  /** Sections after placement and region, before the call settings. */
  late?: (context: PanelContext) => ReadonlyArray<Html>
}>

/**
 * A folded section: the title alone until opened. Once the player has opened or
 * closed it, the browser owns that state, so a re-render on every Step leaves
 * the section as they left it. `open` forces it open while it holds, as a
 * pinned Tradeoff card does; when it stops holding, the fold is the player's
 * again.
 */
export const section = (
  title: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
  open = false,
) =>
  h.details(
    [h.Key(title), ...(open ? [h.Open(true)] : []), h.Class('fold group px-4')],
    [
      h.summary(
        [
          h.Class(
            'flex cursor-pointer list-none items-center gap-1.5 py-2.5 hover:[&>span]:text-foreground [&::-webkit-details-marker]:hidden',
          ),
        ],
        [
          icon(
            h,
            ChevronRight,
            'fold-chevron size-3.5 shrink-0 text-muted-foreground group-open:rotate-90',
          ),
          h.span([h.Class(EYEBROW)], [title]),
        ],
      ),
      h.div([h.Class('flex flex-col gap-2 pb-3')], children),
    ],
  )

/** A segmented control: options sunk in a well, the chosen one raised. */
export const segmented = (
  columns: string,
  children: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
) => h.div([h.Class(cn('grid gap-[3px] p-[3px]', WELL, 'rounded-[11px]', columns))], children)

export const choice = (
  key: string,
  selected: boolean,
  ready: boolean,
  message: Message,
  children: ReadonlyArray<Html | string>,
  title: string,
  h: HtmlBuilder<Message>,
  /** Hovering previews the option on a Tradeoff card. */
  hover?: Message,
) =>
  h.button(
    [
      h.Key(key),
      h.Type('button'),
      h.Title(title),
      h.Disabled(!ready),
      h.AriaPressed(selected ? 'true' : 'false'),
      h.OnClick(message),
      ...(hover && !selected && ready
        ? [h.OnMouseEnter(hover), h.OnMouseLeave(Message.OptionLeft())]
        : []),
      h.Class(
        `flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-left text-[calc(12px*var(--type-scale))] font-medium transition-colors ${
          selected
            ? 'bg-raised text-foreground shadow-raised'
            : ready
              ? 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              : 'cursor-not-allowed text-muted-foreground/45 [&_svg]:opacity-45 [&_svg]:grayscale'
        }`,
      ),
    ],
    children,
  )

export const COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
}

/** One option set as a segmented control: each value with its label. */
export const picker = <T extends string | number | boolean>(
  key: string,
  values: ReadonlyArray<readonly [T, string]>,
  current: T,
  message: (value: T) => Message,
  h: HtmlBuilder<Message>,
  ready: (value: T) => boolean = () => true,
  columns = COLUMNS[values.length] ?? 'grid-cols-4',
): Html =>
  segmented(
    columns,
    values.map(([value, label]) =>
      choice(
        `${key}-${String(value)}`,
        value === current,
        ready(value),
        message(value),
        [h.span([h.Class('w-full truncate text-center')], [label])],
        label,
        h,
      ),
    ),
    h,
  )

/** A control that buys one size at a time while its pointer stays down (15 "Bulk actions"). */
export const holdListeners = (nodeId: string, h: HtmlBuilder<Message>) => [
  h.OnPointerDown(() => Option.some(Message.HoldStarted({ nodeId, now: Date.now() }))),
  h.OnPointerUp(() => Option.some(Message.HoldEnded({ nodeId }))),
  h.OnPointerLeave(() => Option.some(Message.HoldEnded({ nodeId }))),
]

export const smallButton = (
  label: string,
  glyph: Parameters<typeof icon>[1],
  message: Message,
  enabled: boolean,
  h: HtmlBuilder<Message>,
  /** The Node it buys for, when holding it repeats the buy. */
  holdFor?: string,
) =>
  button(
    {
      onClick: message,
      isDisabled: !enabled,
      variant: 'outline',
      size: 'icon-sm',
      attributes: [
        h.AriaLabel(label),
        h.Title(label),
        ...(holdFor ? holdListeners(holdFor, h) : []),
      ],
    },
    icon(h, glyph, 'size-3.5'),
    h,
  )

export const percent = (value: number) => `${Math.round(value * 100)}%`

export const stack = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
  reviewingRuntime: RuntimeId | null,
): ReadonlyArray<Html> => {
  const runtime = RUNTIMES[node.runtime]
  const frameworks = FRAMEWORK_IDS.filter(
    (id) => id === 'none' || FRAMEWORKS[id].language === runtime.language,
  )
  const fit = Math.max(
    0,
    Math.floor(
      ((ramOf(node) - OS_RAM - (node.localDb ? 1 : 0)) * 1024) /
        (runtime.memory + FRAMEWORKS[node.framework].memory),
    ),
  )
  return [
    section(
      'Runtime',
      [
        segmented(
          'grid-cols-2',
          RUNTIME_IDS.map((id) =>
            choice(
              id,
              node.runtime === id,
              runtimeReady(game, id),
              Message.OptionChosen({ nodeId: node.id, option: { kind: 'runtime', id } }),
              [
                stackLogo(RUNTIMES[id].language, 'size-4', h),
                h.span([h.Class('truncate')], [RUNTIMES[id].name]),
                ...(reviewingRuntime === id
                  ? [
                      h.span(
                        [h.Class('text-[calc(10px*var(--type-scale))] text-group-compute')],
                        ['Proposed'],
                      ),
                    ]
                  : []),
              ],
              runtimeReady(game, id)
                ? RUNTIMES[id].blurb
                : `Research ${RUNTIMES[id].name} to unlock`,
              h,
              Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'runtime', id } }),
            ),
          ),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [runtime.blurb],
        ),
      ],
      h,
      reviewingRuntime !== null,
    ),
    ...(runtime.pool
      ? [
          section(
            'Pool size',
            [
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  smallButton(
                    'Fewer workers',
                    Minus,
                    Message.WorkersChosen({
                      nodeId: node.id,
                      workers: Math.max(1, Math.round(node.workers * 0.75)),
                    }),
                    node.workers > 1,
                    h,
                  ),
                  h.span(
                    [h.Class(cn(FIGURE, 'w-12 text-center text-[calc(13px*var(--type-scale))]'))],
                    [String(node.workers)],
                  ),
                  smallButton(
                    'More workers',
                    Plus,
                    Message.WorkersChosen({
                      nodeId: node.id,
                      workers: Math.max(node.workers + 1, Math.round(node.workers * 1.5)),
                    }),
                    true,
                    h,
                  ),
                  h.span(
                    [
                      h.Class(
                        `ml-auto ${FIGURE} text-[calc(11.5px*var(--type-scale))] ${node.workers > fit ? 'text-danger' : 'text-muted-foreground'}`,
                      ),
                    ],
                    [`RAM fits ${fit}`],
                  ),
                ],
              ),
            ],
            h,
          ),
        ]
      : []),
    section(
      'Framework',
      [
        segmented(
          'grid-cols-2',
          frameworks.map((id) =>
            choice(
              id,
              node.framework === id,
              frameworkReady(game, id),
              Message.OptionChosen({ nodeId: node.id, option: { kind: 'framework', id } }),
              [
                id === 'none' ? h.empty : stackLogo(id, 'size-4', h),
                h.span([h.Class('truncate')], [FRAMEWORKS[id].name]),
              ],
              frameworkReady(game, id)
                ? FRAMEWORKS[id].blurb
                : `Research ${FRAMEWORKS[id].name} to unlock`,
              h,
              Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'framework', id } }),
            ),
          ),
          h,
        ),
        h.p(
          [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
          [FRAMEWORKS[node.framework].blurb],
        ),
      ],
      h,
    ),
    ...(node.runtime === 'php_fpm'
      ? [
          section(
            'Process manager',
            [
              picker(
                'pm',
                (Object.keys(PM_MODES) as ReadonlyArray<PmMode>).map(
                  (pm) => [pm, PM_MODES[pm].label] as const,
                ),
                node.pm,
                (pm) => Message.PmChosen({ nodeId: node.id, pm }),
                h,
              ),
            ],
            h,
          ),
        ]
      : []),
    ...(RUNTIMES[node.runtime].persistent
      ? [
          section(
            'Recycle workers',
            [
              picker(
                'recycle',
                [
                  [false, 'Off'],
                  [true, 'Every few hours'],
                ],
                node.recycle,
                (recycle) => Message.RecycleChosen({ nodeId: node.id, recycle }),
                h,
              ),
              h.p(
                [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
                [
                  'pm.max_requests and worker killers restart each process now and then. A leak never builds, and each restart runs cold.',
                ],
              ),
            ],
            h,
          ),
        ]
      : []),
    ...(has(game, 'gzip')
      ? [
          section(
            'Compression',
            [
              picker(
                'gzip',
                [
                  [false, 'Off'],
                  [true, 'Gzip'],
                ],
                node.compress,
                (compress) => Message.CompressionChosen({ nodeId: node.id, compress }),
                h,
              ),
            ],
            h,
          ),
        ]
      : []),
  ]
}

/** The Service an App Server or Worker belongs to (08 "Ownership"); empty while there is one Service. */
export const serviceOwnership = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> =>
  game.services.length < 2
    ? []
    : [
        section(
          'Service',
          [
            picker(
              'service',
              game.services.map((service) => [service.id, service.name] as const),
              serviceOfNode(game, node).id,
              (serviceId) => Message.ServiceAssigned({ nodeId: node.id, serviceId }),
              h,
            ),
          ],
          h,
          true,
        ),
      ]

/** A Node's name as a button that reveals it on the Board. */
export const nodeLink = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
  className = '',
): Html => {
  const label = nodeLabelOf(game, node)
  return h.button(
    [
      h.Type('button'),
      h.OnClick(Message.RevealNode({ nodeId: node.id })),
      h.AriaLabel(`Open ${nodeLabel(game, node)}`),
      h.Class(
        cn(
          'flex min-w-0 items-center gap-1 text-left text-[12px] font-medium text-muted-foreground hover:text-foreground',
          className,
        ),
      ),
    ],
    [
      h.span(
        [h.Class('truncate')],
        [label.name, ...(label.ordinal > 0 ? [` ${label.ordinal}`] : [])],
      ),
      icon(h, ChevronRight, 'size-3.5 shrink-0'),
    ],
  )
}

/** The routing Links out of a Node, with the Node at the far end. */
export const outbound = (
  game: Game,
  node: GameNode,
): ReadonlyArray<readonly [GameLink, GameNode]> =>
  game.links.flatMap((link) => {
    const target = game.nodes.find((entry) => entry.id === link.to)
    return link.from === node.id && target && !COMPONENTS[target.type].tap
      ? [[link, target] as const]
      : []
  })

export const caption = (text: string, h: HtmlBuilder<Message>): Html =>
  h.span([h.Class('text-[calc(12px*var(--type-scale))] font-medium text-muted-foreground')], [text])

export const KIND_SHORT: Record<RequestKind, string> = {
  page: 'Page',
  bid: 'Bid',
  read: 'Read',
  write: 'Write',
  login: 'Login',
  search: 'Search',
  upload: 'Upload',
  bot: 'Bot',
  media: 'Media',
  rt: 'Realtime',
  buy: 'Buy',
  job: 'Export',
  report: 'Report',
  ai: 'AI',
  feed: 'Feed',
  hook: 'Webhook',
  push: 'Push',
}

/** A Database's or Read Replica's engine (07 "Variants"). */
export const engine = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Engine',
    [
      picker(
        'db-engine',
        (Object.keys(DB_ENGINES) as ReadonlyArray<DbEngine>).map(
          (id) => [id, DB_ENGINES[id].name] as const,
        ),
        node.dbEngine,
        (dbEngine) => Message.DbEngineChosen({ nodeId: node.id, dbEngine }),
        h,
        () => true,
        'grid-cols-2',
      ),
      caption(
        `${DB_ENGINES[node.dbEngine].connections} connections: Postgres forks a process for each, MySQL gives it a thread.`,
        h,
      ),
    ],
    h,
  )

/** A store that can replicate across the open regions. */
export const spreading = (
  game: Game,
  node: GameNode,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> =>
  openRegions(game).length < 2
    ? []
    : [
        section(
          'Regions',
          [
            picker(
              'spread',
              [
                [false, 'One'],
                [true, 'Spread'],
              ],
              node.spread,
              (spread) => Message.SpreadChosen({ nodeId: node.id, spread }),
              h,
            ),
          ],
          h,
        ),
      ]

export const splitting = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Hot keys',
    [
      picker(
        'split',
        [
          [false, 'One shard'],
          [true, 'Split'],
        ],
        node.split,
        (split) => Message.SplitChosen({ nodeId: node.id, split }),
        h,
      ),
    ],
    h,
  )

/** The runtime a pinned Tradeoff card asks this Node's Stack to show, if any. */
export const pinnedRuntime = (model: Model, node: GameNode) =>
  model.board.tradeoff?.nodeId === node.id &&
  model.board.tradeoff.option.kind === 'runtime' &&
  model.board.tradeoff.pinned
    ? model.board.tradeoff.option.id
    : null
