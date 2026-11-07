import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { PREFETCH } from '@quorum/simulation/catalog'
import type { GameNode } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, picker, pinnedRuntime, section, serviceOwnership, stack } from './shared.ts'

const prefetching = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorWorker.prefetch,
    [
      picker(
        'prefetch',
        PREFETCH.map((prefetch) => [prefetch, String(prefetch)] as const),
        node.prefetch,
        (prefetch) => Message.PrefetchChosen({ nodeId: node.id, prefetch }),
        h,
      ),
    ],
    h,
  )
}

export const workerPanel: Panel = {
  body: ({ model, game, node, h }) => [
    ...stack(model, node, h, pinnedRuntime(model, node)),
    ...serviceOwnership(game, node, h),
    prefetching(node, h),
  ],
}
