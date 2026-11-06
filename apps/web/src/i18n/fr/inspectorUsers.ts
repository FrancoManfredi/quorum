import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: 'Requêtes',
  sOk: (p0, p1, p2) => `${arg(p0)}/s · ${arg(p1)} ok${arg(p2)}`,
  errorsByCause: 'Erreurs par cause',
  s: (p0) => `${arg(p0)}/s`,
  users: 'Utilisateurs',
  market: 'Marché',
  apdexNow: 'Apdex maintenant',
  apdexLastHour: 'Apdex, dernière heure',
  velocity: 'Vélocité',
}
