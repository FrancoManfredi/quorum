import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: '分区',
  keyed: '按 key',
  roundRobin: '轮询',
  oneKeyKeepsAnEntityIn:
    'One key keeps an entity in one partition, so its events stay in order. A hot key fills a partition and slows it.',
  eventsSpreadEvenlyAndOrderIs:
    'Events spread evenly, and order is lost: a superseded write can land after the one that replaced it.',
  aConsumerGroupReadsOneConsumer: (p0) =>
    `A consumer group reads one consumer per partition, so this stream hands on at most ${arg(p0)}/s.`,
  durability: '持久性',
  retention: '保留',
  messagesStayAfterTheyAreRead:
    'Messages stay after they are read, so a consumer can replay them into a new index or a second Worker without touching the Database. A consumer further behind than the window loses the oldest events.',
  inbound: '入站',
  s: (p0) => `${arg(p0)}/秒`,
  lag: '滞后',
  behind: '落后',
  caughtUp: '已追平',
  s2: (p0) => `${arg(p0)} 秒`,
  replicas: '副本',
  burn: '支出',
}
