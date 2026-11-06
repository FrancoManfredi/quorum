import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const glossary: Messages['glossary'] = {
  category: 'Catégorie',
  all: 'Tout',
  met: 'rencontré',
  inTheGame: 'Dans le jeu',
  related: 'Notions associées',
  learnMore: 'En savoir plus',
  glossary: 'Glossaire',
  ofTermsMet: (p0, p1) => `${arg(p0)} notions rencontrées sur ${arg(p1)}`,
  searchTheGlossary: 'Rechercher dans le glossaire',
  terms: 'Notions',
  noMatches: 'Aucun résultat',
  performance: 'Performance',
  reliability: 'Fiabilité',
  observability: 'Observabilité',
  data: 'Données',
  runtimes: 'Environnements d’exécution',
  network: 'Réseau',
  security: 'Sécurité',
  delivery: 'Livraison',
  team: 'Équipe',
  business: 'Activité',
}
