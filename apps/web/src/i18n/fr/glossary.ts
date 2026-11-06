import type { Messages } from '../messages.ts'

export const glossary: Messages['glossary'] = {
  category: 'Catégorie',
  all: 'Tout',
  met: 'rencontré',
  inTheGame: 'Dans le jeu',
  related: 'Notions associées',
  learnMore: 'En savoir plus',
  glossary: 'Glossaire',
  ofTermsMet: (p0, p1) => `${p0} notions rencontrées sur ${p1}`,
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
  cveDefinition: (score, components) => `Score ${score} sur 10. Affecte ${components}.`,
  cveInGame: (cost, minutes) =>
    `Le courrier de sécurité le nomme et ouvre un ticket de correctif : ${cost}, à rendre ${minutes} minutes après la divulgation. En retard, il devient rouge dans la file d’Équipe et, une minute plus tard, il est exploité.`,
}
