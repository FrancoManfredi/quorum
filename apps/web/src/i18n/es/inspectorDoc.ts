import type { Messages } from '../messages.ts'

export const inspectorDoc: Messages['inspectorDoc'] = {
  oneDocument: 'Un documento',
  multiDocument: 'Multi-documento',
  aCheckoutWritesSeveralDocumentsWithout:
    'Un checkout escribe varios documentos. Sin transacciones multi-documento, uno puede quedar sin los otros, y un reintento vuelve a cobrar la tarjeta; con ellas, cada escritura espera al resto, a una vez y media su latencia.',
  accessPatterns: 'Patrones de acceso',
  thereAreNoJoinsAQuery: (p0: string | number | null, p1: string | number | null) =>
    `No hay joins: una consulta que abarca varios documentos es un escaneo, a ${p0}× las operaciones, y cada patrón nuevo que necesita una funcionalidad es su propia colección e índice que escribir. Una funcionalidad que cambia la forma de los datos cuesta un ${p1}% menos de horas de desarrollo, porque no hay migración; el resto cuesta un poco más.`,
  theTeamPanelChargesTheDev:
    'El panel de Equipo cobra las horas de desarrollo. La base de datos es el otro lado de este intercambio: joins y esquemas, al precio de las migraciones.',
  inbound: 'Entrada',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Carga',
  idle: 'inactivo',
  joins: 'Joins',
  connections: 'Conexiones',
  noneToPool: 'ninguna que agrupar',
  latency: 'Latencia',
  burn: 'Gasto',
  transactions: 'Transacciones',
  multiDocumentValue: 'multi-documento',
  oneDocumentValue: 'un documento',
  ofOpsPerSecond: (load: string | number, capacity: string | number) =>
    `${load} de ${capacity} ops/s`,
}
