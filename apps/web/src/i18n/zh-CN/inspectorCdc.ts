import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorCdc: Messages['inspectorCdc'] = {
  changeStream: '变更流',
  itReadsEveryWriteOffThe:
    'It reads every write off the Database’s write log and publishes it to the Stream, so the Search Engine or the Warehouse follows the Database without the app writing twice.',
  linkADatabaseIntoItAnd: '先把数据库连接到它，再把它连接到事件流，它才会传递数据。',
  readingPublishingTo: (p0, p1) => `读取 ${arg(p0)}，发布到 ${arg(p1)}。`,
  itAddsLagAConsumerReads:
    'It adds lag: a consumer reads the Stream at its own pace, so a search result or a report is behind by the Stream’s lag. Order holds only inside a partition, and the Stream’s key decides that.',
  notBuiltTheDualWriteInconsistency:
    'Not built: the dual-write inconsistency it removes, since the build never writes twice.',
  changes: '变更',
  s: (p0) => `${arg(p0)}/秒`,
  load: '负载',
  ofS: (p0, p1) => `${arg(p0)} / ${arg(p1)}/秒`,
  idle: '空闲',
  lag: '滞后',
  caughtUp: '已追平',
  sBehind: (p0) => `落后 ${arg(p0)} 秒`,
  noStream: '无事件流',
  published: '已发布',
  latency: '延迟',
  burn: '支出',
}
