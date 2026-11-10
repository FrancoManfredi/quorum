import type { Messages } from '../messages.ts'

export const inspectorCdc: Messages['inspectorCdc'] = {
  changeStream: 'Flujo de cambios',
  itReadsEveryWriteOffThe:
    'Lee cada escritura del log de escritura de la base de datos y la publica en el flujo de eventos, así el motor de búsqueda o el almacén de datos sigue a la base de datos sin que la app escriba dos veces.',
  linkADatabaseIntoItAnd:
    'Enlaza una base de datos a él, y él a un flujo de eventos, antes de que transporte nada.',
  readingPublishingTo: (p0: string | number | null, p1: string | number | null) =>
    `Leyendo ${p0}, publicando en ${p1}.`,
  itAddsLagAConsumerReads:
    'Añade retraso: un consumidor lee el flujo a su ritmo, así que un resultado de búsqueda o un informe va por detrás del retraso del flujo. El orden solo se mantiene dentro de una partición, y la clave del flujo decide cuál es.',
  notBuiltTheDualWriteInconsistency:
    'No implementado: la inconsistencia de doble escritura que elimina, ya que la build nunca escribe dos veces.',
  changes: 'Cambios',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Carga',
  ofS: (p0: string | number | null, p1: string | number | null) => `${p0} de ${p1}/s`,
  idle: 'inactivo',
  lag: 'Retraso',
  caughtUp: 'al día',
  sBehind: (p0: string | number | null) => `${p0} s de retraso`,
  noStream: 'sin flujo',
  published: 'Publicado',
  latency: 'Latencia',
  burn: 'Gasto',
}
