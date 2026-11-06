import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: 'Variante',
  forwardsTCPTenTimesTheThroughput:
    'Transmet le TCP : dix fois le débit, 0,2 ms et moins cher. Il ne lit pas le HTTP, donc il ne peut ni router par type ni réessayer.',
  readsHTTPRoutesByKindRetries:
    'Lit le HTTP : route par type, réessaie et vérifie l’état. Débit plus faible et saut plus long.',
  policy: 'Politique',
  sessions: 'Sessions',
  balanced: 'Équilibrée',
  sticky: 'Persistant',
  everyRequestGoesWhereTheAlgorithm: "Chaque requête va là où l'algorithme l'envoie.",
  off: 'Désactivé',
  on: 'Sur',
  healthChecks: 'Sondes de disponibilité',
  s: (p0) => `${arg(p0)} s`,
  shallow: 'Superficielles',
  deep: 'Approfondies',
  routes: 'Routes',
}
