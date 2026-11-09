import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'Réplication',
  primary: 'Primaire',
  primaryNote: (name) =>
    `${name} prend les écritures. Ce nœud répond aux lectures depuis sa copie.`,
  noSinglePrimary: 'Reliez une base à cette réplique de lecture pour qu’elle la copie.',
  asynchronous: 'Asynchrone',
  synchronous: 'Synchrone',
  runsThePrimaryEngine: 'Il utilise le moteur du primaire.',
  noWriteCostAndTheReplica:
    "Aucun coût d'écriture, et le réplica prend du retard : une lecture après écriture peut être périmée.",
  everyWriteWaits: (wait) =>
    `Chaque écriture attend ${wait} ce réplica, davantage entre zones et régions. Il ne sert aucune lecture périmée, et les écritures se bloquent tant qu’il est en panne.`,
}
