import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  SEARCH_REFRESH,
  SEARCH_HEAPS,
  SEARCH_REPLICAS,
  SEARCH_SHARDS,
  SEARCH_VARIANTS,
} from '@quorum/simulation/catalog'
import type { GameNode, SearchHeap, SearchVariant } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** A Search Engine's refresh interval (07 "Search Engine"): fresher answers cost indexing CPU. */
const search = (node: GameNode, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const variant = SEARCH_VARIANTS[node.searchVariant]
  return [
    section(
      'Product',
      [
        picker(
          'search-variant',
          (Object.keys(SEARCH_VARIANTS) as ReadonlyArray<SearchVariant>).map(
            (id) => [id, SEARCH_VARIANTS[id].name] as const,
          ),
          node.searchVariant,
          (searchVariant) => Message.SearchOptionsChosen({ nodeId: node.id, searchVariant }),
          h,
          () => true,
          'grid-cols-3',
        ),
        caption(
          variant.jvm
            ? 'Full features on a JVM: shards, replicas, and a heap to tune.'
            : 'Answers half again as many queries in a shorter hop on one smaller node, and its relevance falls as the index grows. No shards, replicas, or heap.',
          h,
        ),
      ],
      h,
    ),
    ...(variant.jvm
      ? [
          section(
            'Shards and replicas',
            [
              picker(
                'search-shards',
                SEARCH_SHARDS.map(
                  (count) => [count, `${count} shard${count === 1 ? '' : 's'}`] as const,
                ),
                node.searchShards,
                (searchShards) => Message.SearchOptionsChosen({ nodeId: node.id, searchShards }),
                h,
                () => true,
                'grid-cols-3',
              ),
              picker(
                'search-replicas',
                SEARCH_REPLICAS.map(
                  (count) => [count, `${count} replica${count === 1 ? '' : 's'}`] as const,
                ),
                node.searchReplicas,
                (searchReplicas) =>
                  Message.SearchOptionsChosen({ nodeId: node.id, searchReplicas }),
                h,
                () => true,
                'grid-cols-3',
              ),
              caption(
                'More shards parallelize the index and fan every query out. Each replica adds query capacity, a box, and a copy of the index.',
                h,
              ),
            ],
            h,
          ),
          section(
            'Heap',
            [
              picker(
                'search-heap',
                (Object.keys(SEARCH_HEAPS) as ReadonlyArray<SearchHeap>).map(
                  (id) => [id, SEARCH_HEAPS[id].name] as const,
                ),
                node.heap,
                (heap) => Message.SearchOptionsChosen({ nodeId: node.id, heap }),
                h,
                () => true,
                'grid-cols-3',
              ),
              caption(
                node.heap === 'small'
                  ? 'Too small: garbage collection pauses.'
                  : node.heap === 'large'
                    ? 'Too large: long pauses and less file system cache.'
                    : 'The JVM heap holds caches without starving the file system cache.',
                h,
              ),
            ],
            h,
          ),
        ]
      : []),
    searchRefresh(node, h),
  ]
}

const searchRefresh = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Refresh',
    [
      picker(
        'refresh',
        SEARCH_REFRESH.map((entry) => [entry.seconds, `${entry.seconds} s`] as const),
        node.refresh,
        (refresh) => Message.SearchRefreshChosen({ nodeId: node.id, refresh }),
        h,
      ),
      caption(
        node.refresh <= 1
          ? 'A new document is searchable within a second, at the cost of indexing CPU.'
          : `A new document waits up to ${node.refresh} s: indexing is cheaper, and answers are staler.`,
        h,
      ),
    ],
    h,
  )

export const searchPanel: Panel = {
  body: ({ node, h }) => [...search(node, h)],
}
