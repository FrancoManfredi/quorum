import type { Messages } from '../messages.ts'

export const inspectorDoc: Messages['inspectorDoc'] = {
  oneDocument: '单文档',
  multiDocument: '多文档',
  aCheckoutWritesSeveralDocumentsWithout:
    '一次结账会写入多个文档。没有多文档事务时，其中一个可能落盘而其余没有，重试就会再次扣款；有了事务，每次写入都要等其余写入，延迟增加一半。',
  accessPatterns: '访问模式',
  thereAreNoJoinsAQuery: (p0, p1) =>
    `没有联表：跨文档的查询是一次扫描，操作量是 ${p0} 倍，功能需要的每种新模式都要单独写一个集合和索引。改变数据形状的功能少花 ${p1}% 的开发工时，因为没有迁移；其余的则多花一点。`,
  theTeamPanelChargesTheDev:
    '开发工时由团队面板扣除。数据库是这项取舍的另一面：有联表和模式，代价是迁移。',
  inbound: '入站',
  s: (p0) => `${p0}/秒`,
  load: '负载',
  idle: '空闲',
  joins: '连接',
  connections: '连接数',
  noneToPool: '无需池化',
  latency: '延迟',
  burn: '支出',
  transactions: '事务',
  multiDocumentValue: '多文档',
  oneDocumentValue: '单文档',
  ofOpsPerSecond: (load, capacity) => `${load} / ${capacity} 次操作/秒`,
}
