import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: 'Variante',
  forwardsTCPTenTimesTheThroughput:
    'Transmet le TCP : dix fois le débit, 0,2 ms et moins cher. Il ne lit pas le HTTP, donc il ne peut pas réessayer un appel.',
  readsHTTPRetriesAndChecksHealth:
    'Lit le HTTP : réessaie et vérifie l’état. Débit plus faible et saut plus long.',
  policy: 'Politique',
  sessions: 'Sessions',
  balanced: 'Équilibrée',
  sticky: 'Persistant',
  everyRequestGoesWhereTheAlgorithm: "Chaque requête va là où l'algorithme l'envoie.",
  off: 'Désactivé',
  on: 'Sur',
  healthChecks: 'Sondes de disponibilité',
  s: (p0) => `${p0} s`,
  shallow: 'Superficielles',
  deep: 'Approfondies',
  stickyHolds:
    'Un utilisateur reste sur la cible qu’il a atteinte en premier. La plus ancienne copie porte le plus d’utilisateurs, une cible qui tombe emporte ses sessions, et les caches en processus et les clients temps réel restent chauds.',
  slowStart: 'Démarrage progressif',
  slowStartOn:
    'Une nouvelle copie reçoit le trafic progressivement, donc une copie Java à froid ne répond jamais à sa vitesse à froid.',
  slowStartOff: 'Une nouvelle copie prend toute sa part d’un coup.',
}
