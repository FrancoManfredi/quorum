import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { COLLECTORS, GOGC, RUNTIMES } from '@quorum/simulation/catalog'
import { regional } from '@quorum/simulation/regions'
import { has } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, picker, pinnedRuntime, section, serviceOwnership, stack } from './shared.ts'

const fanout = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorServer.feeds,
    [
      picker(
        'fanout',
        [
          ['pull', t.inspectorServer.pull],
          ['push', t.inspectorServer.push],
        ],
        node.fanout,
        (choice) => Message.FanoutChosen({ nodeId: node.id, fanout: choice }),
        h,
      ),
    ],
    h,
  )
}

/** A Java App Server's collector, or a Go App Server's GOGC. */
const collector = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const language = RUNTIMES[node.runtime].language
  if (language === 'java')
    return [
      section(
        t.inspectorServer.collector,
        [
          picker(
            'collector',
            (Object.keys(COLLECTORS) as ReadonlyArray<keyof typeof COLLECTORS>).map(
              (id) => [id, t.catalog.collectors[id].label] as const,
            ),
            node.collector,
            (choice) => Message.CollectorChosen({ nodeId: node.id, collector: choice }),
            h,
            (choice) => choice !== 'zgc' || has(game, 'zgc'),
          ),
        ],
        h,
      ),
    ]
  if (language === 'go' && has(game, 'gogc-tuning'))
    return [
      section(
        'GOGC',
        [
          picker(
            'gogc',
            GOGC.map((entry) => [entry.gogc, `${entry.gogc}`] as const),
            node.gogc,
            (gogc) => Message.GogcChosen({ nodeId: node.id, gogc }),
            h,
          ),
        ],
        h,
      ),
    ]
  return []
}

/** Load shedding and read-your-writes routing on an App Server. */
const routing = (game: Game, node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const rows: Array<Html> = []
  if (has(game, 'load-shedding'))
    rows.push(
      picker(
        'shed',
        [
          [false, t.inspectorServer.dropEvenly],
          [true, t.inspectorServer.shedLowValue],
        ],
        node.shed,
        (shed) => Message.ShedChosen({ nodeId: node.id, shed }),
        h,
      ),
    )
  if (has(game, 'graceful-degradation'))
    rows.push(
      picker(
        'degrade',
        [
          [false, t.inspectorServer.keepKinds],
          [true, t.inspectorServer.dropDearest],
        ],
        node.degrade,
        (degrade) => Message.DegradeChosen({ nodeId: node.id, degrade }),
        h,
      ),
    )
  if (has(game, 'ryw-routing'))
    rows.push(
      picker(
        'ryw',
        [
          [false, t.inspectorServer.readsAnywhere],
          [true, t.inspectorServer.readYourWrites],
        ],
        node.ryw,
        (ryw) => Message.RywChosen({ nodeId: node.id, ryw }),
        h,
      ),
    )
  return rows.length > 0 ? [section(t.inspectorServer.overload, rows, h)] : []
}

export const serverPanel: Panel = {
  body: ({ model, game, node, h }) => [
    ...stack(model, node, h, pinnedRuntime(model, node)),
    ...serviceOwnership(game, node, h),
    ...collector(game, node, h),
    ...routing(game, node, h),
  ],
  late: ({ game, node, h }) => (regional(game) ? [fanout(node, h)] : []),
}
