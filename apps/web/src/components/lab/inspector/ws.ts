import { formats } from '@/i18n/format.ts'
import { copy, localized } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { RT_HOLD_SECONDS, RUNTIMES, RUNTIME_IDS } from '@quorum/simulation/catalog'
import { distributedErlang, hubConnections } from '@quorum/simulation/rules'
import { burnOf, runtimeReady } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { compact, money, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, picker, section } from './shared.ts'

/** The runtime a Realtime Hub holds its connections on: the per-connection cost is the whole model. */
const hubStack = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const runtime = localized(RUNTIMES[node.runtime], t.catalog.runtimes[node.runtime])
  return section(
    t.inspectorWs.runtime,
    [
      picker(
        'runtime',
        RUNTIME_IDS.map((id) => [id, t.catalog.runtimes[id].name] as const),
        node.runtime,
        (id) => Message.OptionChosen({ nodeId: node.id, option: { kind: 'runtime', id } }),
        h,
        (id) => runtimeReady(game, id),
      ),
      h.p(
        [h.Class('text-[calc(12px*var(--type-scale))] leading-snug text-muted-foreground')],
        [runtime.blurb],
      ),
      caption(
        runtime.connectionKB === null
          ? t.inspectorWs.holdsNoConnectionsPickARuntime(runtime.name)
          : t.inspectorWs.holdsAboutConnections(
              compact(hubConnections(node, distributedErlang(game, node))),
            ),
        h,
      ),
    ],
    h,
  )
}

/** A Realtime Hub's Presence, Reconnect backoff and Clustering (05 "Realtime Hub"). */
const hub = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorWs.clients,
    [
      picker(
        'presence',
        [
          [false, t.inspectorWs.noPresence],
          [true, t.inspectorWs.presence],
        ],
        node.presence,
        (presence) => Message.HubOptionsChosen({ nodeId: node.id, presence }),
        h,
      ),
      picker(
        'backoff',
        [
          [false, t.inspectorWs.reconnectAtOnce],
          [true, t.inspectorWs.backoffWithJitter],
        ],
        node.backoff,
        (backoff) => Message.HubOptionsChosen({ nodeId: node.id, backoff }),
        h,
      ),
      picker(
        'clustering',
        [
          [false, t.inspectorWs.oneBox],
          [true, t.inspectorWs.clustered],
        ],
        node.clustering,
        (clustering) => Message.HubOptionsChosen({ nodeId: node.id, clustering }),
        h,
      ),
      caption(
        node.clustering
          ? t.inspectorWs.boxesShareAPubSubBackbone
          : t.inspectorWs.oneBoxTakesEveryConnectionLarger,
        h,
      ),
    ],
    h,
  )
}

export const wsPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    const t = copy(h)

    // The Hub's limit is connections, not requests: each realtime message holds one open.
    const max = hubConnections(node, distributedErlang(game, node))
    const held = own.inbound * RT_HOLD_SECONDS
    return [
      row(
        t.inspectorWs.connections,
        `${compact(Math.round(held))} / ${compact(Math.round(max))}`,
        max <= 0 || held >= max * 0.9 ? 'danger' : held >= max * 0.7 ? 'warn' : 'plain',
        h,
      ),
      row(t.inspectorWs.messages, t.inspectorWs.s(rate(own.inbound)), 'plain', h),
      row(t.inspectorWs.latency, formats(t).ms(own.latency), 'plain', h),
      row(
        t.inspectorWs.dropped,
        t.inspectorWs.s(rate(own.dropped)),
        own.dropped > 0.05 ? 'danger' : 'plain',
        h,
      ),
      row(t.inspectorWs.burn, t.inspectorWs.s(money(burnOf(game, node))), 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [hubStack(game, node, h), hub(node, h)],
}
