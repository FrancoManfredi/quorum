import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: 'Partitions',
  keyed: 'Par clé',
  roundRobin: 'Tourniquet',
  oneKeyKeepsAnEntityIn:
    'Une clé garde une entité dans une seule partition, donc ses événements restent ordonnés. Une clé chaude remplit une partition et la ralentit.',
  eventsSpreadEvenlyAndOrderIs:
    'Les événements se répartissent également, et l’ordre est perdu : une écriture remplacée peut arriver après celle qui l’a remplacée.',
  aConsumerGroupReadsOneConsumer: (p0) =>
    `Un groupe de consommateurs lit un consommateur par partition, donc ce flux transmet au plus ${arg(p0)}/s.`,
  durability: 'Durabilité',
  retention: 'Rétention',
  messagesStayAfterTheyAreRead:
    'Les messages restent après lecture, donc un consommateur peut les rejouer dans un nouvel index ou un second Worker sans toucher à la base de données. Un consommateur plus en retard que la fenêtre perd les événements les plus anciens.',
  inbound: 'Trafic entrant',
  s: (p0) => `${arg(p0)}/s`,
  lag: 'Retard',
  behind: 'En retard',
  caughtUp: 'à jour',
  s2: (p0) => `${arg(p0)} s`,
  replicas: 'Réplicas',
  burn: 'Dépenses',
}
