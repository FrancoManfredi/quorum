import type { SearchHeap } from '@quorum/simulation/state'

import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorSearch: Messages['inspectorSearch'] = {
  product: 'Producto',
  fullFeaturesOnAJVMShards:
    'Todas las capacidades sobre una JVM: shards, réplicas y un heap que ajustar.',
  answersHalfAgainAsManyQueries:
    'Responde una vez y media más consultas en un salto más corto y en un nodo más pequeño, y su relevancia cae a medida que crece el índice. Sin shards, réplicas ni heap.',
  shardsAndReplicas: 'Shards y réplicas',
  moreShardsParallelizeTheIndexAnd:
    'Más shards paralelizan el índice y reparten cada consulta. Cada réplica añade capacidad de consulta, una máquina y una copia del índice.',
  heap: 'Heap',
  tooSmallGarbageCollectionPauses: 'Demasiado pequeño: pausas del recolector de basura.',
  tooLargeLongPausesAndLess:
    'Demasiado grande: pausas largas y menos caché del sistema de archivos.',
  theJVMHeapHoldsCachesWithout:
    'El heap de la JVM guarda las cachés sin quitarle memoria a la caché del sistema de archivos.',
  refresh: 'Refresco',
  s: (p0: string | number | null) => `${p0} s`,
  aNewDocumentIsSearchableWithin:
    'Un documento nuevo se puede buscar en un segundo, a cambio de CPU de indexación.',
  aNewDocumentWaitsUpTo: (p0: string | number | null) =>
    `Un documento nuevo espera hasta ${p0} s: la indexación es más barata y las respuestas están más desfasadas.`,
  shardCount: (count: number) => `${count} ${isOne('es', count) ? 'shard' : 'shards'}`,
  replicaCount: (count: number) => `${count} ${isOne('es', count) ? 'réplica' : 'réplicas'}`,
  heaps: {
    small: '25% de la RAM',
    half: '50% de la RAM',
    large: '75% de la RAM',
  } satisfies Record<SearchHeap, string>,
}
