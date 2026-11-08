import { Schema } from 'effect'
import * as Simulation from '@quorum/simulation/actions'
import * as RunwayActions from '@quorum/simulation/runway'
import * as WorkActions from '@quorum/simulation/work'
import * as MirrorActions from '@quorum/simulation/mirror'
import { planOf, type Intent } from '@quorum/simulation/room'
import { Game } from '@quorum/simulation/state'

/* ==========================================================================
   The board's actions, each carrying the Intent it stands for. `act()` sends
   that Intent while a Room is live, so one call site plays offline and online.
   ========================================================================== */

const plans = new WeakMap<object, Intent>()
const isGame = Schema.is(Game)

/** The Intent a value returned by an action stands for, if it is one. */
export const planIn = (value: unknown): Intent | null =>
  typeof value === 'object' && value !== null ? (plans.get(value) ?? null) : null

/**
 * One module's actions, with the same call signatures. A call records the
 * Intent its result stands for; an action a Seat may not take records nothing,
 * and `act()` refuses it while a Room is live.
 */
const planned = <T extends object>(module: T): T => {
  const base = { ...module } as Record<string, unknown>
  const calls = new Map<string, unknown>()
  return new Proxy(base, {
    get(target, named) {
      const value = target[named as string]
      if (typeof named !== 'string' || typeof value !== 'function') return value
      const known = calls.get(named)
      if (known !== undefined) return known
      const call = (...args: ReadonlyArray<unknown>) => {
        const outcome = (value as (...params: ReadonlyArray<unknown>) => unknown)(...args)
        if (typeof outcome === 'object' && outcome !== null) {
          // Every action takes the Game it acts on first; the Room has its own.
          const plan = planOf(named, isGame(args[0]) ? args.slice(1) : args)
          if (plan !== null) plans.set(outcome, plan)
        }
        return outcome
      }
      calls.set(named, call)
      return call
    },
  }) as T
}

export const Actions = planned(Simulation)
export const Work = planned(WorkActions)
export const Mirrors = planned(MirrorActions)
export const Runway = planned(RunwayActions)
