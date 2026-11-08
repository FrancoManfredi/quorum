import { StudyStall } from '@quorum/simulation/studies'
import { insightName, type Messages } from './messages.ts'

/**
 * The Simulation's number formatters, in words of one language. `@quorum/ui/game/format` writes
 * English units for the wiki and the board; a view that shows a duration or a latency takes its
 * units from the typed copy instead.
 */
export const formats = (t: Messages) => ({
  /** Milliseconds: whole ms under a second, seconds above. */
  ms: (value: number): string =>
    value < 1000
      ? t.units.ms(Math.round(value))
      : t.units.s((value / 1000).toFixed(value < 10_000 ? 1 : 0)),
  /** How long a new task waits in a Queue: seconds, minutes or hours, or stalled. */
  queueWait: (seconds: number | null): string =>
    seconds === null
      ? '—'
      : seconds === Number.POSITIVE_INFINITY
        ? t.units.stalled
        : seconds < 60
          ? t.units.s(Math.round(seconds))
          : seconds < 3600
            ? t.units.min(Math.round(seconds / 60))
            : t.units.h(Math.round(seconds / 3600)),
  /** A setting in seconds: 30 s, 5 min, 1 h. */
  duration: (seconds: number): string =>
    seconds < 60
      ? t.units.s(seconds)
      : seconds < 3600
        ? t.units.min(seconds / 60)
        : t.units.h(seconds / 3600),
  /** What an alert rule pages on, at its threshold. */
  alertText: (
    rule: 'errors' | 'latency' | 'saturation' | 'queue' | 'budget',
    threshold: number,
  ): string =>
    rule === 'errors'
      ? t.units.errorRateAbove(threshold * 100)
      : rule === 'latency'
        ? t.units.p99Above(threshold)
        : rule === 'queue'
          ? t.units.queueOlderThan(threshold)
          : rule === 'budget'
            ? t.units.budgetBurningAbove(threshold)
            : t.units.nodeAboveLoad(Math.round(threshold * 100)),
})

/** Why a Study stalls, in one sentence (10 "Studies"). */
export const stallReasonIn = (t: Messages, stall: StudyStall): string =>
  StudyStall.match(stall, {
    Breadth: ({ types }) => t.hud.stalledBreadth(types),
    Pool: ({ pool, feature }) =>
      feature
        ? t.hud.stalledShip(insightName(t, pool), t.catalog.features[feature].name)
        : pool === 'failure'
          ? t.hud.stalledFailure
          : t.hud.stalledPool(insightName(t, pool)),
  })
