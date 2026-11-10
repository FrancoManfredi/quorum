import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (
    p0: string | number | null,
    p1: string | number | null,
    p2: string | number | null,
  ) =>
    `Exact compara la consulta con cada vector: cada búsqueda encuentra su vecino más cercano, a ${p0} por segundo y por paso de tamaño. HNSW recorre un grafo: ${p1}× las búsquedas, el doble de memoria en gasto y ${p2} de recall, así que una búsqueda de cada veinte cita el documento equivocado.`,
  recallBurnS: (p0: string | number | null, p1: string | number | null) =>
    `Recall ${p0} · Gasto ${p1}/s`,
  retrieval: 'Recuperación',
  linkANodeThatAnswersPrompts: (p0: string | number | null) =>
    `Enlaza un nodo que responda prompts y cada prompt paga una búsqueda de vecino más cercano por los documentos que cita. Esas respuestas ganan un ${p0}% más, y un stack de Python solo conserva su plus del ecosistema ML con un índice en el camino.`,
  nothingAnswersPromptsThroughItYet:
    'Todavía nada responde prompts a través de él. Enlaza un servidor de aplicaciones.',
  lookups: 'Búsquedas',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Carga',
  ofS: (p0: string | number | null, p1: string | number | null) => `${p0} de ${p1}/s`,
  idle: 'inactivo',
  recall: 'Recall',
  latency: 'Latencia',
  burn: 'Gasto',
  index: 'Índice',
  nodesRetrieveFromIt: (count: number) =>
    `${count} ${isOne('es', count) ? 'nodo recupera' : 'nodos recuperan'} de él.`,
}
