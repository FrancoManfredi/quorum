import { copy, type Messages } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Ledger } from '@quorum/simulation/ledger'
import { COMPONENTS, SIZES } from '@quorum/simulation/catalog'
import { regionView } from '@quorum/simulation/regions'
import { rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'

/** A Node's load as the cards show it: the share of its limiting resource in use. */
const loadOf = (t: Messages, ledger: Ledger, id: string): string => {
  const own = ledger.nodes[id]
  if (!own) return t.nodeList.noLoad
  if (own.status === 'down') return t.nodeList.down
  return `${Math.round(own.utilization * 100)}%`
}

export const nodeList = (model: Model, ledger: Ledger, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const nodes = regionView(game, model.board.region).nodes
  return h.section(
    [
      h.Key('node-list'),
      h.DataAttribute('node-list', ''),
      h.Class('node-list sr-only'),
      h.AriaLabel(t.nodeList.nodes),
    ],
    [
      h.h2([h.Class('node-list-title')], [t.nodeList.nodes]),
      h.ul(
        [],
        nodes.map((node) =>
          h.li(
            [h.Key(node.id)],
            [
              h.button(
                [h.Type('button'), h.OnClick(Message.NodeTapped({ nodeId: node.id }))],
                [
                  h.span([], [t.catalog.components[node.type].name]),
                  h.span([], [' · ']),
                  h.span(
                    [],
                    [
                      COMPONENTS[node.type].sized
                        ? t.nodeList.sizes[SIZES[node.size]?.name ?? 'custom']
                        : t.nodeList.sizeStep(node.size),
                    ],
                  ),
                  h.span([], [' · ']),
                  h.span([], [loadOf(t, ledger, node.id)]),
                  h.span([], [' · ']),
                  h.span([], [t.nodeList.s(rate(ledger.nodes[node.id]?.inbound ?? 0))]),
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  )
}
