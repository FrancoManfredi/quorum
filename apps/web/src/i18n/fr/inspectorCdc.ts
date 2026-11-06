import type { Messages } from '../messages.ts'

export const inspectorCdc: Messages['inspectorCdc'] = {
  changeStream: 'Flux de modifications',
  itReadsEveryWriteOffThe:
    'Il lit chaque écriture dans le journal de la base de données et la publie dans le flux, donc le moteur de recherche ou l’entrepôt suit la base sans que l’application écrive deux fois.',
  linkADatabaseIntoItAnd:
    'Reliez-lui une base de données, et lui à un flux d’événements, avant qu’il ne transporte quoi que ce soit.',
  readingPublishingTo: (p0, p1) => `Lit ${p0}, publie vers ${p1}.`,
  itAddsLagAConsumerReads:
    'Il ajoute du retard : un consommateur lit le flux à son rythme, donc un résultat de recherche ou un rapport est en retard du retard du flux. L’ordre ne tient qu’à l’intérieur d’une partition, et la clé du flux le décide.',
  notBuiltTheDualWriteInconsistency:
    'Non construit : l’incohérence de double écriture qu’il supprime, puisque le jeu n’écrit jamais deux fois.',
  changes: 'Modifications',
  s: (p0) => `${p0}/s`,
  load: 'Charge',
  ofS: (p0, p1) => `${p0} sur ${p1}/s`,
  idle: 'inactif',
  lag: 'Retard',
  caughtUp: 'à jour',
  sBehind: (p0) => `${p0} s de retard`,
  noStream: 'aucun flux',
  published: 'Publiées',
  latency: 'Latence',
  burn: 'Dépenses',
}
