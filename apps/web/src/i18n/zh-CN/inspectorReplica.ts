import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: '复制',
  asynchronous: '异步',
  synchronous: '同步',
  noWriteCostAndTheReplica: '没有写入开销,但副本会滞后:写后读可能读到旧数据。',
}
