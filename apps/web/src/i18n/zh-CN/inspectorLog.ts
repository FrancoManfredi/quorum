import type { Messages } from '../messages.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: '分区',
  keyed: '按 key',
  roundRobin: '轮询',
  oneKeyKeepsAnEntityIn:
    '同一个键会把一个实体留在同一个分区，所以它的事件保持有序。热键会占满一个分区并拖慢它。',
  eventsSpreadEvenlyAndOrderIs:
    '事件均匀分布，顺序丢失：被取代的写入可能晚于取代它的那次写入落盘。',
  aConsumerGroupReadsOneConsumer: (p0) =>
    `消费者组每个分区只由一个消费者读取，所以这条数据流每秒最多交出 ${p0} 条。`,
  durability: '持久性',
  retention: '保留',
  messagesStayAfterTheyAreRead:
    '消息在被读取后仍会保留，所以消费者可以把它们重放到新索引或第二个工作进程里，而不用碰数据库。落后超过保留窗口的消费者会丢失最旧的事件。',
  inbound: '入站',
  s: (p0) => `${p0}/秒`,
  lag: '滞后',
  behind: '落后',
  caughtUp: '已追平',
  s2: (p0) => `${p0} 秒`,
  replicas: '副本',
  burn: '支出',
  aProducerWaitsForTheAppend: (multiple) =>
    `生产者要等待 5 ms 追加耗时的 ${multiple} 倍。第一个之外的每个副本，会再计入半个代理节点的支出。`,
  replicaCount: (count) => `${count} 个副本`,
  oneReplicaHoldsTheOnlyCopy:
    '只有一个副本持有唯一的拷贝：发生故障的代理节点会带走它持有的所有事件。',
  aBrokerThatFailsLoses: (share) =>
    `发生故障的代理节点会丢失它所持事件的 ${share}%：即其副本尚未复制的那些。`,
  everyReplicaHadEveryEvent:
    '每个副本都有每个已确认的事件，所以发生故障的代理节点不会丢失任何事件。',
  events: (count) => `${count} 个事件`,
  replicasAndAcks: (replicas, acks) => `${replicas} · acks ${acks}`,
}
