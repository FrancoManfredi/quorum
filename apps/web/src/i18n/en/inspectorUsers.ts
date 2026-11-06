import type { ErrorCause } from '@quorum/simulation/distribution'

export const inspectorUsers = {
  requests: 'Requests',
  sOk: (p0: string | number | null, p1: string | number | null, p2: string | number | null) =>
    `${p0}/s · ${p1} ok${p2}`,
  errorsByCause: 'Errors by cause',
  s: (p0: string | number | null) => `${p0}/s`,
  users: 'Users',
  market: 'Market',
  apdexNow: 'Apdex now',
  apdexLastHour: 'Apdex, last hour',
  velocity: 'Velocity',
  percentileLine: (mean: string, p50: string, p95: string, p99: string) =>
    `mean ${mean} · p50 ${p50} · p95 ${p95} · p99 ${p99}`,
  causes: {
    dropped: 'dropped',
    stranded: 'stranded',
    refused: 'refused',
    down: 'down',
    stale: 'stale',
    oom: 'oom',
    timeout: 'timeout',
    crash: 'crash',
    blocked: 'blocked',
    upstream: 'upstream',
    throttled: 'throttled',
    duplicate: 'duplicate',
  } satisfies Record<ErrorCause, string>,
}
