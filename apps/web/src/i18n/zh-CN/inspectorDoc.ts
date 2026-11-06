import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorDoc: Messages['inspectorDoc'] = {
  oneDocument: '单文档',
  multiDocument: '多文档',
  aCheckoutWritesSeveralDocumentsWithout:
    'A checkout writes several documents. Without multi-document transactions one can land without the others, and a retry charges the card again; with them every write waits for the rest, at half again its latency.',
  accessPatterns: '访问模式',
  thereAreNoJoinsAQuery: (p0, p1) =>
    `There are no joins: a query that spans documents is a scan, at ${arg(p0)}× the ops, and each new pattern a Feature needs is its own collection and index to write. A Feature that changes the data shape costs ${arg(p1)}% fewer Dev Hours, because there is no migration; the rest cost a little more.`,
  theTeamPanelChargesTheDev:
    'The Team panel charges the Dev Hours. The Database is the other side of this trade: joins and schemas, at the price of migrations.',
  inbound: '入站',
  s: (p0) => `${arg(p0)}/秒`,
  load: '负载',
  idle: '空闲',
  joins: '连接',
  connections: '连接数',
  noneToPool: '无需池化',
  latency: '延迟',
  burn: '支出',
}
