import type { Messages } from '../messages.ts'

export const presence: Messages['presence'] = {
  opening: (what) => `Ouverture : ${what}`,
  inspector: 'inspecteur',
  research: 'recherche',
  team: 'panneau d’équipe',
  dashboard: 'tableau de bord',
  playbooks: 'plans types',
  help: 'aide',
  dev: 'panneau de développement',
  inbox: 'boîte de réception',
  cost: 'coût',
  churn: 'répartition du churn',
  mirror: 'miroir',
  settings: 'paramètres',
  menu: 'menu',
  room: 'panneau de salle',
  exit: 'écran de sortie',
  challenge: 'défi',
}
