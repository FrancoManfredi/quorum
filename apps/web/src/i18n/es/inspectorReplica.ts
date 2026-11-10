import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'Replicación',
  primary: 'Primario',
  primaryNote: (name) =>
    `${name} recibe las escrituras. Este nodo responde las lecturas desde su copia.`,
  noSinglePrimary: 'Enlaza una base de datos a esta réplica de lectura para copiarla.',
  asynchronous: 'Asíncrona',
  synchronous: 'Síncrona',
  runsThePrimaryEngine: 'Ejecuta el motor del primario.',
  noWriteCostAndTheReplica:
    'Sin coste de escritura, y la réplica va retrasada: una lectura tras una escritura puede estar obsoleta.',
  everyWriteWaits: (wait: string | number) =>
    `Cada escritura espera ${wait} por esta réplica, y más entre zonas y regiones. No sirve lecturas obsoletas, y las escrituras se atascan mientras está caída.`,
}
