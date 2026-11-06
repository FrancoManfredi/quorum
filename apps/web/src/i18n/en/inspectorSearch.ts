export const inspectorSearch = {
  product: 'Product',
  fullFeaturesOnAJVMShards: 'Full features on a JVM: shards, replicas, and a heap to tune.',
  answersHalfAgainAsManyQueries:
    'Answers half again as many queries in a shorter hop on one smaller node, and its relevance falls as the index grows. No shards, replicas, or heap.',
  shardsAndReplicas: 'Shards and replicas',
  moreShardsParallelizeTheIndexAnd:
    'More shards parallelize the index and fan every query out. Each replica adds query capacity, a box, and a copy of the index.',
  heap: 'Heap',
  tooSmallGarbageCollectionPauses: 'Too small: garbage collection pauses.',
  tooLargeLongPausesAndLess: 'Too large: long pauses and less file system cache.',
  theJVMHeapHoldsCachesWithout: 'The JVM heap holds caches without starving the file system cache.',
  refresh: 'Refresh',
  s: (p0: string | number | null) => `${p0} s`,
  aNewDocumentIsSearchableWithin:
    'A new document is searchable within a second, at the cost of indexing CPU.',
  aNewDocumentWaitsUpTo: (p0: string | number | null) =>
    `A new document waits up to ${p0} s: indexing is cheaper, and answers are staler.`,
}
