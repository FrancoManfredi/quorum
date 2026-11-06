import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: 'Requêtes',
  sOk: (p0, p1, p2) => `${p0}/s · ${p1} ok${p2}`,
  errorsByCause: 'Erreurs par cause',
  s: (p0) => `${p0}/s`,
  users: 'Utilisateurs',
  market: 'Marché',
  apdexNow: 'Apdex maintenant',
  apdexLastHour: 'Apdex, dernière heure',
  velocity: 'Vélocité',
  percentileLine: (mean, p50, p95, p99) => `moyenne ${mean} · p50 ${p50} · p95 ${p95} · p99 ${p99}`,
  causes: {
    dropped: 'abandonné',
    stranded: 'sans route',
    refused: 'refusé',
    down: 'en panne',
    stale: 'périmé',
    oom: 'mémoire saturée',
    timeout: 'délai dépassé',
    crash: 'plantage',
    blocked: 'bloqué',
    upstream: 'fournisseur',
    throttled: 'limité',
    duplicate: 'doublon',
  },
}
