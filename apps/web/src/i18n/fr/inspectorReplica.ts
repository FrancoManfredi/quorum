import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'Réplication',
  asynchronous: 'Asynchrone',
  synchronous: 'Synchrone',
  noWriteCostAndTheReplica:
    "Aucun coût d'écriture, et le réplica prend du retard : une lecture après écriture peut être périmée.",
  everyWriteWaits: (wait) =>
    `Chaque écriture attend ${wait} ce réplica, davantage entre zones et régions. Il ne sert aucune lecture périmée, et les écritures se bloquent tant qu’il est en panne.`,
}
