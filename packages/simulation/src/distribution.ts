export const ERROR_CAUSES = [
  'stranded',
  'dropped',
  'refused',
  'down',
  'stale',
  'oom',
  'timeout',
  'crash',
  'blocked',
  'upstream',
  'throttled',
  'duplicate',
] as const
export type ErrorCause = (typeof ERROR_CAUSES)[number]
export type Failures = Readonly<Record<ErrorCause, number>>

export type Outcome = Readonly<{
  /** Share of requests that get an answer. */
  success: number
  fixedMs: number
  /** Mean of the exponential part, in milliseconds. */
  variableMs: number
  /** Share of requests hit by a tail event, and what it adds. */
  tailP: number
  tailMs: number
  /** Share of answered reads that come back stale. */
  stale: number
  /** Revenue multiplier from the Stack that answered. */
  value: number
  /**
   * Share of requests that fail, by cause. They live flat on the outcome so a hop builds one
   * object instead of a record per term. They sum to 1 − success.
   */
  failStranded: number
  failDropped: number
  failRefused: number
  failDown: number
  failStale: number
  failOom: number
  failTimeout: number
  failCrash: number
  failBlocked: number
  failUpstream: number
  failThrottled: number
  failDuplicate: number
}>

export const NO_FAILURES: Failures = {
  stranded: 0,
  dropped: 0,
  refused: 0,
  down: 0,
  stale: 0,
  oom: 0,
  timeout: 0,
  crash: 0,
  blocked: 0,
  upstream: 0,
  throttled: 0,
  duplicate: 0,
}

/** The failures of an Outcome as the record the Ledger and the rules pass around. */
export const failuresOf = (outcome: Outcome): Failures => ({
  stranded: outcome.failStranded,
  dropped: outcome.failDropped,
  refused: outcome.failRefused,
  down: outcome.failDown,
  stale: outcome.failStale,
  oom: outcome.failOom,
  timeout: outcome.failTimeout,
  crash: outcome.failCrash,
  blocked: outcome.failBlocked,
  upstream: outcome.failUpstream,
  throttled: outcome.failThrottled,
  duplicate: outcome.failDuplicate,
})

/** The twelve failure fields at zero, in the one shape every builder spreads. */
const NO_FAILURE_FIELDS = {
  failStranded: 0,
  failDropped: 0,
  failRefused: 0,
  failDown: 0,
  failStale: 0,
  failOom: 0,
  failTimeout: 0,
  failCrash: 0,
  failBlocked: 0,
  failUpstream: 0,
  failThrottled: 0,
  failDuplicate: 0,
} as const

/** The outcome fields a Node with no time and no queue behind it adds. */
const NO_HOP = { fixedMs: 0, variableMs: 0, tailP: 0, tailMs: 0, stale: 0 }

/*
 * These run on every hop of every solve, so they build one object with every field named: V8 keeps
 * one shape, which is several times faster than a loop or a spread per term.
 */
/** The same outcome with every failure share scaled, for retries. */
const withScaledFailures = (outcome: Outcome, by: number): Outcome => ({
  ...outcome,
  failStranded: outcome.failStranded * by,
  failDropped: outcome.failDropped * by,
  failRefused: outcome.failRefused * by,
  failDown: outcome.failDown * by,
  failStale: outcome.failStale * by,
  failOom: outcome.failOom * by,
  failTimeout: outcome.failTimeout * by,
  failCrash: outcome.failCrash * by,
  failBlocked: outcome.failBlocked * by,
  failUpstream: outcome.failUpstream * by,
  failThrottled: outcome.failThrottled * by,
  failDuplicate: outcome.failDuplicate * by,
})

/** The same outcome with no failures at all, for a hop that replaces them. */
export const withoutFailures = (outcome: Outcome): Outcome => ({
  ...outcome,
  ...NO_FAILURE_FIELDS,
})

export const failed = (cause: ErrorCause): Outcome => ({
  success: 0,
  value: 1,
  ...NO_HOP,
  failStranded: cause === 'stranded' ? 1 : 0,
  failDropped: cause === 'dropped' ? 1 : 0,
  failRefused: cause === 'refused' ? 1 : 0,
  failDown: cause === 'down' ? 1 : 0,
  failStale: cause === 'stale' ? 1 : 0,
  failOom: cause === 'oom' ? 1 : 0,
  failTimeout: cause === 'timeout' ? 1 : 0,
  failCrash: cause === 'crash' ? 1 : 0,
  failBlocked: cause === 'blocked' ? 1 : 0,
  failUpstream: cause === 'upstream' ? 1 : 0,
  failThrottled: cause === 'throttled' ? 1 : 0,
  failDuplicate: cause === 'duplicate' ? 1 : 0,
})

/** The same outcome with a share of its answered requests failing for `cause` instead. */
export const failSome = (outcome: Outcome, share: number, cause: ErrorCause): Outcome => {
  if (share <= 0) return outcome
  const add = outcome.success * share
  return {
    ...outcome,
    success: outcome.success * (1 - share),
    failStranded: outcome.failStranded + (cause === 'stranded' ? add : 0),
    failDropped: outcome.failDropped + (cause === 'dropped' ? add : 0),
    failRefused: outcome.failRefused + (cause === 'refused' ? add : 0),
    failDown: outcome.failDown + (cause === 'down' ? add : 0),
    failStale: outcome.failStale + (cause === 'stale' ? add : 0),
    failOom: outcome.failOom + (cause === 'oom' ? add : 0),
    failTimeout: outcome.failTimeout + (cause === 'timeout' ? add : 0),
    failCrash: outcome.failCrash + (cause === 'crash' ? add : 0),
    failBlocked: outcome.failBlocked + (cause === 'blocked' ? add : 0),
    failUpstream: outcome.failUpstream + (cause === 'upstream' ? add : 0),
    failThrottled: outcome.failThrottled + (cause === 'throttled' ? add : 0),
    failDuplicate: outcome.failDuplicate + (cause === 'duplicate' ? add : 0),
  }
}

export const answered = (fixedMs: number, variableMs: number): Outcome => ({
  success: 1,
  value: 1,
  ...NO_HOP,
  fixedMs,
  variableMs,
  ...NO_FAILURE_FIELDS,
})

/** What a Node adds before it passes the request on. */
export type Hop = Readonly<{
  /** Share it processes; the rest fails for `cause`. */
  share: number
  cause: ErrorCause
  fixedMs: number
  variableMs: number
  tailP: number
  tailMs: number
  value: number
}>

export const hop = (entry: Partial<Hop>): Hop => ({
  share: 1,
  cause: 'dropped',
  fixedMs: 0,
  variableMs: 0,
  tailP: 0,
  tailMs: 0,
  value: 1,
  ...entry,
})

/** Two independent tail events as one: either can hit, and the length is their weighted mean. */
export const combineTail = (a: number, aMs: number, b: number, bMs: number) => {
  const p = 1 - (1 - a) * (1 - b)
  return { tailP: p, tailMs: a + b > 0 ? (a * aMs + b * bMs) / (a + b) : 0 }
}

/** A hop followed by the requests it sends, called in sequence. */
export const through = (
  own: Hop,
  calls: ReadonlyArray<readonly [Outcome, number]> = [],
  staleCounts = false,
): Outcome => {
  let success = 1
  let fixedMs = own.fixedMs
  let variableMs = own.variableMs
  // The Stack that answered sets the revenue: a multiplier reaches the user through every hop
  // between, so a Rails or Phoenix page view still earns its share.
  let value = own.value
  let tail = { tailP: own.tailP, tailMs: own.tailMs }
  let stranded = 0
  let dropped = 0
  let refused = 0
  let down = 0
  let staleFail = 0
  let oom = 0
  let timeout = 0
  let crash = 0
  let blocked = 0
  let upstream = 0
  let throttled = 0
  let duplicate = 0
  let causeWeight = 0
  let stale = 0
  for (const [call, count] of calls) {
    if (count <= 0) continue
    let reached = 1
    for (let index = 0; index < count; index += 1) reached *= call.success
    success *= reached
    fixedMs += call.fixedMs * count
    variableMs += call.variableMs * count
    tail = combineTail(tail.tailP, tail.tailMs, call.tailP, call.tailMs)
    stranded += call.failStranded * count
    dropped += call.failDropped * count
    refused += call.failRefused * count
    down += call.failDown * count
    staleFail += call.failStale * count
    oom += call.failOom * count
    timeout += call.failTimeout * count
    crash += call.failCrash * count
    blocked += call.failBlocked * count
    upstream += call.failUpstream * count
    throttled += call.failThrottled * count
    duplicate += call.failDuplicate * count
    causeWeight += (1 - call.success) * count
    stale = Math.max(stale, call.stale)
    value *= call.value
  }
  const staleLoss = staleCounts ? stale : 0
  const childFailure = 1 - success
  const ratio = causeWeight > 0 ? childFailure / causeWeight : 0
  const reached = own.share
  const ownFail = 1 - reached
  return {
    success: reached * success * (1 - staleLoss),
    fixedMs,
    variableMs,
    tailP: tail.tailP,
    tailMs: tail.tailMs,
    stale: staleCounts ? 0 : stale,
    value,
    failStranded: stranded * ratio * reached + (own.cause === 'stranded' ? ownFail : 0),
    failDropped: dropped * ratio * reached + (own.cause === 'dropped' ? ownFail : 0),
    failRefused: refused * ratio * reached + (own.cause === 'refused' ? ownFail : 0),
    failDown: down * ratio * reached + (own.cause === 'down' ? ownFail : 0),
    failStale:
      (staleFail * ratio + success * staleLoss) * reached + (own.cause === 'stale' ? ownFail : 0),
    failOom: oom * ratio * reached + (own.cause === 'oom' ? ownFail : 0),
    failTimeout: timeout * ratio * reached + (own.cause === 'timeout' ? ownFail : 0),
    failCrash: crash * ratio * reached + (own.cause === 'crash' ? ownFail : 0),
    failBlocked: blocked * ratio * reached + (own.cause === 'blocked' ? ownFail : 0),
    failUpstream: upstream * ratio * reached + (own.cause === 'upstream' ? ownFail : 0),
    failThrottled: throttled * ratio * reached + (own.cause === 'throttled' ? ownFail : 0),
    failDuplicate: duplicate * ratio * reached + (own.cause === 'duplicate' ? ownFail : 0),
  }
}

/** A weighted mix of the outcomes of several targets. Undefined when there are none. */
export const blend = (entries: ReadonlyArray<readonly [Outcome, number]>): Outcome | undefined => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  if (entries.length === 0 || total <= 0) return undefined
  let success = 0
  let fixedMs = 0
  let variableMs = 0
  let tailP = 0
  let stale = 0
  let value = 0
  let stranded = 0
  let dropped = 0
  let refused = 0
  let down = 0
  let staleFail = 0
  let oom = 0
  let timeout = 0
  let crash = 0
  let blocked = 0
  let upstream = 0
  let throttled = 0
  let duplicate = 0
  let tailWeight = 0
  for (const [entry, weight] of entries) {
    const w = weight / total
    tailWeight += entry.tailP * w * entry.tailMs
    success += entry.success * w
    fixedMs += entry.fixedMs * w
    variableMs += entry.variableMs * w
    tailP += entry.tailP * w
    stale += entry.stale * w
    value += entry.value * w
    stranded += entry.failStranded * w
    dropped += entry.failDropped * w
    refused += entry.failRefused * w
    down += entry.failDown * w
    staleFail += entry.failStale * w
    oom += entry.failOom * w
    timeout += entry.failTimeout * w
    crash += entry.failCrash * w
    blocked += entry.failBlocked * w
    upstream += entry.failUpstream * w
    throttled += entry.failThrottled * w
    duplicate += entry.failDuplicate * w
  }
  return {
    success,
    fixedMs,
    variableMs,
    tailP,
    tailMs: tailP > 0 ? tailWeight / tailP : 0,
    stale,
    value,
    failStranded: stranded,
    failDropped: dropped,
    failRefused: refused,
    failDown: down,
    failStale: staleFail,
    failOom: oom,
    failTimeout: timeout,
    failCrash: crash,
    failBlocked: blocked,
    failUpstream: upstream,
    failThrottled: throttled,
    failDuplicate: duplicate,
  }
}

/** e^(−x) for x ≥ 0, from a short series and eight squarings. */
export const decay = (x: number): number => {
  if (x <= 0) return 1
  if (x > 60) return 0
  const y = x / 256
  let value = 1 - y + (y * y) / 2 - (y * y * y) / 6
  for (let index = 0; index < 8; index += 1) value *= value
  return value
}

/**
 * Share of answered requests slower than `ms`. The tail event adds `tailMs` to
 * the slowest `tailP` share, so a stall raises the p99 by its length while the
 * p95 and the mean barely move.
 */
export const slowerThan = (outcome: Outcome, ms: number): number => {
  const base = (at: number): number => {
    const left = at - outcome.fixedMs
    if (left < 0) return 1
    return outcome.variableMs > 0 ? decay(left / outcome.variableMs) : 0
  }
  if (outcome.tailP <= 0 || outcome.tailMs <= 0) return base(ms)
  return Math.max(base(ms), Math.min(outcome.tailP, base(ms - outcome.tailMs)))
}

export const meanOf = (outcome: Outcome): number =>
  outcome.fixedMs + outcome.variableMs + outcome.tailP * outcome.tailMs

/**
 * A call with a timeout: answers slower than `ms` fail as `timeout`. The
 * answers left are the fast ones, so the exponential part shrinks to its mean
 * below the cut: v − L·e^(−L/v) / (1 − e^(−L/v)), with L the room above the fixedMs part.
 */
export const timedOut = (outcome: Outcome, ms: number): Outcome => {
  const late = slowerThan(outcome, ms)
  if (late <= 1e-12 || outcome.success <= 0) return outcome
  const room = ms - outcome.fixedMs
  const v = outcome.variableMs
  const cut = room > 0 && v > 0 ? decay(room / v) : 1
  const variableMs = room > 0 && v > 0 && cut < 1 ? Math.max(0, v - (room * cut) / (1 - cut)) : 0
  const tailKept = outcome.fixedMs + outcome.tailMs < ms
  return {
    ...outcome,
    success: outcome.success * (1 - late),
    variableMs,
    tailP: tailKept ? outcome.tailP : 0,
    tailMs: tailKept ? outcome.tailMs : 0,
    failTimeout: outcome.failTimeout + outcome.success * late,
  }
}

/** Attempts per call with naive retries (three retries) when a share `f` fails: 1 + f + f² + f³. */
export const attemptsFor = (failure: number): number =>
  1 + failure + failure * failure + failure * failure * failure

/** Attempts per task when a share `f` of attempts fails and the Queue allows `n`: 1 + f + … + fⁿ⁻¹. */
export const taskAttempts = (failure: number, n: number): number => {
  let total = 0
  let term = 1
  for (let attempt = 0; attempt < n; attempt += 1) {
    total += term
    term *= failure
  }
  return total
}

/** Share of tasks that fail every one of `n` attempts: fⁿ. */
export const taskLost = (failure: number, n: number): number => {
  let lost = 1
  for (let attempt = 0; attempt < n; attempt += 1) lost *= failure
  return lost
}

/**
 * A timed-out call with up to three naive retries: only f⁴ still fails, and the
 * failed attempts add their time. A timeout costs the whole wait; a refusal
 * costs only the fixedMs part.
 */
export const retried = (call: Outcome, ms: number): Outcome => {
  const failure = 1 - call.success
  if (failure <= 1e-12) return call
  const still = failure * failure * failure * failure
  const wasted = (call.failTimeout * ms + (failure - call.failTimeout) * call.fixedMs) / failure
  return {
    ...withScaledFailures(call, still / failure),
    success: 1 - still,
    fixedMs: call.fixedMs + (attemptsFor(failure) - 1) * wasted,
  }
}

/** Retries with backoff stay within this share of extra calls (a retry budget).  */
export const RETRY_BUDGET = 0.1
/** Milliseconds a backed-off retry waits, on average, before it goes.  */
export const BACKOFF_MS = 200

/**
 * A call that retries with backoff and jitter, inside a retry budget: only
 * `budget` extra calls per call, so when many fail, most are not retried.
 */
export const backedOff = (call: Outcome, ms: number, budget: number): Outcome => {
  const failure = 1 - call.success
  if (failure <= 1e-12) return call
  const extra = attemptsFor(failure) - 1
  const allowed = Math.min(1, budget / extra)
  const still = failure * (1 - allowed * (1 - failure * failure * failure))
  const wasted = (call.failTimeout * ms + (failure - call.failTimeout) * call.fixedMs) / failure
  return {
    ...withScaledFailures(call, still / failure),
    success: 1 - still,
    fixedMs: call.fixedMs + allowed * extra * (wasted + BACKOFF_MS),
  }
}

/**
 * How long a caller holds its slot on one attempt: E[min(X, T)]. With T well
 * above the latency this is the mean.
 */
export const heldFor = (outcome: Outcome, ms: number): number => {
  const room = ms - outcome.fixedMs
  if (room <= 0) return ms
  const v = outcome.variableMs
  const part = v > 0 ? v * (1 - decay(room / v)) : 0
  return outcome.fixedMs + part + outcome.tailP * Math.min(outcome.tailMs, Math.max(0, room - part))
}

/** Apdex of the answered requests: satisfied plus half the tolerating. */
export const apdexOf = (outcome: Outcome, target: number): number => {
  const slow = slowerThan(outcome, target)
  const frustrated = slowerThan(outcome, target * 4)
  return 1 - slow + (slow - frustrated) / 2
}

/** The q-th percentile of answered requests, in milliseconds. */
export const percentile = (outcome: Outcome, q: number): number => {
  let low = outcome.fixedMs
  let high = outcome.fixedMs + outcome.tailMs + outcome.variableMs * 12 + 1
  for (let index = 0; index < 40; index += 1) {
    const middle = (low + high) / 2
    if (slowerThan(outcome, middle) > 1 - q) low = middle
    else high = middle
  }
  return high
}

/**
 * Mean of the k-th fastest of n replicas whose times are exponential with mean 1:
 * Σ 1/i for i from n − k + 1 to n (07 "Wide-column Store": a quorum waits for the k-th reply).
 */
export const kthFastest = (k: number, n: number): number => {
  let sum = 0
  for (let i = Math.max(1, n - k + 1); i <= n; i += 1) sum += 1 / i
  return sum
}

/**
 * The faster of two independent copies of a call: the user waits for whichever answers first, so
 * the mean halves and the rare slow answer has to be slow twice (10 "Track: Reliability", "Hedged
 * requests"). The extra copy is the caller's, and the callee's load, not the user's.
 */
export const hedged = (call: Outcome): Outcome => ({
  ...call,
  variableMs: call.variableMs * kthFastest(1, 2),
  tailP: call.tailP * call.tailP,
  tailMs: call.tailMs / 2,
})
