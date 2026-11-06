import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorWs: Messages['inspectorWs'] = {
  runtime: 'Environnement d’exécution',
  holdsNoConnectionsPickARuntime: (p0) =>
    `${arg(p0)} ne garde aucune connexion. Choisissez un runtime qui en garde.`,
  holdsAboutConnections: (p0) => `Garde environ ${arg(p0)} connexions.`,
  clients: 'Clients',
  noPresence: 'Sans présence',
  presence: 'Présence',
  reconnectAtOnce: 'Reconnexion immédiate',
  backoffWithJitter: 'Recul avec gigue',
  oneBox: 'Une boîte',
  clustered: 'En grappe',
  boxesShareAPubSubBackbone:
    'Les boîtes partagent un bus pub/sub : chaque palier ajoute de la place.',
  oneBoxTakesEveryConnectionLarger:
    'Une seule boîte prend toutes les connexions : les paliers plus grands ajoutent du coût et pas de place.',
  connections: 'Connexions',
  messages: 'Messages',
  s: (p0) => `${arg(p0)}/s`,
  latency: 'Latence',
  dropped: 'Rejetées',
  burn: 'Dépenses',
}
