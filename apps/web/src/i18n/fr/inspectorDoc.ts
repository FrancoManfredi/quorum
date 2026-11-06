import type { Messages } from '../messages.ts'

export const inspectorDoc: Messages['inspectorDoc'] = {
  oneDocument: 'Un document',
  multiDocument: 'Multi-document',
  aCheckoutWritesSeveralDocumentsWithout:
    'Un paiement écrit plusieurs documents. Sans transactions multi-documents, l’un peut être écrit sans les autres, et une nouvelle tentative débite la carte une seconde fois ; avec elles, chaque écriture attend les autres, à une fois et demie sa latence.',
  accessPatterns: 'Schémas d’accès',
  thereAreNoJoinsAQuery: (p0, p1) =>
    `Pas de jointures : une requête qui traverse des documents est un balayage, à ${p0}× les opérations, et chaque nouveau schéma demandé par une fonctionnalité est sa propre collection et son index à écrire. Une fonctionnalité qui change la forme des données coûte ${p1} % d’heures de dev en moins, faute de migration ; les autres coûtent un peu plus.`,
  theTeamPanelChargesTheDev:
    'Le panneau Équipe facture les heures de dev. La base de données est l’autre côté de ce compromis : des jointures et des schémas, au prix des migrations.',
  inbound: 'Trafic entrant',
  s: (p0) => `${p0}/s`,
  load: 'Charge',
  idle: 'inactif',
  joins: 'Jointures',
  connections: 'Connexions',
  noneToPool: 'aucune à mutualiser',
  latency: 'Latence',
  burn: 'Dépenses',
  transactions: 'Transactions',
  multiDocumentValue: 'multi-document',
  oneDocumentValue: 'un document',
  ofOpsPerSecond: (load, capacity) => `${load} sur ${capacity} ops/s`,
}
