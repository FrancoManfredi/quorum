import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'Réplication',
  asynchronous: 'Asynchrone',
  synchronous: 'Synchrone',
  noWriteCostAndTheReplica:
    "Aucun coût d'écriture, et le réplica prend du retard : une lecture après écriture peut être périmée.",
}
