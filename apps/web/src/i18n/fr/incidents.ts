import type { Messages } from '../messages.ts'

export const incidents: Messages['incidents'] = {
  ignored: 'Ignoré',
  s: (p0) => `${p0} s`,
  rollBack: 'Revenir à la version précédente',
  researchToRollBack: (p0) => `Recherchez ${p0} pour revenir en arrière`,
  file: 'Consigner',
  actionItem: (p0) => `Élément de suivi : ${p0}`,
  fileAndLeaveTheActionItem:
    "Classer et laisser l'action ouverte : cet incident reste deux fois plus probable",
  showDetails: 'Afficher les détails',
  users: 'Utilisateurs',
  revenue: 'Revenus',
  after: 'Après',
  leftAlone: 'laissé de côté',
  followedLeftAlone: (incident) => `Fait suite à ${incident}, laissé de côté.`,
  renew: 'Renouveler',
  fenceLeader: 'Isoler le leader',
  cancelMigration: 'Annuler la migration',
  pinAndRedeploy: 'Épingler et redéployer',
  restore: 'Restaurer',
  restartNodes: 'Redémarrer les Nœuds',
  moveLogin: 'Déplacer la connexion',
  failOver: 'Basculer',
  restart: 'Redémarrer',
  restartHub: 'Redémarrer le hub',
  throttleConnects: 'Limiter les connexions',
}
