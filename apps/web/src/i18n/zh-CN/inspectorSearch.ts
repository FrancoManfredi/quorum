import type { Messages } from '../messages.ts'

export const inspectorSearch: Messages['inspectorSearch'] = {
  product: '产品',
  fullFeaturesOnAJVMShards: 'JVM 上的完整功能:分片、副本和可调的堆。',
  answersHalfAgainAsManyQueries:
    '单个较小节点上的查询量提高一半、跳数更短,但相关性随索引增大而下降。没有分片、副本或堆。',
  shardsAndReplicas: '分片与副本',
  moreShardsParallelizeTheIndexAnd:
    '分片越多,索引越并行,每个查询也要扇出。每个副本增加查询容量、一台机器和一份索引副本。',
  heap: '堆',
  tooSmallGarbageCollectionPauses: '太小:垃圾回收暂停。',
  tooLargeLongPausesAndLess: '太大:暂停很长,文件系统缓存变少。',
  theJVMHeapHoldsCachesWithout: 'JVM 堆放得下缓存,又不挤占文件系统缓存。',
  refresh: '刷新',
  s: (p0) => `${p0} 秒`,
  aNewDocumentIsSearchableWithin: '新文档在一秒内可被搜索，代价是索引 CPU。',
  aNewDocumentWaitsUpTo: (p0) => `新文档最多等待 ${p0} 秒：索引更便宜，结果更陈旧。`,
  shardCount: (count) => `${count} 个分片`,
  replicaCount: (count) => `${count} 个副本`,
  heaps: { small: '25% 的 RAM', half: '50% 的 RAM', large: '75% 的 RAM' },
}
