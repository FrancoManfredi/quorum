import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: '变体',
  forwardsTCPTenTimesTheThroughput:
    '转发 TCP：吞吐量十倍、0.2 毫秒，价格更低。它不解析 HTTP，因此无法按类型路由，也无法重试。',
  readsHTTPRoutesByKindRetries: '解析 HTTP：可按类型路由、重试并做健康检查。吞吐量较低，跳转更长。',
  policy: '策略',
  sessions: '会话',
  balanced: '均衡',
  sticky: '粘性',
  everyRequestGoesWhereTheAlgorithm: '每个请求都按算法分配的目标走。',
  off: '关闭',
  on: '开启',
  healthChecks: '健康检查',
  s: (p0) => `${arg(p0)} 秒`,
  shallow: '浅层',
  deep: '深层',
  routes: '路由',
}
