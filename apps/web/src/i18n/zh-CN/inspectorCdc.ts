import type { Messages } from '../messages.ts'

export const inspectorCdc: Messages['inspectorCdc'] = {
  changeStream: '变更流',
  itReadsEveryWriteOffThe:
    '它从数据库的写入日志中读取每一次写入，并发布到数据流，这样搜索引擎或数据仓库无需应用写两次，就能跟上数据库。',
  linkADatabaseIntoItAnd: '先把数据库连接到它，再把它连接到事件流，它才会传递数据。',
  readingPublishingTo: (p0, p1) => `读取 ${p0}，发布到 ${p1}。`,
  itAddsLagAConsumerReads:
    '它会带来延迟：消费者按自己的节奏读取数据流，所以搜索结果或报表会落后数据流的延迟那么多。顺序只在分区内成立，而由数据流的键决定分区。',
  notBuiltTheDualWriteInconsistency: '未构建：它消除的双写不一致，因为这个构建从不写两次。',
  changes: '变更',
  s: (p0) => `${p0}/秒`,
  load: '负载',
  ofS: (p0, p1) => `${p0} / ${p1}/秒`,
  idle: '空闲',
  lag: '滞后',
  caughtUp: '已追平',
  sBehind: (p0) => `落后 ${p0} 秒`,
  noStream: '无事件流',
  published: '已发布',
  latency: '延迟',
  burn: '支出',
}
