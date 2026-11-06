import type { Messages } from '../messages.ts'
import { isOne } from '../plural.ts'

export const inspectorSearch: Messages['inspectorSearch'] = {
  product: 'Produit',
  fullFeaturesOnAJVMShards:
    'Toutes les fonctions sur une JVM : partitions, réplicas et un tas à régler.',
  answersHalfAgainAsManyQueries:
    "Répond à une fois et demie plus de requêtes en un saut plus court sur un nœud plus petit, mais sa pertinence baisse avec l'index. Ni partitions, ni réplicas, ni tas.",
  shardsAndReplicas: 'Partitions et réplicas',
  moreShardsParallelizeTheIndexAnd:
    "Plus de partitions parallélisent l'index et diffusent chaque requête. Chaque réplica ajoute de la capacité, une machine et une copie de l'index.",
  heap: 'Tas',
  tooSmallGarbageCollectionPauses: 'Trop petit : pauses du ramasse-miettes.',
  tooLargeLongPausesAndLess:
    'Trop grand : longues pauses et moins de cache du système de fichiers.',
  theJVMHeapHoldsCachesWithout:
    'Le tas JVM contient les caches sans priver le cache du système de fichiers.',
  refresh: 'Relire',
  s: (p0) => `${p0} s`,
  aNewDocumentIsSearchableWithin:
    'Un nouveau document est cherchable en une seconde, au prix de CPU d’indexation.',
  aNewDocumentWaitsUpTo: (p0) =>
    `Un nouveau document attend jusqu’à ${p0} s : l’indexation coûte moins, les réponses sont plus périmées.`,
  shardCount: (count) => `${count} shard${isOne('fr', count) ? '' : 's'}`,
  replicaCount: (count) => `${count} ${isOne('fr', count) ? 'réplica' : 'réplicas'}`,
  heaps: { small: '25 % de la RAM', half: '50 % de la RAM', large: '75 % de la RAM' },
}
