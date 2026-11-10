import { type Action, Refusal, no, notAllowed, ok, patch, withNode } from '../action-kit.ts'
import type { CacheEngine, CacheStrategy, Game, GameNode } from '../state.ts'
import {
  RESEARCH,
  CACHE_ENGINES,
  CACHE_OPS,
  CACHE_STRATEGIES,
  CACHE_TTLS,
  STALE_SURGE,
  COALESCED,
  HOT_KB_PER_USER,
  EARLY_LIFT,
  EARLY_REFRESH,
  WARMED,
} from '../catalog.ts'
import { RUNNING, warmOf, withWarm } from '../life.ts'
import { answered, blend, through } from '../distribution.ts'

import { flatModel } from '../capacity.ts'
import { flatScale, grown, has, hopMs } from '../lookups.ts'
import { type ComponentRule, each, hotKeyFactor, noProbe, relay, slotOf } from '../rule-kit.ts'

/**
 * The strategy a Cache runs (07 "Strategies"). The three that change the write path need their
 * research; without it the Cache is cache-aside.
 */
const cacheStrategyOf = (game: Game, node: GameNode) =>
  has(game, 'cache-strategies') ? CACHE_STRATEGIES[node.cacheStrategy] : CACHE_STRATEGIES.aside

/** Redis answers on one main thread; Memcached on every core of its box. */
const cacheCapacity = (node: GameNode): number =>
  CACHE_OPS * (CACHE_ENGINES[node.engine].scales ? Math.max(1, grown(1, 2, node.size - 3)) : 1)

/** The TTL class a Cache's TTL falls in. */
const cacheTtlOf = (ttl: number) =>
  ttl <= 10 ? CACHE_TTLS[0] : ttl < 3_600 ? CACHE_TTLS[1] : CACHE_TTLS[2]

/**
 * The share of reads a Cache's TTL keeps as hits (07 "TTL", "Stampedes"). Probabilistic early
 * expiration refreshes a key a little before it expires, so half the hits a short TTL loses stay;
 * stale-while-revalidate serves the old value while one request refreshes it, so none are lost.
 */
const ttlFactorOf = (game: Game, node: GameNode): number => {
  const factor = cacheTtlOf(node.ttl).factor
  if (!has(game, 'stampede-protection')) return factor
  if (node.swr) return 1
  return node.earlyExpiry ? factor + (1 - factor) * EARLY_LIFT : factor
}

const hitRatioOf = (game: Game, node: GameNode, writeShare: number): number => {
  const memory = flatScale(node)
  const hot = (game.users * HOT_KB_PER_USER) / 1_000_000
  const fits = hot > 0 ? Math.min(1, memory / hot) : 1
  return (
    Math.sqrt(fits) *
    ttlFactorOf(game, node) *
    (1 - Math.min(0.5, 2 * writeShare)) *
    warmOf(node.life)
  )
}

export const cacheRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      cacheCapacity(node) / hotKeyFactor(solver.game, node),
      arriving,
      { fixedMs: 0.5, variableMs: 0.2 },
      solver.boost(node),
    ),
  serve: (serve, node, rates, share) => {
    const reads = rates['q-read'] ?? 0
    const writes = rates['q-write'] ?? 0
    const writeShare = reads + writes > 0 ? writes / (reads + writes) : 0
    const { game } = serve.solver
    const strategy = cacheStrategyOf(game, node)
    const hit = hitRatioOf(game, node, writeShare)
    // A write-behind Cache keeps its own copy fresh but the Database lags; cache-aside's race
    // stores old data now and then; write-through has nothing stale behind it. A stale-read
    // incident is an invalidation bug on top: the Cache keeps serving old rows (07 "TTL").
    const surge = game.incident?.kind === 'stale-read' && game.incident.nodeId === node.id
    // Stale-while-revalidate answers the reads an expired key would have missed from the old value.
    const revalidating =
      node.swr && has(game, 'stampede-protection') ? 1 - cacheTtlOf(node.ttl).factor : 0
    serve.setHits(
      hit,
      Math.min(
        1,
        cacheTtlOf(node.ttl).stale * writeShare * strategy.stale * (surge ? STALE_SURGE : 1) +
          revalidating,
      ),
    )
    // Stampede protection: misses only a cold Cache has wait on one fetch per key.
    const warmHit = hitRatioOf(game, { ...node, life: RUNNING }, writeShare)
    const early = node.earlyExpiry && has(game, 'stampede-protection') ? hit * EARLY_REFRESH : 0
    const sent =
      (node.coalesce && has(game, 'stampede-protection')
        ? 1 - warmHit + (warmHit - hit) * COALESCED
        : 1 - hit) + early
    each(rates, share, (kind, processed) => {
      // A change invalidates the Cache's copy. It has no answer to send on.
      if (kind === 'change') return
      if (kind === 'q-read') return serve.route(kind, processed * sent)
      // Write-behind answers the write here and flushes only its share to the Database.
      if (kind === 'q-write' && strategy.write === 'ahead')
        return serve.route(kind, processed * strategy.flush)
      serve.route(kind, processed)
    })
  },
  outcome: (answer, node, kind) => {
    if (kind === 'change') return through(answer.ownHop(kind))
    const strategy = cacheStrategyOf(answer.game, node)
    // Write-through pays one more cache write; write-behind answers before the Database sees it.
    if (kind === 'q-write' && strategy.write === 'through') {
      const own = answer.ownHop(kind)
      return through({ ...own, fixedMs: own.fixedMs + strategy.writeMs }, [
        [answer.downstream(kind, hopMs(answer.game)), 1],
      ])
    }
    if (kind === 'q-write' && strategy.write === 'ahead') return through(answer.ownHop(kind))
    if (kind !== 'q-read') return relay(answer, node, kind)
    const hit = answer.pass.hits[slotOf(answer.pass, node)] ?? 0
    const mixed = blend([
      [{ ...answered(0, 0), stale: answer.pass.staleHits[slotOf(answer.pass, node)] ?? 0 }, hit],
      [answer.downstream(kind, hopMs(answer.game) + strategy.loadMs), 1 - hit],
    ])
    return through(answer.ownHop(kind), mixed ? [[mixed, 1]] : [])
  },
  // A Cache in front of the Database passes its callers' connections through.
  connections: (_, __, ___, inbound) => inbound,
  probe: noProbe,
}

/** Swaps a Cache's engine. The new one starts empty. */
export const setCacheEngine = (game: Game, id: string, engine: CacheEngine): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'cache') return notAllowed('Only a Cache has an engine.')
    return ok(
      node.engine === engine ? game : patch(game, id, { engine, life: withWarm(node.life, 0) }),
    )
  })

/** Turns a Cache's stampede protection or warming on or off. Each needs its research. */
export const setCacheGuard = (
  game: Game,
  id: string,
  change: Readonly<{
    coalesce?: boolean
    warming?: boolean
    earlyExpiry?: boolean
    swr?: boolean
  }>,
): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'cache') return notAllowed('Only a Cache has stampede guards.')
    if ((change.coalesce || change.earlyExpiry || change.swr) && !has(game, 'stampede-protection'))
      return no(
        Refusal.Locked({
          what: change.coalesce
            ? 'Coalescing'
            : change.earlyExpiry
              ? 'Early expiration'
              : 'Stale-while-revalidate',
          research: RESEARCH['stampede-protection'].name,
        }),
      )
    if (change.warming && !has(game, 'cache-warming'))
      return no(Refusal.Locked({ what: 'Warming', research: RESEARCH['cache-warming'].name }))
    return ok(patch(game, id, change))
  })

/**
 * Picks what a Cache does on a write (07 "Strategies"): cache-aside, read-through,
 * write-through or write-behind. Every strategy but cache-aside needs Cache strategies.
 */
export const setCacheStrategy = (game: Game, id: string, cacheStrategy: CacheStrategy): Action =>
  withNode(game, id, (node) => {
    if (node.type !== 'cache') return notAllowed('Only a Cache has a strategy.')
    if (cacheStrategy !== 'aside' && !has(game, 'cache-strategies'))
      return no(
        Refusal.Locked({ what: 'Cache strategies', research: RESEARCH['cache-strategies'].name }),
      )
    return ok(
      node.cacheStrategy === cacheStrategy
        ? game
        : patch(game, id, {
            cacheStrategy,
            life: withWarm(node.life, node.warming && has(game, 'cache-warming') ? WARMED : 0),
          }),
    )
  })
