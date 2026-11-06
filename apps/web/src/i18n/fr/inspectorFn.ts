import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: 'Exécutions',
  coldStart: 'Démarrage à froid',
  bill: 'Facture',
  inbound: 'Trafic entrant',
  s: (p0) => `${p0}/s`,
  uses: 'Usages',
  standingBurn: 'Dépenses fixes',
  oneExecutionHoldsTheRequest: (cap) =>
    `Une exécution retient la requête aussi longtemps qu’elle tourne, jusqu’à ${cap} à la fois. Au-delà du plafond, le fournisseur limite le débit : les requêtes sont abandonnées, pas mises en file.`,
  inFlight: (used, total) => `${used} sur ${total} en cours`,
  aNewEnvironmentBoots: (coldStart) =>
    `Un nouvel environnement d’exécution démarre avant l’exécution du code : ${coldStart} pour cette pile. Une fonction inactive perd ses environnements, donc un mince filet de trafic le paie plus souvent qu’un trafic régulier.`,
  changeTheRuntime:
    'Changez l’environnement d’exécution dans la pile pour échanger le démarrage à froid contre du débit.',
  noBoxToPayFor: (perThousandRequests, perGbSecond, gigabytes) =>
    `Il n’y a pas de machine à payer : rien ne tourne quand elle est inactive. Chaque usage facture ${perThousandRequests} par 1 000 requêtes plus ${perGbSecond} par Go-seconde, à ${gigabytes} Go par exécution, sur la ligne Requêtes de la facture.`,
  thisUse: (cost) => `Cet usage : ${cost}/s`,
}
