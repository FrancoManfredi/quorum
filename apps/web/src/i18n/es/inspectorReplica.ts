import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'Replicación',
  asynchronous: 'Asíncrona',
  synchronous: 'Síncrona',
  runsThePrimaryEngine: 'Ejecuta el motor del primario.',
  noWriteCostAndTheReplica:
    'Sin coste de escritura, y la réplica va retrasada: una lectura tras una escritura puede estar obsoleta.',
  everyWriteWaits: (wait: string | number) =>
    `Cada escritura espera ${wait} por esta réplica, y más entre zonas y regiones. No sirve lecturas obsoletas, y las escrituras se atascan mientras está caída.`,
}
