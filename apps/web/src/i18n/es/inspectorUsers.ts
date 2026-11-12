import type { ErrorCause } from '@quorum/simulation/distribution'

import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: 'Peticiones',
  sOk: (p0: string | number | null, p1: string | number | null, p2: string | number | null) =>
    `${p0}/s · ${p1} ok${p2}`,
  errorsByCause: 'Errores por causa',
  s: (p0: string | number | null) => `${p0}/s`,
  users: 'Usuarios',
  market: 'Mercado',
  apdexNow: 'Apdex ahora',
  apdexLastHour: 'Apdex, última hora',
  velocity: 'Velocidad',
  percentileLine: (mean: string, p50: string, p95: string, p99: string) =>
    `media ${mean} · p50 ${p50} · p95 ${p95} · p99 ${p99}`,
  causes: {
    dropped: 'descartadas',
    stranded: 'varadas',
    refused: 'rechazadas',
    down: 'caída',
    stale: 'obsoletas',
    oom: 'sin memoria',
    timeout: 'tiempo agotado',
    crash: 'caída',
    blocked: 'bloqueadas',
    upstream: 'dependencia',
    throttled: 'limitadas',
    duplicate: 'duplicadas',
  } satisfies Record<ErrorCause, string>,
}
