import type { Html, HtmlBuilder } from 'foldkit/html'
import { DNS_TTLS } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { GameNode } from '@quorum/simulation/state'
import { duration } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, picker, section } from './shared.ts'

const dnsTtl = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'TTL',
    [
      picker(
        'ttl',
        DNS_TTLS.map((ttl) => [ttl, duration(ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

export const dnsPanel: Panel = {
  late: ({ game, node, h }) => (has(game, 'health-checks') ? [dnsTtl(node, h)] : []),
}
