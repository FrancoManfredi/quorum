import type { Messages } from '../messages.ts'

export const inspectorCi: Messages['inspectorCi'] = {
  deployStrategy: 'Stratégie de déploiement',
  deploysInMinABadDeploy: (p0, p1) =>
    `Déploie en ${p0} min ; un mauvais déploiement casse jusqu'à ${p1} des requêtes.`,
  deploysADayAtThisBuild: (p0) => `${p0} déploiements par jour avec ce build et cette stratégie.`,
  deploys: 'Déploiements',
  deployTime: 'Durée du déploiement',
  min: (p0) => `${p0} min`,
  blastRadius: 'Rayon d’impact',
  upTo: (p0) => `jusqu’à ${p0}`,
  burn: 'Dépenses',
  s: (p0) => `${p0}/s`,
  perDay: (count) => `${count}/jour`,
}
