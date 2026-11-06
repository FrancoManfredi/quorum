import { copy } from '@/i18n/messages.ts'
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
  const t = copy(h)

  const variant = SEARCH_VARIANTS[node.searchVariant]
  return [
    section(
      t.inspectorSearch.product,
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
            ? t.inspectorSearch.fullFeaturesOnAJVMShards
            : t.inspectorSearch.answersHalfAgainAsManyQueries,
          h,
        ),
      ],
      h,
    ),
    ...(variant.jvm
      ? [
          section(
            t.inspectorSearch.shardsAndReplicas,
            [
              picker(
                'search-shards',
                SEARCH_SHARDS.map((count) => [count, t.inspectorSearch.shardCount(count)] as const),
                node.searchShards,
                (searchShards) => Message.SearchOptionsChosen({ nodeId: node.id, searchShards }),
                h,
                () => true,
                'grid-cols-3',
              ),
              picker(
                'search-replicas',
                SEARCH_REPLICAS.map(
                  (count) => [count, t.inspectorSearch.replicaCount(count)] as const,
                ),
                node.searchReplicas,
                (searchReplicas) =>
                  Message.SearchOptionsChosen({ nodeId: node.id, searchReplicas }),
                h,
                () => true,
                'grid-cols-3',
              ),
              caption(t.inspectorSearch.moreShardsParallelizeTheIndexAnd, h),
            ],
            h,
          ),
          section(
            t.inspectorSearch.heap,
            [
              picker(
                'search-heap',
                (Object.keys(SEARCH_HEAPS) as ReadonlyArray<SearchHeap>).map(
                  (id) => [id, t.inspectorSearch.heaps[id]] as const,
                ),
                node.heap,
                (heap) => Message.SearchOptionsChosen({ nodeId: node.id, heap }),
                h,
                () => true,
                'grid-cols-3',
              ),
              caption(
                node.heap === 'small'
                  ? t.inspectorSearch.tooSmallGarbageCollectionPauses
                  : node.heap === 'large'
                    ? t.inspectorSearch.tooLargeLongPausesAndLess
                    : t.inspectorSearch.theJVMHeapHoldsCachesWithout,
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

const searchRefresh = (node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorSearch.refresh,
    [
      picker(
        'refresh',
        SEARCH_REFRESH.map((entry) => [entry.seconds, t.inspectorSearch.s(entry.seconds)] as const),
        node.refresh,
        (refresh) => Message.SearchRefreshChosen({ nodeId: node.id, refresh }),
        h,
      ),
      caption(
        node.refresh <= 1
          ? t.inspectorSearch.aNewDocumentIsSearchableWithin
          : t.inspectorSearch.aNewDocumentWaitsUpTo(node.refresh),
        h,
      ),
    ],
    h,
  )
}

export const searchPanel: Panel = {
  body: ({ node, h }) => [...search(node, h)],
}
