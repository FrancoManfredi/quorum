import type { Html, HtmlBuilder } from 'foldkit/html'
import { CACHE_ENGINES, CACHE_TTLS, CACHE_STRATEGIES } from '@quorum/simulation/catalog'
import { has } from '@quorum/simulation/lookups'
import type { CacheEngine, Game, GameNode, CacheStrategy } from '@quorum/simulation/state'
import { duration } from '@quorum/ui/game/format'
import { Message } from '@/game/message.ts'
import { type Panel, caption, picker, section, splitting } from './shared.ts'

const cache = (game: Game, node: GameNode, h: HtmlBuilder<Message>): Html =>
  section(
    'Cache',
    [
      picker(
        'strategy',
        (Object.keys(CACHE_STRATEGIES) as ReadonlyArray<CacheStrategy>).map(
          (id) => [id, CACHE_STRATEGIES[id].name] as const,
        ),
        node.cacheStrategy,
        (cacheStrategy) => Message.CacheStrategyChosen({ nodeId: node.id, cacheStrategy }),
        h,
        (id) => id === 'aside' || has(game, 'cache-strategies'),
        'grid-cols-2',
      ),
      caption(
        CACHE_STRATEGIES[node.cacheStrategy].write === 'ahead'
          ? 'A write returns from the Cache and reaches the Database late. A crash loses what has not flushed.'
          : CACHE_STRATEGIES[node.cacheStrategy].write === 'through'
            ? 'Every write goes to the Cache and the Database together: fresher, and a write longer.'
            : 'Reads come from the Cache, writes go around it. A miss can store an old row until the TTL.',
        h,
      ),
      ...(has(game, 'stampede-protection')
        ? [
            picker(
              'coalesce',
              [
                [false, 'Every miss'],
                [true, 'Coalesce'],
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
                [false, 'Expire on the TTL'],
                [true, 'Refresh early'],
              ],
              node.earlyExpiry,
              (earlyExpiry) => Message.CacheGuardChosen({ nodeId: node.id, earlyExpiry }),
              h,
            ),
            picker(
              'swr',
              [
                [false, 'Miss on expiry'],
                [true, 'Stale while revalidating'],
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
                [false, 'Cold start'],
                [true, 'Warm start'],
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
        CACHE_TTLS.map((entry) => [entry.ttl, duration(entry.ttl)] as const),
        node.ttl,
        (ttl) => Message.TtlChosen({ nodeId: node.id, ttl }),
        h,
      ),
    ],
    h,
  )

export const cachePanel: Panel = {
  body: ({ game, node, h }) => [cache(game, node, h)],
  late: ({ game, node, h }) => (has(game, 'hybrid-fanout') ? [splitting(node, h)] : []),
}
