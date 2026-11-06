export const glossary = {
  category: 'Category',
  all: 'All',
  met: 'met',
  inTheGame: 'In the game',
  related: 'Related',
  learnMore: 'Learn more',
  glossary: 'Glossary',
  ofTermsMet: (p0: string | number | null, p1: string | number | null) =>
    `${p0} of ${p1} terms met`,
  searchTheGlossary: 'Search the glossary',
  terms: 'Terms',
  noMatches: 'No matches',
  performance: 'Performance',
  reliability: 'Reliability',
  observability: 'Observability',
  data: 'Data',
  runtimes: 'Runtimes',
  network: 'Network',
  security: 'Security',
  delivery: 'Delivery',
  team: 'Team',
  business: 'Business',
  cveDefinition: (score: string | number, components: string | number) =>
    `Score ${score} of 10. Affects ${components}.`,
  cveInGame: (cost: string | number, minutes: string | number) =>
    `Security mail names it and files a patch ticket: ${cost}, due ${minutes} minutes after disclosure. Overdue, it turns red on the Team backlog, and a minute later it is exploited.`,
}
