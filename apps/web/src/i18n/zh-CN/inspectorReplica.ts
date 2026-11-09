import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: '复制',
  primary: '主库',
  primaryNote: (name) => `${name} 负责写入，此节点从它的副本提供读取。`,
  noSinglePrimary: '此设计有多个数据库，因此这个只读副本没有单一主库。',
  asynchronous: '异步',
  synchronous: '同步',
  runsThePrimaryEngine: '运行主库的引擎。',
  noWriteCostAndTheReplica: '没有写入开销,但副本会滞后:写后读可能读到旧数据。',
  everyWriteWaits: (wait) =>
    `每次写入都要等待此副本 ${wait}，跨可用区和区域时更久。它不会提供过期读取，而它宕机时写入会停滞。`,
}
