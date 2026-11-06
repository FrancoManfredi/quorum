import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const incidents: Messages['incidents'] = {
  ignored: 'Ignoré',
  s: (p0) => `${arg(p0)} s`,
  rollBack: 'Revenir à la version précédente',
  researchToRollBack: (p0) => `Recherchez ${arg(p0)} pour revenir en arrière`,
  file: 'Consigner',
  actionItem: (p0) => `Élément de suivi : ${arg(p0)}`,
  fileAndLeaveTheActionItem:
    "Classer et laisser l'action ouverte : cet incident reste deux fois plus probable",
  showDetails: 'Afficher les détails',
  users: 'Utilisateurs',
  revenue: 'Revenus',
}
