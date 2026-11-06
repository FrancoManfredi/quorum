import type { Html, HtmlBuilder } from 'foldkit/html'
import { CDN_TTLS, CACHE_KEYS } from '@quorum/simulation/catalog'
import type { GameNode, CacheKey } from '@quorum/simulation/state'
import { duration } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section } from './shared.ts'

/** A CDN's purge on deploy and cache key (05 "CDN"). */
const cdnOptions = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Deploys and keys',
    [
      picker(
        'cdn-purge',
        [
          [false, 'Keep until the TTL'],
          [true, 'Purge on deploy'],
        ],
        node.purge,
        (purge) => Message.CdnOptionsChosen({ nodeId: node.id, purge }),
        h,
      ),
      picker(
        'cdn-key',
        (Object.keys(CACHE_KEYS) as ReadonlyArray<CacheKey>).map(
          (id) => [id, CACHE_KEYS[id].name] as const,
        ),
        node.cacheKey,
        (cacheKey) => Message.CdnOptionsChosen({ nodeId: node.id, cacheKey }),
        h,
        () => true,
        'grid-cols-3',
      ),
      caption(
        node.purge
          ? 'A deploy empties the cache: the origin takes the misses while it refills.'
          : `After a deploy the edge serves some of the old pages until the TTL passes.`,
        h,
      ),
      caption(
        node.cacheKey === 'full'
          ? 'The key holds the path, the query string and the cookies: nothing is shared between users.'
          : `A smaller key lifts the hit ratio ${Math.round((CACHE_KEYS[node.cacheKey].hit - 1) * 100)}%, and a logged-in page cached under it can be served to another user: a data leak.`,
        h,
      ),
    ],
    h,
  )

const cdnTtl = (node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'TTL',
    [
      picker(
        'cdn-ttl',
        CDN_TTLS.map((entry) => [entry.ttl, duration(entry.ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

export const cdnPanel: Panel = {
  body: ({ node, h }) => [cdnTtl(node, h), cdnOptions(node, h)],
}
