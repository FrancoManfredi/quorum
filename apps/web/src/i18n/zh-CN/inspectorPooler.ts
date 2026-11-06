import type { Messages } from '../messages.ts'

export const inspectorPooler: Messages['inspectorPooler'] = {
  poolingMode: '连接池模式',
  session: '会话',
  transaction: '事务',
  statement: '语句',
  oneServerConnectionPerStatementA: '每条语句占用一个服务器连接：跨语句的事务会失败。',
  oneServerConnectionPerClientBarely: '每个客户端一个服务器连接：比没有连接池好不了多少。',
  oneServerConnectionPerActiveTransaction: '每个活动事务一个服务器连接。会话状态会失效。',
}
