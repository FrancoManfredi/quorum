import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorCi: Messages['inspectorCi'] = {
  deployStrategy: 'Stratégie de déploiement',
  deploysInMinABadDeploy: (p0, p1) =>
    `Déploie en ${arg(p0)} min ; un mauvais déploiement casse jusqu'à ${arg(p1)} des requêtes.`,
  deploysADayAtThisBuild: (p0) =>
    `${arg(p0)} déploiements par jour avec ce build et cette stratégie.`,
  deploys: 'Déploiements',
  deployTime: 'Durée du déploiement',
  min: (p0) => `${arg(p0)} min`,
  blastRadius: 'Rayon d’impact',
  upTo: (p0) => `jusqu’à ${arg(p0)}`,
  burn: 'Dépenses',
  s: (p0) => `${arg(p0)}/s`,
}
