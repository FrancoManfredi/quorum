import type { Html, HtmlBuilder } from 'foldkit/html'
import { RT_HOLD_SECONDS, RUNTIMES, RUNTIME_IDS } from '@quorum/simulation/catalog'
import { distributedErlang, hubConnections } from '@quorum/simulation/rules'
import { burnOf, runtimeReady } from '@quorum/simulation/lookups'
import type { Game, GameNode } from '@quorum/simulation/state'
import { compact, money, ms, rate } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { row } from '@quorum/ui/game/bits'
import { type Panel, caption, picker, section } from './shared.ts'

/** The runtime a Realtime Hub holds its connections on: the per-connection cost is the whole model. */
const hubStack = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const runtime = RUNTIMES[node.runtime]
  return section(
    'Runtime',
    [
      picker(
        'runtime',
        RUNTIME_IDS.map((id) => [id, RUNTIMES[id].name] as const),
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
          ? `${runtime.name} holds no connections. Pick a runtime that does.`
          : `Holds about ${compact(hubConnections(node, distributedErlang(game, node)))} connections.`,
        h,
      ),
    ],
    h,
  )
}

/** A Realtime Hub's Presence, Reconnect backoff and Clustering (05 "Realtime Hub"). */
const hub = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Clients',
    [
      picker(
        'presence',
        [
          [false, 'No presence'],
          [true, 'Presence'],
        ],
        node.presence,
        (presence) => Message.HubOptionsChosen({ nodeId: node.id, presence }),
        h,
      ),
      picker(
        'backoff',
        [
          [false, 'Reconnect at once'],
          [true, 'Backoff with jitter'],
        ],
        node.backoff,
        (backoff) => Message.HubOptionsChosen({ nodeId: node.id, backoff }),
        h,
      ),
      picker(
        'clustering',
        [
          [false, 'One box'],
          [true, 'Clustered'],
        ],
        node.clustering,
        (clustering) => Message.HubOptionsChosen({ nodeId: node.id, clustering }),
        h,
      ),
      caption(
        node.clustering
          ? 'Boxes share a pub/sub backbone, so every size step adds room.'
          : 'One box takes every connection: larger sizes add Burn and no room.',
        h,
      ),
    ],
    h,
  )

export const wsPanel: Panel = {
  stats: ({ game, node, own, h }) => {
    // The Hub's limit is connections, not requests: each realtime message holds one open.
    const max = hubConnections(node, distributedErlang(game, node))
    const held = own.inbound * RT_HOLD_SECONDS
    return [
      row(
        'Connections',
        `${compact(Math.round(held))} / ${compact(Math.round(max))}`,
        max <= 0 || held >= max * 0.9 ? 'danger' : held >= max * 0.7 ? 'warn' : 'plain',
        h,
      ),
      row('Messages', `${rate(own.inbound)}/s`, 'plain', h),
      row('Latency', ms(own.latency), 'plain', h),
      row('Dropped', `${rate(own.dropped)}/s`, own.dropped > 0.05 ? 'danger' : 'plain', h),
      row('Burn', `${money(burnOf(game, node))}/s`, 'plain', h),
    ]
  },
  body: ({ game, node, h }) => [hubStack(game, node, h), hub(node, h)],
}
