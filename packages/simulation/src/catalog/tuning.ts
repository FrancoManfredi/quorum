/* Playtest knobs for the vertical slice. Change these to tune a session's pace. */

/** Multiplies the user growth rate `g`, so the slice fits a 15 to 30 minute session. */
export const PLAYTEST_PACE = 2
/**
 * Mean sim seconds between Pre-seed incidents. The design's 12 minutes is too slow for a playtest.
 * Later Eras scale it by their own interval over Pre-seed's 12 minutes.
 */
export const INCIDENT_GAP = 200
/** Sim seconds from the Pre-seed raise to the first incident. */
export const FIRST_INCIDENT_AFTER = 90
/**
 * Divides the Team's calendar durations: time to hire, ramp-up, morale, deploy
 * slots, and policy changes. The design's calendar runs a day in 24 real minutes,
 * so a hire would join near the end of the slice; the live Team runs a day a minute.
 */
export const CALENDAR_PACE = 24

/** The pacing knobs the Simulation reads. */
export type Tuning = Readonly<{
  /** Multiplies the user growth rate `g`. */
  pace: number
  /** Mean sim seconds between incidents. */
  incidentGap: number
  /** Sim seconds from the Pre-seed raise to the first incident. */
  firstIncidentAfter: number
  /** Divides the Team's calendar durations. Dev Hours flow on the same calendar. */
  calendarPace: number
}>

/** What a Company plays at: the playtest knobs above. */
export const LIVE_TUNING: Tuning = {
  pace: PLAYTEST_PACE,
  incidentGap: INCIDENT_GAP,
  firstIncidentAfter: FIRST_INCIDENT_AFTER,
  calendarPace: CALENDAR_PACE,
}

/**
 * The fixed ruleset a Challenge and a Sandbox replay at, and the pace the pacing bots use so a run
 * shows a whole curve inside a test. Its values are the ones the slice was balanced on before the
 * playtest knobs moved, so a replay from either side stays comparable. A Company plays at
 * `LIVE_TUNING`.
 */
export const CHALLENGE_TUNING: Tuning = {
  pace: 1,
  incidentGap: 720,
  firstIncidentAfter: 600,
  calendarPace: CALENDAR_PACE,
}
