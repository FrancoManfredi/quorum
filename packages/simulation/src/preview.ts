import { Result } from 'effect'
import { resize, setLinkPolicy, type Action, type Refusal } from './actions.ts'
import { COMPONENTS } from './catalog.ts'
import type { Ledger } from './ledger.ts'
import { solveFlow } from './solve.ts'
import { causeOf, leftOf, RUNNING } from './life.ts'
import type { Game, GameNode } from './state.ts'
import { step } from './step.ts'

/* ==========================================================================
   The Tradeoff preview (15 "Tradeoff cards"): a ghost Simulation that runs
   the Design with and without a change for a few sim seconds and reports
   both. Pure: it never touches the Game it is given, and no incident starts
   inside it. The changed Nodes start up and warm, so the preview shows the
   settled effect; the restart they would pay is reported apart (16 D19).
   ========================================================================== */

/** The figures a change is measured by. */
export type Figures = Readonly<{
  revenue: number
  latency: number
  p99: number
  errors: number
}>

export type Preview = Readonly<{
  before: Figures
  after: Figures
  /** Burn per second without and with the change. */
  burn: readonly [number, number]
  /** Seconds the changed Nodes would be down restarting, 0 when nothing restarts. */
  restart: number
  /** Cash the change costs now, 0 when it is free. */
  cash: number
}>

/** Sim seconds each ghost runs. */
export const PREVIEW_SECONDS = 10

export const figuresOf = (ledger: Ledger): Figures => ({
  revenue: ledger.revenue,
  latency: ledger.latency,
  p99: ledger.p99,
  errors: ledger.errorShare,
})

/** Runs a ghost in 1 s Steps with users held, so growth cannot differ between the two. */
const ghostRun = (start: Game, seconds: number): Ledger => {
  let game = start
  for (let elapsed = 0; elapsed < seconds; elapsed += 1)
    game = { ...step(game, 1).game, users: start.users }
  return solveFlow(game)
}

/** Nodes the change touched start up and warm; returns the Game and the longest restart. */
const settled = (before: Game, after: Game): readonly [Game, number] => {
  const old = new Map(before.nodes.map((node) => [node.id, node]))
  let restart = 0
  const nodes = after.nodes.map((node): GameNode => {
    if (old.get(node.id) === node || causeOf(node.life) !== 'restart') return node
    restart = Math.max(restart, leftOf(node.life))
    return { ...node, life: RUNNING }
  })
  return [{ ...after, nodes }, restart]
}

const previews = new WeakMap<Game, Map<string, Result.Result<Preview, Refusal>>>()
/** The unchanged ghost, shared by every option previewed on the same Game. */
const baselines = new WeakMap<Game, Map<number, Ledger>>()

const baselineOf = (game: Game, ghost: Game, seconds: number): Ledger => {
  const cached = baselines.get(game)?.get(seconds)
  if (cached) return cached
  const ledger = ghostRun(ghost, seconds)
  const entries = baselines.get(game) ?? new Map<number, Ledger>()
  entries.set(seconds, ledger)
  baselines.set(game, entries)
  return ledger
}

/**
 * Previews a change: `apply` is the action, `key` names it for the cache, one
 * entry per Game and option. A refused action returns its refusal.
 */
export const previewOf = (
  game: Game,
  key: string,
  apply: (game: Game) => Action,
  seconds = PREVIEW_SECONDS,
): Result.Result<Preview, Refusal> => {
  const cached = previews.get(game)?.get(key)
  if (cached) return cached
  const ghost: Game = { ...game, nextIncidentAt: Number.MAX_SAFE_INTEGER }
  const result = Result.map(apply(ghost), (changed): Preview => {
    const [warm, restart] = settled(ghost, changed)
    const before = baselineOf(game, ghost, seconds)
    const after = ghostRun(warm, seconds)
    return {
      before: figuresOf(before),
      after: figuresOf(after),
      burn: [before.burn, after.burn],
      restart,
      cash: ghost.cash - changed.cash,
    }
  })
  const entries = previews.get(game) ?? new Map<string, Result.Result<Preview, Refusal>>()
  entries.set(key, result)
  previews.set(game, entries)
  return result
}

/* ==========================================================================
   What-if rows (12 "Load diagnosis"): the utilization a busy Node would have
   after one change the player can make now. Each row is a ghost run of the
   same length as a Tradeoff preview; a refused change gives no row.
   ========================================================================== */

export type WhatIf = Readonly<{
  /** Larger is one size up on `target`; Retries off stops every retry on Links into the Node. */
  change: 'larger' | 'retries-off'
  target: string
  before: number
  after: number
}>

export const whatIfsOf = (game: Game, nodeId: string): ReadonlyArray<WhatIf> => {
  const node = game.nodes.find((entry) => entry.id === nodeId)
  if (!node) return []
  const ledger = solveFlow(game)
  const ghost: Game = { ...game, nextIncidentAt: Number.MAX_SAFE_INTEGER }
  const typeOf = (id: string) => game.nodes.find((entry) => entry.id === id)?.type
  const live = (id: string) => (ledger.nodes[id]?.inbound ?? 0) > 0
  // The Node itself, the Caches in front of it, and the busiest Node it calls.
  const caches = game.links
    .filter((link) => link.to === nodeId && live(link.from))
    .map((link) => link.from)
    .filter((id) => typeOf(id) === 'cache' || typeOf(id) === 'cdn')
  const busiest = ledger.links
    .filter((link) => link.from === nodeId && link.rate > 0 && live(link.to))
    .map((link) => link.to)
    .filter((id) => !COMPONENTS[typeOf(id) ?? 'users'].tap)
    .toSorted(
      (a, b) => (ledger.nodes[b]?.utilization ?? 0) - (ledger.nodes[a]?.utilization ?? 0),
    )[0]
  const retrying = game.links.filter((link) => link.to === nodeId && link.retries !== 'none')
  const candidates: ReadonlyArray<readonly [WhatIf['change'], string, (game: Game) => Action]> = [
    ['larger', nodeId, (current) => resize(current, nodeId, 1)],
    ...caches.map((id) => ['larger', id, (current: Game) => resize(current, id, 1)] as const),
    ...(busiest
      ? [['larger', busiest, (current: Game) => resize(current, busiest, 1)] as const]
      : []),
    ...(retrying.length
      ? [
          [
            'retries-off',
            nodeId,
            (current: Game) =>
              retrying.reduce<Action>(
                (result, link) =>
                  Result.flatMap(result, (next) =>
                    setLinkPolicy(next, link.from, link.to, { retries: 'none' }),
                  ),
                Result.succeed(current),
              ),
          ] as const,
        ]
      : []),
  ]
  const before = baselineOf(game, ghost, PREVIEW_SECONDS).nodes[nodeId]?.utilization ?? 0
  return candidates
    .flatMap(([change, target, apply]) => {
      const changed = apply(ghost)
      if (Result.isFailure(changed)) return []
      const [warm] = settled(ghost, changed.success)
      const after = ghostRun(warm, PREVIEW_SECONDS).nodes[nodeId]?.utilization ?? 0
      return [{ change, target, before, after }]
    })
    .toSorted((a, b) => a.after - b.after)
}
