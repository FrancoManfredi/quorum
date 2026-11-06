import { formats } from '@/i18n/format.ts'
import { copy } from '@/i18n/messages.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { CACHE_ENGINES, CACHE_TTLS, CACHE_STRATEGIES } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { CacheEngine, Game, GameNode, CacheStrategy } from '@quorum/simulation/state'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section, splitting } from './shared.ts'

const cache = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return section(
    t.inspectorCache.cache,
    [
      picker(
        'strategy',
        (Object.keys(CACHE_STRATEGIES) as ReadonlyArray<CacheStrategy>).map(
          (id) => [id, t.catalog.cacheStrategies[id].name] as const,
        ),
        node.cacheStrategy,
        (cacheStrategy) => Message.CacheStrategyChosen({ nodeId: node.id, cacheStrategy }),
        h,
        (id) => id === 'aside' || has(game, 'cache-strategies'),
        'grid-cols-2',
      ),
      caption(
        CACHE_STRATEGIES[node.cacheStrategy].write === 'ahead'
          ? t.inspectorCache.aWriteReturnsFromTheCache
          : CACHE_STRATEGIES[node.cacheStrategy].write === 'through'
            ? t.inspectorCache.everyWriteGoesToTheCache
            : t.inspectorCache.readsComeFromTheCacheWrites,
        h,
      ),
      ...(has(game, 'stampede-protection')
        ? [
            picker(
              'coalesce',
              [
                [false, t.inspectorCache.everyMiss],
                [true, t.inspectorCache.coalesce],
              ],
              node.coalesce,
              (coalesce) => Message.CacheGuardChosen({ nodeId: node.id, coalesce }),
              h,
            ),
          ]
        : []),
      ...(has(game, 'stampede-protection')
        ? [
            picker(
              'early-expiry',
              [
                [false, t.inspectorCache.expireOnTheTTL],
                [true, t.inspectorCache.refreshEarly],
              ],
              node.earlyExpiry,
              (earlyExpiry) => Message.CacheGuardChosen({ nodeId: node.id, earlyExpiry }),
              h,
            ),
            picker(
              'swr',
              [
                [false, t.inspectorCache.missOnExpiry],
                [true, t.inspectorCache.staleWhileRevalidating],
              ],
              node.swr,
              (swr) => Message.CacheGuardChosen({ nodeId: node.id, swr }),
              h,
            ),
          ]
        : []),
      ...(has(game, 'cache-warming')
        ? [
            picker(
              'warming',
              [
                [false, t.inspectorCache.coldStart],
                [true, t.inspectorCache.warmStart],
              ],
              node.warming,
              (warming) => Message.CacheGuardChosen({ nodeId: node.id, warming }),
              h,
            ),
          ]
        : []),
      picker(
        'engine',
        (Object.keys(CACHE_ENGINES) as ReadonlyArray<CacheEngine>).map(
          (engine) => [engine, CACHE_ENGINES[engine].name] as const,
        ),
        node.engine,
        (engine) => Message.CacheEngineChosen({ nodeId: node.id, engine }),
        h,
      ),
      picker(
        'cache-ttl',
        CACHE_TTLS.map((entry) => [entry.ttl, formats(t).duration(entry.ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )
}

export const cachePanel: Panel = {
  body: ({ game, node, h }) => [cache(game, node, h)],
  late: ({ game, node, h }) => (has(game, 'hybrid-fanout') ? [splitting(node, h)] : []),
}
