import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: 'Partitions',
  keyed: 'Par clé',
  roundRobin: 'Tourniquet',
  oneKeyKeepsAnEntityIn:
    'Une clé garde une entité dans une seule partition, donc ses événements restent ordonnés. Une clé chaude remplit une partition et la ralentit.',
  eventsSpreadEvenlyAndOrderIs:
    'Les événements se répartissent également, et l’ordre est perdu : une écriture remplacée peut arriver après celle qui l’a remplacée.',
  aConsumerGroupReadsOneConsumer: (p0) =>
    `Un groupe de consommateurs lit un consommateur par partition, donc ce flux transmet au plus ${p0}/s.`,
  durability: 'Durabilité',
  retention: 'Rétention',
  messagesStayAfterTheyAreRead:
    'Les messages restent après lecture, donc un consommateur peut les rejouer dans un nouvel index ou un second Worker sans toucher à la base de données. Un consommateur plus en retard que la fenêtre perd les événements les plus anciens.',
  inbound: 'Trafic entrant',
  s: (p0) => `${p0}/s`,
  lag: 'Retard',
  behind: 'En retard',
  caughtUp: 'à jour',
  s2: (p0) => `${p0} s`,
  replicas: 'Réplicas',
  burn: 'Dépenses',
  aProducerWaitsForTheAppend: (multiple) =>
    `Un producteur attend ${multiple}× les 5 ms d’ajout. Un réplica au-delà du premier refacture la moitié de la dépense d’un courtier.`,
  replicaCount: (count) => `${count} ${isOne('fr', count) ? 'réplica' : 'réplicas'}`,
  oneReplicaHoldsTheOnlyCopy:
    'Un seul réplica détient l’unique copie : un courtier qui tombe emporte tous les événements qu’il détenait.',
  aBrokerThatFailsLoses: (share) =>
    `Un courtier qui tombe perd ${share} % des événements qu’il détenait : ceux que ses réplicas n’avaient pas copiés.`,
  everyReplicaHadEveryEvent:
    'Chaque réplica avait chaque événement acquitté, donc un courtier qui tombe n’en perd aucun.',
  events: (count) => `${count} événements`,
  replicasAndAcks: (replicas, acks) => `${replicas} · acks ${acks}`,
}
