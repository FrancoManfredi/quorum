import { StudyStall } from '@quorum/simulation/studies'
import type { StudyShapeKind } from '@quorum/simulation/catalog'
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

/** What a Study waits for, as the rest of a "can’t run unless …" sentence (10 "Studies"). */
export const stallNeedIn = (t: Messages, stall: StudyStall): string =>
  StudyStall.match(stall, {
    Breadth: ({ unit, target }) =>
      unit === 'regions' ? t.hud.needBreadthRegions(target) : t.hud.needBreadth(target),
    Pool: ({ pool, feature }) =>
      feature
        ? t.hud.needShip(insightName(t, pool), t.catalog.features[feature].name)
        : pool === 'failure'
          ? t.hud.needFailure
          : t.hud.needPool(insightName(t, pool)),
    Shape: ({ shape, value }) => shapeNeedIn(t, shape, value),
  })

/** Why a Study stalls, in one sentence, for a surface that names the Study beside it. */
export const stallReasonIn = (t: Messages, stall: StudyStall): string =>
  t.hud.studyBlocked(stallNeedIn(t, stall))

/** The behaviour a shape asks the Design to show, in this language. */
const shapeNeedIn = (t: Messages, shape: StudyShapeKind, value: number): string => {
  const pct = Math.round(value * 100)
  switch (shape) {
    case 'connections':
      return t.hud.shapeConnections(value)
    case 'read-share':
      return t.hud.shapeReadShare(pct)
    case 'cache-hit':
      return t.hud.shapeCacheHit(pct)
    case 'backlog':
      return t.hud.shapeBacklog(value)
    case 'report-share':
      return t.hud.shapeReportShare(pct)
    case 'saturation':
      return t.hud.shapeSaturation(pct)
    case 'replica':
      return t.hud.shapeReplica
  }
}
